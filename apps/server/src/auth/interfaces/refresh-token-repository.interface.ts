export const REFRESH_TOKEN_REPOSITORY: unique symbol = Symbol(
  'REFRESH_TOKEN_REPOSITORY',
);

export interface CreateRefreshTokenParams {
  userId: string;
  familyId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface RefreshTokenRecord {
  id: string;
  userId: string;
  familyId: string | null;
  expiresAt: Date;
  revokedAt: Date | null;
}

export interface IRefreshTokenRepository {
  insertToken(params: CreateRefreshTokenParams): Promise<{ id: string }>;
  findByTokenHash(tokenHash: string): Promise<RefreshTokenRecord | null>;
  deleteById(id: string): Promise<void>;
  /**
   * Kullanılan token'ı iptal eder ve aynı oturum ailesinde yeni token üretir.
   * Eski satır silinmez; yeniden kullanım tespiti için iptal zamanı tutulur.
   */
  rotateToken(
    oldId: string,
    params: CreateRefreshTokenParams,
  ): Promise<{ id: string }>;
  /** Bir oturum ailesindeki tüm token'ları siler (yeniden kullanım tespitinde). */
  deleteByFamilyId(familyId: string): Promise<number>;
  /** Kullanıcının tüm refresh token'larını siler (şifre sıfırlamada). */
  deleteByUserId(userId: string): Promise<number>;
}
