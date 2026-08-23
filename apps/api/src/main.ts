import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { logger } from './common/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: false,
  });
  app.useLogger(app.get(Logger));
  const configService = app.get(ConfigService);
  const prefix = configService.get('API_PREFIX', '/api/v1');
  app.setGlobalPrefix(prefix);
  app.enableCors();
  const port = configService.get('PORT', 3000);
  await app.listen(port);
  logger.info({ port, prefix }, 'NovaBank API is running');
}
bootstrap();
