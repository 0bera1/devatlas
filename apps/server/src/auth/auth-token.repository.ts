import { Inject, Injectable } from '@nestjs/common';
import {
  PRISMA_SERVICE,
  type IPrismaService,
} from '../prisma/interfaces/prisma-service.interface';
import type {
  AuthTokenPurposeValue,
  AuthTokenRecord,
  CreateAuthTokenParams,
  IAuthTokenRepository,
} from './interfaces/auth-token-repository.interface';

@Injectable()
export class AuthTokenRepository implements IAuthTokenRepository {
  public constructor(
    @Inject(PRISMA_SERVICE)
    private readonly prisma: IPrismaService,
  ) {}

  public async deleteUnusedByUser(
    userId: string,
    purpose: AuthTokenPurposeValue,
  ): Promise<void> {
    await this.prisma.authToken.deleteMany({
      where: { userId, purpose, usedAt: null },
    });
  }

  public async insertToken(params: CreateAuthTokenParams): Promise<void> {
    await this.prisma.authToken.create({
      data: {
        userId: params.userId,
        purpose: params.purpose,
        tokenHash: params.tokenHash,
        expiresAt: params.expiresAt,
      },
    });
  }

  public async findByTokenHash(
    tokenHash: string,
    purpose: AuthTokenPurposeValue,
  ): Promise<AuthTokenRecord | null> {
    const row = await this.prisma.authToken.findFirst({
      where: { tokenHash, purpose },
      select: { id: true, userId: true, expiresAt: true, usedAt: true },
    });
    return row;
  }

  public async markUsed(id: string, usedAt: Date): Promise<void> {
    await this.prisma.authToken.update({
      where: { id },
      data: { usedAt },
    });
  }
}
