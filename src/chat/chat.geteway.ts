import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Message } from './message.entity';
import { Room } from './room.entity';
import { verifyToken } from 'src/utils/verifyToken';
import { formatOnlineUser, formatRoomList } from 'src/utils/tool';
import { Music } from 'src/music/entities/music.entity';
import { getRandomId } from 'src/constant/avatar';
import { getMusicDetail, getMusicSrc } from 'src/utils/spider';
@WebSocketGateway({
    path: '/chat',
    allowEIO3: true,
    cors: {
        origin: /.*/,
        credentials: true,
    },
    transports: ["websocket"],
})

export class WsChatGateway {
    constructor(
        @InjectRepository(User)
        private readonly userModule: Repository<User>,
        @InjectRepository(Message)
        private readonly messageModule: Repository<Message>,
        @InjectRepository(Room)
        private readonly roomModule: Repository<Room>,
        @InjectRepository(Music)
        private readonly musicModule: Repository<Music>
    ) { }

    @WebSocketServer()
    private server: Server;
    private max_count: any = {}; // 一共有多少首歌曲，在这个区间随机拿
    private clientIdMap: any = {}; //  记录clientId 和userId roomId的映射关系 {  client.id: { user_id, room_id }}
    private onlineUserInfo: any = {}//在线用户数量
    private room_list_map: any = {}; // 所有的在线房间列表
    private timerList: any = {}
    async afterInit() {
        await this.initBasic()
    }

    //连接成功时
    async handleConnection(client: Socket): Promise<any> {
        //query表示客户端请求 URL 中的查询参数对象，类型为一个 JSON 对象
        this.connectSuccess(client, client.handshake.query)

    }
    //断开连接的时候
    async handleDisconnect(client: Socket) {
        const clientInfo = this.clientIdMap[client.id];
        if (!clientInfo) return;
        /* 删除此用户记录 */
        delete this.clientIdMap[client.id];
        const { user_id, room_id } = clientInfo;
        const { on_line_user_list, room_admin_info, room_info } =
            this.room_list_map[room_id];
        let nickname;
        const delUserIndex = on_line_user_list.findIndex((t) => {
            if (t.id === user_id) {
                nickname = t.nickname;
                return true;
            }
        });
        on_line_user_list.splice(delUserIndex, 1);
        if (!on_line_user_list.length && Number(room_id !== 888)) {
            clearTimeout(this.timerList[`timer${room_id}`])
            delete this.room_list_map[Number(room_id)]
            const { room_name } = room_info;
            const { nickname: roomAdminNick } = room_admin_info
            return this.server.emit('updateRoomList', {
                room_list: formatRoomList(this.room_list_map),
                msg: `[${roomAdminNick}]的房间[${room_name}]因没有人而被系统关闭`
            })
        }
        this.server.to(room_id).emit('offline', {
            code: 1,
            on_line_user_list: formatOnlineUser(on_line_user_list, user_id),
            msg: `[${nickname}]离开房间了`,
        });
        console.log('连接断开');

    }
    //接受客户端的消息
    @SubscribeMessage('message')
    async handleMessage(client: Socket, data: any) {
        const { user_id, room_id } = this.clientIdMap[client.id]
        const { message_type, message_content } = data;
        //整理发送消息
        const { nickname, avatar, role, id } =
            await this.getUserInfoForClientId(client.id)
        const params = {
            user_id,
            message_content,
            message_type,
            room_id,
        }
        const message = await this.messageModule.save(params)
        //需要对消息的message_content序列化
        message.message_content &&
            (message.message_content = JSON.parse(message.message_content));
        //组装发送消息的格式
        const result: any = {
            ...message,
            user_info: { nickname, avatar, role, id, user_id: id }
        }

        this.server.to(room_id).emit('message', { data: result, msg: '有一条新消息' })
    }
    async initBasic() {
        const musicCount = await this.musicModule.count();
        this.max_count = musicCount;
    }

