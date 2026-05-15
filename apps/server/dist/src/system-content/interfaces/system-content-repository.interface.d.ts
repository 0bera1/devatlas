import type { SystemContentRecord } from './system-content-record.interface';
export declare const SYSTEM_CONTENT_REPOSITORY: unique symbol;
export interface ISystemContentRepository {
    selectAllByCreatedAtDesc(): Promise<SystemContentRecord[]>;
}
