# DevAtlas API — Document System Rehberi

Doküman modülü: oluşturma, sayfalı liste (isteğe bağlı başlık araması), detay, içerik güncelleme (`PUT`), başlık güncelleme (`PATCH`), silme.  
Tüm `/documents` uçları **JWT (Bearer)** ile korunur; önce [postman-auth-test.md](./postman-auth-test.md) ile giriş yapıp `accessToken` alın.

Varsayılan sunucu: `http://localhost:3500`

## Ortak header

| Header | Değer |
|--------|--------|
| `Authorization` | `Bearer {{accessToken}}` |
| `Content-Type` | `application/json` (body olan isteklerde) |

## Veri modeli (özet)

| Alan | Açıklama |
|------|-----------|
| `id` | CUID |
| `title` | Başlık |
| `content` | Düz metin (ileride rich text için ayrılabilir) |
| `ownerId` | Dokümanı oluşturan kullanıcının `id` değeri |
| `createdAt` / `updatedAt` | ISO tarih |

Sadece **sahibi** kendi dokümanlarını listeler, okur ve günceller; başkasının kaydına erişim `404` ile sonuçlanır.

---

## 1) Doküman oluştur

- **Method:** `POST`
- **URL:** `{{baseUrl}}/documents`
- **Body:**

```json
{
  "title": "İlk not"
}
```

**Beklenen:** `201 Created` — tam `Document` objesi (`content` genelde `""`).

---

## 2) Dokümanları listele (sayfalama + arama)

- **Method:** `GET`
- **URL:** `{{baseUrl}}/documents?page=1&pageSize=20&q=not`

**Sorgu parametreleri (hepsi isteğe bağlı):**

| Parametre | Varsayılan | Açıklama |
|-----------|------------|----------|
| `page` | `1` | Sayfa (min `1`) |
| `pageSize` | `20` | Sayfa boyutu (min `1`, max `100`) |
| `q` | yok | Başlıkta büyük/küçük harf duyarsız kısmi arama |

**Beklenen:** `200 OK` — sayfalı gövde:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "pageSize": 20,
  "totalPages": 0
}
```

`total === 0` iken `totalPages` `0` olur.

---

## 3) Tek doküman detayı

- **Method:** `GET`
- **URL:** `{{baseUrl}}/documents/:id`

**Beklenen:** `200 OK` — tek doküman; sahip değilseniz veya yoksa `404`.

---

## 4) İçerik güncelle (tam gövde metni)

- **Method:** `PUT`
- **URL:** `{{baseUrl}}/documents/:id`
- **Body:**

```json
{
  "content": "Güncellenmiş gövde metni."
}
```

**Beklenen:** `200 OK` — güncellenmiş doküman.

---

## 5) Başlık güncelle

- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/documents/:id`
- **Body:**

```json
{
  "title": "Yeni başlık"
}
```

**Beklenen:** `200 OK` — güncellenmiş doküman (`content` değişmez).

---

## 6) Doküman sil

- **Method:** `DELETE`
- **URL:** `{{baseUrl}}/documents/:id`

**Beklenen:** `204 No Content`; kayıt yoksa veya sahip değilseniz `404`.

---

## Prisma migration

Şema değiştiyse (ör. yeni indeks):

```bash
cd server
npx prisma migrate dev
```

İlk doküman tablosu için örnek migration adı: `add_documents`.

---

## Sonraki adımlar (henüz yok)

- Sürüm geçmişi (versioning)
- Gerçek zamanlı / çok kullanıcılı düzenleme (collaboration)

Bu rehber mevcut NestJS `documents` modülünün HTTP sözleşmesini yansıtır.
