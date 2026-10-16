import type { APIRequestContext, Page } from '@playwright/test';

export const API_URL: string = process.env.E2E_API_URL ?? 'http://localhost:3500';
export const PASSWORD = 'Passw0rd!Strong';

/** Benzersiz bir test kullanıcısı oluşturur ve erişim belirtecini döndürür. */
export async function registerUser(request: APIRequestContext, tag: string): Promise<{ email: string; accessToken: string }> {
  const email = `e2e-${tag}-${Date.now()}@example.com`;
  const response = await request.post(`${API_URL}/auth/register`, {
    data: { email, password: PASSWORD, firstName: 'E2E', lastName: 'Test', birthDate: '1990-01-01' },
  });
  if (!response.ok()) {
    throw new Error(`register failed: ${response.status()} ${await response.text()}`);
  }
  const body = (await response.json()) as { accessToken: string };
  return { email, accessToken: body.accessToken };
}

/** Giriş formunu kullanarak oturum açar. */
export async function signIn(page: Page, email: string): Promise<void> {
  await page.goto('/login');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('form button[type="submit"]').first().click();
  await page.waitForURL('**/today', { timeout: 20_000 });
}
