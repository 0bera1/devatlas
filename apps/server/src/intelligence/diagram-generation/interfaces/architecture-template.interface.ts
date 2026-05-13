/**
 * Node tipi mevcut diagram editörüyle uyumlu olmalı:
 * `'text' | 'db' | 'service' | 'api'`. SaveDiagramNodeBodyDto ile aynı set.
 */
export type ArchitectureTemplateNodeType =
  | 'text'
  | 'db'
  | 'service'
  | 'api'
  | 'cache'
  | 'queue';
export type ArchitectureTemplateEdgeType =
  | 'smoothstep'
  | 'straight'
  | 'step'
  | 'default';

export interface ArchitectureTemplateNode {
  /** Şablon içi yerel kimlik; final diagram persistance sırasında değiştirilir. */
  readonly localId: string;
  readonly label: string;
  readonly type: ArchitectureTemplateNodeType;
  readonly x: number;
  readonly y: number;
  readonly width?: number | null;
  readonly height?: number | null;
}

export interface ArchitectureTemplateEdge {
  readonly fromLocalId: string;
  readonly toLocalId: string;
  readonly label?: string;
  readonly type?: ArchitectureTemplateEdgeType;
  readonly animated?: boolean;
}

export interface ArchitectureTemplate {
  readonly id: string;
  readonly name: string;
  /** Prompt eşleşmesinde aranan normalize anahtar kelimeler. */
  readonly keywords: readonly string[];
  readonly description: string;
  readonly nodes: readonly ArchitectureTemplateNode[];
  readonly edges: readonly ArchitectureTemplateEdge[];
}
