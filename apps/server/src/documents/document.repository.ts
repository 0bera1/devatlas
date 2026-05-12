import { Inject, Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import {
  PRISMA_SERVICE,
  type IPrismaService,
} from '../prisma/interfaces/prisma-service.interface';
import type { DocumentRecord } from './interfaces/document-record.interface';
import type {
  CreateDocumentInput,
  IDocumentRepository,
} from './interfaces/document-repository.interface';

const documentRecordSelect = {
  id: true,
  title: true,
  content: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
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
    return this.prisma.document.create({
      data: {
        title: input.title,
        ownerId: input.ownerId,
      },
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

  public async selectDocumentByIdAndOwnerId(
    id: string,
    ownerId: string,
  ): Promise<DocumentRecord | null> {
    return this.prisma.document.findFirst({
      where: { id, ownerId },
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
    const existing: DocumentRecord | null =
      await this.selectDocumentByIdAndOwnerId(id, ownerId);

    if (existing === null) {
      return null;
    }

    return this.prisma.document.update({
      where: { id },
      data: { title },
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
