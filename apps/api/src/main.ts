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
  const configuredPort = configService.get('PORT', 3000);
  const port = Number(configuredPort) || 3000;

  try {
    await app.listen(port , '0.0.0.0');
  } catch (error) {
    const code = (error as NodeJS.ErrnoException)?.code;
    if (code === 'EADDRINUSE') {
      logger.error(
        { port, prefix },
        `Port ${port} is already in use. Stop the other API process or set PORT to another value.`,
      );
    }
    throw error;
  }
  logger.info({ port, prefix }, 'NovaBank API is running');
}
bootstrap().catch((error) => {
  logger.error({ error }, 'NovaBank API failed to start');
  process.exitCode = 1;
});
