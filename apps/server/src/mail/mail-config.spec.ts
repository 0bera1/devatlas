import { resolveMailConfig } from './mail-config';

describe('resolveMailConfig', () => {
  it('SMTP_HOST yoksa geliştirmede konsol modunu seçer', () => {
    expect(resolveMailConfig({ NODE_ENV: 'development' })).toMatchObject({
      mode: 'console',
      appUrl: 'http://localhost:3000',
    });
  });

  it('üretimde SMTP_HOST zorunludur', () => {
    expect(() => resolveMailConfig({ NODE_ENV: 'production' })).toThrow(
      'SMTP_HOST üretim ortamında zorunludur',
    );
  });

  it('SMTP_HOST tanımlıysa smtp modunu seçer ve 465 portunda secure açar', () => {
    expect(
      resolveMailConfig({
        SMTP_HOST: 'smtp.example.com',
        SMTP_PORT: '465',
        SMTP_USER: 'user@example.com',
        SMTP_PASSWORD: 'secret',
        APP_URL: 'https://app.example.com/',
      }),
    ).toMatchObject({
      mode: 'smtp',
      host: 'smtp.example.com',
      port: 465,
      secure: true,
      user: 'user@example.com',
      appUrl: 'https://app.example.com',
    });
  });

  it('varsayılan SMTP portu 587 ve secure kapalıdır', () => {
    expect(resolveMailConfig({ SMTP_HOST: 'smtp.example.com' })).toMatchObject({
      mode: 'smtp',
      port: 587,
      secure: false,
    });
  });
});
