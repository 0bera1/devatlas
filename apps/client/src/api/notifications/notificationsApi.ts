import { apiClient } from '@/api/http/api-client';

export interface NotificationItem {
  id: string;
  type: 'COLLABORATION_INVITE';
  payload: { diagramId?: string; diagramTitle?: string; invitedById?: string } & Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

export const notificationsApi = {
  async list(accessToken: string): Promise<NotificationItem[]> {
    const response = await apiClient.get<NotificationItem[]>('/notifications', { accessToken });
    return response.data;
  },

  async unreadCount(accessToken: string): Promise<number> {
    const response = await apiClient.get<{ count: number }>('/notifications/unread-count', { accessToken });
    return response.data.count;
  },

  async markRead(accessToken: string, id: string): Promise<void> {
    await apiClient.post<void>(`/notifications/${id}/read`, { accessToken });
  },

  async markAllRead(accessToken: string): Promise<void> {
    await apiClient.post<void>('/notifications/read-all', { accessToken });
  },
};
