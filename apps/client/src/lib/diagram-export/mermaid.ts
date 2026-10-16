export interface MermaidNodeInput {
  readonly id: string;
  readonly label: string;
}

export interface MermaidEdgeInput {
  readonly source: string;
  readonly target: string;
  readonly label?: string;
  readonly dashed?: boolean;
}

/** Mermaid etiketlerinde tırnak ve köşeli parantez gibi karakterleri kaçırır. */
export function escapeMermaidLabel(value: string): string {
  return value
    .replace(/"/g, '#quot;')
    .replace(/\[/g, '#91;')
    .replace(/\]/g, '#93;')
    .replace(/\r?\n/g, ' ')
    .trim();
}

/**
 * Düğüm ve kenarları Mermaid `flowchart` metnine çevirir.
 * Düğüm kimlikleri n1, n2 … olarak yeniden adlandırılır; böylece özel karakterler sorun olmaz.
 */
export function toMermaidFlowchart(
  nodes: readonly MermaidNodeInput[],
  edges: readonly MermaidEdgeInput[],
): string {
  const aliases = new Map<string, string>();
  const lines: string[] = ['flowchart LR'];

  nodes.forEach((node, index) => {
    const alias = `n${index + 1}`;
    aliases.set(node.id, alias);
    const label = escapeMermaidLabel(node.label.length > 0 ? node.label : node.id);
    lines.push(`  ${alias}["${label}"]`);
  });

  for (const edge of edges) {
    const source = aliases.get(edge.source);
    const target = aliases.get(edge.target);
    if (source === undefined || target === undefined) {
      continue;
    }
    const arrow = edge.dashed === true ? '-.->' : '-->';
    if (edge.label !== undefined && edge.label.trim().length > 0) {
      const label = escapeMermaidLabel(edge.label);
      lines.push(edge.dashed === true
        ? `  ${source} -. "${label}" .-> ${target}`
        : `  ${source} -- "${label}" --> ${target}`);
    } else {
      lines.push(`  ${source} ${arrow} ${target}`);
    }
  }

  return `${lines.join('\n')}\n`;
}
