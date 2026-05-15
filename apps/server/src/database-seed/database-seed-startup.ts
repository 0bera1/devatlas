import { Logger } from '@nestjs/common';
import type { IDatabaseSeedPersistence } from './interfaces/database-seed-persistence.interface';
import { DatabaseSeedRunner } from './database-seed.runner';

export class DatabaseSeedStartup {
  private readonly logger: Logger = new Logger(DatabaseSeedStartup.name);

  public constructor(
    private readonly persistence: IDatabaseSeedPersistence,
  ) {}

  public async runIfEnabled(): Promise<void> {
    if (!this.isEnabled()) {
      this.logger.log('Database seed skipped (RUN_DB_SEED_ON_STARTUP=false)');
      return;
    }

    const runner: DatabaseSeedRunner = new DatabaseSeedRunner(this.persistence);
    await runner.run();
  }

  private isEnabled(): boolean {
    const flag: string | undefined = process.env.RUN_DB_SEED_ON_STARTUP;
    if (flag === undefined) {
      return true;
    }
    return flag.toLowerCase() !== 'false' && flag !== '0';
  }
}
