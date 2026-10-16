import { expect, test } from '@playwright/test';
import { API_URL, PASSWORD, readSharedUsers, signIn } from './helpers';

// Sahip testleri kurulumda kaydedilen oturumu kullanır (playwright.config.ts).
test.describe.configure({ mode: 'serial' });

test('kayıt formu yeni hesap oluşturur ve bugün ekranına götürür', async ({ page }) => {
  const email = `e2e-ui-${Date.now()}@example.com`;
  await page.goto('/register');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('#firstName').fill('Ada');
  await page.locator('#lastName').fill('Lovelace');
  await page.locator('#birthDate').fill('1990-01-01');
  await page.locator('form button[type="submit"]').first().click();
  await page.waitForURL('**/today', { timeout: 20_000 });
  await expect(page.getByRole('navigation', { name: 'modes' }).first()).toBeVisible();
});

test('Ctrl+K komut paletini açar ve ilerleme sayfasına gider', async ({ page }) => {
  await page.goto('/today');
  // Kısayol dinleyicisi hidrasyondan sonra kaydedilir; kabuk görünmeden tuşa basılmaz.
  await expect(page.getByRole('navigation', { name: 'modes' }).first()).toBeVisible();
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('dialog', { name: 'Komut paleti' })).toBeVisible();
  await page.getByRole('combobox').fill('İlerleme');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/progress$/);
  await expect(page.getByRole('heading', { name: 'İlerleme' })).toBeVisible();
});

test('ilerleme sayfası istatistikleri ve tekrar bağlantısını gösterir', async ({ page }) => {
  await page.goto('/progress');
  await expect(page.getByRole('progressbar')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Tekrara git' })).toHaveAttribute('href', '/study');
});

test('doküman odak modu yan sütunu gizler ve kapatınca geri getirir', async ({ page, request }) => {
  const { owner } = readSharedUsers();
  const created = await request.post(`${API_URL}/documents`, {
    headers: { Authorization: `Bearer ${owner.accessToken}` },
    data: { title: `Odak testi ${Date.now()}` },
  });
  expect(created.ok()).toBeTruthy();
  const doc = (await created.json()) as { id: string };

  await page.goto(`/documents/${doc.id}`);
  const focusButton = page.getByRole('button', { name: 'Odak modu' });
  await expect(focusButton).toBeVisible();
  await expect(page.locator('aside').first()).toBeVisible();

  await focusButton.click();
  await expect(page.getByRole('button', { name: 'Odaktan çık' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('aside').first()).toBeHidden();

  await page.getByRole('button', { name: 'Odaktan çık' }).click();
  await expect(page.locator('aside').first()).toBeVisible();
});

test('diyagram paylaşım bağlantısı oluşturulur', async ({ page, request }) => {
  const { owner } = readSharedUsers();
  const created = await request.post(`${API_URL}/diagrams`, {
    headers: { Authorization: `Bearer ${owner.accessToken}` },
    data: { title: `Paylaşım testi ${Date.now()}` },
  });
  expect(created.ok()).toBeTruthy();
  const diagram = (await created.json()) as { id: string };

  await page.goto(`/diagrams/${diagram.id}`);
  await page.getByRole('button', { name: 'Paylaş' }).click();
  const createResponse = page.waitForResponse(
    (response) => response.url().includes('/share-links') && response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Bağlantı oluştur' }).click();
  expect((await createResponse).status()).toBeLessThan(300);
});

test('diyagrama davet edilen kullanıcı bildirimde daveti görür', async ({ page, request }) => {
  const { owner, recipient } = readSharedUsers();
  const title = `Davet testi ${Date.now()}`;

  const created = await request.post(`${API_URL}/diagrams`, {
    headers: { Authorization: `Bearer ${owner.accessToken}` },
    data: { title },
  });
  const diagram = (await created.json()) as { id: string };
  const invited = await request.post(`${API_URL}/diagrams/${diagram.id}/collaborators`, {
    headers: { Authorization: `Bearer ${owner.accessToken}` },
    data: { email: recipient.email },
  });
  expect(invited.ok()).toBeTruthy();

  // Alıcı, sahipten ayrı bir oturumla giriş yapar.
  await signIn(page, recipient.email);
  await page.getByRole('button', { name: 'Bildirimler' }).click();
  // Davet hem bildirim menüsünde hem Bugün ekranının paylaşılan işler bölümünde görünür.
  await expect(page.getByText(`"${title}" diyagramına davet edildiniz.`).first()).toBeVisible();
});
