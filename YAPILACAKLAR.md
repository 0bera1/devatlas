# DevAtlas — Yapılacaklar

Son güncelleme: 2026-10-16

Bu dosya açık işlerin takip listesidir. Tamamlanan maddeler `[x]` ile işaretlenir.
Yerel çalıştırma: `docker compose up -d` (proje kökünde). API: http://localhost:3500, Swagger: http://localhost:3500/docs, web: http://localhost:3000.

## İhtiyaç bekleyenler (sizden gerekenler)

- [ ] **E-posta sağlayıcısı (SMTP)**: kapsam dışı bırakıldı (sizin kararınız). Kod hazır; geliştirmede konsola yazılıyor, üretimde `SMTP_HOST` zorunlu.
- [ ] **Deployment hedefi**: kapsam dışı bırakıldı. Hedef sunucu (IP/alan adı), SSH erişimi, SSL yönlendirmesi gerekiyor.
- [ ] **Eksik seed içeriği**: `apps/server/prisma/seed/data/` içindeki beş dosya repoda yoktu (`interview-topic-diagrams`, `interview-topic-documents`, `interview-topic-flows`, `interview-knowledge-links`, `interview-questions`). Yerel bir kopyanız varsa bu dosyalara koyun; şu an boş yer tutucular var.

## Tamamlanan

### Güvenlik ve altyapı
- [x] `GET /users` kaldırıldı; `GET` ve `DELETE /users/:id` yalnızca kendi kaydı için
- [x] CORS üretimde zorunlu (HTTP ve Socket.IO)
- [x] Hız sınırlama (genel 120/dk; giriş ve kayıt 10/dk; token yenileme 30/dk; şifre sıfırlama 5/dk)
- [x] Refresh token yeniden kullanım tespiti: iptal edilmiş token gelirse oturum ailesi kapanır
- [x] Swagger (`/docs`, üretimde `SWAGGER_ENABLED=true` ile)
- [x] CI iş akışı (`.github/workflows/ci.yml`): build ve birim testleri
- [x] Migration zinciri yeniden yazıldı; tek başlangıç migration'ı ve sonraki değişiklikler
- [x] Dockerfile ve `start:prod` yolu düzeltildi (`dist/src/main.js`)
- [x] Yerel Docker yığını (db, api, web) ayağa kalkıyor ve doğrulandı
- [x] Üretim için ayrı Compose yapılandırması (`docker-compose.prod.yml`, TLS proxy, zorunlu gizli değerler)
- [x] Avatar dosyaları için kalıcı `uploads` volume'u

### Hesap ve e-posta
- [x] E-posta doğrulama (kayıtta gönderilir, 24 saat geçerli, tek kullanımlık)
- [x] Şifre sıfırlama (1 saat geçerli, tek kullanımlık; sıfırlamada tüm oturumlar kapanır)
- [x] Şifre sıfırlama ve e-posta doğrulama ekranları
- [x] Hesap varlığını ifşa etmeyen şifre sıfırlama yanıtı
- [x] Posta katmanı: SMTP veya konsol (`apps/server/src/mail/`)

### Paylaşım, bildirim ve arama
- [x] Diyagram paylaşım bağlantıları: süreli (1-30 gün), isteğe bağlı şifreli, iptal edilebilir; yalnızca token hash'i saklanır
- [x] Paylaşım bağlantısı arayüzü (diyagram başlığında, yalnızca sahibe)
- [x] İşbirlikçi davetinde bildirim üretimi, bildirim uçları ve zil/liste arayüzü
- [x] Tam metin ve yazım toleranslı arama (`GET /search/library`): tür, etiket, tarih ve sıralama filtreleri
- [x] Arama arayüzü (kitaplık araması)

### Öğrenme
- [x] Tekrar zamanlaması: SM-2 tabanlı, dört değerlendirme (Tekrar, Zor, İyi, Kolay)
- [x] Tekrar oturumu arayüzü (flashcard, değerlendirme düğmeleri, ilerleme özeti)
- [x] Çalışma listeleri: API ve arayüz (oluşturma, listeleme, soru ekleme, silme)
- [x] İlerleme ekranı (`/progress`): istatistikler, öğrenme oranı, son 14 gün

