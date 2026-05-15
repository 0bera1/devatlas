import type { SystemContentRecord } from './system-content-record.interface';
export declare const SYSTEM_CONTENT_SERVICE: unique symbol;
export interface ISystemContentService {
    listSystemContent(): Promise<SystemContentRecord[]>;
}