    async switchMusic(room_id) {
        const { mid, user_info, music_queue_list } = await this.getNextMusicMid(
            room_id,
        );
        try {
            const { music_lrc, music_info } = await getMusicDetail(mid);

            music_info.choose_user_id = user_info ? user_info.id : -1;
            const music_src = await getMusicSrc(mid);
            this.room_list_map[Number(room_id)].music_info = music_info;
            this.room_list_map[Number(room_id)].music_lrc = music_lrc;
            this.room_list_map[Number(room_id)].music_src = music_src;
            const { music_singer, music_album } = music_info;

            this.server.to(room_id).emit('switchMusic', {
                musicInfo: { music_info, music_src, music_lrc, music_queue_list },
                msg: `正在播放${user_info ? user_info.nickname : '系统随机'
                    }点播的 ${music_album}(${music_singer})`,
            });
            const { music_duration } = music_info;
            clearTimeout(this.timerList[`timer${room_id}`]);
            //设置一个定时器 以歌曲时长为准 歌曲到时间后自动切歌
            this.timerList[`timer${room_id}`] = setTimeout(() => {
                this.switchMusic(room_id);
            }, music_duration * 1000);
            //拿到歌曲时长， 记录歌曲结束时间, 新用户进入时，可以计算出歌曲还有多久结束
            this.room_list_map[Number(room_id)].last_music_timespace =
                new Date().getTime() + music_duration * 1000;
        } catch (error) {
            music_queue_list.shift();
            this.switchMusic(room_id);
            return this.messageNotice(
                'info',
                `当前歌曲暂时无法播放、点首其他歌曲吧! `,
            );
        }
    }
    async getNextMusicMid(room_id) {
        let mid: any;
        let user_info: any = null;
        let music_queue_list: any = [];
        this.room_list_map[Number(room_id)] &&
            (music_queue_list = this.room_list_map[Number(room_id)].music_queue_list);

        /* 如果当前房间有点歌列表，就顺延，没有就随机播放一区 */
        if (music_queue_list.length) {
            mid = music_queue_list[0].music_mid;
            user_info = music_queue_list[0]?.user_info;
        } else {
            const random_id = getRandomId(1, this.max_count);
            const random_music: any = await this.musicModule.findOne({ where: { id: random_id } });
            /* TODO 如果删除了db 可能导致这个随机id查不到数据，要保证不要删除tb_music的数据 或者自定义id用于随机歌曲查询 或增加一个随机歌曲的爬虫方法 */
            if (!random_music) {
            }
            mid = random_music.music_mid;
        }
        return { mid, user_info, music_queue_list };
    }

    //初次连接房间
    async connectSuccess(client, query) {
        try {
            const { token, address, room_id = 888 } = query;
            const payload = await verifyToken(token);
            //将user_id从payload对象中解构并赋值给user_id变量
            const { user_id } = payload;
            //校验token
            if (user_id === -1 || !token) {
                client.emit('authFail', { code: -1, msg: '权限校验失败，请重新登录' })
                return client.disconnect();
            }

            //判断用户是否连接上
            Object.keys(this.clientIdMap).forEach((clientId) => {
                //对象属性访问的写法获取指定键名 clientId 对应的子对象中的 user_id 属性值
                if (this.clientIdMap[clientId]['user_id'] === user_id) {
                    /* 提示老的用户被挤掉 */
                    this.server.to(clientId).emit('tips', {
                        code: -2,
                        msg: '您的账户在别地登录了，您已被迫下线',
                    });
                    /* 提示新用户是覆盖登录 */
                    client.emit('tips', {
                        code: -1,
                        msg: '您的账户已在别地登录，已为您覆盖登录！',
                    });
                    /* 断开老的用户连接 并移除掉老用户的记录 */
                    this.server.in(clientId).disconnectSockets(true);
                    delete this.clientIdMap[clientId];
                }
            })

            //判断用户是否在房间里
            if (
                Object.values(this.room_list_map).some((t: any) =>
                    t.on_line_user_list.includes(user_id),
                )
            ) {
                return client.emit('tips', { code: -2, msg: '您已经在别处登录了' });
            }

            //查询用户基本信息
            const u = await this.userModule.findOne({ where: { id: user_id } })
            const {
                username,
                nickname,
                email,
                role,
                avatar,
                id
            } = u;
            const userInfo = {
                username,
                nickname,
                email,
                role,
                avatar,
                id
            };
            if (!u) {
                client.emit('authFail', { code: -1, msg: '无此用户信息、非法操作！' })
                return client.disconnect();
            }
            //查询房间信息,没有则需要新建，然后加入
            const room_info = await this.roomModule.findOne({
                where: { room_id },
                select: [
                    'room_id',
                    'create_room_user_id',
                    'room_logo',
                    'room_name',
                    'room_notice',
                    'room_need_password'
                ]
            });
            if (!room_info) {
                client.emit('tips', {
                    code: -3,
                    msg: '您正在尝试加入一个不存在的房间、非法操作！！！',
                });
                return client.disconnect();
            }
            //默认加入主房间888
            client.join(room_id)
            //加载默认房间888的信息
            const isRoomExist = this.room_list_map[room_id];
            !isRoomExist &&
                (await this.initBasicRoomInfo(room_id, room_info))
            //根据当前房间id获取用户信息并将该用户加入在线用户列表末尾
            this.room_list_map[room_id].on_line_user_list.push(userInfo)
            //记录当前连接的clientId用户和房间号的映射关系
            this.clientIdMap[client.id] = { user_id, room_id };
            //记录用户到在线列表，并记住当前用户的房间号
            this.onlineUserInfo[user_id] = { userInfo, roomId: room_id };

            await this.initRoom(client, user_id, nickname, address, room_id);

            const data: any = { room_list: formatRoomList(this.room_list_map) }
            !isRoomExist &&
                (data.msg = `${nickname}的房间[${room_info.room_name}]有新用户加入已成功开启`)
            this.server.emit('updateRoomList', data);
        } catch (error) {

        }
    }


