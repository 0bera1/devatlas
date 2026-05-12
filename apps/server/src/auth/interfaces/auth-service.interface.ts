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
    name: string | null | undefined,
    birthDate: Date,
  ): Promise<AuthResult>;

  login(email: string, password: string): Promise<AuthResult>;

  refresh(refreshToken: string): Promise<AuthResult>;

  /**
   * Opsiyonel Bearer access token doğrular; geçerliyse kullanıcı id, değilse null.
   * Görüntülenme dedup için public uçlarda kullanılır.
   */
  tryGetSubjectFromAccessToken(
    accessToken: string | undefined,
  ): Promise<string | null>;
}
