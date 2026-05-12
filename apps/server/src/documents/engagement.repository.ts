import { Inject, Injectable } from '@nestjs/common';
import { Prisma, Visibility } from '@prisma/client';
import {
  PRISMA_SERVICE,
  type IPrismaService,
} from '../prisma/interfaces/prisma-service.interface';
import type { IEngagementRepository } from './interfaces/engagement-repository.interface';

@Injectable()
export class EngagementRepository implements IEngagementRepository {
  public constructor(
    @Inject(PRISMA_SERVICE)
    private readonly prisma: IPrismaService,
  ) {}

  public async tryCountPublicDocumentView(
    documentId: string,
    viewerKey: string,
    bucketDate: Date,
  ): Promise<boolean> {
    const publicDoc = await this.prisma.document.findFirst({
      where: {
        id: documentId,
        visibility: Visibility.PUBLIC,
      },
      select: { id: true },
    });

    if (publicDoc === null) {
      return false;
    }

    try {
      await this.prisma.documentViewBucket.create({
        data: {
          documentId,
          viewerKey,
          bucketDate,
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return false;
      }
      throw error;
    }

    await this.prisma.document.update({
      where: { id: documentId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    return true;
  }

  public async insertFavorite(
    userId: string,
    documentId: string,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.favorite.create({
        data: {
          userId,
          documentId,
        },
      });
      await tx.document.update({
        where: { id: documentId },
        data: {
          favoriteCount: {
            increment: 1,
          },
        },
      });
    });
  }
}