    //加入房间之后初始化信息:个人信息和更新在线用户列表
    async initRoom(client, user_id, nickname, address, room_id) {
        //从房间列表中获取指定 ID 的房间信息
        const { on_line_user_list,
            room_admin_info,
            music_queue_list,
            music_info,
            music_src,
            music_lrc,
            last_music_timeSpace
        } = this.room_list_map[Number(room_id)];
        //获取音乐开始播放时间
        const music_start_time = music_info.music_duration - Math.round((last_music_timeSpace - new Date().getTime()) / 1000)

        //格式化当前在线用户列表
        const formatOnlineUserList = formatOnlineUser(
            on_line_user_list,
            room_admin_info.id
        );
        //向客户端发送初始化房间用户需要用到的各种信息
        await client.emit('initRoom', {
            user_id,
            music_src,
            music_queue_list,
            music_info,
            music_lrc,
            music_start_time,
            room_admin_info,
            on_line_user_list: formatOnlineUserList,
            room_list: formatRoomList(this.room_list_map),
            tips: `欢迎${nickname}加入房间！`,
            msg: `来自${address}的[${nickname}]进入房间了`,
        });

        //有新用户上线的时候，全体广播
        client.broadcast.to(room_id).emit('online', {
            on_line_user_list: formatOnlineUserList,
            msg: `来自${address}的[${nickname}]进入房间了`,
        });
    }

    messageNotice(room_id, message) {
        this.server.to(room_id).emit('notice', message);
    }
    // 初始化房间信息和创建房间人的信息
    async initBasicRoomInfo(room_id, room_info) {
        const { create_room_user_id } = room_info;
        const room_admin_info = await this.userModule.findOne({
            where: { id: create_room_user_id },
            select: ['nickname', 'avatar', 'id', 'role'],
        });

        this.room_list_map[Number(room_id)] = {
            on_line_user_list: [],
            music_queue_list: [],
            music_info: {},
            music_src: null,
            music_lrc: null,
            last_music_timeSpace: null,
            [`timer${room_id}`]: null,
            room_info,
            room_admin_info,
        }
        //初次启动房间，需要开始启动音乐
        await this.switchMusic(room_id)
    }

    //通过clientId 拿到用户信息
    async getUserInfoForClientId(client_id) {
        const { user_id, room_id } = this.clientIdMap[client_id];
        const { on_line_user_list } = this.room_list_map[room_id];
        return on_line_user_list.find((t) => t.id === user_id);
    }

    //通过clientId 拿到房间歌曲队列
    async getMusicQueueForClientId(client_id) {
        const { room_id } = this.clientIdMap[client_id];
        const { music_queue_list } = this.room_list_map[room_id];
        return music_queue_list;
    }
}