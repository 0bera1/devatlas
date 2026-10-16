import { describe, expect, it } from 'vitest';
import { flattenKnowledgeInfiniteData, flattenKnowledgePages, getKnowledgeNextPage } from './knowledge/flatten-knowledge-pages';
import { buildUserInitials } from './user/build-user-initials';
import { formatUserDisplayName } from './user/format-user-display-name';
import { decodeBasicHtmlEntities } from './strings/decode-basic-html-entities';
import { parseApiError } from './api/parse-api-error';
import { normalizeDiagramRecordWireTypes } from '@/diagram-engine/model/migrate-diagram-record';
import { findUnreachableNodes, validateEngineDiagram } from '@/diagram-engine/model/validate-engine-diagram';
import type { DiagramEngineGraph } from '@/diagram-engine/types/diagram-engine.types';
import type { DiagramRecord } from '@/domains/diagram/diagramDomains';

describe('bilgi tabanı sayfa birleştirme', () => {
  const page = <T,>(items: T[], current: number, totalPages: number) => ({ items, page: current, totalPages, total: 0, pageSize: 2 });

  it('sayfaları sırayla tek listeye açar', () => {
    expect(flattenKnowledgePages([page([1, 2], 1, 2), page([3], 2, 2)])).toEqual([1, 2, 3]);
    expect(flattenKnowledgePages(undefined)).toEqual([]);
  });

  it('sonsuz veriyi birleştirir ve boş girdide boş döner', () => {
    expect(flattenKnowledgeInfiniteData({ pages: [page(['a'], 1, 1)], pageParams: [1] })).toEqual(['a']);
    expect(flattenKnowledgeInfiniteData(undefined)).toEqual([]);
  });

  it('son sayfadan sonra sonraki sayfa yoktur', () => {
    expect(getKnowledgeNextPage(page([], 1, 3))).toBe(2);
    expect(getKnowledgeNextPage(page([], 3, 3))).toBeUndefined();
  });
});

describe('kullanıcı adı yardımcıları', () => {
  it('baş harflerini büyük harfle birleştirir', () => {
    expect(buildUserInitials('ayşe', 'yılmaz')).toBe('AY');
  });

  it('boş ad için soru işareti kullanır', () => {
    expect(buildUserInitials('', '  ')).toBe('??');
  });

  it('tam adı boşlukları temizleyerek birleştirir', () => {
    expect(formatUserDisplayName('  Ada ', ' Lovelace ')).toBe('Ada Lovelace');
    expect(formatUserDisplayName('Ada', '')).toBe('Ada');
  });
});

describe('HTML varlıklarını çözme', () => {
  it('yaygın kaçışları düz metne çevirir', () => {
    expect(decodeBasicHtmlEntities('a &quot;b&quot; &amp; &lt;c&gt; &#39;d&#39;')).toBe('a "b" & <c> \'d\'');
  });

  it('&amp; önce çözülmez; çift kodlanmış metin bir kez çözülür', () => {
    expect(decodeBasicHtmlEntities('&amp;lt;')).toBe('&lt;');
  });
});

describe('API hata metni', () => {
  it('Nest dizi mesajını virgülle birleştirir', async () => {
    const response = new Response(JSON.stringify({ message: ['e-posta geçersiz', 'parola kısa'] }), { status: 400 });
    expect(await parseApiError(response)).toBe('e-posta geçersiz, parola kısa');
  });

  it('JSON olmayan yanıtta durum metnine düşer', async () => {
    const response = new Response('<html>', { status: 502, statusText: 'Bad Gateway' });
    expect(await parseApiError(response)).toBe('Bad Gateway');
  });
});

describe('diyagram kayıt göçü', () => {
  it('eski db tipini database olarak yazar ve girdiyi değiştirmez', () => {
    const record = {
      id: 'd1',
      title: 'T',
      nodes: [{ id: 'n1', type: 'db', position: { x: 0, y: 0 } }],
      edges: [],
    } as unknown as DiagramRecord;
    const normalized = normalizeDiagramRecordWireTypes(record);
    expect(normalized.nodes[0]?.type).toBe('database');
    expect(record.nodes[0]?.type).toBe('db');
  });
});

describe('motor grafiği doğrulama', () => {
  const graph = (nodes: Array<{ id: string; x?: number }>, edges: Array<{ id: string; source: string; target: string }>) =>
    ({
      nodes: nodes.map((n) => ({ id: n.id, position: { x: n.x ?? 0, y: 0 } })),
      edges,
    }) as unknown as DiagramEngineGraph;

  it('geçerli grafikte sorun bulmaz', () => {
    expect(validateEngineDiagram(graph([{ id: 'a' }, { id: 'b' }], [{ id: 'e', source: 'a', target: 'b' }]))).toEqual([]);
  });

  it('yinelenen düğüm, geçersiz pozisyon ve kopuk kenarı raporlar', () => {
    const issues = validateEngineDiagram(
      graph([{ id: 'a' }, { id: 'a' }, { id: 'b', x: Number.NaN }], [{ id: 'e', source: 'a', target: 'zz' }]),
    );
    const codes = issues.map((i) => i.code);
    expect(codes).toContain('DUPLICATE_NODE_ID');
    expect(codes).toContain('INVALID_NODE_POSITION');
    expect(codes).toContain('INVALID_EDGE_ENDPOINT');
  });

  it('boş grafikte ulaşılamayan düğüm yoktur', () => {
    expect(findUnreachableNodes(graph([], []))).toEqual([]);
  });
});
