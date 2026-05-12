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

## Projeyi Docker ile ayağa kaldırma

Depoyu klonladıktan sonra **proje kökünde** (`docker-compose.yml` dosyasının olduğu dizinde):

```bash
docker compose up --build
```

İlk çalıştırmada imajlar oluşturulur; API container içinde `prisma migrate deploy` ile migration’lar uygulanır.

API için Compose içinde varsayılanlar tanımlıdır: `JWT_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_DAYS`. Üretim veya paylaşımlı ortamlarda `JWT_SECRET` değerini mutlaka güçlü ve gizli bir anahtarla değiştirin (ör. kök dizinde `.env` ile `JWT_SECRET=...` vererek Compose değişken genişletmesi kullanılabilir).

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

## Yerel geliştirme (Docker kullanmadan veya sadece DB için Docker)

Bağımlılıkları **uygulama klasörlerinde** kur:

```bash
cd apps/server && npm install
cd ../client && npm install
```

### Ortam değişkenleri (API)

`apps/server/.env` dosyasında en azından:

| Değişken | Açıklama |
|----------|----------|
| `DATABASE_URL` | PostgreSQL bağlantı dizesi |
| `JWT_SECRET` | Access JWT imzalama için güçlü gizli anahtar |
| `JWT_ACCESS_EXPIRES_IN` | İsteğe bağlı; access token süresi (örn. `10m`, `1d`) |
| `REFRESH_TOKEN_EXPIRES_DAYS` | İsteğe bağlı; refresh token geçerliliği (gün) |

### Veritabanı bağlantı dizesi

- **PostgreSQL aynı makinede (Docker’daki `db` kapalı):** host olarak `localhost` kullanın.
- **API’yi makinede, Postgres’i `docker compose` ile çalıştırırken:** host olarak `localhost` ve map edilen port `5432` uygundur.

NestJS API’yi geliştirme modunda:

```bash
cd apps/server
npm run start:dev
```

Kod veya modül listesi değiştiyse (ör. auth eklendikten sonra) **`npm run build` yapıp sunucuyu yeniden başlatın** veya `--watch` ile çalıştığınızdan emin olun; eski `dist` veya yenilenmemiş Docker imajı ile çalışan süreçte korumalı uçlara istek atınca `404` görebilirsiniz.

Varsayılan API portu **3500**’dir (`PORT` ortam değişkeni ile değiştirilebilir).

Next.js istemcisi:

```bash
cd apps/client
npm run dev
```

Varsayılan olarak Next geliştirme sunucusu **3000** portundadır.

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
