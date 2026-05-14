# DevAtlas — İstemci (Next.js)

DevAtlas web uygulaması. [NestJS API](../server) ile konuşur; kimlik, dokümanlar, diyagramlar, keşif, arama ve profil ekranlarını sunar.

## Teknolojiler

| Alan | Paket / yaklaşım |
|------|------------------|
| Çatı | Next.js 16 (App Router), React 19 |
| Stil | Tailwind CSS 4 |
| Sunucu durumu | TanStack React Query |
| Diyagram editörü | `@xyflow/react` |
| Diyagram editör durumu | Zustand (ör. `diagram-engine`) |
| Gerçek zamanlı | `socket.io-client` (işbirliği) |
| Tema | Özel React Context + `localStorage` + Tailwind `dark` |
| Dil / yerelleştirme | `src/i18n` (TR / EN) |

## Gereksinimler

- Node.js 22+ (önerilir)
- Çalışan API: varsayılan `http://localhost:3500` — bkz. [../server/README.md](../server/README.md)

## Kurulum ve çalıştırma

```bash
npm install
npm run dev
```

Tarayıcı: [http://localhost:3000](http://localhost:3000)

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Üretim derlemesi |
| `npm run start` | Üretim sunucusu (`build` sonrası) |
| `npm run lint` | ESLint |

## Ortam değişkenleri

Proje kökü yerine bu klasörde `.env.local` oluşturun:

| Değişken | Açıklama |
|----------|----------|
| `NEXT_PUBLIC_API_URL` | API tabanı URL’si. Tanımlı değilse `http://localhost:3500` kullanılır (`src/lib/api/base-url.ts`). |

## Kaynak yapısı (özet)

```
src/
├── app/                 # App Router: sayfalar, layout’lar, (auth) / (app) grupları
├── components/          # UI bileşenleri (domain klasörlerine göre gruplanmış)
├── features/            # React Query mutation/query kancaları, özellik odaklı parçalar
├── hooks/               # Paylaşılan özel kancalar
├── api/                 # HTTP istemcisi, endpoint yardımcıları
├── domains/             # Socket / gerçek zamanlı domain sabitleri
├── diagram-engine/      # Diyagram durumu, reducer, canvas kancaları, node tanımları
├── i18n/                # Çeviri metinleri ve tema anahtarı
├── lib/                 # `parse-api-error`, API tabanı vb.
└── components/providers/
    ├── query-provider.tsx
    ├── theme-provider.tsx
    └── locale-provider.tsx
```

Önemli sayfa grupları: `(auth)` (giriş / kayıt), `(app)` (ana kabuk, dokümanlar, diyagramlar, keşif, arama, bilgi bankası, profil).

## API ve kimlik

İstekler `NEXT_PUBLIC_API_URL` üzerinden gider. Korumalı sayfalar `use-require-auth` ve layout ile oturum bekler; token saklama / yenileme akışı auth özellikleri ve API ile uyumludur.

## Tam yığın çalıştırma

Veritabanı, migration ve Docker için depo kökündeki [../../README.md](../../README.md) dosyasına bakın.
