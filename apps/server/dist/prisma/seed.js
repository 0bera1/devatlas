"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const database_seed_runner_1 = require("../src/database-seed/database-seed.runner");
async function main() {
    const prisma = new client_1.PrismaClient();
    const runner = new database_seed_runner_1.DatabaseSeedRunner(prisma);
    await runner.run();
    await prisma.$disconnect();
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map