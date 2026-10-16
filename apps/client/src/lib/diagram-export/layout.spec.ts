import { describe, expect, it } from 'vitest';
import { computeHierarchicalLayout } from './layout';

describe('computeHierarchicalLayout', () => {
  it('LR yerleşiminde zincirin düğümleri soldan sağa dizer', () => {
    const positions = computeHierarchicalLayout(
      [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
      [
        { source: 'a', target: 'b' },
        { source: 'b', target: 'c' },
      ],
      { direction: 'LR' },
    );
    const x = (id: string) => positions.get(id)?.x ?? Number.NaN;
    expect(x('a')).toBeLessThan(x('b'));
    expect(x('b')).toBeLessThan(x('c'));
  });

  it('düğümler birbirinin üstüne binmez', () => {
    const positions = computeHierarchicalLayout(
      [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
      [{ source: 'a', target: 'c' }],
    );
    const boxes = [...positions.values()];
    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        const overlapX = Math.abs(boxes[i].x - boxes[j].x) < 200;
        const overlapY = Math.abs(boxes[i].y - boxes[j].y) < 96;
        expect(overlapX && overlapY).toBe(false);
      }
    }
  });

  it('bilinmeyen kenar uçlarında hata vermez', () => {
    const positions = computeHierarchicalLayout([{ id: 'a' }], [{ source: 'a', target: 'x' }]);
    expect(positions.has('a')).toBe(true);
  });
});
