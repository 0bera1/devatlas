import { Inject, Injectable } from '@nestjs/common';
import type { Prisma, Visibility } from '@prisma/client';
import { Visibility as VisibilityEnum } from '@prisma/client';
import {
  PRISMA_SERVICE,
  type IPrismaService,
} from '../prisma/interfaces/prisma-service.interface';
import type { DocumentRecord } from './interfaces/document-record.interface';
import type { DocumentSearchRow } from './interfaces/document-search-row.interface';
import type {
  CreateDocumentInput,
  IDocumentRepository,
} from './interfaces/document-repository.interface';

const documentRecordSelect = {
  id: true,
  title: true,
  content: true,
  ownerId: true,
  visibility: true,
  category: {
    select: {
      id: true,
      name: true,
    },
  },
  viewCount: true,
  favoriteCount: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.DocumentSelect;

const documentSearchRowSelect = {
  id: true,
  title: true,
  content: true,
  ownerId: true,
  visibility: true,
  viewCount: true,
  favoriteCount: true,
  createdAt: true,
  updatedAt: true,
  owner: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
} satisfies Prisma.DocumentSelect;

@Injectable()
export class DocumentRepository implements IDocumentRepository {
  public constructor(
    @Inject(PRISMA_SERVICE)
    private readonly prisma: IPrismaService,
  ) {}

  public async insertDocument(
    input: CreateDocumentInput,
  ): Promise<DocumentRecord> {
    const tagNames: readonly string[] | undefined = input.tagNames;
    const documentTagCreates:
      | Prisma.DocumentTagCreateWithoutDocumentInput[]
      | undefined =
      tagNames !== undefined && tagNames.length > 0
        ? tagNames.map(
            (name: string): Prisma.DocumentTagCreateWithoutDocumentInput => ({
              tag: {
                connectOrCreate: {
                  where: { name },
                  create: { name },
                },
              },
            }),
          )
        : undefined;

    const data: Prisma.DocumentCreateInput = {
      title: input.title,
      owner: { connect: { id: input.ownerId } },
      visibility: input.visibility ?? VisibilityEnum.PRIVATE,
    };

    if (documentTagCreates !== undefined) {
      data.documentTags = { create: [...documentTagCreates] };
    }

    if (input.categoryName !== undefined) {
      data.category = {
        connectOrCreate: {
          where: { name: input.categoryName },
          create: { name: input.categoryName },
        },
      };
    }

    return this.prisma.document.create({
      data,
      select: documentRecordSelect,
    });
  }

  public async countAllDocumentsByOwnerId(ownerId: string): Promise<number> {
    return this.prisma.document.count({
      where: { ownerId },
    });
  }

  public async countDocumentsByOwnerIdAndTitleContains(
    ownerId: string,
    titleSearch: string,
  ): Promise<number> {
    return this.prisma.document.count({
      where: {
        ownerId,
        title: {
          contains: titleSearch,
          mode: 'insensitive',
        },
      },
    });
  }

  public async selectDocumentsByOwnerIdPage(
    ownerId: string,
    skip: number,
    take: number,
  ): Promise<DocumentRecord[]> {
    return this.prisma.document.findMany({
      where: { ownerId },
      select: documentRecordSelect,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  public async selectDocumentsByOwnerIdAndTitleContainsPage(
    ownerId: string,
    titleSearch: string,
    skip: number,
    take: number,
  ): Promise<DocumentRecord[]> {
    return this.prisma.document.findMany({
      where: {
        ownerId,
        title: {
          contains: titleSearch,
          mode: 'insensitive',
        },
      },
      select: documentRecordSelect,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  public async selectDocumentByIdForUser(
    id: string,
    userId: string,
  ): Promise<DocumentRecord | null> {
    return this.prisma.document.findFirst({
      where: {
        id,
        OR: [
          { visibility: VisibilityEnum.PUBLIC },
          { ownerId: userId },
        ],
      },
      select: documentRecordSelect,
    });
  }

  public async selectDocumentByIdPublicOnly(
    id: string,
  ): Promise<DocumentRecord | null> {
    return this.prisma.document.findFirst({
      where: { id, visibility: VisibilityEnum.PUBLIC },
      select: documentRecordSelect,
    });
  }

  public async selectDocumentByIdAndOwnerId(
    id: string,
    ownerId: string,
  ): Promise<DocumentRecord | null> {
    return this.prisma.document.findFirst({
      where: { id, ownerId },
      select: documentRecordSelect,
    });
  }

  public async selectPublicDocumentsOrdered(): Promise<DocumentRecord[]> {
    return this.prisma.document.findMany({
      where: { visibility: VisibilityEnum.PUBLIC },
      orderBy: { createdAt: 'desc' },
      select: documentRecordSelect,
    });
  }

  public async selectPublicFeedLatest(take: number): Promise<DocumentRecord[]> {
    return this.prisma.document.findMany({
      where: { visibility: VisibilityEnum.PUBLIC },
      orderBy: { createdAt: 'desc' },
      take,
      select: documentRecordSelect,
    });
  }

  public async selectPublicFeedTrending(
    take: number,
  ): Promise<DocumentRecord[]> {
    return this.prisma.document.findMany({
      where: { visibility: VisibilityEnum.PUBLIC },
      orderBy: [
        { favoriteCount: 'desc' },
        { viewCount: 'desc' },
      ],
      take,
      select: documentRecordSelect,
    });
  }

  public async selectPublicDocumentsByQuery(
    searchTerm: string,
    take: number,
  ): Promise<DocumentSearchRow[]> {
    return this.prisma.document.findMany({
      where: {
        visibility: VisibilityEnum.PUBLIC,
        OR: [
          {
            title: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            content: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            documentTags: {
              some: {
                tag: {
                  name: {
                    contains: searchTerm,
                    mode: 'insensitive',
                  },
                },
              },
            },
          },
          {
            category: {
              name: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          },
        ],
      },
      take,
      orderBy: {
        favoriteCount: 'desc',
      },
      select: documentSearchRowSelect,
    });
  }

  public async selectPublicRelatedDocumentsBySharedTagsAndCategory(
    sourceDocumentId: string,
    take: number,
  ): Promise<DocumentRecord[]> {
    const source: {
      categoryId: string | null;
      documentTags: { tag: { name: string } }[];
    } | null = await this.prisma.document.findUnique({
      where: { id: sourceDocumentId },
      select: {
        categoryId: true,
        documentTags: {
          select: {
            tag: { select: { name: true } },
          },
        },
      },
    });

    if (source === null) {
      return [];
    }

    const tagNames: string[] = source.documentTags.map(
      (row: { tag: { name: string } }): string => row.tag.name,
    );

    if (tagNames.length === 0) {
      return [];
    }

    return this.prisma.document.findMany({
      where: {
        id: { not: sourceDocumentId },
        visibility: VisibilityEnum.PUBLIC,
        categoryId: source.categoryId,
        documentTags: {
          some: {
            tag: {
              name: { in: tagNames },
            },
          },
        },
      },
      orderBy: { favoriteCount: 'desc' },
      take,
      select: documentRecordSelect,
    });
  }

  public async updateDocumentContentByIdAndOwnerId(
    id: string,
    ownerId: string,
    content: string,
  ): Promise<DocumentRecord | null> {
    const existing: DocumentRecord | null =
      await this.selectDocumentByIdAndOwnerId(id, ownerId);

    if (existing === null) {
      return null;
    }

    return this.prisma.document.update({
      where: { id },
      data: { content },
      select: documentRecordSelect,
    });
  }

  public async updateDocumentTitleByIdAndOwnerId(
    id: string,
    ownerId: string,
    title: string,
  ): Promise<DocumentRecord | null> {
    return this.updateDocumentPatchByIdAndOwnerId(id, ownerId, { title });
  }

  public async updateDocumentPatchByIdAndOwnerId(
    id: string,
    ownerId: string,
    patch: {
      title?: string;
      visibility?: Visibility;
      categoryName?: string | null;
    },
  ): Promise<DocumentRecord | null> {
    const existing: DocumentRecord | null =
      await this.selectDocumentByIdAndOwnerId(id, ownerId);

    if (existing === null) {
      return null;
    }

    const data: Prisma.DocumentUpdateInput = {};
    if (patch.title !== undefined) {
      data.title = patch.title;
    }
    if (patch.visibility !== undefined) {
      data.visibility = patch.visibility;
    }
    if (patch.categoryName !== undefined) {
      switch (patch.categoryName) {
        case null:
          data.category = { disconnect: true };
          break;
        default:
          data.category = {
            connectOrCreate: {
              where: { name: patch.categoryName },
              create: { name: patch.categoryName },
            },
          };
          break;
      }
    }

    return this.prisma.document.update({
      where: { id },
      data,
      select: documentRecordSelect,
    });
  }

  public async deleteDocumentsByIdAndOwnerId(
    id: string,
    ownerId: string,
  ): Promise<number> {
    const result: Prisma.BatchPayload = await this.prisma.document.deleteMany({
      where: { id, ownerId },
    });

    return result.count;
  }
}
