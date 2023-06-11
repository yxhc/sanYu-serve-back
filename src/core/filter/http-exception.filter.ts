import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { formatDate } from 'src/utils/date';
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()//获取请求上下文
    const response = ctx.getResponse()//获取请求上下文的response对象
    const request = ctx.getRequest();
    const { } = response;
    const exceptionRes: any = exception.getResponse();
    //获取异常状态码

    const message =
      exceptionRes.constructor === Object
        ? exceptionRes['message']
        : exceptionRes;
    const statusCode = exception.getStatus() || 400;
    const errorResponse = {
      message: Array.isArray(message) ? message[0] : message,
      data: {},
      code: statusCode,
      url: request.originalUrl,
      success: false,
      timestamp: new Date().toLocaleDateString(),
    }
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;


    Logger.error(
      `【${formatDate(Date.now())}】${request.method} ${request.url}`,
      JSON.stringify(errorResponse),
      'HttpExceptionFilter',
    );
    console.log(errorResponse, 'errorResponse');

    /* 设置返回的状态码、请求头、发送错误信息 */
    response.status(status);
    response.header('Content-Type', 'application/json; charset=utf-8');
    response.send(errorResponse);

  }
}
