# DevAtlas — Yapılacaklar

Son güncelleme: 2026-10-16

Bu dosya açık işlerin takip listesidir. Tamamlanan maddeler `[x]` ile işaretlenir.
Yerel çalıştırma: `docker compose up -d` (proje kökünde). API: http://localhost:3500, Swagger: http://localhost:3500/docs, web: http://localhost:3000.

## İhtiyaç bekleyenler (sizden gerekenler)

- [ ] **E-posta sağlayıcısı (SMTP)**
  - Gerekenler: SMTP host, port, kullanıcı, şifre ve gönderen adresi (`MAIL_FROM`). Ya da Resend / Postmark / SES gibi bir servis ve API anahtarı.
  - Durum: Kod hazır. Geliştirmede e-postalar konsola yazılıyor. Üretimde `SMTP_HOST` zorunlu, yoksa uygulama açılmaz.
  - Doğrulama bağlantısının gideceği web adresi (`APP_URL`) de gerekli.
- [ ] **Deployment hedefi**
  - Gerekenler: hedef sunucu (IP veya alan adı), SSH erişimi, alan adı ve SSL için yönlendirme.
- [ ] **Eksik seed içeriği**: `apps/server/prisma/seed/data/` içinde beş dosya repoda yoktu (`interview-topic-diagrams`, `interview-topic-documents`, `interview-topic-flows`, `interview-knowledge-links`, `interview-questions`). Yerel bir kopyanız varsa bu dosyalara koyun. Şu an boş yer tutucular var, mülakat soruları ve konu içerikleri boş görünür.

## Tamamlanan

### Güvenlik ve altyapı
- [x] `GET /users` kaldırıldı; `GET` ve `DELETE /users/:id` yalnızca kendi kaydı için
- [x] CORS üretimde zorunlu (HTTP ve Socket.IO)
- [x] Hız sınırlama (genel 120/dk; giriş ve kayıt 10/dk; token yenileme 30/dk; şifre sıfırlama 5/dk)
- [x] Refresh token yeniden kullanım tespiti: iptal edilmiş token gelirse oturum ailesi kapanır
- [x] Swagger (`/docs`, üretimde `SWAGGER_ENABLED=true` ile)
- [x] CI iş akışı (`.github/workflows/ci.yml`)
- [x] Migration zinciri yeniden yazıldı: eski zincir boş bir veritabanında çalışmıyordu. Tek başlangıç migration'ı ve sonraki değişiklikler.
- [x] Dockerfile ve `start:prod` yolu düzeltildi (`dist/src/main.js`)
- [x] Yerel Docker yığını (db, api, web) ayağa kalkıyor ve doğrulandı

### Hesap ve e-posta
- [x] E-posta doğrulama (kayıtta gönderilir, 24 saat geçerli, tek kullanımlık)
- [x] Şifre sıfırlama (1 saat geçerli, tek kullanımlık; sıfırlamada tüm oturumlar kapanır)
- [x] Şifre sıfırlama ve e-posta doğrulama ekranları
- [x] Hesap varlığını ifşa etmeyen şifre sıfırlama yanıtı
- [x] Posta katmanı: SMTP veya konsol (`apps/server/src/mail/`)

### Paylaşım, bildirim ve arama
- [x] Diyagram paylaşım bağlantıları: süreli (1-30 gün), isteğe bağlı şifreli, iptal edilebilir; yalnızca token hash'i saklanır
- [x] Paylaşım bağlantısı arayüzü (diyagram başlığında, yalnızca sahibe)
- [x] İşbirlikçi davetinde bildirim üretimi ve bildirim uçları
- [x] Tam metin ve yazım toleranslı arama (`GET /search/library`): tür, etiket, tarih ve sıralama filtreleri
- [x] Arama arayüzü (kitaplık araması)

### Öğrenme
- [x] Tekrar zamanlaması: SM-2 tabanlı, dört değerlendirme (Tekrar, Zor, İyi, Kolay)
- [x] Tekrar oturumu arayüzü (flashcard, değerlendirme düğmeleri, ilerleme özeti)
- [x] Çalışma listeleri ve ilerleme özeti: API

