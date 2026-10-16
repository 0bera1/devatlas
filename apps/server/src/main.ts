import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { resolveCorsOrigins } from './common/cors-origins';
import { SocketIoAdapter } from './collaboration/socket-io.adapter';

const DEFAULT_PORT = 3500;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useWebSocketAdapter(new SocketIoAdapter(app));
  app.enableShutdownHooks();

  app.enableCors({
    origin: resolveCorsOrigins(),
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

  setupSwagger(app);

  app.useStaticAssets(process.env.UPLOAD_DIR ?? join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  await app.listen(process.env.PORT ?? DEFAULT_PORT);
}

/**
 * OpenAPI dokümantasyonu. Üretimde yalnızca SWAGGER_ENABLED=true ile açılır.
 */
function setupSwagger(app: INestApplication): void {
  const isProduction: boolean = process.env.NODE_ENV === 'production';
  const enabled: boolean =
    !isProduction || process.env.SWAGGER_ENABLED === 'true';

  if (!enabled) {
    return;
  }

  const config = new DocumentBuilder()
    .setTitle('DevAtlas API')
    .setDescription('DevAtlas sunucu API dokümantasyonu')
    .setVersion('0.0.1')
    .addBearerAuth()
    .build();

  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));
}

void bootstrap();
