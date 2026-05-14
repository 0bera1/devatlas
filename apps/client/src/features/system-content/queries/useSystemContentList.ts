'use client';

import { systemContentApi } from '@/api/system-content/systemContentApi';
import { systemContentQueryKeys } from '@/api/query/system-content-query-keys';
import type { SystemContentRecord } from '@/domains/system-content/systemContentDomains';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

export function useSystemContentListQuery(): UseQueryResult<
  SystemContentRecord[],
  Error
> {
  return useQuery({
    queryKey: systemContentQueryKeys.list(),
    queryFn: async (): Promise<SystemContentRecord[]> => {
      return systemContentApi.list();
    },
  });
}
