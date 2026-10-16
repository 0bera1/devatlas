import { apiClient } from '@/api/http/api-client';

/** Hesap kurtarma ve e-posta doğrulama uçları. Yanıtlar hesap varlığını ifşa etmez. */
export const accountApi = {
  async forgotPassword(email: string): Promise<void> {
    await apiClient.post<void>('/auth/forgot-password', { body: { email } });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post<void>('/auth/reset-password', { body: { token, password } });
  },

  async verifyEmail(token: string): Promise<void> {
    await apiClient.post<void>('/auth/verify-email', { body: { token } });
  },

  async resendVerification(email: string): Promise<void> {
    await apiClient.post<void>('/auth/resend-verification', { body: { email } });
  },
};
