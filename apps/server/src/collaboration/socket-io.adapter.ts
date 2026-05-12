import { INestApplication } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import type { ServerOptions } from 'socket.io';

export class SocketIoAdapter extends IoAdapter {
  public constructor(app: INestApplication) {
    super(app);
  }

  public override createIOServer(port: number, options?: ServerOptions): unknown {
    const corsOrigins: string[] | undefined = process.env.CORS_ORIGIN?.split(',')
      .map((origin: string) => origin.trim())
      .filter((origin: string) => origin.length > 0);

    const merged = {
      ...(options ?? {}),
      path: options?.path ?? '/socket.io',
      cors: {
        origin:
          corsOrigins !== undefined && corsOrigins.length > 0
            ? corsOrigins
            : true,
        credentials: true,
      },
    };
    return super.createIOServer(port, merged as ServerOptions);
  }
}
