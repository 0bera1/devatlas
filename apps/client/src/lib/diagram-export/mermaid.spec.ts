import { describe, expect, it } from 'vitest';
import { escapeMermaidLabel, toMermaidFlowchart } from './mermaid';

describe('toMermaidFlowchart', () => {
  it('düğümleri ve kenarları flowchart metnine çevirir', () => {
    const text = toMermaidFlowchart(
      [
        { id: 'a', label: 'API' },
        { id: 'b', label: 'Kafka' },
      ],
      [{ source: 'a', target: 'b', label: 'olay' }],
    );
    expect(text).toContain('flowchart LR');
    expect(text).toContain('n1["API"]');
    expect(text).toContain('n2["Kafka"]');
    expect(text).toContain('n1 -- "olay" --> n2');
  });

  it('kesikli kenarları noktalı ok ile yazar', () => {
    const text = toMermaidFlowchart(
      [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ],
      [{ source: 'a', target: 'b', dashed: true }],
    );
    expect(text).toContain('n1 -.-> n2');
  });

  it('tanımlı olmayan kenar uçlarını atlar', () => {
    const text = toMermaidFlowchart([{ id: 'a', label: 'A' }], [{ source: 'a', target: 'yok' }]);
    expect(text).not.toContain('-->');
  });
});

describe('escapeMermaidLabel', () => {
  it('tırnak ve köşeli parantezleri kaçırır', () => {
    expect(escapeMermaidLabel('a "b" [c]')).toBe('a #quot;b#quot; #91;c#93;');
  });
});
