# DevAtlas — API (NestJS)

DevAtlas REST ve WebSocket arka ucu. PostgreSQL üzerinde Prisma ile şema yönetilir; JWT kimlik doğrulama, doküman / diyagram modülleri ve Socket.IO tabanlı diyagram işbirliği içerir.

## Teknolojiler

| Alan | Paket / yaklaşım |
|------|------------------|
| Çatı | NestJS 11 |
| Yapılandırma | `@nestjs/config` |
| Kimlik | JWT, Passport (`passport-jwt`), bcrypt |
| Doğrulama | `class-validator`, `class-transformer` |
| Veritabanı | PostgreSQL 16 |
| Şema ve erişim | Prisma Migrate + `@prisma/client` |
| Katman | Controller → Service → Repository (arayüz + `PrismaService` enjeksiyonu) |
| Gerçek zamanlı | `@nestjs/websockets`, `@nestjs/platform-socket.io`, `socket.io` |

## Gereksinimler

- Node.js 22+
- PostgreSQL (yerelde veya Docker ile) ve uygulanmış migration’lar

## Kurulum

```bash
npm install
npx prisma generate
npx prisma migrate dev
```

İlk kurulumda `migrate dev` şemayı oluşturur; sonraki şema değişikliklerinde yeni migration üretir.

## Çalıştırma

| Komut | Açıklama |
|-------|----------|
| `npm run start:dev` | İzleme modunda geliştirme (önerilir) |
| `npm run start` | Tek seferlik derleme çıktısı |
| `npm run start:prod` | `dist` üzerinden üretim |
| `npm run build` | Derleme |
| `npm run lint` | ESLint |

Varsayılan HTTP portu **3500** (`main.ts` / ortam değişkeni `PORT`).

## Ortam değişkenleri

`apps/server/.env` (bu klasörde):

| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `DATABASE_URL` | Evet | PostgreSQL bağlantı dizesi |
| `JWT_SECRET` | Evet | Access token imzalama (yeterince uzun rastgele metin) |
| `JWT_ACCESS_EXPIRES_IN` | Hayır | Örn. `10m`, `1d` |
| `REFRESH_TOKEN_EXPIRES_DAYS` | Hayır | Refresh token ömrü (gün) |
| `PORT` | Hayır | Dinleme portu (varsayılan 3500) |

## Modüller (domain)

| Modül | Sorumluluk (kısa) |
|-------|-------------------|
| `auth` | Kayıt, giriş, refresh, profil uçları |
| `users` | Kullanıcı listesi vb. |
| `documents` | Doküman CRUD, görünürlük, etkileşim |
| `diagrams` | Diyagram ve grafik verisi |
| `collaboration` | Socket.IO gateway (JWT ile) |
| `intelligence` | Diyagram / içerik yardım uçları |
| `feed` | Keşif akışı |
| `search` | Arama |
| `profile` | Profil ve tercihler |
| `system-content` | Sistem içerikleri |
| `user-activity` | Etkinlik kaydı (servis; diğer modüller tarafından kullanılır) |
| `prisma` | `PrismaService` ve global modül |

## API belgeleri (repo içi)

- [mds/postman-auth-test.md](./mds/postman-auth-test.md) — Auth ve Postman akışı  
- [mds/documents-api.md](./mds/documents-api.md) — Doküman API özeti  

HTTP özet listesi için depo kökündeki [../../README.md](../../README.md) dosyasına bakın.

## Prisma

Şema: `prisma/schema.prisma`. Migration’lar: `prisma/migrations/`.

```bash
npx prisma migrate dev    # geliştirme
npx prisma migrate deploy # CI / üretim
```

## İstemci ile birlikte geliştirme

1. Bu dizinde `npm run start:dev`
2. [../client](../client) içinde `npm run dev`
3. İstemcide gerekirse `.env.local` ile `NEXT_PUBLIC_API_URL` ayarlayın

Tam Docker kurulumu için yine [../../README.md](../../README.md).
