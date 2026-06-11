import type { DocumentVisibility } from './document-record.interface';

export interface PublicSearchDocumentAuthor {
  id: string;
  firstName: string;
  lastName: string;
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

export interface PublicSearchKnowledgeDocumentHit {
  kind: 'knowledge_document';
  slug: string;
  title: string;
  preview: string;
  updatedAt: Date;
}

export interface PublicSearchKnowledgeDiagramHit {
  kind: 'knowledge_diagram';
  slug: string;
  title: string;
  preview: string;
  updatedAt: Date;
}

export interface PublicSearchKnowledgeFlowHit {
  kind: 'knowledge_flow';
  slug: string;
  title: string;
  preview: string;
  updatedAt: Date;
}

export interface PublicSearchInterviewQuestionHit {
  kind: 'interview_question';
  slug: string;
  title: string;
  preview: string;
  category: string;
  isFollowUp: boolean;
  updatedAt: Date;
}

export type PublicSearchHit =
  | PublicSearchDocumentHit
  | PublicSearchDiagramHit
  | PublicSearchKnowledgeDocumentHit
  | PublicSearchKnowledgeDiagramHit
  | PublicSearchKnowledgeFlowHit
  | PublicSearchInterviewQuestionHit;
