/**
 * Diyagram motorunun altın veri modeli.
 * Flow / knowledge / diagram linking özellikleri bu şemaya dayanır; UI yalnızca üst katmandır.
 */

export type DiagramMode = 'simple' | 'flow' | 'knowledge';

export type DiagramLayoutKind = 'free' | 'hierarchical' | 'auto';

/** Motor + ileride API ile hizalanacak metadata */
export interface DiagramMetadataModel {
  readonly version: number;
  readonly mode: DiagramMode;
  readonly layout: DiagramLayoutKind;
  readonly theme?: string;
}

/** Sunucu + editörde kullanılan düğüm sınıflandırması */
export type DiagramNodeType =
  | 'text'
  | 'api'
  | 'service'
  | 'database'
  | 'cache'
  | 'queue'
  | 'external'
  | 'custom';

export type DiagramNodeStatus =
  | 'default'
  | 'active'
  | 'warning'
  | 'error';

/** Kenarın anlamsal rolü (XYFlow routing’den bağımsız katman) */
export type DiagramEdgeSemanticType =
  | 'default'
  | 'dashed'
  | 'data-flow'
  | 'dependency'
  | 'async';

export interface DiagramNodeDataModel {
  readonly title: string;
  readonly description?: string;
  readonly markdown?: string;
  readonly tags?: readonly string[];
  readonly status?: DiagramNodeStatus;
  readonly icon?: string;
  readonly color?: string;
  readonly relatedDiagramId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface DiagramNodeModel {
  readonly id: string;
  readonly type: DiagramNodeType;
  readonly position: { readonly x: number; readonly y: number };
  readonly width?: number;
  readonly height?: number;
  readonly data: DiagramNodeDataModel;
}

export interface DiagramEdgeModel {
  readonly id: string;
  readonly source: string;
  readonly target: string;
  readonly label?: string;
  readonly animated?: boolean;
  /** XYFlow kenar tipi (smoothstep, straight, …) */
  readonly routing: string;
  readonly semanticType?: DiagramEdgeSemanticType;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/** Tam diyagram belgesi (API kaydı + motor sözleşmesi) */
export interface DiagramDocumentModel {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly nodes: readonly DiagramNodeModel[];
  readonly edges: readonly DiagramEdgeModel[];
  readonly metadata: DiagramMetadataModel;
  readonly createdAt: string;
  readonly updatedAt: string;
}
