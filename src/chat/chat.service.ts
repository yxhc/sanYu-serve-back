import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Message } from './message.entity';
import { Room } from './room.entity';
import { User } from 'src/user/entities/user.entity';
import { randomAvatar } from 'src/constant/avatar';
@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Message)
        private readonly messageModule: Repository<Message>,
        @InjectRepository(User)
        private readonly userModule: Repository<User>,
        @InjectRepository(Room)
        private readonly roomModule: Repository<Room>
    ) { }

    async showHistory(params) {
        //根据客户端传入的查询参数 page、pagesize 和 room_id 
        //查询指定房间的历史聊天记录
        const { page = 1, pagesize = 300, room_id = 888, } = params;
        const messageInfo = await this.messageModule.find({
            //通过房间号查询历史消息
            where: { room_id },
            //按照 id 字段倒序排列
            order: { id: 'DESC' },
            skip: (page - 1) * pagesize,
            take: pagesize
        });
        //收集所有发过信息人的id
        const userIds = [];

        messageInfo.forEach((t) => {
            !userIds.includes(t.user_id) &&//条件语句,成立后会执行后面的
                userIds.push(t.user_id)
        });
        //查找所有发送信息人的信息
        const userInfoList = await this.userModule.find({
            where: { id: In(userIds) },
            select: ['id', 'nickname', 'avatar', 'role']
        });
        //统一用户ID的字段名
        userInfoList.forEach((t: any) => (t.user_id = t.id))

        //组装消息形式
        messageInfo.forEach((t: any) => {
            t.user_info = userInfoList.find((k: any) => k.user_id === t.user_id)
            t.message_content &&
                t.message_status === 1 &&
                (t.message_content = JSON.parse(t.message_content))
        });

        return messageInfo.reverse();
    }

    //创建聊天室
    async createRoom(params, req) {
        // payload 通常表示 HTTP 请求的负载数据，例如 POST 请求中的表单数据或 JSON 数据
        // 从 payload 中解构出一个变量 { user_id: room_user_id }。
        // 其中，user_id 是 payload 对象中的一个属性，表示当前请求的用户 ID。
        // 而 create_room_user_id 是解构出的目标变量名，用于存储从 payload 中获取到的 user_id 值。
        const { user_id: create_room_user_id } = req.payload;
        const { room_id } = params;
        const { user_room_id, avatar } = await this.userModule.findOne({
            where: { id: create_room_user_id },
            select: ['avatar', 'user_room_id']
        });
        if (user_room_id) {
            throw new HttpException(
                `您已经创建过了，拒绝重复创建！`,
                HttpStatus.BAD_REQUEST);
        }
        const count = await this.roomModule.count({ where: { room_id } })
        if (count) {
            throw new HttpException(
                `房间ID[${room_id}]已经被注册了，换一个试试吧！`,
                HttpStatus.BAD_REQUEST,
            );
        }
        //将当前用户的 ID 和传递进来的聊天室信息对象 params 合并成一个新的对象
        const room = Object.assign({ create_room_user_id }, params)
        !room.room_logo &&
            (room.room_logo = avatar)
        await this.roomModule.save(room)
        //更新数据库，当id和create_room_user_id吻合时才会执行
        await this.userModule.update(
            { id: create_room_user_id }
            , { user_room_id: room_id });
        return true
    }

    async roomInfo(params) {
        const { room_id } = params;
        return await this.roomModule.findOne({
            where: { room_id },
            select: [
                'room_id',
                'create_room_user_id',
                'room_logo',
                'room_name',
                'room_notice',
                'room_bg_img',
                'room_need_password'
            ]
        });
    }
}
