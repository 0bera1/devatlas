import type { DocumentVisibility } from '@/domains/documents/documentsDomains';
import type { InterviewPrepCategory } from '@/domains/knowledge/knowledgeDomains';

export interface PublicSearchDocumentAuthor {
  id: string;
  firstName: string;
  lastName: string;
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

export interface PublicSearchKnowledgeDocumentHit {
  kind: 'knowledge_document';
  slug: string;
  title: string;
  preview: string;
  updatedAt: string;
}

export interface PublicSearchKnowledgeDiagramHit {
  kind: 'knowledge_diagram';
  slug: string;
  title: string;
  preview: string;
  updatedAt: string;
}

export interface PublicSearchKnowledgeFlowHit {
  kind: 'knowledge_flow';
  slug: string;
  title: string;
  preview: string;
  updatedAt: string;
}

export interface PublicSearchInterviewQuestionHit {
  kind: 'interview_question';
  slug: string;
  title: string;
  preview: string;
  category: InterviewPrepCategory;
  isFollowUp: boolean;
  updatedAt: string;
}

export type PublicSearchHit =
  | PublicSearchDocumentHit
  | PublicSearchDiagramHit
  | PublicSearchKnowledgeDocumentHit
  | PublicSearchKnowledgeDiagramHit
  | PublicSearchKnowledgeFlowHit
  | PublicSearchInterviewQuestionHit;
