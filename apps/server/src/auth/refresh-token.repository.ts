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
      select: { id: true, userId: true, expiresAt: true },
    });
  }

  public async deleteById(id: string): Promise<void> {
    await this.prisma.refreshToken.delete({
      where: { id },
    });
  }

  public async replaceToken(
    oldId: string,
    params: CreateRefreshTokenParams,
  ): Promise<{ id: string }> {
    const created = await this.prisma.$transaction(async (tx) => {
      await tx.refreshToken.delete({
        where: { id: oldId },
      });
      return tx.refreshToken.create({
        data: {
          userId: params.userId,
          tokenHash: params.tokenHash,
          expiresAt: params.expiresAt,
        },
        select: { id: true },
      });
    });
    return created;
  }
}
