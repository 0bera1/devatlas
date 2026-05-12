# DevAtlas

Next.js arayüz, NestJS API, Prisma ve PostgreSQL içeren tam yığın bir SaaS iskeletidir. Üç servis `docker-compose` ile birlikte çalışır. API tarafında **JWT tabanlı kimlik doğrulama** (kayıt, giriş, token yenileme, profil) ve **JWT ile korunan doküman** uçları bulunur.

## Mimari

| Katman | Teknoloji | Klasör |
|--------|-----------|--------|
| Önyüz | Next.js | `apps/client` |
| API | NestJS | `apps/server` |
| Veritabanı erişimi | Prisma | `apps/server/prisma` |
| Veritabanı | PostgreSQL 16 | Docker servisi `db` |

## Gereksinimler

- **Docker ile çalıştırmak için:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Compose dahil)
- **Yerel geliştirme için (isteğe bağlı):** Node.js 22+ ve yerelde erişilebilir PostgreSQL

## Projeyi ayağa kaldırma (adım adım)

Aşağıdaki **üç seçenekten** birini kullanın: **tamamını Docker ile** çalıştırmak en hızlı yoldur; geliştirme için sıklıkla **yalnızca veritabanını Docker’da** bırakıp API ve Next.js’i yerelde çalıştırırsınız (Seçenek 2).

### Seçenek 1 — Her şey Docker’da (web + API + PostgreSQL)

1. Bilgisayarınızda **Docker Desktop**’ın çalıştığından emin olun.
2. Depoyu klonlayın ve **proje kök dizinine** girin (`docker-compose.yml` bu dizinde olmalıdır).
3. _(İsteğe bağlı, önerilir — üretim dışı paylaşımlı ortamlar için)_ kök dizinde `.env` oluşturup güçlü bir `JWT_SECRET` tanımlayın; `docker-compose.yml` içinde `${JWT_SECRET:-...}` ile okunur. Tanımlamazsanız Compose’daki güvenlik **amacıyla değiştirilmesi gereken** varsayılan değer kullanılır.
4. Proje kökünde şu komutu çalıştırın:

   ```bash
   docker compose up --build
   ```

   İlk seferde imajlar oluşur; `api` konteyneri açılınca **`prisma migrate deploy`** ile şema güncellenir. Loglarda üç servisin ayakta olduğunu doğrulayın.
