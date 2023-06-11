import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { HttpExceptionFilter } from './core/filter/http-exception.filter';
import { TransformInterceptor } from './core/interceptor/transform.interceptor';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from './guard/auth.guard';
import { createSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app));
  app.useGlobalGuards(new AuthGuard())
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalPipes(new ValidationPipe())
  app.setGlobalPrefix('/api')
  createSwagger(app)
  app.enableCors();
  await app.listen(3000, () => {
    Logger.log(`API服务已经启动,服务请访问:http://localhost:3000`);
    Logger.log(`websocket服务已经启动`)
    Logger.log(`swagger已经启动,服务请访问:http://localhost:3000/docs`)
  });
}
bootstrap();
