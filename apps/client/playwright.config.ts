import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

/**
 * Uçtan uca testler çalışan yığına karşı koşar (docker compose up -d).
 * Web: E2E_BASE_URL (varsayılan http://localhost:3000), API: E2E_API_URL (varsayılan http://localhost:3500).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
    locale: 'tr-TR',
  },
  projects: [
    // Önce paylaşılan hesaplar oluşturulur ve oturum kaydedilir (e2e/auth.setup.ts).
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    // Misafir sayfaları oturumsuz çalışır.
    { name: 'guest', testMatch: /guest\.spec\.ts/, use: { ...devices['Desktop Chrome'] } },
    // Kimlik doğrulamalı testler kurulumda kaydedilen oturumu kullanır.
    {
      name: 'chromium',
      testMatch: /(authenticated|flows|mobile)\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: path.resolve(__dirname, 'e2e/.auth/owner.json') },
    },
  ],
});
