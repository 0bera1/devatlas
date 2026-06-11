import type { PrismaClient } from '@prisma/client';

/** Seed işlemlerinde kullanılan Prisma alt kümesi. */
export type IDatabaseSeedPersistence = Pick<
  PrismaClient,
  | 'user'
  | 'systemDocument'
  | 'systemDiagram'
  | 'systemDiagramNode'
  | 'systemDiagramEdge'
  | 'systemFlow'
  | 'systemFlowStep'
  | 'interviewQuestion'
>;
