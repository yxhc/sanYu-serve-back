import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Music {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 300, comment: '歌曲专辑' })
    music_album: string;

    @Column({ length: 300, comment: '歌曲名称' })
    music_name: string;

    @Column({ unique: true, comment: '歌曲的id' })
    music_mid: number;

    @Column({ comment: '歌曲时长' })
    music_duration: number;

    @Column({ length: 300, comment: '歌曲作者' })
    music_singer: string;

    @Column({ comment: '是否推荐到热门歌曲 1:是 -1:不是', default: 0 })
    is_recommend: number;

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
