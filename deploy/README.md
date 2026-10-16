# Üretim dağıtımı

Bu belge DevAtlas'ı tek bir Linux sunucuda üretim modunda çalıştırmak için adımları anlatır.

## Gereksinimler

- Docker ve Docker Compose v2 kurulu bir Linux sunucu. Önerilen: en az 2 vCPU, 2 GB RAM.
- Alan adları (ör. `devatlas.example.com` ve `api.devatlas.example.com`) bu sunucunun IP adresine A kaydıyla yönlenmiş olmalı.
- Sunucuda 80 ve 443 portları açık olmalı (Caddy, TLS sertifikasını otomatik alır).
- SMTP bilgileri ya da bir e-posta servisinin SMTP ayarları. Üretimde `SMTP_HOST` zorunludur.

## 1. Kodu al

```bash
git clone <repo-adresi> devatlas
cd devatlas
git checkout <dağıtılacak-etiket-veya-dal>
```

## 2. Ortam dosyasını hazırla

```bash
cp .env.production.example .env.production
```

`.env.production` içinde şunları doldur:

| Değişken | Açıklama |
|---|---|
| `APP_DOMAIN`, `API_DOMAIN` | Web ve API alan adları |
| `PUBLIC_API_URL` | Web istemcisinin API adresi (`https://` ile). Derleme sırasında gömülür, değişirse web imajı yeniden derlenmelidir. |
| `APP_URL`, `CORS_ORIGIN` | Web arayüzünün adresi. Doğrulama ve sıfırlama bağlantıları bu adrese gider. |
| `POSTGRES_PASSWORD` | Uzun, rastgele bir değer. |
| `JWT_SECRET` | En az 32 karakter, rastgele. Üretmek için: `openssl rand -hex 48` |
| `SMTP_*`, `MAIL_FROM` | E-posta sağlayıcısının bilgileri |

Bu dosya gizlidir, git'e eklenmez.

## 3. Yapılandırmayı doğrula

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production config > /dev/null && echo "yapılandırma tamam"
```

Eksik bir gizli değer varsa Compose hangi değişkenin eksik olduğunu söyleyip durur.

## 4. Başlat

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

İlk açılışta API imajı derlenir, `prisma migrate deploy` veritabanı şemasını uygular. Logları kontrol et:

```bash
docker compose -f docker-compose.prod.yml logs -f api
```

## 5. Kontrol et

- `https://<APP_DOMAIN>` açılmalı.
- `https://<API_DOMAIN>/` yanıt vermeli.
- Yeni bir hesap oluştur. Doğrulama e-postası gelmeli, bağlantı `https://<APP_DOMAIN>/verify-email?token=...` adresine gitmeli.

## Güncelleme

```bash
git pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

Migration'lar API açılışında otomatik uygulanır.

## Yedekleme

Veritabanını düzenli olarak yedekle:

```bash
docker compose -f docker-compose.prod.yml exec -T db pg_dump -U postgres devatlas | gzip > devatlas-$(date +%F).sql.gz
```

Avatar dosyaları `uploads` volume'unda tutulur. Bunları da yedekle:

```bash
docker run --rm -v devatlas_uploads:/data -v "$PWD":/backup alpine tar czf /backup/uploads-$(date +%F).tar.gz -C /data .
```

## Notlar

- API ve veritabanı dış ağa açık değildir. Yalnızca Caddy 80 ve 443 portlarını dinler.
- Swagger varsayılan olarak kapalıdır. Açmak için `SWAGGER_ENABLED=true` yap.
- Mevcut bir sunucuda (ör. başka uygulamaların çalıştığı) dağıtmadan önce bellek ve disk kapasitesini kontrol et. Yığın birkaç yüz MB bellek kullanır, ama veritabanı ve derleme için boş alan gerekir.
