import type { DocumentVisibility } from '../../documents/interfaces/document-record.interface';
export type DiagramListAccessRole = 'owner' | 'collaborator' | 'viewer';
export interface DiagramSummary {
    id: string;
    title: string;
    ownerId: string;
    visibility: DocumentVisibility;
    accessRole: DiagramListAccessRole;
    nodeCount: number;
    createdAt: Date;
    updatedAt: Date;
}
