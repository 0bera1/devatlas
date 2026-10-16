# DevAtlas — Yapılacaklar

Son güncelleme: 2026-10-16

Bu dosya açık işlerin takip listesidir. Tamamlanan maddeler `[x]` ile işaretlenir.
Yerel çalıştırma: `docker compose up -d` (proje kökünde). API: http://localhost:3500, Swagger: http://localhost:3500/docs, web: http://localhost:3000.

## İhtiyaç bekleyenler (sizden gerekenler)

- [ ] **E-posta sağlayıcısı (SMTP)**
  - Gerekenler: SMTP host, port, kullanıcı, şifre ve gönderen adresi (`MAIL_FROM`). Ya da Resend / Postmark / SES gibi bir servis ve API anahtarı (servise göre küçük bir entegrasyon eklenir).
  - Durum: Kod hazır. Geliştirmede e-postalar konsola yazılıyor. Üretimde `SMTP_HOST` zorunlu, yoksa uygulama açılmaz.
  - Doğrulama bağlantısının gideceği web adresi (`APP_URL`) de gerekli.
- [ ] **Deployment hedefi**
  - Gerekenler: hedef sunucu (IP veya alan adı), SSH erişimi, alan adı ve SSL için yönlendirme. Hangi sunucuda çalışacağı kararı.
  - Durum: Docker imajları yerelde derleniyor ve çalışıyor. Üretim ortam şablonu hazır (`apps/server/.env.example`).
- [ ] **Eksik seed içeriği**: `apps/server/prisma/seed/data/` içinde beş dosya repoda yoktu (`interview-topic-diagrams`, `interview-topic-documents`, `interview-topic-flows`, `interview-knowledge-links`, `interview-questions`). Yerel bir kopyanız varsa bu dosyalara koyun. Şu an boş yer tutucular var, mülakat soruları ve konu içerikleri boş görünür.

## Tamamlanan

