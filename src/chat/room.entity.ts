import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Room {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, comment: '房间创建人id' })
    create_room_user_id: number;

    @Column({ unique: true, comment: '房间ID' })
    room_id: number;

    @Column({ length: 255, nullable: true, comment: '房间logo' })
    room_logo: string;

    @Column({ length: 20, comment: '房间名称' })
    room_name: string;

    @Column({ default: 1, comment: '房间是否需要密码 1:公开 2:加密' })
    room_need_password: number;

    @Column({ length: 255, nullable: true, comment: '房间密码' })
    room_password: string;

    @Column({ length: 512, default: '房间空空如也呢', comment: '房间公告' })
    room_notice: string;

    @Column({ length: 512, nullable: true, comment: '房间背景图片' })
    room_bg_img: string;

    @Column({
        name: 'create_time',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createTime: Date;

    @Column({
        name: 'update_time',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    updateTime: Date;
}
