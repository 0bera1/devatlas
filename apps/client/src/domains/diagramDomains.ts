import type { DocumentVisibility } from './documentsDomains';

export type DiagramViewerAccess = 'owner' | 'collaborator' | 'viewer';

export type DiagramListAccessRole = 'owner' | 'collaborator' | 'viewer';

export interface DiagramCollaboratorEntry {
  userId: string;
  email: string;
  name: string | null;
}

export type DiagramNodeKind = 'text' | 'db' | 'service' | 'api';

export interface DiagramNodeRecord {
  id: string;
  diagramId: string;
  label: string;
  type: string;
  x: number;
  y: number;
}

export interface DiagramEdgeRecord {
  id: string;
  diagramId: string;
  fromNodeId: string;
  toNodeId: string;
  label: string | null;
}

export interface DiagramRecord {
  id: string;
  title: string;
  ownerId: string;
  visibility: DocumentVisibility;
  viewerAccess: DiagramViewerAccess;
  nodes: DiagramNodeRecord[];
  edges: DiagramEdgeRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface DiagramSummary {
  id: string;
  title: string;
  ownerId: string;
  visibility: DocumentVisibility;
  accessRole: DiagramListAccessRole;
  nodeCount: number;
  createdAt: string;
  updatedAt: string;
}

export type DiagramSaveNodeBody = {
  id: string;
  label: string;
  type: DiagramNodeKind;
  x: number;
  y: number;
};

export interface DiagramSaveEdgeBody {
  from: string;
  to: string;
  label?: string;
}

export interface SaveDiagramGraphBody {
  nodes: DiagramSaveNodeBody[];
  edges: DiagramSaveEdgeBody[];
}

export interface CreateDiagramBody {
  title: string;
  visibility?: DocumentVisibility;
}

export interface PatchDiagramBody {
  title?: string;
  visibility?: DocumentVisibility;
}
