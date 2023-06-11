import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ comment: '用户id' })
    user_id: number;

    @Column({ comment: '房间ID' })
    room_id: number;

    @Column('text')
    message_content: string;

    @Column({ length: 64, comment: '消息类型' })
    message_type: string;

    @Column({ comment: '消息状态： 1: 正常 ,-1: 已撤回', default: 1 })
    message_status: number;

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
    updateTime: Date
}