### Profil, görünüm ve dil
- [x] Dil tercihi: Türkçe ve en popüler on dil (tr, en, zh, hi, es, ar, fr, bn, pt, ru, ur); Arapça ve Urduca RTL
- [x] Tema: dört hazır tema (açık iki, koyu iki) ve dört özel tema slotu (açık iki, koyu iki)
- [x] Yazı boyutu: dört seçenek
- [x] Profil fotoğrafı yükleme ve kaldırma (PNG veya JPG, en fazla 5 MB, içerik imzasıyla doğrulanır)
- [x] Ayarlar sayfası (dil, tema, özel tema editörü, yazı boyutu, fotoğraf)

### Diyagram
- [x] Dışa aktarma: PNG, SVG, PDF, Mermaid kodu (kopyala ya da indir)
- [x] Otomatik yerleşim (dagre, hiyerarşik)

### Testler
- [x] Sunucu birim testleri (auth akışları, SRS, CORS, posta, paylaşım bağlantısı, tercihler, kullanıcı uçları, arama dışı)
- [x] Gerçek API'ye uçtan uca kontroller: kayıt, giriş, doğrulama, sıfırlama, refresh yeniden kullanımı, davet bildirimi, paylaşım bağlantısı, çalışma listesi, SRS, tercihler, avatar, arama (yazım toleransı ve görünürlük dahil)

## Kısmen tamamlanan

- [ ] Çalışma listeleri: API var, arayüz yok
- [ ] Bildirimler: API var, zil ve liste arayüzü yok
- [x] Diller: Türkçe, İngilizce ve dokuz dilin tamamı çevrildi (zh, hi, es, ar, fr, bn, pt, ru, ur); her çeviri tablosu tip denetimi ve birim testiyle tüm anahtarları doğrular
- [ ] İlerleme takibi: özet ve tekrar sayfasında gösterim var, ayrı bir ilerleme ekranı yok

## Yapılacaklar

### Frontend: Opsiyon B görsel yeniden yazımı
- [ ] Uygulama kabuğu: üst mod çubuğu (Bugün, Kitaplık, Keşif, Bilgi) ve komut paleti. Şu an eski gezinme korunuyor, Tekrar ve Ayarlar bağlantıları eklendi.
- [ ] Ana sayfa (Bugün): günün planı, haftalık çubuk grafik, önce bunlar. Şu an yalnızca tasarım panelinde var.
- [ ] Diyagram tuvali: yüzen araçlar, bağlam araç çubuğu, durum çubuğu. Şu an eski düzen; dışa aktarma, yerleşim ve paylaşım düğmeleri eklendi.
- [ ] Doküman düzenleyici: odak modu, satır içi özellikler, ilgili içerikler
- [ ] Keşif ve bilgi tabanı sayfalarının yeniden stillenmesi
- [ ] Mobil uyum (duyarlı düzen) ve kontrast denetimi
- [ ] Yeni ekranların (ayarlar, tekrar, arama, kurtarma) Opsiyon B diline göre sadeleştirilmesi

### Test
- [ ] Uçtan uca tarayıcı testleri (Playwright): kayıt, doğrulama, şifre sıfırlama, tekrar, paylaşım
- [ ] İstemci birim testleri (şu an test çalıştırıcısı yok): Mermaid üretimi, yerleşim, palet çözümleme
- [ ] Eski modüller için birim testler (documents, diagrams, knowledge-base, intelligence)

### Deployment
- [ ] Üretim için ayrı Compose / ortam yapılandırması (`NODE_ENV=production`, SMTP, `APP_URL`, `CORS_ORIGIN`, güçlü `JWT_SECRET`, veritabanı şifresi)
- [ ] Avatar dosyaları için kalıcı depolama (şu an `uploads` Docker volume'u; üretimde yedekleme)
- [ ] Hedef sunucuya dağıtım (bkz. "İhtiyaç bekleyenler")
- [ ] E-posta sağlayıcısının bağlanması (bilgiler size ulaştığında)
