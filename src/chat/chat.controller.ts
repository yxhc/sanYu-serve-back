import { Controller, Post, Body, Get, Query, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Chat')
@Controller('/chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post('/history')
    history(@Body() params) {
        //params 参数是从请求体中提取的数据，通常包含了客户端提交的所有参数
        return this.chatService.showHistory(params)
    }

    @Post('/createRoom')
    //req 参数是 HTTP 请求对象它包含了客户端发出的 HTTP 请求的所有信息，
    //例如请求头、查询参数、路径参数等
    createRoom(@Body() params, @Request() req) {
        return this.chatService.createRoom(params, req)
    }

    @Get('/roomInfo')
    //@Query() 装饰器用于从请求的查询参数中提取数据。
    //查询参数是指位于 URL 中 ? 后面的参数，
    //例如 /api/room/info?id=1&name=test 中的 id=1&name=test 部分。
    //params 参数将被解析为 { id: "1", name: "test" }
    roomInfo(@Query() params) {
        return this.chatService.roomInfo(params)
    }
}
