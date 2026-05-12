# DevAtlas API — Postman ile Auth Test Rehberi

Varsayılan sunucu adresi: `http://localhost:3500`  
Port `PORT` ortam değişkeni ile değiştirilebilir.

## Ortam değişkenleri

`.env` dosyanızda aşağıdakilerin tanımlı olduğundan emin olun:

| Değişken       | Açıklama                                      |
|----------------|-----------------------------------------------|
| `DATABASE_URL` | PostgreSQL bağlantı dizesi                    |
| `JWT_SECRET`   | Token imzalama için güçlü bir gizli anahtar   |
| `JWT_EXPIRES_IN` | İsteğe bağlı; örn. `1d`, `7d` (varsayılan: `1d`) |

Veritabanı şemasını güncelledikten sonra Docker veya lokal Postgres açıkken:

```bash
npx prisma migrate dev
```

## Postman koleksiyonu önerisi

1. Yeni bir **Environment** oluşturun: `baseUrl` = `http://localhost:3500`
2. İsteklerde URL olarak `{{baseUrl}}/...` kullanın.

### 1) KayIT (Register)

- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/register`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**

```json
{
  "email": "ornek@devatlas.local",
  "password": "guvenliParola123",
  "name": "Test Kullanıcı",
  "birthDate": "1990-05-15T00:00:00.000Z"
}
```

**Beklenen cevap:** `201 Created` — gövdede `accessToken` ve `password` alanı olmayan `user` nesnesi.

Başarılı kayıttan sonra `accessToken` değerini ortam değişkeni olarak kaydedin (ör. Postman **Tests** sekmesinde):

```javascript
const json = pm.response.json();
pm.environment.set("accessToken", json.accessToken);
```

### 2) Giriş (Login)

- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body:**

```json
{
  "email": "ornek@devatlas.local",
  "password": "guvenliParola123"
}
```

**Beklenen cevap:** `200 OK` — `accessToken` + `user`.

### 3) Profil (JWT korumalı örnek route)

- **Method:** `GET`
- **URL:** `{{baseUrl}}/auth/profile`
- **Authorization:** Type `Bearer Token`, Token: `{{accessToken}}`

**Beklenen cevap:** `200 OK` — oturum açan kullanıcının herkese açık alanları (`password` yok).

### 4) Kullanıcı listesi (JWT korumalı)

- **Method:** `GET`
- **URL:** `{{baseUrl}}/users`
- **Authorization:** Bearer `{{accessToken}}`

### 5) Hata senaryoları (kontrol listesi)

| Senaryo              | İstek        | Beklenen HTTP kodu |
|----------------------|-------------|--------------------|
| Yanlış şifre         | `POST /auth/login` | `401 Unauthorized` |
| Aynı e-posta ile kayıt | `POST /auth/register` | `409 Conflict` |
| Token olmadan `/users` | `GET /users` | `401 Unauthorized` |
| Geçersiz / süresi dolmuş token | Bearer hatalı | `401 Unauthorized` |

## Notlar

- Kayıt ve giriş uçları **JWT gerektirmez**; `users` ve `auth/profile` **JWT ister**.
- `birthDate` gövdesi JSON’da ISO-8601 tarih/saat olarak gönderilmelidir (ValidationPipe `transform: true` ile `Date`’e dönüşür).
