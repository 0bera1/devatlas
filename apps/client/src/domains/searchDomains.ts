import type { DocumentVisibility } from './documentsDomains';

export interface PublicSearchDocumentAuthor {
  id: string;
  name: string | null;
  email: string;
}

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
  createdAt: string;
  updatedAt: string;
}

export interface PublicSearchDiagramHit {
  kind: 'diagram';
  id: string;
  title: string;
  preview: string;
  ownerId: string;
  author: PublicSearchDocumentAuthor;
  visibility: DocumentVisibility;
  createdAt: string;
  updatedAt: string;
}

export type PublicSearchHit = PublicSearchDocumentHit | PublicSearchDiagramHit;
