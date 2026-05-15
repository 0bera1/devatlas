import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  KnowledgeDiagramRecord,
  KnowledgeDiagramSummary,
} from './interfaces/knowledge-diagram-record.interface';
import type {
  KnowledgeDocumentRecord,
  KnowledgeDocumentSummary,
} from './interfaces/knowledge-document-record.interface';
import type {
  KnowledgeFlowRecord,
  KnowledgeFlowSummary,
} from './interfaces/knowledge-flow-record.interface';
import {
  KNOWLEDGE_REPOSITORY,
  type IKnowledgeRepository,
} from './interfaces/knowledge-repository.interface';
import type { KnowledgeContentLocale } from './knowledge-narrative-locale.util';
import type { IKnowledgeService } from './interfaces/knowledge-service.interface';

@Injectable()
export class KnowledgeBaseService implements IKnowledgeService {
  public constructor(
    @Inject(KNOWLEDGE_REPOSITORY)
    private readonly repository: IKnowledgeRepository,
  ) {}

  public async listDocuments(): Promise<KnowledgeDocumentSummary[]> {
    return this.repository.selectDocumentsOrdered();
  }

  public async getDocumentBySlug(slug: string): Promise<KnowledgeDocumentRecord> {
    const row: KnowledgeDocumentRecord | null =
      await this.repository.selectDocumentBySlug(slug);
    if (row === null) {
      throw new NotFoundException(`Knowledge document "${slug}" not found`);
    }
    return row;
  }

  public async listDiagrams(
    locale: KnowledgeContentLocale,
  ): Promise<KnowledgeDiagramSummary[]> {
    return this.repository.selectDiagramsOrdered(locale);
  }

  public async getDiagramBySlug(
    slug: string,
    locale: KnowledgeContentLocale,
  ): Promise<KnowledgeDiagramRecord> {
    const row: KnowledgeDiagramRecord | null =
      await this.repository.selectDiagramBySlug(slug, locale);
    if (row === null) {
      throw new NotFoundException(`Knowledge diagram "${slug}" not found`);
    }
    return row;
  }

  public async listFlows(
    locale: KnowledgeContentLocale,
  ): Promise<KnowledgeFlowSummary[]> {
    return this.repository.selectFlowsOrdered(locale);
  }

  public async getFlowBySlug(
    slug: string,
    locale: KnowledgeContentLocale,
  ): Promise<KnowledgeFlowRecord> {
    const row: KnowledgeFlowRecord | null =
      await this.repository.selectFlowBySlug(slug, locale);
    if (row === null) {
      throw new NotFoundException(`Knowledge flow "${slug}" not found`);
    }
    return row;
  }
}
