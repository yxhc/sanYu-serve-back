//创建用户服务
import { HttpException, Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { hashSync } from 'bcryptjs'
import { JwtService } from '@nestjs/jwt';
import { randomAvatar } from '../constant/avatar';
import { compareSync } from 'bcryptjs'

@Injectable()
export class UserService {
  constructor(@InjectRepository(User)
  private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) { }

  //注册功能
  async register(params) {
    //解构赋值传入参数
    const { username, password, email, avatar } = params;
    params.password = hashSync(password, 10)//加密
    if (!avatar) {
      params.avatar = randomAvatar()
    }
    const userExist: any = await this.userRepository.findOne({
      //查询数据库里用户名或者邮箱来判断用户是否已经存在
      where: [{ username }, { email }]
    });
    if (userExist) {
      const tips = username == userExist.username ? '用户名' : '邮箱';
      throw new HttpException(`该${tips}已经存在了！`, HttpStatus.BAD_REQUEST)
    }
    await this.userRepository.save(params);
    return true
  }
  // 登录
  async login(params): Promise<any> {
    const { username, password } = params;
    const user = await this.userRepository.findOne({
      where: { username }
    })
    if (!user) {
      throw new HttpException('该用户不存在！', HttpStatus.BAD_REQUEST)
    }
    //验证输入密码是否与数据库的匹配
    const bool = compareSync(password, user.password)
    if (bool) {
      const { username, email, id: user_id, nickname, role } = user
      return {
        token: this.jwtService.sign({
          username,
          nickname,
          email,
          role,
          user_id
        })
      }
    } else {
      throw new HttpException(
        { message: '账号或者密码错误！', error: 'please try again later.' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getInfo(payload) {
    const { user_id: id, exp: failure_time } = payload;
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'username',
        'nickname',
        'email',
        'avatar',
        'role',
        'user_room_id'
      ]
    })
    return { user_info: { ...user, user_id: id }, failure_time }
  }



}


