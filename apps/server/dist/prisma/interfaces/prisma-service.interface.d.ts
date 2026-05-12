import type { PrismaClient } from '@prisma/client';
export declare const PRISMA_SERVICE: unique symbol;
export interface IPrismaService extends PrismaClient {
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
