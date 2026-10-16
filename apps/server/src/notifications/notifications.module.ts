import { Module, Provider } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificationsController } from './notifications.controller';
import { NOTIFICATIONS_SERVICE, NotificationsService } from './notifications.service';

const notificationsServiceProvider: Provider = {
  provide: NOTIFICATIONS_SERVICE,
  useClass: NotificationsService,
};

@Module({
  imports: [AuthModule],
  controllers: [NotificationsController],
  providers: [notificationsServiceProvider],
  exports: [NOTIFICATIONS_SERVICE],
})
export class NotificationsModule {}
