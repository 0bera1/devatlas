import type { PublicUser } from '../../users/interfaces/public-user.interface';

export const AUTH_SERVICE: unique symbol = Symbol('AUTH_SERVICE');

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
}

export interface IAuthService {
  register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    birthDate: Date,
  ): Promise<AuthResult>;

  login(email: string, password: string): Promise<AuthResult>;

  refresh(refreshToken: string): Promise<AuthResult>;

  /** E-posta adresini doğrular. Geçersiz veya kullanılmış token'da hata verir. */
  verifyEmail(token: string): Promise<void>;

  /** Doğrulanmamış hesap için yeni doğrulama e-postası gönderir. */
  resendVerification(email: string): Promise<void>;

  /**
   * Şifre sıfırlama bağlantısı gönderir. Kullanıcı yoksa sessizce döner
   * (hesap varlığı ifşa edilmez).
   */
  forgotPassword(email: string): Promise<void>;

  /** Token ile yeni şifre belirler ve kullanıcının tüm oturumlarını kapatır. */
  resetPassword(token: string, newPassword: string): Promise<void>;

  /**
   * Opsiyonel Bearer access token doğrular; geçerliyse kullanıcı id, değilse null.
   * Görüntülenme dedup için public uçlarda kullanılır.
   */
  tryGetSubjectFromAccessToken(
    accessToken: string | undefined,
  ): Promise<string | null>;
}
