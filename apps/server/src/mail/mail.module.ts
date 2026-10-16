import { Module, Provider } from '@nestjs/common';
import { MailService } from './mail.service';
import { MAIL_SERVICE } from './mail.interfaces';

const mailServiceProvider: Provider = {
  provide: MAIL_SERVICE,
  useClass: MailService,
};

@Module({
  providers: [mailServiceProvider],
  exports: [MAIL_SERVICE],
})
export class MailModule {}