5. Bir tarayıcıda **web** adresini açın: [http://localhost:3000](http://localhost:3000).
6. API’nin ayakta olduğunu doğrulamak için [http://localhost:3500](http://localhost:3500) adresine gidin — metin çıktısı (ör. karşılama) görmelisiniz. İsterseniz terminalde:

   ```bash
   curl http://localhost:3500/
   ```

7. İşiniz bitince konteynerları durdurmak için terminalde `Ctrl+C`; arka planda çalıştırdıysanız proje kökünde:

   ```bash
   docker compose down
   ```

**Not:** Compose içinde API için varsayılanlar tanımlıdır: `JWT_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_DAYS`.

### Seçenek 2 — API ve Next.js yerelde, PostgreSQL Docker’da (tipik geliştirme)

1. Docker Desktop çalışıyorken **sadece veritabanı servisini** proje kökünden başlatın:

   ```bash
   docker compose up -d db
   ```

   Postgres’in hazır olduğundan emin olun (birkaç saniye sürebilir). İsterseniz: `docker compose ps`.

2. `apps/server` altında `.env` dosyası oluşturun ve en az şunları verin (`docker-compose.yml` ile uyumlu örnek):

   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/devatlas?schema=public"
   JWT_SECRET="yerelde-gelistirme-icin-uzun-rastgele-bir-metin-en-az-32-karakter"
   ```

   İsteğe bağlı: `JWT_ACCESS_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_DAYS` (sunucunun beklediği isimlerle; ayrıntı için tabloya bakın).

3. Sunucu bağımlılıklarını kurun ve veritabanını güncelleyin:

   ```bash
   cd apps/server
   npm install
   npx prisma generate
   npx prisma migrate dev
   ```

   İlk kurulumda `migrate dev` migration’ları uygular; ad sorarsa uygun bir isim verebilirsiniz.

4. API’yi geliştirme modunda başlatın (`PORT` vermezseniz varsayılan **3500**):

   ```bash
   npm run start:dev
   ```

5. **Yeni bir terminal** açıp istemci bağımlılıklarını kurun ve Next.js’i çalıştırın:

   ```bash
   cd apps/client
   npm install
   npm run dev
   ```

   API adresini özelleştirmek isterseniz `apps/client/.env.local` içinde `NEXT_PUBLIC_API_URL=http://localhost:3500` kullanılabilir; tanımlamazsanız istemci zaten varsayılan olarak `http://localhost:3500` kullanır.

6. Web: [http://localhost:3000](http://localhost:3000), API doğrulama: [http://localhost:3500](http://localhost:3500).

### Seçenek 3 — PostgreSQL tamamen yerel (Docker kullanmadan DB)

Docker kullanmak istemiyorsanız, makinenizde **PostgreSQL** kurulu ve `devatlas` adında (veya seçtiğiniz) bir veritabanı oluşturulmuş olmalıdır.

1. `apps/server/.env` içinde `DATABASE_URL` değerini kendi Postgres kullanıcı / şifre / host bilginize göre yazın (`JWT_SECRET` zorunludur).
2. Yukarıdaki **Seçenek 2**’deki 3–6. adımları aynı şekilde uygulayın (`docker compose` komutları olmadan).

---

## Projeyi Docker ile ayağa kaldırma (kısayol komutları)

Özet olarak proje kökünde tam yığıt için:

```bash
docker compose up --build
```

### Erişim adresleri

| Servis | Adres |
|--------|--------|
| Next.js (web) | http://localhost:3000 |
| NestJS API | http://localhost:3500 |
| PostgreSQL (makineden) | `localhost:5432`, veritabanı `devatlas`, kullanıcı `postgres` / şifre `postgres` |

### API uçları (özet)

| Uç | Açıklama |
|----|----------|
| `GET /` | Sağlık / karşılama metni |
| `POST /auth/register` | Kayıt (JWT gerektirmez) |
| `POST /auth/login` | Giriş (JWT gerektirmez) |
| `POST /auth/refresh` | Access token yenileme (`refreshToken` ile) |
| `GET /auth/profile` | Oturumdaki kullanıcı (**Bearer access JWT**) |
| `GET /users` | Kullanıcı listesi (**Bearer JWT**) |
| `/documents` | CRUD ve sayfalama (**Bearer JWT** — ayrıntılar için aşağıdaki rehber) |

Ayrıntılı istek örnekleri ve Postman akışı: [apps/server/mds/postman-auth-test.md](apps/server/mds/postman-auth-test.md).  
Doküman API’si: [apps/server/mds/documents-api.md](apps/server/mds/documents-api.md).

`docker compose` çalışırken üç container görünür: `devatlas-web`, `devatlas-api`, `devatlas-db`.

### Arka planda çalıştırma

```bash
docker compose up --build -d
```

Durdurmak:

```bash
docker compose down
```

Kalıcı veriyi de silmek için:

```bash
docker compose down -v
```

## Yerel geliştirme (referans)

Üstteki **Seçenek 2 ve 3** adımları yerel kurulum için yeterlidir. Aşağıda ortam değişkenleri ve Prisma için kısa referans yer alır.

### Ortam değişkenleri (API)

`apps/server/.env` dosyasında en azından:

| Değişken | Açıklama |
|----------|----------|
| `DATABASE_URL` | PostgreSQL bağlantı dizesi |
| `JWT_SECRET` | Access JWT imzalama için güçlü gizli anahtar |
| `JWT_ACCESS_EXPIRES_IN` | İsteğe bağlı; access token süresi (örn. `10m`, `1d`) |
| `REFRESH_TOKEN_EXPIRES_DAYS` | İsteğe bağlı; refresh token geçerliliği (gün) |

İstemci tarafında API tabanı adresi: `NEXT_PUBLIC_API_URL` (varsayılan: `http://localhost:3500` — bkz. `apps/client/src/lib/api/base-url.ts`).

### Prisma (yerel)

Şema veya migration değiştiyse `apps/server` içinden:

```bash
npx prisma generate
npx prisma migrate dev
```

Docker ile ilk kurulumda migration’lar API container başlangıcında uygulanır; yerelde çalışırken `migrate dev` veya `db push` ihtiyacınıza göre kullanın.

## Proje yapısı (özet)

```
devatlas/
├── docker-compose.yml    # web + api + db
├── apps/
│   ├── client/           # Next.js
│   └── server/           # NestJS + Prisma (+ mds: API rehberleri)
└── infrastructure/       # altyapı ile ilgili ek dosyalar
```

## Sorun giderme

- **Docker daemon çalışmıyor:** Docker Desktop’ı açıp tekrar `docker compose up` deneyin.
- **Port çakışması:** 3000, 3500 veya 5432 kullanımdaysa ilgili uygulamayı durdurun veya `docker-compose.yml` içindeki port eşlemelerini değiştirin.
- **`Cannot POST /auth/...` veya auth uçlarında `404`:** Çalışan API süreci güncel derlemeyi kullanmıyor olabilir. Yerelde `npm run build` ve sunucuyu yeniden başlatın; Docker’da `docker compose build api --no-cache` ile imajı yenileyip container’ı tekrar çalıştırın.
- **JWT hataları / API açılmıyor:** `JWT_SECRET` tanımlı mı kontrol edin; Docker’da Compose içindeki varsayılanı üretimde kullanmayın.
