import { Inject, Injectable } from '@nestjs/common';
import {
  PRISMA_SERVICE,
  type IPrismaService,
} from '../prisma/interfaces/prisma-service.interface';
import type {
  CreateRefreshTokenParams,
  IRefreshTokenRepository,
  RefreshTokenRecord,
} from './interfaces/refresh-token-repository.interface';

@Injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
  public constructor(
    @Inject(PRISMA_SERVICE)
    private readonly prisma: IPrismaService,
  ) {}

  public async insertToken(
    params: CreateRefreshTokenParams,
  ): Promise<{ id: string }> {
    const row = await this.prisma.refreshToken.create({
      data: {
        userId: params.userId,
        familyId: params.familyId,
        tokenHash: params.tokenHash,
        expiresAt: params.expiresAt,
      },
      select: { id: true },
    });
    return row;
  }

  public async findByTokenHash(
    tokenHash: string,
  ): Promise<RefreshTokenRecord | null> {
    return this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        userId: true,
        familyId: true,
        expiresAt: true,
        revokedAt: true,
      },
    });
  }

  public async deleteById(id: string): Promise<void> {
    await this.prisma.refreshToken.delete({
      where: { id },
    });
  }

  public async rotateToken(
    oldId: string,
    params: CreateRefreshTokenParams,
  ): Promise<{ id: string }> {
    return this.prisma.$transaction(async (tx) => {
      await tx.refreshToken.update({
        where: { id: oldId },
        data: { revokedAt: new Date() },
      });
      return tx.refreshToken.create({
        data: {
          userId: params.userId,
          familyId: params.familyId,
          tokenHash: params.tokenHash,
          expiresAt: params.expiresAt,
        },
        select: { id: true },
      });
    });
  }

  public async deleteByFamilyId(familyId: string): Promise<number> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: { familyId },
    });
    return result.count;
  }

  public async deleteByUserId(userId: string): Promise<number> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
    return result.count;
  }
}
