import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './user/entities/user.entity';
import { ChatModule } from './chat/chat.module';
import { Message } from './chat/message.entity';
import { Room } from './chat/room.entity';
import { MusicModule } from './music/music.module';
import { Music } from './music/entities/music.entity';


@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    username: 'root',
    password: '123456',
    database: 'chat-test',
    entities: [User, Message, Room, Music],
    synchronize: true //自动创建数据表 线上一定要关了，不然直接提桶跑路

  }), UserModule, ChatModule, MusicModule,]
})
export class AppModule { }
