import type { DocumentVisibility } from '../../documents/interfaces/document-record.interface';
import type { DiagramEdgeRecord } from './diagram-edge-record.interface';
import type { DiagramNodeRecord } from './diagram-node-record.interface';
export type DiagramViewerAccess = 'owner' | 'collaborator' | 'viewer';
export interface DiagramRecord {
    id: string;
    title: string;
    ownerId: string;
    visibility: DocumentVisibility;
    viewerAccess: DiagramViewerAccess;
    nodes: DiagramNodeRecord[];
    edges: DiagramEdgeRecord[];
    createdAt: Date;
    updatedAt: Date;
}
