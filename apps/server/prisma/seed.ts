import { PrismaClient } from '@prisma/client';
import { DatabaseSeedRunner } from '../src/database-seed/database-seed.runner';

async function main(): Promise<void> {
  const prisma: PrismaClient = new PrismaClient();
  const runner: DatabaseSeedRunner = new DatabaseSeedRunner(prisma);
  await runner.run();
  await prisma.$disconnect();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
