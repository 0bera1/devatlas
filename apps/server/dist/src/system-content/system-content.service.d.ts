import type { SystemContentRecord } from './interfaces/system-content-record.interface';
import { type ISystemContentRepository } from './interfaces/system-content-repository.interface';
import type { ISystemContentService } from './interfaces/system-content-service.interface';
export declare class SystemContentService implements ISystemContentService {
    private readonly repository;
    constructor(repository: ISystemContentRepository);
    listSystemContent(): Promise<SystemContentRecord[]>;
}
