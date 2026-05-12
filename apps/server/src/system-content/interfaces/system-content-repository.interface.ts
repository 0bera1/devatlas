import type { SystemContentRecord } from './system-content-record.interface';

export const SYSTEM_CONTENT_REPOSITORY: unique symbol = Symbol(
  'SYSTEM_CONTENT_REPOSITORY',
);

export interface ISystemContentRepository {
  selectAllByCreatedAtDesc(): Promise<SystemContentRecord[]>;
}
