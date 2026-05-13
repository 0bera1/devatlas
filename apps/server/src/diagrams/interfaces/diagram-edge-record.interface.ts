export interface DiagramEdgeRecord {
  id: string;
  diagramId: string;
  fromNodeId: string;
  toNodeId: string;
  label: string | null;
  type: string | null;
  animated: boolean;
}
