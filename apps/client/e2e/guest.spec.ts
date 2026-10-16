import { expect, test } from '@playwright/test';

test('misafir giriş sayfasını açar ve şifre sıfırlama bağlantısını izler', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('#email')).toBeVisible();
  await page.getByText('Şifrenizi mi unuttunuz?').click();
  await expect(page).toHaveURL(/\/forgot-password$/);
  await expect(page.getByRole('heading', { name: 'Şifreni sıfırla' })).toBeVisible();
});

test('şifre sıfırlama isteği her zaman aynı onay mesajını gösterir', async ({ page }) => {
  await page.goto('/forgot-password');
  await page.locator('#email').fill('bilinmeyen-kullanici@example.com');
  await page.locator('form button[type="submit"]').click();
  await expect(page.getByText('Adresin kayıtlıysa bir bağlantı gönderildi')).toBeVisible();
});

test('doğrulanmamış token ile doğrulama sayfası hata gösterir', async ({ page }) => {
  await page.goto('/verify-email?token=gecersiz-token-gecersiz-token');
  await expect(page.getByText('Bağlantı geçersiz veya süresi dolmuş')).toBeVisible();
});
