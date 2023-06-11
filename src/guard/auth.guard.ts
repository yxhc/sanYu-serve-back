import {
    CanActivate,
    ExecutionContext,
    HttpException,
    Injectable,
    HttpStatus,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { secret, whiteList, } from 'src/config/jwt';
@Injectable()
export class AuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { headers, path, route } = context.switchToRpc().getData();

        if (whiteList.includes(path)) {
            return true;
        }

        const isGet = route.methods.get;
        const token = headers.authorization || request.headers.authorization

        if (token) {
            const payload = await this.verifyToken(token, secret)
            request.payload = payload
            return true
        } else {
            if (isGet) return true
            throw new HttpException('你还没登录,请先登录', HttpStatus.UNAUTHORIZED)
        }
    }

    private verifyToken(token: string, secret: string): Promise<any> {
        return new Promise((resolve) => {
            jwt.verify(token, secret, (error, payload) => {
                if (error) {
                    throw new HttpException('身份验证失败', HttpStatus.UNAUTHORIZED)
                } else {
                    //解码后的 payload 对象
                    resolve(payload)
                }
            })
        })
    }
}