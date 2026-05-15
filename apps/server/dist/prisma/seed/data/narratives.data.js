"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flowNarratives = exports.diagramNarratives = void 0;
exports.diagramNarratives = {
    'react-app-layer-architecture': `## Senaryo: Diyagramı kaydetmek

**Ayşe** editörde bir diyagramı düzenledi ve **Kaydet**'e bastı. Aşağıdaki sıra, diyagramdaki kutuların üzerinden gerçek zamanlı olarak izlenir.

1. **UI Components** — \`DiagramEditor\` içindeki Kaydet düğmesine tıklanır; form gönderilmez, \`onSave\` olayı yukarı fırlatılır.
2. **Custom Hooks** — \`useDiagramSave\` hook'u tetiklenir: önce istemci tarafında doğrulama (başlık boş mu?), sonra kayıt fonksiyonu çağrılır.
3. **Client Store** — Optimistik güncelleme için Zustand'daki \`diagramDraft\` slice'ı güncellenir; arayüzde "Kaydediliyor…" durumu görünür.
4. **API Client** — \`PATCH /api/diagrams/{id}\` isteği atılır; \`Authorization\` header'ına access token eklenir, JSON gövdesinde node/edge listesi gider.
5. **Backend API** — NestJS controller isteği alır, servis katmanı Prisma ile PostgreSQL'e yazar, \`200 OK\` ve güncel \`updatedAt\` döner.
6. Hook başarıyı görünce store'u senkronize eder; **UI Components** yeşil toast gösterir.

> **Diyagramda takip edin:** Oklar sırasıyla UI → Hooks → Store/API → Backend yönündedir; \`fetch\` ve \`HTTP\` etiketli oklar ağ isteğini temsil eder.`,
    'request-lifecycle': `## Senaryo: Keşfet sayfasında doküman listesi

**Mehmet** tarayıcıda \`/explore\` adresine girdi. Liste yüklenirken istek diyagramdaki yolculuğu şöyle izler:

1. **Browser** — React uygulaması \`GET https://api.devatlas.local/explore/feed?page=1\` çağrısını başlatır (SPA fetch, tam sayfa yenileme yok).
2. **CDN** — Önceki ziyarette cache'lenmiş \`logo.svg\` ve \`main.js\` buradan gelir; **API yanıtı** genelde CDN'den geçmez, doğrudan origin'e gider (diyagramdaki üst ok).
3. **Load Balancer** — İstek sağlıklı bir API pod'una yönlendirilir; pod çökmüşse başka instance seçilir.
4. **API Gateway** — TLS sonlandırılır, JWT doğrulanır, dakikada 100 istek limiti kontrol edilir; geçerse iç servise proxy edilir.
5. **Microservice** — \`ExploreService\` handler'ı çalışır: filtreler uygulanır, DTO'ya map edilir.
6. **PostgreSQL** — \`SELECT ... FROM documents WHERE visibility = 'public' ORDER BY published_at DESC LIMIT 20\` çalışır; sonuç JSON olarak tarayıcıya döner.

> **Diyagramda takip edin:** Browser'dan başlayın; CDN dalı statik varlık içindir. Asıl API hattı Browser → Load Balancer → API Gateway → Microservice → PostgreSQL çizgisidir.`,
    'authentication-flow': `## Senaryo: İlk giriş ve korumalı sayfa

**Zeynep** henüz oturum açmamış; girişten sonra diyagramlar sayfasına gidiyor.

1. **Client App** — Login formunda e-posta/şifre girilir, **Giriş yap**'a tıklanır.
2. **POST /auth/login** — İstek gövdesi: \`{ "email": "...", "password": "..." }\`. Sunucu kullanıcıyı veritabanında arar, bcrypt ile şifreyi doğrular.
3. **Issue JWT + Refresh** — Geçerliyse access token (15 dk) ve refresh token (7 gün) üretilir; refresh httpOnly cookie'ye yazılır.
4. **Access Token** — Yanıt gövdesinde access token döner; istemci bunu bellekte veya güvenli depoda tutar.
5. **Auth Guard** — Zeynep \`/diagrams\` sayfasına gider; her \`GET /api/diagrams\` isteğinde \`Authorization: Bearer <access>\` header'ı okunur, imza ve süre kontrol edilir; geçersizse **401** döner.
6. **POST /auth/refresh** — 15 dakika sonra access süresi dolar; istemci otomatik \`/auth/refresh\` çağırır (cookie'deki refresh ile), **Issue JWT + Refresh** yeni access üretir; kullanıcı tekrar login ekranı görmez.

> **Diyagramda takip edin:** İlk giriş Client → POST /auth/login → Issue → Access. Sonraki API çağrıları Access → Auth Guard üzerinden geçer. \`expired\` etiketli ok yenileme döngüsünü gösterir.`,
    'microservice-architecture': `## Senaryo: Yeni doküman yayınlama

**Can** editörde dokümanını **Yayınla**'ya bastı. İstek monolit değil, servis sınırlarından geçiyor:

1. **API Gateway** — \`POST /api/documents\` tek giriş noktasına gelir; path ve JWT'ye göre hedef servis seçilir.
2. **Documents Service** — İstek buraya yönlendirilir: başlık/içerik validate edilir, Documents DB'ye \`INSERT\` yapılır, \`201\` döner.
3. **Message Bus** — Documents Service, \`document.published\` olayını kuyruğa yazar (senkron cevap beklemez).
4. **Diagrams Service** — Kuyruktan olayı dinler; arama indeksini veya öneri cache'ini günceller (kullanıcı bu adımı HTTP'de görmez).
5. **Observability** — Gateway, Documents ve consumer span'leri tek trace ID altında toplanır; Grafana'da uçtan uca gecikme görülür.

> **Diyagramda takip edin:** Gateway'den üç servise giden düz oklar senkron HTTP'dir. Documents → Message Bus → (Diagrams) kesik/animasyonlu ok asenkron yan etkidir.`,
    'database-scaling': `## Senaryo: Dashboard istatistikleri (yoğun okuma)

**Elif** ana sayfada "Son 7 gün özeti" kartını açıyor; sistem okuma yükünü ölçekler:

1. **Application** — \`getWeeklyStats(userId)\` çağrılır.
2. **Redis Cache** — Önce \`stats:weekly:{userId}\` anahtarına bakılır. **Cache hit** ise PostgreSQL'e hiç gidilmez, yanıt ~2 ms'de döner.
3. **Cache miss** — Uygulama okuma sorgusunu **PgBouncer** üzerinden **Read Replica**'ya gönderir (\`reads\` etiketli ok).
4. **Read Replica** — Ağır \`SELECT\` + aggregate çalışır; sonuç uygulamaya döner.
5. Uygulama sonucu Redis'e 60 sn TTL ile yazar ve Elif'e JSON gönderir.
6. Aynı oturumda Elif profil fotoğrafını değiştirir — bu **yazma**dır: **Application** → **PgBouncer** → **Primary DB** (\`writes\` oku); replica birkaç ms/sn sonra güncellenir.

> **Diyagramda takip edin:** Okuma hattı App → Redis (kısayol) veya App → Pool → Replica. Yazma her zaman Pool → Primary'dir.`,
    'cicd-deployment-flow': `## Senaryo: main'e merge sonrası deploy

**Deniz** auth düzeltmesini \`main\` branch'ine merge etti. Pipeline diyagramdaki sırayı izler:

1. **Git Push** — \`git push origin main\` remote'a commit gönderir; GitHub webhook tetiklenir.
2. **CI Pipeline** — GitHub Actions workflow başlar: checkout, \`npm ci\`, ortam değişkenleri yüklenir.
3. **Tests + Lint** — \`npm test\` ve \`npm run lint\` paralel job'larda çalışır; biri kırmızıysa pipeline durur, deploy olmaz.
4. **Docker Build** — Testler geçince \`Dockerfile\` ile \`api:1.4.2\` imajı build edilir.
5. **Container Registry** — İmaj \`ghcr.io/org/api:1.4.2\` olarak push edilir; imza ve SBOM eklenir.
6. **Kubernetes Rollout** — Cluster yeni imajı çeker; pod'lar rolling update ile yenilenir; health check geçince trafik yeni sürüme akar.

> **Diyagramda takip edin:** Git Push'tan K8s'e tek yön. Test ve Build CI'dan paralel dallanır; deploy yalnızca ikisi de başarılıysa Registry → Kubernetes ile devam eder.`,
    'state-management-diagram': `## Senaryo: Profil adını güncellemek

**Burak** ayarlar sayfasında görünen adını değiştiriyor; hangi durum nerede tutuluyor:

1. **React UI** — Input'a her tuşta **useState / useReducer** içindeki \`draftName\` güncellenir (henüz sunucuya gitmez).
2. **Blur veya Kaydet** — \`useUpdateProfile\` mutation'ı (TanStack Query) tetiklenir; buton loading olur.
3. **TanStack Query** — \`PUT /api/users/me\` isteğini **REST API**'ye gönderir; önbellekteki \`['user','me']\` anahtarı \`pending\` işaretlenir.
4. **REST API** — Sunucu \`users\` tablosunda \`display_name\` günceller, yeni kaydı döner.
5. Query başarıda cache'i günceller; **React UI** input'u senkronize eder.
6. **Zustand Store** — Header'daki avatar yanındaki isim global \`authSlice\` içindeyse orada da \`setDisplayName\` dispatch edilir; sayfa yenilenmeden navbar güncellenir.

> **Diyagramda takip edin:** Geçici yazım UI → local. Kalıcı veri UI → Query → REST API. Birden fazla bileşende görünen isim global store ile paylaşılır.`,
    'micro-frontend-architecture': `## Senaryo: Dokümanlardan diyagramlara geçiş

**Selin** büyük üründe farklı ekiplerin modülleri arasında geziniyor:

1. **Host Shell** — \`https://app.devatlas.com\` açılır; ortak layout, auth ve React Router burada çalışır.
2. Selin sidebar'dan **Diyagramlar**'a tıklar; URL \`/diagrams\` olur.
3. **Host Shell** — \`import('diagrams/Module')\` ile **Diagrams Remote** federated bundle'ı lazy yüklenir (ilk tıklamada kısa gecikme).
4. **Nav Remote** — Zaten mount edilmiş menü aktif sekmeyi vurgular; kendi bundle'ı host tarafından daha önce yüklenmiştir.
5. **Diagrams Remote** — Liste ve editör ekranları render edilir; butonlar **Design System**'den \`Button\`, \`Card\` import eder.
6. **Design System** — Tüm remote'lar aynı renk/spacing token'larını kullanır; Selin Dokümanlar ile Diyagramlar arasında görsel kopukluk hissetmez.

> **Diyagramda takip edin:** Host ortada üstte; üç remote'a oklar. Her remote'un altında Design System'e inen oklar paylaşılan UI kütüphanesini gösterir.`,
};
exports.flowNarratives = [
    {
        slug: 'full-stack-request-journey',
        narrative: `## Senaryo: Herkese açık bir dokümanı açmak

**Ayşe** keşfet sayfasında *"NestJS WebSocket Rehberi"* kartına tıklıyor. Bu akış, o tek tıklamanın **üç diyagramda** nasıl parçalandığını anlatır — hepsi aynı kullanıcı hikâyesinin devamıdır.

| Adım | Diyagram | Ne öğreneceksiniz |
|------|----------|-------------------|
| 1 | HTTP Request Lifecycle | İstek ağ katmanlarından nasıl geçer |
| 2 | Microservice Architecture | Gateway hangi servise yollar |
| 3 | Database Scaling | Veri nereden okunur, cache devreye girer mi |

Alttaki adımlara tıklayın veya **Sonraki adım** ile ilerleyin; her adımda diyagramın altında o bölüme özel senaryo metni görünür.`,
        steps: [
            {
                diagramSlug: 'request-lifecycle',
                label: 'Adım 1 — İstek yığına girer',
                narrative: `### Ayşe'nin tıklaması (şu an bu diyagram)

Karttaki linke tıklanınca tarayıcı \`GET /api/documents/nestjs-websocket-guide\` gönderir.

1. **Browser** — SPA route değişir, eşzamanlı API fetch başlar.
2. **CDN** — Sayfa JS/CSS dosyaları cache'den gelir; API isteği CDN'i bypass eder.
3. **Load Balancer** — İstek \`api-pod-2\`'ye gider.
4. **API Gateway** — JWT opsiyonel (public doküman); rate limit sayacı artar.
5. **Microservice** — Henüz hangi domain servisi olduğu belli değil; gateway içeride yönlendirecek (Adım 2).
6. **PostgreSQL** — Bu diyagramda "veri katmanına istek gidecek" son noktası gösterilir; detay Adım 3'te.

**Sonraki adımda** gateway'in bu isteği **Documents Service**'e nasıl ayırdığını göreceksiniz.`,
            },
            {
                diagramSlug: 'microservice-architecture',
                label: 'Adım 2 — Servislere yönlendirme',
                narrative: `### Aynı istek — servis sınırı (şu an bu diyagram)

Gateway path'e bakar: \`/api/documents/...\` → **Documents Service**.

1. **API Gateway** — Ayşe'nin isteği tek hop'ta Documents'e proxy edilir; istemci servis URL'ini bilmez.
2. **Documents Service** — \`findBySlug('nestjs-websocket-guide')\` çalışır; markdown içerik ve metadata hazırlanır.
3. Yanıt **201 değil 200** ile döner; henüz yazma yok.
4. (Paralel hikâye) Başka kullanıcı aynı anda diyagram yayınlarsa **Diagrams Service** → **Message Bus** olayı tetiklenir; Ayşe'nin okuması bundan etkilenmez.
5. **Observability** — Trace'de \`gateway → documents\` span'i ~40 ms görünür.

**Sonraki adımda** Documents Service'in veritabanına giderken **replica ve Redis**'i nasıl kullandığını inceleyin.`,
            },
            {
                diagramSlug: 'database-scaling',
                label: 'Adım 3 — Veri katmanı',
                narrative: `### Aynı istek — verinin okunması (şu an bu diyagram)

Documents Service içindeki kod bu diyagramdaki katmanlara iner:

1. **Application** — \`DocumentRepository.findBySlug\` çağrılır.
2. **Redis Cache** — Anahtar \`doc:slug:nestjs-websocket-guide\` aranır. İlk ziyaret **miss**; Adım 3 sonunda doldurulur.
3. **PgBouncer** — Bağlantı havuzundan slot alınır; ham connection patlaması önlenir.
4. **Read Replica** — \`SELECT * FROM documents WHERE slug = $1\` replikada çalışır (okuma yükü primary'den uzak tutulur).
5. Sonuç Redis'e yazılır; JSON Ayşe'nin tarayıcısına döner; editör markdown'u render eder.

**Akış bitti.** Aynı üç diyagramı **Diyagramlar** sekmesinden tek tek de açabilirsiniz.`,
            },
        ],
    },
    {
        slug: 'secure-delivery-pipeline',
        narrative: `## Senaryo: Güvenli kod teslimi

**Deniz** production'da 401 hatası düzeltmek için kod gönderiyor. Bu akış **iki ayrı diyagramdır** — tek resimde birleşmez:

| Sıra | Diyagram | Gerçek hayatta ne olur |
|------|----------|------------------------|
| 1 | Authentication Flow | Kullanıcılar yeni sürümle nasıl oturum açar |
| 2 | CI/CD Deployment Flow | Düzeltme sunucuya nasıl çıkar |

Önce kimlik katmanının doğru çalıştığından emin olun (Adım 1), sonra pipeline'ın yeni imajı dağıttığını izleyin (Adım 2).`,
        steps: [
            {
                diagramSlug: 'authentication-flow',
                label: 'Adım 1 — Kimlik ve tokenlar',
                narrative: `### Deploy öncesi / sonrası oturum (şu an bu diyagram)

Deniz'in düzeltmesi **Auth Guard** mantığını değiştiriyor. Canlıya çıkmadan önce bu yol test edilir:

1. **Client App** — Staging'de test kullanıcısı login olur.
2. **POST /auth/login** — Düzeltilmiş validasyon çalışır; hatalı şifrede **401**, doğruda token üretilir.
3. **Issue JWT + Refresh** — Yeni token claim'leri (ör. \`aud\`, \`iss\`) burada set edilir.
4. **Access Token** — Mobil/SPA istemci bunu saklar.
5. **Auth Guard** — \`GET /api/diagrams\` artık eski token formatını reddeder; kullanıcı **POST /auth/refresh** ile yeniler.
6. QA onayı: kimlik akışı yeşil → Adım 2'de deploy'a geçilir.

> Bu adımda **Docker / K8s yoktur**; yalnızca kimlik. Build pipeline bir sonraki diyagramdadır.`,
            },
            {
                diagramSlug: 'cicd-deployment-flow',
                label: 'Adım 2 — Build ve deploy',
                narrative: `### Aynı düzeltme — canlıya çıkış (şu an bu diyagram)

Deniz \`main\`'e merge eder; auth düzeltmesi kullanıcılara bu sırayla ulaşır:

1. **Git Push** — Commit remote'a gider; CI webhook tetiklenir.
2. **CI Pipeline** — \`api\` servisi için workflow başlar.
3. **Tests + Lint** — Auth modülü unit testleri çalışır; kırık test deploy'u durdurur.
4. **Docker Build** — Yeni \`api:1.4.3\` imajı oluşur.
5. **Container Registry** — İmaj push edilir.
6. **Kubernetes Rollout** — Production pod'ları sırayla yenilenir; artık tüm \`Auth Guard\` kontrolleri yeni kodla çalışır.

Ayşe (Adım 1'deki kullanıcı) sayfayı yenilediğinde eski access token süresi dolunca refresh döngüsü devreye girer; login ekranı görmeden yeni kurallarla devam eder.`,
            },
        ],
    },
    {
        slug: 'frontend-architecture-path',
        narrative: `## Senaryo: "Diyagramlarım" özelliğini geliştirmek

**Ekip** DevAtlas client'ta yeni bir liste filtresi ekliyor. Bu akış, aynı özelliğin **üç mimari seviyede** nasıl düşünüleceğini gösterir:

1. Katmanlar ve sorumluluklar (React App Layer)
2. State nereye yazılır (State Management)
3. Büyük ölçekte modül bölme (Micro Frontend)

Her adım farklı bir diyagramdır; sırayla okuyun.`,
        steps: [
            {
                diagramSlug: 'react-app-layer-architecture',
                label: 'Adım 1 — Uygulama katmanları',
                narrative: `### Filtre UI'sı nereye kodlanır? (şu an bu diyagram)

Geliştirici önce katmanları ayırır:

1. **UI Components** — \`DiagramListToolbar\` içine "Sadece benimkiler" switch'i eklenir.
2. **Custom Hooks** — \`useDiagramListFilters\` URL query (\`?mine=true\`) ile senkronize eder.
3. **Client Store** — Filtre tercihi oturum boyunca Zustand'da tutulur.
4. **API Client** — \`GET /api/diagrams?owner=me\` çağrısı atılır.
5. **Backend API** — Sunucu filtreli listeyi döner.

Bu adım bittiğinde özellik çalışır; Adım 2'de state'in doğru yerde olup olmadığını netleştirin.`,
            },
            {
                diagramSlug: 'state-management-diagram',
                label: 'Adım 2 — Durum sınırları',
                narrative: `### Aynı filtre — state kararları (şu an bu diyagram)

1. Switch'in açık/kapalı görünümü → **useState** (sadece toolbar'da).
2. Liste verisi → **TanStack Query** \`['diagrams', { mine: true }]\` cache anahtarı; sunucu cevabı burada.
3. Navbar'daki kullanıcı adı → **Zustand** (filtreyle ilgisi yok, karıştırılmaz).
4. **REST API** — Query fetch ile konuşur; gereksiz global store güncellemesi yapılmaz.

Kural: Sunucudan gelen liste Query'de; her şeyi Zustand'a koymayın.`,
            },
            {
                diagramSlug: 'micro-frontend-architecture',
                label: 'Adım 3 — Federated UI',
                narrative: `### Aynı özellik — ekip sınırları (şu an bu diyagram)

Ürün büyüyünce Diyagramlar takımı kendi release cycle'ına geçer:

1. **Host Shell** — Auth ve routing ortak kalır; \`/diagrams\` route'u tanımlıdır.
2. **Diagrams Remote** — Filtre toolbar'ı bu bundle'da geliştirilir; haftalık deploy.
3. **Nav Remote** ve **Docs Remote** — Bu özellikten etkilenmez; host sadece remote entry URL'ini bilir.
4. **Design System** — Switch ve liste kartı ortak bileşen; tutarlı görünüm.

Özellik tek monolit repo yerine federated modül olarak canlıya çıkar; host yeniden deploy edilmeden Diagrams Remote güncellenebilir.`,
            },
        ],
    },
];
//# sourceMappingURL=narratives.data.js.map