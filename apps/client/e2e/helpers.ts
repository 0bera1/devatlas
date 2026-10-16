import type { APIRequestContext, Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

export const API_URL: string = process.env.E2E_API_URL ?? 'http://localhost:3500';
export const PASSWORD = 'Passw0rd!Strong';

/** Kurulum adımının yazdığı oturum dosyası (sahip kullanıcının tarayıcı durumu). */
export const STORAGE_STATE_PATH: string = path.resolve(__dirname, '.auth', 'owner.json');
/** Kurulum adımının yazdığı paylaşılan kullanıcı bilgileri. */
export const SHARED_USERS_PATH: string = path.resolve(__dirname, '.auth', 'shared-users.json');

export interface TestUser {
  email: string;
  accessToken: string;
}

export interface SharedUsers {
  owner: TestUser;
  recipient: TestUser;
}

/**
 * Kayıt uç noktası dakikada sınırlıdır (10/dk). Testler her biri yeni hesap açmak yerine
 * kurulumda oluşturulan paylaşılan hesapları kullanır.
 */
export async function registerUser(request: APIRequestContext, tag: string): Promise<TestUser> {
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

export function readSharedUsers(): SharedUsers {
  return JSON.parse(fs.readFileSync(SHARED_USERS_PATH, 'utf8')) as SharedUsers;
}

/** Giriş formunu kullanarak oturum açar. */
export async function signIn(page: Page, email: string): Promise<void> {
  await page.goto('/login');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('form button[type="submit"]').first().click();
  await page.waitForURL('**/today', { timeout: 20_000 });
}
