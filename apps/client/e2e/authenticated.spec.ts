import { expect, test } from '@playwright/test';
import { API_URL, PASSWORD, registerUser, signIn } from './helpers';

test.describe.configure({ mode: 'serial' });

test('giriş sonrası bugün ekranı açılır ve mod çubuğu görünür', async ({ page, request }) => {
  const user = await registerUser(request, 'today');
  await signIn(page, user.email);
  await expect(page.getByRole('navigation', { name: 'modes' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Bugün' }).first()).toBeVisible();
});

test('tekrar sayfası ilerleme özetini ve çalışma listeleri bağlantısını gösterir', async ({ page, request }) => {
  const user = await registerUser(request, 'study');
  await signIn(page, user.email);
  await page.goto('/study');
  await expect(page.getByRole('heading', { name: 'Tekrar' })).toBeVisible();
  await expect(page.getByText('Bugün tekrar')).toBeVisible();
  await page.getByRole('link', { name: 'Çalışma listelerim' }).click();
  await expect(page).toHaveURL(/\/study\/lists$/);
  await expect(page.getByRole('heading', { name: 'Çalışma listeleri' })).toBeVisible();
});

test('çalışma listesi oluşturulur ve listelenir', async ({ page, request }) => {
  const user = await registerUser(request, 'lists');
  await signIn(page, user.email);
  await page.goto('/study/lists');
  await page.getByPlaceholder('Liste adı').fill('Sistem tasarımı');
  await page.getByRole('button', { name: 'Liste oluştur' }).click();
  await expect(page.getByText('Sistem tasarımı')).toBeVisible();
});

test('ayarlar dört hazır tema ve dört yazı boyutu sunar', async ({ page, request }) => {
  const user = await registerUser(request, 'settings');
  await signIn(page, user.email);
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
  const user = await registerUser(request, 'lang');
  await signIn(page, user.email);
  await page.goto('/settings');
  await page.getByLabel('Dil', { exact: true }).selectOption('en');
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
});

test('arama kendi dokümanını bulur', async ({ page, request }) => {
  const user = await registerUser(request, 'search');
  const headers = { Authorization: `Bearer ${user.accessToken}` };
  const created = await request.post(`${API_URL}/documents`, { headers, data: { title: 'Olay tabanlı mimari notu' } });
  const doc = (await created.json()) as { id: string };
  await request.put(`${API_URL}/documents/${doc.id}`, { headers, data: { content: 'Kafka partition sıralama' } });
  await signIn(page, user.email);
  await page.goto('/search');
  await page.getByPlaceholder('Doküman veya diyagram ara').fill('olay tabanlı');
  await expect(page.getByRole('heading', { name: 'Olay tabanlı mimari notu' })).toBeVisible();
  expect(PASSWORD.length).toBeGreaterThan(0);
});
