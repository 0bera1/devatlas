import type { Visibility } from '@prisma/client';
import type { DocumentRecord } from './document-record.interface';

export const DOCUMENT_REPOSITORY: unique symbol = Symbol('DOCUMENT_REPOSITORY');

export interface CreateDocumentInput {
  ownerId: string;
  title: string;
  visibility?: Visibility;
}

export interface IDocumentRepository {
  insertDocument(input: CreateDocumentInput): Promise<DocumentRecord>;
  countAllDocumentsByOwnerId(ownerId: string): Promise<number>;
  countDocumentsByOwnerIdAndTitleContains(
    ownerId: string,
    titleSearch: string,
  ): Promise<number>;
  selectDocumentsByOwnerIdPage(
    ownerId: string,
    skip: number,
    take: number,
  ): Promise<DocumentRecord[]>;
  selectDocumentsByOwnerIdAndTitleContainsPage(
    ownerId: string,
    titleSearch: string,
    skip: number,
    take: number,
  ): Promise<DocumentRecord[]>;
  /** Okuma: PUBLIC veya istenen kullanıcının sahibi olduğu doküman. */
  selectDocumentByIdForUser(
    id: string,
    userId: string,
  ): Promise<DocumentRecord | null>;
  /** Yazma/silme öncesi: yalnızca owner. */
  selectDocumentByIdAndOwnerId(
    id: string,
    ownerId: string,
  ): Promise<DocumentRecord | null>;
  selectPublicDocumentsOrdered(): Promise<DocumentRecord[]>;
  updateDocumentContentByIdAndOwnerId(
    id: string,
    ownerId: string,
    content: string,
  ): Promise<DocumentRecord | null>;
  updateDocumentTitleByIdAndOwnerId(
    id: string,
    ownerId: string,
    title: string,
  ): Promise<DocumentRecord | null>;
  updateDocumentPatchByIdAndOwnerId(
    id: string,
    ownerId: string,
    patch: { title?: string; visibility?: Visibility },
  ): Promise<DocumentRecord | null>;
  deleteDocumentsByIdAndOwnerId(id: string, ownerId: string): Promise<number>;
}
