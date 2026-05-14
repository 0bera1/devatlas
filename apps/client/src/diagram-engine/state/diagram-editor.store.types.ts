/**
 * Canvas etkileşim modu — diyagram `metadata.mode` (simple | flow | knowledge) ile karıştırılmamalı.
 */
export type DiagramEditorCanvasMode = 'edit' | 'view' | 'flow';

export interface DiagramEditorViewportState {
  readonly x: number;
  readonly y: number;
  readonly zoom: number;
}
