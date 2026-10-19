import type { SeedInterviewKnowledgeLinksInput } from '../types';

/**
 * Her mülakat sorusunun bağlı olduğu bilgi tabanı kaynakları. Slug'lar seed dokümanlarından, diyagramlarından
 * ve akışlarından alınır; seed çalıştırıcısı yalnızca var olan kaynakları kullanır.
 */
export const seedInterviewKnowledgeLinks: readonly SeedInterviewKnowledgeLinksInput[] = [
  {
    questionSlug: 'url-kisaltici-olcekleme',
    documents: ['redis'],
    diagrams: ['database-scaling', 'microservice-architecture'],
    flows: [],
  },
  {
    questionSlug: 'rest-sayfalama',
    documents: ['rest-best-practices', 'api-gateway'],
    diagrams: ['request-lifecycle'],
    flows: [],
  },
  {
    questionSlug: 'saga-vs-iki-asamali-commit',
    documents: ['api-gateway'],
    diagrams: ['microservice-architecture'],
    flows: ['full-stack-request-journey'],
  },
  {
    questionSlug: 'tuketici-idempotens',
    documents: ['websocket-vs-sse'],
    diagrams: ['request-lifecycle'],
    flows: [],
  },
  {
    questionSlug: 'okuma-agirlikli-onbellek',
    documents: ['redis'],
    diagrams: ['database-scaling'],
    flows: [],
  },
  {
    questionSlug: 'jwt-yenileme-rotasyonu',
    documents: [],
    diagrams: ['authentication-flow'],
    flows: [],
  },
  {
    questionSlug: 'kafka-siralama-garantisi',
    documents: ['websocket-vs-sse'],
    diagrams: ['microservice-architecture'],
    flows: [],
  },
  {
    questionSlug: 'react-sunucu-istemci-durumu',
    documents: ['state-management-strategies', 'lazy-loading'],
    diagrams: ['react-app-layer-architecture', 'state-management-diagram'],
    flows: ['frontend-architecture-path'],
  },
  {
    questionSlug: 'guvenli-dagitim-hatti',
    documents: [],
    diagrams: ['cicd-deployment-flow'],
    flows: ['secure-delivery-pipeline'],
  },
  {
    questionSlug: 'indeks-ne-zaman-zarar-verir',
    documents: ['database-engineering-indexes'],
    diagrams: ['database-scaling'],
    flows: [],
  },
];
