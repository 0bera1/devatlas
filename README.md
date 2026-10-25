# DevAtlas

DevAtlas web arayüzü (Next.js 16, React 19, App Router, Tailwind CSS 4, TanStack Query, React Flow). API ayrı bir depoda tutulur: [devatlas-engine](https://github.com/0bera1/devatlas-engine) (NestJS, Prisma, PostgreSQL).

## Çalıştırma

1. API'yi başlatın: `devatlas-engine` deposunu klonlayıp `docker compose up --build` çalıştırın (`http://localhost:3500`).
2. İstemciyi başlatın:

   ```bash
   cd apps/client
   npm install
   npm run dev
   ```

   API adresi `NEXT_PUBLIC_API_URL` ile verilir (varsayılan `http://localhost:3500`). Web: http://localhost:3000.

Docker ile: `docker compose up --build` (kökte, yalnızca web servisini başlatır; API adresi derleme sırasında `NEXT_PUBLIC_API_URL` ile gömülür).

## Yapı

```
devatlas/
├── docker-compose.yml   # yalnızca web
└── apps/client/         # Next.js (src/app, src/components, src/lib)
```

API uçları ve Postman örnekleri için devatlas-engine deposundaki `README.md` ve `mds/` klasörüne bakın.
