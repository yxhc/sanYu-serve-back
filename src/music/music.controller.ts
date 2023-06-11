import { Controller, Get, Post, Body, Query, Request } from '@nestjs/common';
import { MusicService } from './music.service';
import { searchDto } from './dto/search.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Music')
@Controller('/music')
export class MusicController {
  constructor(private readonly musicService: MusicService) {
    this.musicService.initMusicList()

  }
  @Get('/mockQueryMusic')

  test() {
    return this.musicService.mockQueryMusic()
  }
  // @Get('/search')
  // search(@Query() params: searchDto) {
  //   return this.musicService.search(params)
  // }

  // @Post('/collectMusic')
  // collectMusic(@Request() req, @Body() params) {
  //   return this.musicService.collectMusic(req.payload, params)
  // }
  // @Get('/collectList')
  // collectList(@Request() req, @Query() params) {
  //   return this.musicService.collectList(req.payload, params);
  // }
}
