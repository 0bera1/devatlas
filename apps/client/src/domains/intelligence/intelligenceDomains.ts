import type { DiagramSummary } from '@/domains/diagram/diagramDomains';
import type { DocumentRecord } from '@/domains/documents/documentsDomains';

export interface ScoredDiagramRecommendation extends DiagramSummary {
  score: number;
  matchingKeywords: string[];
}

export interface ScoredDocumentRecommendation extends DocumentRecord {
  score: number;
  matchingKeywords: string[];
}

export interface SimilarTechnologyRecommendation {
  label: string;
  score: number;
  relatedDiagramCount: number;
}

export interface DiagramIntelligenceResource {
  semanticTags: string[];
  relatedDiagrams: ScoredDiagramRecommendation[];
  relatedDocuments: ScoredDocumentRecommendation[];
  relatedInterviewQuestions: ScoredDocumentRecommendation[];
  similarTechnologies: SimilarTechnologyRecommendation[];
}

export interface AutoTagRequestPayload {
  title?: string;
  content?: string;
  extraKeywords?: string[];
}

export interface AutoTagResponse {
  tags: string[];
}

export type GeneratedDiagramNodeKind =
  | 'text'
  | 'db'
  | 'service'
  | 'api'
  | 'cache'
  | 'queue';

export interface GeneratedDiagramNode {
  localId: string;
  label: string;
  type: GeneratedDiagramNodeKind;
  x: number;
  y: number;
  width?: number | null;
  height?: number | null;
}

export interface GeneratedDiagramEdge {
  fromLocalId: string;
  toLocalId: string;
  label?: string;
  type?: 'smoothstep' | 'straight' | 'step' | 'default';
  animated?: boolean;
}

export interface GenerateDiagramRequestPayload {
  prompt: string;
}

export interface GeneratedDiagramTemplate {
  templateId: string;
  templateName: string;
  description: string;
  matchedKeywords: string[];
  score: number;
  nodes: GeneratedDiagramNode[];
  edges: GeneratedDiagramEdge[];
}

export interface RelatedInterviewQuestion {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  difficulty: string | null;
  score: number;
  matchingTags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RelatedInterviewQuestionsResource {
  documentId: string;
  documentTags: string[];
  relatedInterviewQuestions: RelatedInterviewQuestion[];
}
