import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WsChatGateway } from './chat.geteway';
import { User } from 'src/user/entities/user.entity';
import { Message } from './message.entity';
import { Room } from './room.entity';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Music } from 'src/music/entities/music.entity';
@Module({
  imports: [TypeOrmModule.forFeature([
    User,
    Message,
    Room,
    Music
  ])],
  providers: [WsChatGateway, ChatService],
  controllers: [ChatController],
})


export class ChatModule {
  // constructor(
  //   @InjectRepository(Room)
  //   private readonly roomRepository: Repository<Room>
  // ) { }
  // async onModuleInit() {
  //   const officialRoom = await this.roomRepository.find({ where: { room_name: 'sanYu聊天室' } })
  //   if (!officialRoom.length) {
  //     await this.roomRepository.save({
  //       create_room_user_id: 1,
  //       room_id: 888,
  //       room_logo: 'https://pic1.zhimg.com/v2-916171050d543abc05c2b41be154e07e_r.jpg?source=1940ef5c',
  //       room_name: 'sanYu聊天室',
  //       room_need_password: 1,
  //       room_notice: '欢迎加入',
  //       room_bg_img: 'https://ts1.cn.mm.bing.net/th/id/R-C.e79036ab9e7ef09bd5951536125c60ac?rik=qzIaIiYX81%2fOAA&riu=http%3a%2f%2f5b0988e595225.cdn.sohucs.com%2fimages%2f20181103%2ffeaa7d14883047fb81bbaa16f681f583.jpeg&ehk=hywgeurG%2fR6NTPM5A6bkA4YGllkcUFzqDTWm%2fxfDeDU%3d&risl=&pid=ImgRaw&r=0'
  //     })
  //     console.log('create official room sanYu聊天室');

  //   }
  // }
}


