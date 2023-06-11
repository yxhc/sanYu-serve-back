import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 12, unique: true, comment: '用户名' })
    username: string;


    @Column({ length: 12, comment: '用户昵称' })
    nickname: string

    @Column({ length: 1000, comment: '用户密码' })
    password: string;

    @Column({ comment: '用户头像' })
    avatar: string;

    @Column()
    email: string

    @Column('simple-enum', { enum: ['root', 'author', 'visitor'] })
    role: string;

    @Column({ default: 'on' })
    status: string;

    @Column({ length: 255, nullable: true, comment: '用户个人创建的房间Id' })
    user_room_id: string;

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