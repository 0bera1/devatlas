import { describe, expect, it } from 'vitest';
import {
  CHAPTERS,
  FEATURE_NODE_IDS,
  NODE_HEIGHT,
  NODE_WIDTH,
  GRAPH_HEIGHT,
  GRAPH_WIDTH,
  STORY_NODES,
  TERMINAL_LOG,
  activeFeatureIndex,
  chapterOpacity,
  clamp01,
  computeGraphFrame,
  featureRange,
  layerOpacities,
  segment,
  smoothstep,
  terminalFrame,
  type Point,
} from './story-timeline';

function rect(center: Point) {
  return {
    left: center.x - NODE_WIDTH / 2,
    right: center.x + NODE_WIDTH / 2,
    top: center.y - NODE_HEIGHT / 2,
    bottom: center.y + NODE_HEIGHT / 2,
  };
}

function overlaps(a: Point, b: Point): boolean {
  const ra = rect(a);
  const rb = rect(b);
  return ra.left < rb.right && rb.left < ra.right && ra.top < rb.bottom && rb.top < ra.bottom;
}

describe('ilerleme yardımcıları', () => {
  it('değerleri 0 ile 1 arasına sıkıştırır', () => {
    expect(clamp01(-0.5)).toBe(0);
    expect(clamp01(1.5)).toBe(1);
    expect(clamp01(0.3)).toBe(0.3);
  });

  it('segment aralık dışında sınırlanır', () => {
    expect(segment(0.5, 0.4, 0.6)).toBeCloseTo(0.5);
    expect(segment(0.1, 0.4, 0.6)).toBe(0);
    expect(segment(0.9, 0.4, 0.6)).toBe(1);
  });

  it('smoothstep uç değerlerde sabitlenir', () => {
    expect(smoothstep(0)).toBe(0);
    expect(smoothstep(1)).toBe(1);
    expect(smoothstep(0.5)).toBeCloseTo(0.5);
  });
});

describe('bölüm görünürlüğü', () => {
  it('bölüm dışında görünmez', () => {
    expect(chapterOpacity(0.9, 0.12, 0.26)).toBe(0);
  });

  it('bölüm ortasında tam görünür', () => {
    expect(chapterOpacity((CHAPTERS.problem[0] + CHAPTERS.problem[1]) / 2, CHAPTERS.problem[0], CHAPTERS.problem[1])).toBeCloseTo(1);
  });

  it('hikâye başında ilk bölüm tam görünür', () => {
    expect(chapterOpacity(0, CHAPTERS.hero[0], CHAPTERS.hero[1])).toBeCloseTo(1);
  });
});

describe('özellik sırası', () => {
  it('her özellik kendi aralığında etkindir', () => {
    FEATURE_NODE_IDS.forEach((_, index) => {
      const [start, end] = featureRange(index);
      expect(activeFeatureIndex((start + end) / 2)).toBe(index);
    });
  });

  it('özellik bölümü dışında etkin özellik yoktur', () => {
    expect(activeFeatureIndex(0.1)).toBe(-1);
    expect(activeFeatureIndex(0.9)).toBe(-1);
  });
});

describe('düğüm yerleşimi', () => {
  it('dağınık haldeki düğümler birbirini kesmez ve kanvas içinde kalır', () => {
    STORY_NODES.forEach((node, index) => {
      const r = rect(node.scatter);
      expect(r.left).toBeGreaterThanOrEqual(0);
      expect(r.right).toBeLessThanOrEqual(GRAPH_WIDTH);
      expect(r.top).toBeGreaterThanOrEqual(0);
      expect(r.bottom).toBeLessThanOrEqual(GRAPH_HEIGHT);
      STORY_NODES.slice(index + 1).forEach((other) => {
        expect(overlaps(node.scatter, other.scatter), `${node.id} / ${other.id}`).toBe(false);
      });
    });
  });

  it('düzenli mimaride de düğümler birbirini kesmez', () => {
    STORY_NODES.forEach((node, index) => {
      STORY_NODES.slice(index + 1).forEach((other) => {
        expect(overlaps(node.layout, other.layout), `${node.id} / ${other.id}`).toBe(false);
      });
    });
  });
});

describe('grafik karesi', () => {
  it('başlangıçta düğümler dağınık ve kenarlar çizilmemiş', () => {
    const frame = computeGraphFrame(0);
    frame.nodes.forEach((node, index) => {
      expect(node.x).toBeCloseTo(STORY_NODES[index]?.scatter.x ?? -1);
    });
    frame.edges.forEach((edge) => expect(edge.draw).toBe(0));
  });

  it('sonunda düğümler düzenli yerde ve kenarlar tamamen çizilmiş', () => {
    const frame = computeGraphFrame(1);
    frame.nodes.forEach((node, index) => {
      expect(node.x).toBeCloseTo(STORY_NODES[index]?.layout.x ?? -1);
    });
    frame.edges.forEach((edge) => expect(edge.draw).toBe(1));
  });

  it('vurgulanan düğüm o anki özelliğin düğümüdür', () => {
    const [start, end] = featureRange(2);
    const frame = computeGraphFrame((start + end) / 2);
    const highlighted = frame.nodes.filter((node) => node.highlighted).map((node) => node.id);
    expect(highlighted).toEqual([FEATURE_NODE_IDS[2]]);
  });

  it('imleçler yalnızca demo bölümünde görünür', () => {
    expect(computeGraphFrame(0.5).cursors.every((cursor) => cursor.opacity === 0)).toBe(true);
    expect(computeGraphFrame(1).cursors.every((cursor) => cursor.opacity === 1)).toBe(true);
  });
});

describe('katmanlar', () => {
  it('terminal bölümünde grafik gider, terminal gelir', () => {
    const mid = layerOpacities((CHAPTERS.terminal[0] + CHAPTERS.terminal[1]) / 2);
    expect(mid.terminal).toBeCloseTo(1);
    expect(mid.graph).toBeCloseTo(0);
  });

  it('başlangıçta grafik görünür, canlı önizleme ve terminal gizlidir', () => {
    expect(layerOpacities(0).graph).toBeCloseTo(1);
    expect(layerOpacities(0).terminal).toBeCloseTo(0);
    expect(layerOpacities(0).live).toBeCloseTo(0);
  });

  it('demo bölümünde canlı önizleme grafiğin yerini alır', () => {
    const demo = layerOpacities(0.95);
    expect(demo.live).toBeCloseTo(1);
    expect(demo.graph).toBeCloseTo(0);
    expect(demo.terminal).toBeCloseTo(0);
  });
});

describe('terminal günlüğü', () => {
  it('komutlar ilerledikçe harf harf yazılır', () => {
    const [start, end] = CHAPTERS.terminal;
    const early = terminalFrame(start + (end - start) * 0.1).lines[0];
    const later = terminalFrame(start + (end - start) * 0.3).lines[0];
    expect(early?.text.length ?? 0).toBeLessThan(later?.text.length ?? 0);
    expect(later?.text.length ?? 0).toBeLessThanOrEqual(TERMINAL_LOG[0]?.text.length ?? 0);
  });

  it('sonda tüm satırlar tamamlanmış ve görünür', () => {
    const lines = terminalFrame(CHAPTERS.terminal[1] - 0.01).lines;
    expect(lines.every((line) => line.complete && line.visible)).toBe(true);
  });

  it('başlangıçta pencere görünmez', () => {
    expect(terminalFrame(CHAPTERS.terminal[0]).appear).toBeCloseTo(0);
    expect(terminalFrame(CHAPTERS.terminal[0] + 0.1).appear).toBeCloseTo(1);
  });
});
