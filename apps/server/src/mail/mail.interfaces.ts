export const MAIL_SERVICE: unique symbol = Symbol('MAIL_SERVICE');

export interface MailMessage {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
}

export interface IMailService {
  send(message: MailMessage): Promise<void>;
}
