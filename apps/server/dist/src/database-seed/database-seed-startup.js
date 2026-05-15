"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseSeedStartup = void 0;
const common_1 = require("@nestjs/common");
const database_seed_runner_1 = require("./database-seed.runner");
class DatabaseSeedStartup {
    persistence;
    logger = new common_1.Logger(DatabaseSeedStartup.name);
    constructor(persistence) {
        this.persistence = persistence;
    }
    async runIfEnabled() {
        if (!this.isEnabled()) {
            this.logger.log('Database seed skipped (RUN_DB_SEED_ON_STARTUP=false)');
            return;
        }
        const runner = new database_seed_runner_1.DatabaseSeedRunner(this.persistence);
        await runner.run();
    }
    isEnabled() {
        const flag = process.env.RUN_DB_SEED_ON_STARTUP;
        if (flag === undefined) {
            return true;
        }
        return flag.toLowerCase() !== 'false' && flag !== '0';
    }
}
exports.DatabaseSeedStartup = DatabaseSeedStartup;
//# sourceMappingURL=database-seed-startup.js.map