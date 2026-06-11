import { apiClient } from '@/api/http/api-client';
import type { SystemContentRecord } from '@/domains/system-content/systemContentDomains';

export const systemContentApi = {
  /**
   * GET — platform bilgisi; JWT gerekmez (@Public).
   */
  async list(): Promise<SystemContentRecord[]> {
    const response = await apiClient.get<SystemContentRecord[]>('/system-content');
    return response.data;
  },
} as const;
