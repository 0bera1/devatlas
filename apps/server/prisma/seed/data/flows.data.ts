import type { SeedFlowInput } from '../types';

export const seedFlows: SeedFlowInput[] = [
  {
    slug: 'full-stack-request-journey',
    title: 'Full-Stack Request Journey',
    description:
      '3 ayrı diyagram · sırayla: istek yolu → mikroservisler → veritabanı ölçekleme',
    sortOrder: 1,
    steps: [
      { diagramSlug: 'request-lifecycle', label: 'Adım 1 — İstek yığına girer' },
      { diagramSlug: 'microservice-architecture', label: 'Adım 2 — Servislere yönlendirme' },
      { diagramSlug: 'database-scaling', label: 'Adım 3 — Veri katmanı' },
    ],
  },
  {
    slug: 'secure-delivery-pipeline',
    title: 'Secure Delivery Pipeline',
    description:
      '2 ayrı diyagram · sırayla: kimlik/token (Auth) → build & deploy (CI/CD)',
    sortOrder: 2,
    steps: [
      { diagramSlug: 'authentication-flow', label: 'Adım 1 — Kimlik ve tokenlar' },
      { diagramSlug: 'cicd-deployment-flow', label: 'Adım 2 — Build ve deploy' },
    ],
  },
  {
    slug: 'frontend-architecture-path',
    title: 'Frontend Architecture Path',
    description:
      '3 ayrı diyagram · sırayla: React katmanları → state → micro frontend',
    sortOrder: 3,
    steps: [
      { diagramSlug: 'react-app-layer-architecture', label: 'Adım 1 — Uygulama katmanları' },
      { diagramSlug: 'state-management-diagram', label: 'Adım 2 — Durum sınırları' },
      { diagramSlug: 'micro-frontend-architecture', label: 'Adım 3 — Federated UI' },
    ],
  },
];
