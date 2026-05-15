import { type IPrismaService } from '../prisma/interfaces/prisma-service.interface';
import type { SystemContentRecord } from './interfaces/system-content-record.interface';
import type { ISystemContentRepository } from './interfaces/system-content-repository.interface';
export declare class SystemContentRepository implements ISystemContentRepository {
    private readonly prisma;
    constructor(prisma: IPrismaService);
    selectAllByCreatedAtDesc(): Promise<SystemContentRecord[]>;
}
