import type { IDatabaseSeedPersistence } from './interfaces/database-seed-persistence.interface';
export declare class DatabaseSeedRunner {
    private readonly persistence;
    private readonly logger;
    constructor(persistence: IDatabaseSeedPersistence);
    run(): Promise<void>;
    private seedUsersTable;
    private seedKnowledgeDocuments;
    private seedKnowledgeDiagrams;
    private seedKnowledgeFlows;
}
