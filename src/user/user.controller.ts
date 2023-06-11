import { Controller, Post, Body, Get, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRegisterDto } from './dto/register.user.dto';
import { ApiTags } from '@nestjs/swagger';
import { UserLoginDto } from './dto/login.user.dto';

@ApiTags('User')
@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService,
  ) { }
  @Post('/register')
  register(@Body() params: UserRegisterDto) {
    return this.userService.register(params)
  }
  @Post('/login')
  login(@Body() params: UserLoginDto) {
    console.log('用户请求登录');
    return this.userService.login(params)
  }

  @Get('/getInfo')
  queryInfo(@Request() req) {
    return this.userService.getInfo(req.payload)
  }













  // @Post('/login')
  // async login(@Body() LoginParma: UserLoginDto) {
  //   console.log('jwt验证-step1:用户请求登录');
  //   const authResult = await this.authService.validateUser(LoginParma.username, LoginParma.password);
  //   switch (authResult.code) {
  //     case 1:
  //       return this.authService.login(authResult.user);
  //     case 2:
  //       return {
  //         code: 600,
  //         msg: `账号或密码不对`
  //       };
  //     default:
  //       return {
  //         code: 600,
  //         msg: `查无此人`
  //       }
  //   }
  // }
}

