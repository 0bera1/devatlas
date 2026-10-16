import { apiClient } from '@/api/http/api-client';

export interface ActivityEntry {
  bucketDate: string;
  count: number;
}

export const activityApi = {
  async list(accessToken: string, from: Date, to: Date): Promise<ActivityEntry[]> {
    const params = new URLSearchParams({ from: from.toISOString(), to: to.toISOString() });
    const response = await apiClient.get<ActivityEntry[]>(`/profile/me/activity?${params.toString()}`, { accessToken });
    return response.data;
  },
};
