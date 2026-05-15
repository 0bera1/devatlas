import type { PrismaClient } from '@prisma/client';
export type IDatabaseSeedPersistence = Pick<PrismaClient, 'user' | 'systemDocument' | 'systemDiagram' | 'systemDiagramNode' | 'systemDiagramEdge' | 'systemFlow' | 'systemFlowStep'>;
