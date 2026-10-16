import { expect, test } from '@playwright/test';
import { API_URL, readSharedUsers, registerUser, signIn } from './helpers';

// Bu dosya kurulumda kaydedilen sahip oturumunu kullanır (playwright.config.ts).
test.describe.configure({ mode: 'serial' });

test('giriş sonrası bugün ekranı açılır ve mod çubuğu görünür', async ({ page }) => {
  await page.goto('/today');
  await expect(page.getByRole('navigation', { name: 'modes' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Bugün' }).first()).toBeVisible();
});

test('tekrar sayfası ilerleme özetini ve çalışma listeleri bağlantısını gösterir', async ({ page }) => {
  await page.goto('/study');
  await expect(page.getByRole('heading', { name: 'Tekrar' })).toBeVisible();
  await expect(page.getByText('Bugün tekrar')).toBeVisible();
  await page.getByRole('link', { name: 'Çalışma listelerim' }).click();
  await expect(page).toHaveURL(/\/study\/lists$/);
  await expect(page.getByRole('heading', { name: 'Çalışma listeleri' })).toBeVisible();
});

test('çalışma listesi oluşturulur ve listelenir', async ({ page }) => {
  const name = `Sistem tasarımı ${Date.now()}`;
  await page.goto('/study/lists');
  await page.getByPlaceholder('Liste adı').fill(name);
  await page.getByRole('button', { name: 'Liste oluştur' }).click();
  await expect(page.getByText(name)).toBeVisible();
});

test('ayarlar dört hazır tema ve dört yazı boyutu sunar', async ({ page }) => {
  await page.goto('/settings');
  await expect(page.getByRole('heading', { name: 'Ayarlar' })).toBeVisible();
  for (const label of ['Açık', 'Kağıt', 'Koyu', 'Gece']) {
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
  }
  for (const label of ['Küçük', 'Normal', 'Büyük', 'Çok büyük']) {
    await expect(page.getByRole('button', { name: new RegExp(label) })).toBeVisible();
  }
});

test('dil değişince arayüz metinleri seçilen dile geçer', async ({ page, request }) => {
  // Dil tercihi kullanıcıya kalıcı olduğu için bu test kendi hesabını kullanır.
  const user = await registerUser(request, 'lang');
  await signIn(page, user.email);
  await page.goto('/settings');
  await page.getByLabel('Dil', { exact: true }).selectOption('en');
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
});

test('arama kendi dokümanını bulur', async ({ page, request }) => {
  const { owner } = readSharedUsers();
  const headers = { Authorization: `Bearer ${owner.accessToken}` };
  const title = `Olay tabanlı mimari notu ${Date.now()}`;
  const created = await request.post(`${API_URL}/documents`, { headers, data: { title } });
  const doc = (await created.json()) as { id: string };
  await request.put(`${API_URL}/documents/${doc.id}`, { headers, data: { content: 'Kafka partition sıralama' } });

  await page.goto('/search');
  await page.getByPlaceholder('Doküman veya diyagram ara').fill('olay tabanlı');
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
});
