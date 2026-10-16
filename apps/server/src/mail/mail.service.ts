import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { resolveMailConfig, type MailConfig } from './mail-config';
import type { IMailService, MailMessage } from './mail.interfaces';

@Injectable()
export class MailService implements IMailService {
  private readonly logger: Logger = new Logger(MailService.name);
  private readonly config: MailConfig;
  private readonly transporter: Transporter | null;

  public constructor(configService: ConfigService) {
    this.config = resolveMailConfig({
      ...process.env,
      MAIL_FROM: configService.get<string>('MAIL_FROM'),
      APP_URL: configService.get<string>('APP_URL'),
      SMTP_HOST: configService.get<string>('SMTP_HOST'),
      SMTP_PORT: configService.get<string>('SMTP_PORT'),
      SMTP_SECURE: configService.get<string>('SMTP_SECURE'),
      SMTP_USER: configService.get<string>('SMTP_USER'),
      SMTP_PASSWORD: configService.get<string>('SMTP_PASSWORD'),
    });

    this.transporter =
      this.config.mode === 'smtp'
        ? nodemailer.createTransport({
            host: this.config.host,
            port: this.config.port,
            secure: this.config.secure,
            auth:
              this.config.user !== undefined
                ? { user: this.config.user, pass: this.config.password }
                : undefined,
          })
        : null;
  }

  public get appUrl(): string {
    return this.config.appUrl;
  }

  public async send(message: MailMessage): Promise<void> {
    if (this.transporter === null) {
      this.logger.log(
        `[e-posta · konsol modu] Kime: ${message.to} | Konu: ${message.subject}\n${message.text}`,
      );
      return;
    }

    await this.transporter.sendMail({
      from: this.config.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
    });
  }
}
