import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const swaggerOptions = new DocumentBuilder()
  .setTitle('sanYu blog api document')
  .setDescription('about sabYu blog api docs')
  .setVersion('1.0.0')
  .addBearerAuth()
  .build();

export function createSwagger(app) {
  const document = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('/docs', app, document);
}
