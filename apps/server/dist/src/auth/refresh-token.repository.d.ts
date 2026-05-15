import { type IPrismaService } from '../prisma/interfaces/prisma-service.interface';
import type { CreateRefreshTokenParams, IRefreshTokenRepository, RefreshTokenRecord } from './interfaces/refresh-token-repository.interface';
export declare class RefreshTokenRepository implements IRefreshTokenRepository {
    private readonly prisma;
    constructor(prisma: IPrismaService);
    insertToken(params: CreateRefreshTokenParams): Promise<{
        id: string;
    }>;
    findByTokenHash(tokenHash: string): Promise<RefreshTokenRecord | null>;
    deleteById(id: string): Promise<void>;
    replaceToken(oldId: string, params: CreateRefreshTokenParams): Promise<{
        id: string;
    }>;
}
