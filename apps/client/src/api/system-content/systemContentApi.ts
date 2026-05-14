import { executeJsonRequest } from '@/api/http/execute-request';
import type { SystemContentRecord } from '@/domains/system-content/systemContentDomains';

export const systemContentApi = {
  /**
   * GET — platform bilgisi; JWT gerekmez (@Public).
   */
  async list(): Promise<SystemContentRecord[]> {
    return executeJsonRequest<SystemContentRecord[]>({
      method: 'GET',
      path: '/system-content',
    });
  },
} as const;
