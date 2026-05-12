import type { DocumentVisibility } from './document-record.interface';

export interface PublicSearchDocumentAuthor {
  id: string;
  name: string | null;
  email: string;
}

/** GET /search — liste öğesi (tam içerik dönülmez, yalnızca önizleme). */
export interface PublicSearchDocumentHit {
  kind: 'document';
  id: string;
  title: string;
  preview: string;
  favoriteCount: number;
  viewCount: number;
  ownerId: string;
  author: PublicSearchDocumentAuthor;
  visibility: DocumentVisibility;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicSearchDiagramHit {
  kind: 'diagram';
  id: string;
  title: string;
  preview: string;
  ownerId: string;
  author: PublicSearchDocumentAuthor;
  visibility: DocumentVisibility;
  createdAt: Date;
  updatedAt: Date;
}

export type PublicSearchHit = PublicSearchDocumentHit | PublicSearchDiagramHit;
