import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type Visibility } from '@prisma/client';
import {
  INTELLIGENCE_SERVICE,
  type IIntelligenceService,
} from '../intelligence/interfaces/intelligence-service.interface';
import {
  USER_ACTIVITY_SERVICE,
  type IUserActivityService,
} from '../user-activity/interfaces/user-activity-service.interface';
import { FEED_DEFAULT_LIMIT } from './constants/feed.constants';
import { RELATED_PUBLIC_DOCUMENTS_LIMIT } from './constants/related.constants';
import { SEARCH_PUBLIC_DOCUMENTS_LIMIT } from './constants/search.constants';
import { buildSearchPreview, SEARCH_PREVIEW_MAX_CHARS } from './utils/search-preview';
import type { DocumentRecord } from './interfaces/document-record.interface';
import type { PublicSearchDocumentHit } from './interfaces/public-search-hit.interface';
import {
  DOCUMENT_REPOSITORY,
  type IDocumentRepository,
} from './interfaces/document-repository.interface';
import {
  ENGAGEMENT_REPOSITORY,
  type IEngagementRepository,
} from './interfaces/engagement-repository.interface';
import type { PaginatedDocumentList } from './interfaces/paginated-document-list.interface';
import type {
  CreateDocumentCommand,
  IDocumentsService,
  ListDocumentsParams,
} from './interfaces/documents-service.interface';
import { normalizeCategoryName } from './utils/normalize-category-name';
import { normalizeDocumentTagNames } from './utils/normalize-document-tag-names';
import { startOfUtcDay } from './utils/utc-date-bucket';

@Injectable()
export class DocumentsService implements IDocumentsService {
  public constructor(
    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepository: IDocumentRepository,
    @Inject(ENGAGEMENT_REPOSITORY)
    private readonly engagementRepository: IEngagementRepository,
    @Inject(INTELLIGENCE_SERVICE)
    private readonly intelligenceService: IIntelligenceService,
    @Inject(USER_ACTIVITY_SERVICE)
    private readonly userActivityService: IUserActivityService,
  ) {}

  public async createDocument(
    ownerId: string,
    command: CreateDocumentCommand,
  ): Promise<DocumentRecord> {
    const providedTagNames: string[] | undefined = normalizeDocumentTagNames(
      command.tags,
    );
    const tagNames: string[] | undefined = this.resolveCreationTagNames(
      providedTagNames,
      command.title,
    );

    const categoryName: string | undefined = normalizeCategoryName(
      command.categoryName,
    );

    const created: DocumentRecord =
      await this.documentRepository.insertDocument({
        ownerId,
        title: command.title,
        visibility: command.visibility,
        tagNames,
        ...(categoryName !== undefined ? { categoryName } : {}),
      });

    await this.userActivityService.recordActivity(ownerId);
    return created;
  }

  /**
   * Kullanıcı etiket vermediyse başlığa bakarak heuristic etiket üret.
   * Kullanıcı etiket verdiyse niyetine saygı duy, dokunma.
   */
  private resolveCreationTagNames(
    providedTagNames: string[] | undefined,
    title: string,
  ): string[] | undefined {
    if (providedTagNames !== undefined) {
      return providedTagNames;
    }

    const autoTags: string[] =
      this.intelligenceService.extractAutoTagsFromSource({ title });
    return autoTags.length === 0 ? undefined : autoTags;
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

    await this.userActivityService.recordActivity(ownerId);
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
    patch: {
      title?: string;
      visibility?: Visibility;
      categoryName?: string | null;
    },
  ): Promise<DocumentRecord> {
    const repoPatch: {
      title?: string;
      visibility?: Visibility;
      categoryName?: string | null;
    } = {};

    if (patch.title !== undefined) {
      repoPatch.title = patch.title;
    }
    if (patch.visibility !== undefined) {
      repoPatch.visibility = patch.visibility;
    }
    if (patch.categoryName !== undefined) {
      switch (patch.categoryName) {
        case null:
          repoPatch.categoryName = null;
          break;
        default: {
          const normalized: string | undefined = normalizeCategoryName(
            patch.categoryName,
          );
          repoPatch.categoryName =
            normalized === undefined ? null : normalized;
          break;
        }
      }
    }

    if (
      repoPatch.title === undefined &&
      repoPatch.visibility === undefined &&
      repoPatch.categoryName === undefined
    ) {
      throw new BadRequestException(
        'Provide at least one field: title, visibility, or categoryName.',
      );
    }

    const updated: DocumentRecord | null =
      await this.documentRepository.updateDocumentPatchByIdAndOwnerId(
        id,
        ownerId,
        repoPatch,
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

  public async getLatestPublicFeed(): Promise<DocumentRecord[]> {
    return this.documentRepository.selectPublicFeedLatest(FEED_DEFAULT_LIMIT);
  }

  public async getTrendingPublicFeed(): Promise<DocumentRecord[]> {
    return this.documentRepository.selectPublicFeedTrending(FEED_DEFAULT_LIMIT);
  }

  public async recordPublicDocumentView(
    documentId: string,
    viewerKey: string,
  ): Promise<boolean> {
    return this.engagementRepository.tryCountPublicDocumentView(
      documentId,
      viewerKey,
      startOfUtcDay(new Date()),
    );
  }

  public async addFavorite(userId: string, documentId: string): Promise<void> {
    const doc: DocumentRecord | null =
      await this.documentRepository.selectDocumentByIdForUser(
        documentId,
        userId,
      );

    if (doc === null) {
      throw new NotFoundException(
        `Document with id "${documentId}" not found`,
      );
    }

    try {
      await this.engagementRepository.insertFavorite(userId, documentId);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Document already favorited');
      }
      throw error;
    }
  }

  public async searchPublicDocuments(
    rawQuery: string,
  ): Promise<PublicSearchDocumentHit[]> {
    const trimmed: string = rawQuery.trim();
    if (trimmed.length === 0) {
      return [];
    }
    const rows = await this.documentRepository.selectPublicDocumentsByQuery(
      trimmed,
      SEARCH_PUBLIC_DOCUMENTS_LIMIT,
    );

    return rows.map(
      row =>
        ({
          kind: 'document',
          id: row.id,
          title: row.title,
          preview: buildSearchPreview(row.content, SEARCH_PREVIEW_MAX_CHARS),
          favoriteCount: row.favoriteCount,
          viewCount: row.viewCount,
          ownerId: row.ownerId,
          author: {
            id: row.owner.id,
            firstName: row.owner.firstName,
            lastName: row.owner.lastName,
            email: row.owner.email,
          },
          visibility: row.visibility,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        }) satisfies PublicSearchDocumentHit,
    );
  }

  public async getRelatedDocuments(
    documentId: string,
    viewerUserId: string | null,
  ): Promise<DocumentRecord[]> {
    const source: DocumentRecord | null =
      viewerUserId === null
        ? await this.documentRepository.selectDocumentByIdPublicOnly(
            documentId,
          )
        : await this.documentRepository.selectDocumentByIdForUser(
            documentId,
            viewerUserId,
          );

    if (source === null) {
      throw new NotFoundException(
        `Document with id "${documentId}" not found`,
      );
    }

    return this.documentRepository.selectPublicRelatedDocumentsBySharedTagsAndCategory(
      documentId,
      RELATED_PUBLIC_DOCUMENTS_LIMIT,
    );
  }
}
