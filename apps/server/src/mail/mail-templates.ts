export interface RenderedMail {
  readonly subject: string;
  readonly text: string;
}

export function buildVerificationMail(appUrl: string, token: string): RenderedMail {
  const link: string = `${appUrl}/dogrula?token=${encodeURIComponent(token)}`;
  return {
    subject: 'DevAtlas hesabınızı doğrulayın',
    text: [
      'DevAtlas hesabınızı doğrulamak için aşağıdaki bağlantıya tıklayın:',
      '',
      link,
      '',
      'Bağlantı 24 saat geçerlidir. Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz.',
    ].join('\n'),
  };
}

export function buildPasswordResetMail(appUrl: string, token: string): RenderedMail {
  const link: string = `${appUrl}/sifre-sifirla?token=${encodeURIComponent(token)}`;
  return {
    subject: 'DevAtlas şifre sıfırlama',
    text: [
      'Şifrenizi sıfırlamak için aşağıdaki bağlantıyı kullanın:',
      '',
      link,
      '',
      'Bağlantı 1 saat geçerlidir ve yalnızca bir kez kullanılabilir.',
      'Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz; şifreniz değişmez.',
    ].join('\n'),
  };
}
