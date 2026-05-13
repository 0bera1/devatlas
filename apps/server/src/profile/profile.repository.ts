import { Inject, Injectable } from '@nestjs/common';
import {
  PRISMA_SERVICE,
  type IPrismaService,
} from '../prisma/interfaces/prisma-service.interface';
import type { FavoriteDiagramEntry } from './interfaces/favorite-diagram-entry.interface';
import type { FavoriteDocumentEntry } from './interfaces/favorite-document-entry.interface';
import type { IProfileRepository } from './interfaces/profile-repository.interface';

@Injectable()
export class ProfileRepository implements IProfileRepository {
  public constructor(
    @Inject(PRISMA_SERVICE)
    private readonly prisma: IPrismaService,
  ) {}

  public async selectFavoriteDocumentsByUserId(
    userId: string,
  ): Promise<FavoriteDocumentEntry[]> {
    const rows = await this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        createdAt: true,
        document: {
          select: {
            id: true,
            title: true,
            ownerId: true,
            visibility: true,
            favoriteCount: true,
            viewCount: true,
            updatedAt: true,
          },
        },
      },
    });

    return rows.map(
      (r: (typeof rows)[number]): FavoriteDocumentEntry => ({
        id: r.document.id,
        title: r.document.title,
        ownerId: r.document.ownerId,
        visibility: r.document.visibility,
        favoritedAt: r.createdAt,
        updatedAt: r.document.updatedAt,
        favoriteCount: r.document.favoriteCount,
        viewCount: r.document.viewCount,
      }),
    );
  }

  public async selectFavoriteDiagramsByUserId(
    userId: string,
  ): Promise<FavoriteDiagramEntry[]> {
    const rows = await this.prisma.diagramFavorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        createdAt: true,
        diagram: {
          select: {
            id: true,
            title: true,
            ownerId: true,
            visibility: true,
            favoriteCount: true,
            updatedAt: true,
            _count: { select: { nodes: true } },
          },
        },
      },
    });

    return rows.map(
      (r: (typeof rows)[number]): FavoriteDiagramEntry => ({
        id: r.diagram.id,
        title: r.diagram.title,
        ownerId: r.diagram.ownerId,
        visibility: r.diagram.visibility,
        favoritedAt: r.createdAt,
        updatedAt: r.diagram.updatedAt,
        favoriteCount: r.diagram.favoriteCount,
        nodeCount: r.diagram._count.nodes,
      }),
    );
  }
}
