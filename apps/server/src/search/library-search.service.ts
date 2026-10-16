import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PRISMA_SERVICE, type IPrismaService } from '../prisma/interfaces/prisma-service.interface';
import type { LibrarySearchQueryDto } from './dto/library-search-query.dto';

/** Yazım toleransı için pg_trgm benzerlik eşiği. */
const SIMILARITY_THRESHOLD = 0.4;
const SNIPPET_OPTIONS = 'MaxFragments=1,MaxWords=18,MinWords=5';

export interface LibrarySearchHit {
  type: 'document' | 'diagram';
  id: string;
  title: string;
  snippet: string;
  ownerId: string;
  updatedAt: Date;
  score: number;
}

interface RawHit {
  type: 'document' | 'diagram';
  id: string;
  title: string;
  snippet: string;
  ownerId: string;
  updatedAt: Date;
  score: number;
}

@Injectable()
export class LibrarySearchService {
  public constructor(
    @Inject(PRISMA_SERVICE)
    private readonly prisma: IPrismaService,
  ) {}

  /**
   * Kullanıcının erişebildiği (kendi, paylaşılan ve herkese açık) doküman ve
   * diyagramlarda tam metin ve yazım toleranslı arama yapar.
   */
  public async search(userId: string, query: LibrarySearchQueryDto): Promise<LibrarySearchHit[]> {
    const q: string = (query.q ?? '').trim();
    const limit: number = query.limit ?? 20;
    const offset: number = query.offset ?? 0;
    const type: string = query.type ?? 'all';
    const includeDocuments: boolean = type === 'all' || type === 'document';
    const includeDiagrams: boolean =
      type === 'all' || (type === 'diagram' && query.categoryId === undefined && query.tag === undefined);

    const parts: Prisma.Sql[] = [];
    if (includeDocuments) {
      parts.push(this.documentQuery(userId, q, query));
    }
    if (includeDiagrams) {
      parts.push(this.diagramQuery(userId, q, query));
    }
    if (parts.length === 0) {
      return [];
    }

    const union: Prisma.Sql = parts.reduce((acc, part, index) =>
      index === 0 ? part : Prisma.sql`${acc} UNION ALL ${part}`,
    );
    const orderBy: Prisma.Sql =
      query.sort === 'recent' || q.length === 0
        ? Prisma.sql`ORDER BY "updatedAt" DESC`
        : Prisma.sql`ORDER BY score DESC, "updatedAt" DESC`;

    const rows: RawHit[] = await this.prisma.$queryRaw<RawHit[]>(
      Prisma.sql`SELECT * FROM (${union}) AS hits ${orderBy} LIMIT ${limit} OFFSET ${offset}`,
    );
    return rows.map((row) => ({ ...row, score: Number(row.score) }));
  }

  private documentQuery(userId: string, q: string, query: LibrarySearchQueryDto): Prisma.Sql {
    const hasText: boolean = q.length > 0;
    const textMatch: Prisma.Sql = hasText
      ? Prisma.sql`AND (d."searchVector" @@ websearch_to_tsquery('simple', ${q}) OR word_similarity(${q}, d.title) > ${SIMILARITY_THRESHOLD})`
      : Prisma.empty;
    const score: Prisma.Sql = hasText
      ? Prisma.sql`(ts_rank(d."searchVector", websearch_to_tsquery('simple', ${q})) + word_similarity(${q}, d.title))`
      : Prisma.sql`0::float8`;
    const snippet: Prisma.Sql = hasText
      ? Prisma.sql`ts_headline('simple', d.content, websearch_to_tsquery('simple', ${q}), ${SNIPPET_OPTIONS})`
      : Prisma.sql`left(d.content, 160)`;
    const categoryFilter: Prisma.Sql =
      query.categoryId !== undefined ? Prisma.sql`AND d."categoryId" = ${query.categoryId}` : Prisma.empty;
    const tagFilter: Prisma.Sql =
      query.tag !== undefined
        ? Prisma.sql`AND EXISTS (SELECT 1 FROM "DocumentTag" dt JOIN "Tag" t ON t.id = dt."tagId" WHERE dt."documentId" = d.id AND t.name = ${query.tag})`
        : Prisma.empty;

    return Prisma.sql`
      SELECT 'document'::text AS type, d.id, d.title, ${snippet} AS snippet,
             d."ownerId", d."updatedAt", ${score} AS score
      FROM "Document" d
      WHERE (d."ownerId" = ${userId} OR d.visibility = 'PUBLIC')
        ${textMatch}
        ${categoryFilter}
        ${tagFilter}
        ${this.dateFilter(query, 'd')}
    `;
  }

  private diagramQuery(userId: string, q: string, query: LibrarySearchQueryDto): Prisma.Sql {
    const hasText: boolean = q.length > 0;
    const textMatch: Prisma.Sql = hasText
      ? Prisma.sql`AND (g."searchVector" @@ websearch_to_tsquery('simple', ${q}) OR word_similarity(${q}, g.title) > ${SIMILARITY_THRESHOLD})`
      : Prisma.empty;
    const score: Prisma.Sql = hasText
      ? Prisma.sql`(ts_rank(g."searchVector", websearch_to_tsquery('simple', ${q})) + word_similarity(${q}, g.title))`
      : Prisma.sql`0::float8`;

    return Prisma.sql`
      SELECT 'diagram'::text AS type, g.id, g.title, g.title AS snippet,
             g."ownerId", g."updatedAt", ${score} AS score
      FROM "Diagram" g
      WHERE (g."ownerId" = ${userId} OR g.visibility = 'PUBLIC'
             OR EXISTS (SELECT 1 FROM "DiagramCollaborator" c WHERE c."diagramId" = g.id AND c."userId" = ${userId}))
        ${textMatch}
        ${this.dateFilter(query, 'g')}
    `;
  }

  private dateFilter(query: LibrarySearchQueryDto, alias: string): Prisma.Sql {
    const from: Prisma.Sql =
      query.from !== undefined ? Prisma.sql`AND ${Prisma.raw(`${alias}."updatedAt"`)} >= ${query.from}` : Prisma.empty;
    const to: Prisma.Sql =
      query.to !== undefined ? Prisma.sql`AND ${Prisma.raw(`${alias}."updatedAt"`)} <= ${query.to}` : Prisma.empty;
    return Prisma.sql`${from} ${to}`;
  }
}
