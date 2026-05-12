# DevAtlas

Next.js arayüz, NestJS API, Prisma ve PostgreSQL içeren tam yığın bir SaaS iskeletidir. Üç servis `docker-compose` ile birlikte çalışır.

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

### Erişim adresleri

| Servis | Adres |
|--------|--------|
| Next.js (web) | http://localhost:3000 |
| NestJS API | http://localhost:3500 |
| Örnek kullanıcı listesi | http://localhost:3500/users |
| PostgreSQL (makineden) | `localhost:5432`, veritabanı `devatlas`, kullanıcı `postgres` / şifre `postgres` |

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

### Veritabanı bağlantı dizesi

API için `apps/server/.env` içinde `DATABASE_URL` kullanılır.

- **PostgreSQL aynı makinede (Docker’daki `db` kapalı):** host olarak `localhost` kullanın.
- **API’yi makinede, Postgres’i `docker compose` ile çalıştırırken:** host olarak `localhost` ve map edilen port `5432` uygundur.

NestJS API’yi geliştirme modunda:

```bash
cd apps/server
npm run start:dev
```

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
│   └── server/           # NestJS + Prisma
└── infrastructure/       # altyapı ile ilgili ek dosyalar
```

## Sorun giderme

- **Docker daemon çalışmıyor:** Docker Desktop’ı açıp tekrar `docker compose up` deneyin.
- **Port çakışması:** 3000, 3500 veya 5432 kullanımdaysa ilgili uygulamayı durdurun veya `docker-compose.yml` içindeki port eşlemelerini değiştirin.
