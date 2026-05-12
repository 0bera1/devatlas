import type { SystemContentRecord } from './system-content-record.interface';

export const SYSTEM_CONTENT_SERVICE: unique symbol = Symbol(
  'SYSTEM_CONTENT_SERVICE',
);

export interface ISystemContentService {
  listSystemContent(): Promise<SystemContentRecord[]>;
}
