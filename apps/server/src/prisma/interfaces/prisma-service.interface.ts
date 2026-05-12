import type { PrismaClient } from '@prisma/client';

export const PRISMA_SERVICE: unique symbol = Symbol('PRISMA_SERVICE');

export interface IPrismaService extends PrismaClient {
  onModuleInit(): Promise<void>;
  onModuleDestroy(): Promise<void>;
}