### Güvenlik ve altyapı
- [x] `GET /users` kaldırıldı; `GET` ve `DELETE /users/:id` yalnızca kendi kaydı için
- [x] CORS üretimde zorunlu (HTTP ve Socket.IO)
- [x] Hız sınırlama (genel 120/dk; giriş ve kayıt 10/dk; token yenileme 30/dk; şifre sıfırlama 5/dk)
- [x] Refresh token yeniden kullanım tespiti: iptal edilmiş token gelirse oturum ailesi kapanır
- [x] Swagger (`/docs`, üretimde `SWAGGER_ENABLED=true` ile)
- [x] CI iş akışı (`.github/workflows/ci.yml`)
- [x] Migration zinciri yeniden yazıldı: eski zincir boş bir veritabanında çalışmıyordu. Tek başlangıç migration'ı (`20260516200000_baseline`) + sonraki değişiklikler. Eski geçmiş git'te duruyor.
- [x] `apps/server/.gitignore` içindeki `/prisma` kuralı kaldırıldı (seed dosyaları git'ten gizleniyordu)
- [x] Dockerfile ve `start:prod` yolu düzeltildi (`dist/src/main.js`)
- [x] Yerel Docker yığını (db, api, web) ayağa kalkıyor ve doğrulandı

### E-posta ve hesap
- [x] E-posta doğrulama (kayıtta gönderilir, 24 saat geçerli, tek kullanımlık)
- [x] Şifre sıfırlama (1 saat geçerli, tek kullanımlık; sıfırlamada tüm oturumlar kapanır)
- [x] Hesap varlığını ifşa etmeyen şifre sıfırlama yanıtı
- [x] Posta katmanı: SMTP veya konsol (`apps/server/src/mail/`)

### Paylaşım ve bildirim
- [x] Diyagram paylaşım bağlantıları: süreli (1-30 gün), isteğe bağlı şifreli, iptal edilebilir; yalnızca token hash'i saklanır
- [x] İşbirlikçi davetinde bildirim üretimi ve bildirim uçları (liste, okunmamış sayısı, okundu)

### Öğrenme (backend)
- [x] Tekrar zamanlaması: SM-2 tabanlı, dört değerlendirme (Tekrar, Zor, İyi, Kolay)
- [x] Tekrar kuyruğu, ilerleme özeti
- [x] Kişisel çalışma listeleri (oluştur, sil, soru ekle, soru çıkar)

### Profil ve görünüm (backend)
- [x] Dil tercihi: Türkçe ve en popüler on dil (tr, en, zh, hi, es, ar, fr, bn, pt, ru, ur)
- [x] Tema: dört hazır tema (açık iki, koyu iki) ve kullanıcı teması slotları (açık iki, koyu iki); renkler hex olarak doğrulanır
- [x] Yazı boyutu: dört seçenek (small, normal, large, xlarge)
- [x] Profil fotoğrafı: PNG veya JPG, en fazla 5 MB, içerik imzası ile doğrulanır

### Birim ve uçtan uca testler
- [x] 43 birim testi (auth akışları, SRS, CORS, posta, paylaşım bağlantısı, tercihler, kullanıcı uçları)
- [x] Uçtan uca kontroller (gerçek API'ye istekler): kayıt, giriş, doğrulama, şifre sıfırlama, refresh yeniden kullanımı, davet bildirimi, paylaşım bağlantısı, çalışma listesi, SRS, tercihler, avatar

## Yapılacaklar

### Veri ve arama
- [ ] Tam metin arama: PostgreSQL `tsvector` ve `pg_trgm` (şu an `contains` ile ILIKE benzeri arama var; doküman, diyagram ve bilgi tabanı sorguları yeniden yazılacak)
- [ ] Çok filtreli arama (tür, kategori, etiket, tarih)

### Diyagramlar (istemci)
- [ ] Dışa aktarma: PNG, SVG, PDF, Mermaid
- [ ] Otomatik yerleşim (ör. dagre)

### Frontend: Opsiyon B'ye göre yeniden yazım
- [ ] Uygulama kabuğu: üst mod çubuğu (Bugün, Kitaplık, Keşif, Bilgi), komut paleti
- [ ] Ana sayfa: günün planı, haftalık çubuk grafik, önce bunlar, konu durumu, kaldığın yer, ortak çalışma
- [ ] Diyagram tuvali: yüzen araçlar, bağlam araç çubuğu, durum çubuğu
- [ ] Doküman düzenleyici: odak modu, satır içi özellikler, ilgili içerikler
- [ ] Tekrar oturumu: etkileşimli quiz, klavye kısayolları, SRS değerlendirme düğmeleri
- [ ] Dışa aktar ve paylaş: süreli ve şifreli bağlantı, davet
- [ ] Bilgi tabanı, arama (filtreler), keşif
- [ ] Giriş, kayıt, doğrulama ve şifre sıfırlama ekranları
- [ ] Profil ve görünüm ayarları: dil seçici, dört hazır tema, özel tema editörü, yazı boyutu, avatar yükleme
- [ ] Mobil ana sayfa (duyarlı düzen)
- [ ] Bildirim paneli (davet ve diğer bildirimler)

### Test
- [ ] Uçtan uca testler (Playwright gibi) — web arayüzü hazır olduğunda
- [ ] Eski modüller için birim testler (documents, diagrams, knowledge-base, intelligence)

### Deployment
- [ ] Üretim için ayrı Compose / ortam yapılandırması (`NODE_ENV=production`, SMTP, `APP_URL`, `CORS_ORIGIN`, güçlü `JWT_SECRET`, veritabanı şifresi)
- [ ] Avatar dosyaları için kalıcı depolama (şu an `uploads` Docker volume'u; üretimde yedekleme)
- [ ] Hedef sunucuya dağıtım (bkz. "İhtiyaç bekleyenler")
