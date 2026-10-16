import { expect, test } from '@playwright/test';
import { API_URL, readSharedUsers } from './helpers';

// Telefon genişliğinde ana ekranlarda yatay kaydırma olmamalı (16px kenar boşluğu kuralı).
test.use({ viewport: { width: 390, height: 844 } });
test.describe.configure({ mode: 'serial' });

const ROUTES: readonly string[] = [
  '/today',
  '/documents',
  '/diagrams',
  '/explore',
  '/knowledge',
  '/study',
  '/study/lists',
  '/progress',
  '/search',
  '/profile',
  '/settings',
];

test('telefon genişliğinde ana ekranlar yatay kaydırma yapmaz', async ({ page, request }) => {
  // Yan sütunların ve uzun başlıkların taşmasını gerçekçi içerikle ölçmek için bir doküman ve diyagram oluşturulur.
  const { owner } = readSharedUsers();
  const headers = { Authorization: `Bearer ${owner.accessToken}` };
  await request.post(`${API_URL}/documents`, { headers, data: { title: 'Çok uzun bir doküman başlığı mobil taşmayı kontrol etmek için yazıldı' } });
  await request.post(`${API_URL}/diagrams`, { headers, data: { title: 'Mobil diyagram test başlığı' } });

  const overflowing: string[] = [];
  for (const route of ROUTES) {
    await page.goto(route);
    await page.waitForLoadState('networkidle');
    const overflow: number = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 0) {
      const offenders: string[] = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        return Array.from(document.querySelectorAll('body *'))
          .filter((el) => el.getBoundingClientRect().right > vw + 1)
          .slice(0, 5)
          .map((el) => `${el.tagName.toLowerCase()} ${Math.round(el.getBoundingClientRect().right)}px`);
      });
      overflowing.push(`${route} (+${overflow}px: ${offenders.join(', ') || 'öğe bulunamadı'})`);
    }
  }
  expect(overflowing, 'yatay taşma olan sayfalar').toEqual([]);
});
