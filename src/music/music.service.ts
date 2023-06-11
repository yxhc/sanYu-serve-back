import { Music } from './entities/music.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { initMusicSheet, } from 'src/utils/spider';
@Injectable()
export class MusicService {
  constructor(
    @InjectRepository(Music)
    private readonly musicModel: Repository<Music>
  ) { }

  async mockQueryMusic() {
    const musicList = await initMusicSheet({ page: 1, pageSize: 3 })
    return musicList;
  }
  async initMusicList() {
    const params = { page: 1, pageSize: 3 };
    const musicCount = await this.musicModel.count();
    if (musicCount) {
      return console.log(
        `当前曲库共有${musicCount}首音乐，初始化会默认填充曲库，具体添加方法查看readme，关闭提示请注释`,
      );
    }
    const musicList = await initMusicSheet(params);
    await this.musicModel.save(musicList);
    /* 歌曲多的时候耗时貌似很长 可以相对减少或者分批存入 */
    musicList.length &&
      console.log(
        `>>>>>>>>>>>>> 初始化歌单成功、共获取${musicList.length}首歌曲。`,
      );
    return musicList;
  }
}
