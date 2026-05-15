export interface KnowledgeDocumentSummary {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeDocumentRecord extends KnowledgeDocumentSummary {
  content: string;
}
