import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SocketIoAdapter } from './collaboration/socket-io.adapter';

const DEFAULT_PORT = 3500;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new SocketIoAdapter(app));
  app.enableShutdownHooks();

  const corsOrigins: string[] | undefined = process.env.CORS_ORIGIN?.split(',')
    .map((origin: string) => origin.trim())
    .filter((origin: string) => origin.length > 0);

  app.enableCors({
    origin:
      corsOrigins !== undefined && corsOrigins.length > 0
        ? corsOrigins
        : true,
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Anonymous-Id',
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT ?? DEFAULT_PORT);
}

void bootstrap();
