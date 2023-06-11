import * as https from 'https';

export const https_get = async (url) => {
    let pipe = null;
    return new Promise((resovle, reject) => {
        https.get(url, (res) => {
            if (res.statusCode == 200) {
                res.on('data', (chunk) => {
                    pipe += chunk;
                });
                res.on('end', () => {
                    const { data } = JSON.parse(pipe.split('null')[1]);
                    if (data.length) {
                        const { origip, location } = data[0];
                        resovle({ ip: origip, address: location.split(' ')[0] });
                    } else {
                        reject('获取ip失败');
                    }
                });
            } else {
                reject('获取ip失败');
            }
        });
    });
}

export const formatOnlineUser = (onlineUserInfo = {}, id) => {
    //将用户的id提取出来
    const keys = Object.keys(onlineUserInfo);
    if (!keys.length) return [];
    //将用户信息全部提取出来
    let userInfo = Object.values(onlineUserInfo);
    let homeowner = null;
    //查找在线用户id并存入新数组里   findIndex()没有符合条件的会返回-1，存在则返回id数
    const homeownerIndex = userInfo.findIndex((k: any) => k.id === id);
    homeownerIndex != -1 &&
        //splice() 方法用于删除数组中的元素 会返回一个数组
        //该方法将索引为homeownerIndex的用户从 userInfo 数组中删除，
        //并返回一个只包含该用户信息的新数组
        (homeowner = userInfo.splice(homeownerIndex, 1));
    homeownerIndex != -1 &&
        (userInfo = [...homeowner, ...userInfo]);
    return userInfo;
};

//准换 房间列表的格式由{}变为[],并将主房间888放在首位
export const formatRoomList = (roomListMap) => {
    //将room_id提出来
    const keys = Object.keys(roomListMap);
    if (!keys.length) return [];
    //将其他房间号不为888的筛选进新数组roomIds
    const roomIds = Object.keys(roomListMap).filter((key) => Number(key) !== 888);
    //获取主房间888的基本信息
    const adminRoom = roomListMap[888];
    let roomList = [];
    roomIds.forEach((roomId) =>
        roomList.push(getBasicRooInfo(roomListMap[roomId])),
    );
    //如果主房间存在
    adminRoom &&
        //...roomList将元素展开并添加到新数组的末尾（这样可以保持主房间在最前面）
        (roomList = [getBasicRooInfo(adminRoom), ...roomList]);
    return roomList;
};
//将信息转换为基本格式
export const getBasicRooInfo = (roomDetailInfo) => {
    const { room_admin_info, on_line_user_list, room_info } = roomDetailInfo;
    return Object.assign(room_info, {
        on_line_num: on_line_user_list.length,
        room_user_nick: room_admin_info.nickname,
    });
};