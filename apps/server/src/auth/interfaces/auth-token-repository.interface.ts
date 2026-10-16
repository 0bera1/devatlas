export const AUTH_TOKEN_REPOSITORY: unique symbol = Symbol('AUTH_TOKEN_REPOSITORY');

export type AuthTokenPurposeValue = 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';

export interface CreateAuthTokenParams {
  userId: string;
  purpose: AuthTokenPurposeValue;
  tokenHash: string;
  expiresAt: Date;
}

export interface AuthTokenRecord {
  id: string;
  userId: string;
  expiresAt: Date;
  usedAt: Date | null;
}

export interface IAuthTokenRepository {
  /** Aynı kullanıcı ve amaç için kullanılmamış eski token'ları siler. */
  deleteUnusedByUser(userId: string, purpose: AuthTokenPurposeValue): Promise<void>;
  insertToken(params: CreateAuthTokenParams): Promise<void>;
  findByTokenHash(
    tokenHash: string,
    purpose: AuthTokenPurposeValue,
  ): Promise<AuthTokenRecord | null>;
  markUsed(id: string, usedAt: Date): Promise<void>;
}
