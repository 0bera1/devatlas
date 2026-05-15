import type { SystemContentRecord } from './interfaces/system-content-record.interface';
import { type ISystemContentService } from './interfaces/system-content-service.interface';
export declare class SystemContentController {
    private readonly systemContentService;
    constructor(systemContentService: ISystemContentService);
    list(): Promise<SystemContentRecord[]>;
}
