import { IsNotEmpty, MinLength, MaxLength } from 'class-validator';
export class UserLoginDto {
    @IsNotEmpty({ message: '用户名不能为空' })
    username: string;

    @IsNotEmpty({ message: '密码不能为空' })
    @MinLength(6, { message: '密码长度最低为6位' })
    @MaxLength(12, { message: '密码长度最多为12位' })
    password: string;
}
