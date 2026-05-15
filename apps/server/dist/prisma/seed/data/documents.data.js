"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDocuments = void 0;
const bilingual_1 = require("../bilingual");
exports.seedDocuments = [
    {
        slug: 'rest-best-practices',
        title: 'REST API Best Practices',
        summary: 'Resource naming, HTTP verbs, status codes, pagination, versioning and idempotency for production APIs.',
        sortOrder: 1,
        content: (0, bilingual_1.bilingualSection)('REST API Best Practices', `**Resource-oriented URLs** use nouns, not verbs: \`GET /users/{id}\`, not \`GET /getUser\`.

**HTTP verbs** map to intent: GET (read), POST (create), PUT/PATCH (update), DELETE (remove).

**Status codes** must be precise: 200/201 for success, 204 for empty body, 400 validation, 401 unauthenticated, 403 forbidden, 404 missing, 409 conflict, 429 rate limit, 500 server fault.

**Pagination** — prefer cursor-based for large feeds; include \`limit\`, \`nextCursor\`, and stable sort keys.

**Versioning** — URI (\`/v1/\`) or header (\`Accept: application/vnd.api+json;version=1\`); never break clients silently.

**Idempotency** — PUT and DELETE are naturally idempotent; POST payments use \`Idempotency-Key\` header.

**HATEOAS (optional)** — embed \`_links\` for discoverability in public platforms.`, 'REST API En İyi Uygulamalar', `**Kaynak odaklı URL'ler** fiil değil isim kullanır: \`GET /users/{id}\`.

**HTTP fiilleri** niyeti yansıtır: GET okuma, POST oluşturma, PUT/PATCH güncelleme, DELETE silme.

**Durum kodları** net olmalı: 200/201 başarı, 400 doğrulama, 401 kimlik yok, 403 yetki yok, 404 bulunamadı, 409 çakışma, 429 limit, 500 sunucu hatası.

**Sayfalama** — büyük listelerde cursor tercih edin; \`limit\` ve \`nextCursor\` döndürün.

**Sürümleme** — URI veya header ile yapın; geriye dönük uyumu bozmayın.

**İdempotans** — PUT/DELETE doğası gereği idempotent; ödeme POST'larında \`Idempotency-Key\` kullanın.`),
    },
    {
        slug: 'websocket-vs-sse',
        title: 'WebSocket vs Server-Sent Events (SSE)',
        summary: 'When to choose bidirectional WebSockets vs one-way SSE for real-time features.',
        sortOrder: 2,
        content: (0, bilingual_1.bilingualSection)('WebSocket vs SSE', `**WebSocket** — full-duplex, binary + text, ideal for chat, collaborative editors, gaming, and low-latency trading. Requires connection management, heartbeats, and horizontal scaling via pub/sub (Redis, NATS).

**SSE** — server → client only over HTTP/1.1 or HTTP/2, auto-reconnect built into browsers, works through many corporate proxies. Perfect for live feeds, notifications, and progress streams.

**Choose WebSocket** when the client must send frequent messages without HTTP overhead.

**Choose SSE** when you only push updates and want simpler infra (standard load balancers, no upgrade handshake).`, 'WebSocket vs SSE', `**WebSocket** — çift yönlü, düşük gecikme; sohbet, ortak düzenleme ve oyunlar için uygundur. Kalp atışı ve pub/sub ile ölçekleme gerekir.

**SSE** — yalnızca sunucudan istemciye HTTP üzerinden; tarayıcı otomatik yeniden bağlanır. Bildirim ve canlı akışlar için basittir.

**WebSocket seçin** istemci sık mesaj gönderecekse.

**SSE seçin** yalnızca sunucu itecek ve proxy uyumluluğu önemliyse.`),
    },
    {
        slug: 'api-gateway',
        title: 'API Gateway Patterns',
        summary: 'Edge routing, auth termination, rate limiting, aggregation and BFF at the gateway layer.',
        sortOrder: 3,
        content: (0, bilingual_1.bilingualSection)('API Gateway', `An **API Gateway** sits at the edge: TLS termination, routing, authentication, rate limiting, request/response transformation, and observability.

**BFF (Backend for Frontend)** — separate gateways per client (mobile vs web) to avoid over-fetching.

**Aggregation** — compose multiple microservice calls into one response (careful with latency budgets).

**Circuit breaking** — fail fast when downstream services degrade.

Popular stacks: Kong, NGINX, Envoy, AWS API Gateway, Azure APIM.`, 'API Gateway', `**API Gateway** kenarda durur: TLS, yönlendirme, kimlik doğrulama, hız sınırlama ve dönüşüm.

**BFF** — mobil ve web için ayrı gateway; gereksiz veri taşımayı önler.

**Birleştirme** — birden fazla servis çağrısını tek yanıtta toplar (gecikme bütçesine dikkat).

**Devre kesici** — bozulan servislerde hızlı hata döndürür.`),
    },
    {
        slug: 'database-engineering-indexes',
        title: 'Database Engineering: Indexes',
        summary: 'B-tree indexes, composite keys, covering indexes, and when indexes hurt write throughput.',
        sortOrder: 4,
        content: (0, bilingual_1.bilingualSection)('Indexes in Relational Databases', `An **index** is a sorted data structure (usually B-tree) that speeds up reads at the cost of extra storage and slower writes.

**Single-column** — great for equality and range on one field (\`WHERE user_id = ?\`).

**Composite** — order matters: index \`(tenant_id, created_at)\` supports \`WHERE tenant_id = ? ORDER BY created_at\`.

**Covering index** — includes all columns in SELECT so the DB avoids table lookups.

**Avoid** over-indexing: each INSERT/UPDATE maintains index pages. Analyze with \`EXPLAIN\` / execution plans.`, 'Veritabanı Mühendisliği: İndeksler', `**İndeks** okumayı hızlandırır, yazmayı ve diski yükler; genelde B-tree yapısıdır.

**Tek kolon** — eşitlik ve aralık sorguları için.

**Bileşik** — sıra önemlidir: \`(tenant_id, created_at)\` hem filtre hem sıralamayı destekler.

**Covering** — SELECT'teki tüm kolonları kapsarsa tablo okuması gerekmez.

**Aşırı indeks** yazma performansını düşürür; \`EXPLAIN\` ile doğrulayın.`),
    },
    {
        slug: 'redis',
        title: 'Redis in Modern Architectures',
        summary: 'Caching, session store, pub/sub, distributed locks and data structure selection.',
        sortOrder: 5,
        content: `# Redis

**Redis** is an in-memory data store used as cache, session backing, rate limiter, pub/sub bus, and job queue (with Streams).

**Cache-aside** — app reads DB, writes Redis with TTL; invalidate on updates.

**Pub/Sub** — fan-out events to WebSocket nodes; not durable — use Streams or Kafka when you need replay.

**Distributed locks** — Redlock pattern with short TTL and fencing tokens; prefer DB constraints when possible.

**Data structures** — Strings, Hashes (objects), Sets (tags), Sorted Sets (leaderboards), HyperLogLog (cardinality).`,
    },
    {
        slug: 'design-system-storybook',
        title: 'Design System & Storybook',
        summary: 'Tokens, components, documentation and visual regression in a design system workflow.',
        sortOrder: 6,
        content: (0, bilingual_1.bilingualSection)('Design System with Storybook', `A **design system** unifies color, typography, spacing tokens and reusable UI primitives.

**Storybook** documents components in isolation with controls, a11y addon, and visual regression (Chromatic).

**Atomic design** — atoms → molecules → organisms; map to your component library folder structure.

**Governance** — versioning, deprecation policy, and contribution guidelines keep teams aligned.`, 'Tasarım Sistemi ve Storybook', `**Tasarım sistemi** renk, tipografi ve spacing token'larını standartlaştırır.

**Storybook** bileşenleri izole dokümante eder; erişilebilirlik ve görsel regresyon testi eklenir.

**Atomik tasarım** — atoms → molecules → organisms klasör yapısıyla eşleşir.

**Yönetişim** — sürümleme ve katkı kuralları ekipleri hizalar.`),
    },
    {
        slug: 'state-management-strategies',
        title: 'State Management Strategies',
        summary: 'Local UI state, server cache, global store, URL state and when to combine them.',
        sortOrder: 7,
        content: (0, bilingual_1.bilingualSection)('State Management', `**Local state** — form inputs, toggles; keep close to components (\`useState\`).

**Server state** — remote data with caches (TanStack Query): stale-while-revalidate, deduplication, optimistic updates.

**Global client state** — cross-cutting UI (theme, sidebar); Zustand/Redux only when prop drilling hurts.

**URL state** — filters and pagination in query params for shareable views.

**Rule of thumb** — default local + server cache; add global store only for truly shared client concerns.`, 'Durum Yönetimi Stratejileri', `**Yerel durum** — form ve UI geçici değerleri bileşende tutun.

**Sunucu durumu** — TanStack Query ile önbellek, yeniden doğrulama ve optimistic update.

**Global istemci** — tema, layout; gereksiz Redux'tan kaçının.

**URL durumu** — filtre ve sayfa paylaşılabilir olsun.

**Özet** — önce yerel + sunucu önbelleği; global store son çare.`),
    },
    {
        slug: 'micro-frontend',
        title: 'Micro Frontend Architecture',
        summary: 'Independent deployable frontends, module federation, routing and shared design tokens.',
        sortOrder: 8,
        content: (0, bilingual_1.bilingualSection)('Micro Frontend', `**Micro frontends** split the UI into independently deployable apps (by domain or team).

**Integration** — Webpack Module Federation, single-spa, or iframe shells (trade-offs on UX and performance).

**Shared contracts** — design tokens, event bus, and authentication cookie domain must be aligned.

**Routing** — host app owns top-level routes; remotes mount on sub-paths.

**Risks** — dependency duplication, inconsistent UX, and harder E2E — mitigate with shared component library.`, 'Micro Frontend', `**Micro frontend** arayüzü bağımsız deploy edilen parçalara böler.

**Entegrasyon** — Module Federation, single-spa veya iframe kabuk.

**Ortak sözleşmeler** — tasarım token'ları ve auth çerezi uyumlu olmalı.

**Routing** — host üst seviye rotaları yönetir.

**Riskler** — bundle tekrarı ve tutarsız UX; paylaşılan kütüphane ile azaltın.`),
    },
    {
        slug: 'macro-frontend',
        title: 'Macro Frontend (Modular Monolith UI)',
        summary: 'Single deployable SPA with feature modules — contrast with micro frontend distribution.',
        sortOrder: 9,
        content: (0, bilingual_1.bilingualSection)('Macro Frontend', `**Macro frontend** keeps one build and deploy but organizes code in feature modules (folders, lazy routes, bounded contexts).

**vs Micro frontend** — simpler ops, shared bundle optimization, one design system version; less team autonomy at deploy time.

**Enforcement** — ESLint boundary rules, Nx module boundaries, or package-based monorepo workspaces.

**Lazy loading** — route-based code splitting still applies inside the monolith.`, 'Macro Frontend', `**Macro frontend** tek deploy ile feature modülleri ayırır.

**Micro'ya karşı** — operasyon basit, tek bundle optimizasyonu; ekip deploy özgürlüğü daha az.

**Sınırlar** — ESLint/Nx ile modül izolasyonu.

**Lazy load** — monolit içinde rota bazlı bölme devam eder.`),
    },
    {
        slug: 'lazy-loading',
        title: 'Lazy Loading in Web Apps',
        summary: 'Route-based splitting, dynamic import, images and prefetch strategies.',
        sortOrder: 10,
        content: `# Lazy Loading

**Route-based** — \`React.lazy(() => import('./Dashboard'))\` with \`Suspense\` fallback.

**Next.js** — automatic per-page chunks; \`dynamic()\` for client-only components.

**Images** — \`loading="lazy"\`, responsive \`srcset\`, modern formats (AVIF/WebP).

**Prefetch** — hover or viewport hints (\`<link rel="prefetch">\`) for likely next navigation.

**Measure** — Lighthouse, bundle analyzer; avoid lazy-loading above-the-fold critical UI.`,
    },
];
//# sourceMappingURL=documents.data.js.map