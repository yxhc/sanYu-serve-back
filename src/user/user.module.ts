import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { expiresIn, secret } from 'src/config/jwt';
@Module({
  imports: [PassportModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret,
      signOptions: {
        expiresIn
      }
    })],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule { }
