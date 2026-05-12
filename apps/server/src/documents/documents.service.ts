import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Visibility } from '@prisma/client';
import type { DocumentRecord } from './interfaces/document-record.interface';
import {
  DOCUMENT_REPOSITORY,
  type IDocumentRepository,
} from './interfaces/document-repository.interface';
import type { PaginatedDocumentList } from './interfaces/paginated-document-list.interface';
import type {
  IDocumentsService,
  ListDocumentsParams,
} from './interfaces/documents-service.interface';

@Injectable()
export class DocumentsService implements IDocumentsService {
  public constructor(
    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepository: IDocumentRepository,
  ) {}

  public async createDocument(
    ownerId: string,
    title: string,
    visibility?: Visibility,
  ): Promise<DocumentRecord> {
    return this.documentRepository.insertDocument({
      ownerId,
      title,
      visibility,
    });
  }

  public async listDocuments(
    ownerId: string,
    params: ListDocumentsParams,
  ): Promise<PaginatedDocumentList> {
    const page: number = params.page;
    const pageSize: number = params.pageSize;
    const skip: number = (page - 1) * pageSize;

    let total: number;
    let items: DocumentRecord[];

    switch (params.titleQuery) {
      case null: {
        total = await this.documentRepository.countAllDocumentsByOwnerId(ownerId);
        items = await this.documentRepository.selectDocumentsByOwnerIdPage(
          ownerId,
          skip,
          pageSize,
        );
        break;
      }
      default: {
        const titleSearch: string = params.titleQuery;
        total =
          await this.documentRepository.countDocumentsByOwnerIdAndTitleContains(
            ownerId,
            titleSearch,
          );
        items =
          await this.documentRepository.selectDocumentsByOwnerIdAndTitleContainsPage(
            ownerId,
            titleSearch,
            skip,
            pageSize,
          );
        break;
      }
    }

    const totalPages: number =
      total === 0 ? 0 : Math.ceil(total / pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  public async listPublicDocuments(): Promise<DocumentRecord[]> {
    return this.documentRepository.selectPublicDocumentsOrdered();
  }

  public async getDocument(userId: string, id: string): Promise<DocumentRecord> {
    const document: DocumentRecord | null =
      await this.documentRepository.selectDocumentByIdForUser(id, userId);

    if (document === null) {
      throw new NotFoundException(`Document with id "${id}" not found`);
    }

    return document;
  }

  public async updateDocumentContent(
    ownerId: string,
    id: string,
    content: string,
  ): Promise<DocumentRecord> {
    const updated: DocumentRecord | null =
      await this.documentRepository.updateDocumentContentByIdAndOwnerId(
        id,
        ownerId,
        content,
      );

    if (updated === null) {
      throw new NotFoundException(`Document with id "${id}" not found`);
    }

    return updated;
  }

  public async updateDocumentTitle(
    ownerId: string,
    id: string,
    title: string,
  ): Promise<DocumentRecord> {
    const updated: DocumentRecord | null =
      await this.documentRepository.updateDocumentTitleByIdAndOwnerId(
        id,
        ownerId,
        title,
      );

    if (updated === null) {
      throw new NotFoundException(`Document with id "${id}" not found`);
    }

    return updated;
  }

  public async patchDocument(
    ownerId: string,
    id: string,
    patch: { title?: string; visibility?: Visibility },
  ): Promise<DocumentRecord> {
    if (patch.title === undefined && patch.visibility === undefined) {
      throw new BadRequestException(
        'Provide at least one field: title or visibility.',
      );
    }

    const updated: DocumentRecord | null =
      await this.documentRepository.updateDocumentPatchByIdAndOwnerId(
        id,
        ownerId,
        patch,
      );

    if (updated === null) {
      throw new NotFoundException(`Document with id "${id}" not found`);
    }

    return updated;
  }

  public async removeDocument(ownerId: string, id: string): Promise<void> {
    const deletedCount: number =
      await this.documentRepository.deleteDocumentsByIdAndOwnerId(id, ownerId);

    if (deletedCount === 0) {
      throw new NotFoundException(`Document with id "${id}" not found`);
    }
  }
}
