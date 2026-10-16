import { expect, test as setup } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { STORAGE_STATE_PATH, SHARED_USERS_PATH, registerUser, signIn } from './helpers';

/**
 * Paylaşılan sahip ve alıcı hesaplarını oluşturur; sahip hesabıyla bir kez giriş yapıp
 * oturumu kaydeder. Böylece testler kayıt ve giriş sınırlarına takılmaz.
 */
setup('paylaşılan test hesapları ve oturum', async ({ page, request }) => {
  const owner = await registerUser(request, 'shared-owner');
  const recipient = await registerUser(request, 'shared-recipient');

  await signIn(page, owner.email);
  await expect(page.getByRole('navigation', { name: 'modes' }).first()).toBeVisible();

  // Yenileme belirteçleri tek kullanımlıktır ve yeniden kullanımda oturum ailesini iptal eder.
  // Her test bağlamı aynı belirteci yeniden kullandığı için dosyadan yalnızca erişim belirteci kalır.
  const state = await page.context().storageState();
  for (const origin of state.origins) {
    origin.localStorage = origin.localStorage.filter((item) => item.name !== 'devatlas_refresh_token');
  }
  fs.mkdirSync(path.dirname(STORAGE_STATE_PATH), { recursive: true });
  fs.writeFileSync(STORAGE_STATE_PATH, JSON.stringify(state, null, 2));
  fs.writeFileSync(SHARED_USERS_PATH, JSON.stringify({ owner, recipient }, null, 2));
});