### Profil, görünüm ve dil
- [x] Dil tercihi: Türkçe, İngilizce ve sekiz dil (zh, hi, es, ar, fr, bn, pt, ru, ur); Arapça ve Urduca RTL
- [x] Her dil tablosu tüm anahtarları tip denetimiyle ve birim testiyle doğrular
- [x] Tema: dört hazır tema (açık iki, koyu iki) ve dört özel tema slotu (açık iki, koyu iki)
- [x] Hazır temaların ikincil metin kontrastı WCAG AA eşiğini geçer (birim testi)
- [x] Yazı boyutu: dört seçenek
- [x] Profil fotoğrafı yükleme ve kaldırma (PNG veya JPG, en fazla 5 MB, içerik imzasıyla doğrulanır)
- [x] Ayarlar sayfası (dil, tema, özel tema editörü, yazı boyutu, fotoğraf)
- [x] Uygulama genelinde palet tokenları: eski sabit renkler kaldırıldı, özel temalar tüm ekranlarda çalışır

### Diyagram
- [x] Dışa aktarma: PNG, SVG, PDF, Mermaid kodu (kopyala ya da indir)
- [x] Otomatik yerleşim (dagre, hiyerarşik)
- [x] Tuval araç çubuğu ve durum çubuğu (düğüm ve bağlantı sayısı, kayıt ve salt okunur durumu)

### Arayüz (Opsiyon B)
- [x] Uygulama kabuğu: mod çubuğu (Bugün, Kitaplık, Keşif, Bilgi), komut paleti (Ctrl/⌘K), kullanıcı baş harfleri, atlama bağlantısı
- [x] Ana sayfa (Bugün): günün planı, haftalık çubuk grafik, önce bunlar
- [x] Doküman düzenleyici: serif başlık, meta çubuğu, odak modu, Markdown biçimlendirme araç çubuğu, ilgili içerikler
- [x] Keşif ve bilgi tabanı: ana ekranlar ve detay sayfaları
- [x] Yeni ekranlar (ayarlar, tekrar, arama, kurtarma, ilerleme) aynı görsel dille
- [x] Mobil uyum: 390 px genişlikte ana ekranlarda yatay taşma yok (e2e denetimi)

### Testler
- [x] Sunucu birim testleri (auth akışları, SRS, CORS, posta, paylaşım bağlantısı, tercihler, kullanıcı uçları, arama dışı)
- [x] İstemci birim testleri (48 test): palet çözümleme, kontrast, Mermaid üretimi, yerleşim, çeviri tabloları, Markdown biçimlendirme, bilgi tabanı sayfa birleştirme, kullanıcı adı yardımcıları, API hata metni, diyagram doğrulama ve göçü
- [x] Tarayıcı e2e (17 test): kayıt formu, giriş, bugün, tekrar, çalışma listeleri, ayarlar, dil değişimi, arama, komut paleti, ilerleme, odak modu, paylaşım bağlantısı, davet bildirimi, misafir sayfaları, mobil taşma denetimi
- [x] Paylaşılan test hesapları ve oturum kurulumu: kayıt ve giriş sınırlarına takılmadan çalışır

## Açık kalanlar

- [ ] Şifre sıfırlama ve e-posta doğrulamanın tam akışı (token e-postadan okunamadığı için e2e yalnızca geçersiz token ve istek ekranlarını kapsar; e-posta sağlayıcısına bağlı)
- [ ] Eski modüllerin UI bileşenleri için birim testleri (documents, diagrams, knowledge-base, intelligence): saf yardımcılar test edildi, bileşenler e2e ile kapsanıyor
- [ ] ESLint `react-hooks` kuralları: 26 hata (`set-state-in-effect`, `refs`, `purity`). CI lint çalıştırmıyor; bu hatalar değişikliklerden önce de vardı. Düzeltme, render sırasında durum eşitleme ve ref kullanımının yeniden yazılmasını gerektiriyor.
- [ ] Avatar dosyaları için yedekleme (deployment kapsamında)
- [ ] Deployment: hedef sunucu ve e-posta sağlayıcısı kararı bekleniyor (yukarıya bakın)
