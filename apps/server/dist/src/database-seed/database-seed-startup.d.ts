import type { IDatabaseSeedPersistence } from './interfaces/database-seed-persistence.interface';
export declare class DatabaseSeedStartup {
    private readonly persistence;
    private readonly logger;
    constructor(persistence: IDatabaseSeedPersistence);
    runIfEnabled(): Promise<void>;
    private isEnabled;
}
