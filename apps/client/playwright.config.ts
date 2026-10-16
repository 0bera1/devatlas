import { defineConfig, devices } from '@playwright/test';

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
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
