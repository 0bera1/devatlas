import { INestApplication } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import type { ServerOptions } from 'socket.io';
import { resolveCorsOrigins } from '../common/cors-origins';

export class SocketIoAdapter extends IoAdapter {
  public constructor(app: INestApplication) {
    super(app);
  }

  public override createIOServer(port: number, options?: ServerOptions): unknown {
    const merged = {
      ...(options ?? {}),
      path: options?.path ?? '/socket.io',
      cors: {
        origin: resolveCorsOrigins(),
        credentials: true,
      },
    };
    return super.createIOServer(port, merged as ServerOptions);
  }
}
