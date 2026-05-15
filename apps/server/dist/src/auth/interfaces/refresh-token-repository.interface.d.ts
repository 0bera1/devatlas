export declare const REFRESH_TOKEN_REPOSITORY: unique symbol;
export interface CreateRefreshTokenParams {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
}
export interface RefreshTokenRecord {
    id: string;
    userId: string;
    expiresAt: Date;
}
export interface IRefreshTokenRepository {
    insertToken(params: CreateRefreshTokenParams): Promise<{
        id: string;
    }>;
    findByTokenHash(tokenHash: string): Promise<RefreshTokenRecord | null>;
    deleteById(id: string): Promise<void>;
    replaceToken(oldId: string, params: CreateRefreshTokenParams): Promise<{
        id: string;
    }>;
}
