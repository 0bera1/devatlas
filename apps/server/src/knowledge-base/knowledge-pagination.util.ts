export interface KnowledgePaginationParams {
  readonly page: number;
  readonly pageSize: number;
}

export const KNOWLEDGE_DEFAULT_PAGE_SIZE = 15;
export const KNOWLEDGE_MAX_PAGE_SIZE = 50;

export function parseKnowledgePagination(
  pageRaw: string | undefined,
  pageSizeRaw: string | undefined,
): KnowledgePaginationParams {
  const parsedPage: number = Number.parseInt(pageRaw ?? '1', 10);
  const parsedPageSize: number = Number.parseInt(
    pageSizeRaw ?? String(KNOWLEDGE_DEFAULT_PAGE_SIZE),
    10,
  );

  const page: number =
    Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const pageSize: number =
    Number.isFinite(parsedPageSize) && parsedPageSize > 0
      ? Math.min(parsedPageSize, KNOWLEDGE_MAX_PAGE_SIZE)
      : KNOWLEDGE_DEFAULT_PAGE_SIZE;

  return { page, pageSize };
}

export function buildPaginatedKnowledgeList<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
} {
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
