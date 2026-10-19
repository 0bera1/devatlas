import { describe, expect, it } from 'vitest';
import {
  CHAPTERS,
  FEATURE_NODE_IDS,
  STORY_NODES,
  activeFeatureIndex,
  chapterOpacity,
  clamp01,
  computeGraphFrame,
  featureRange,
  segment,
  smoothstep,
} from './story-timeline';

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
    expect(chapterOpacity(0.9, 0.16, 0.36)).toBe(0);
  });

  it('bölüm ortasında tam görünür', () => {
    expect(chapterOpacity(0.26, 0.16, 0.36)).toBeCloseTo(1);
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
  });
});

describe('grafik karesi', () => {
  it('başlangıçta düğümler dağınık ve kenarlar çizilmemiş', () => {
    const frame = computeGraphFrame(0);
    frame.nodes.forEach((node, index) => {
      expect(node.x).toBeCloseTo(STORY_NODES[index]?.scatter.x ?? -1);
      expect(node.opacity).toBeLessThan(0.5);
    });
    frame.edges.forEach((edge) => expect(edge.draw).toBe(0));
  });

  it('sonunda düğümler düzenli yerde ve kenarlar tamamen çizilmiş', () => {
    const frame = computeGraphFrame(1);
    frame.nodes.forEach((node, index) => {
      expect(node.x).toBeCloseTo(STORY_NODES[index]?.layout.x ?? -1);
      expect(node.opacity).toBeCloseTo(1);
    });
    frame.edges.forEach((edge) => expect(edge.draw).toBe(1));
  });

  it('vurgulanan düğüm o anki özelliğin düğümüdür', () => {
    const [start, end] = featureRange(2);
    const frame = computeGraphFrame((start + end) / 2);
    const highlighted = frame.nodes.filter((node) => node.highlighted).map((node) => node.id);
    expect(highlighted).toEqual([FEATURE_NODE_IDS[2]]);
  });

  it('imleçler yalnızca sonda görünür', () => {
    expect(computeGraphFrame(0.5).cursors.every((cursor) => cursor.opacity === 0)).toBe(true);
    expect(computeGraphFrame(1).cursors.every((cursor) => cursor.opacity === 1)).toBe(true);
  });
});
