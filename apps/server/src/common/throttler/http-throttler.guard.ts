import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Hız sınırlamasını yalnızca HTTP isteklerine uygular.
 * Global olarak kaydedildiğinde WebSocket bağlamında da çalışmaya kalkmasın diye.
 */
@Injectable()
export class HttpThrottlerGuard extends ThrottlerGuard {
  public override canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') {
      return Promise.resolve(true);
    }
    return super.canActivate(context);
  }
}
