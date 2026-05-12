import { Global, Module, Provider } from '@nestjs/common';
import { PRISMA_SERVICE } from './interfaces/prisma-service.interface';
import { PrismaService } from './prisma.service';

const prismaProvider: Provider = {
  provide: PRISMA_SERVICE,
  useClass: PrismaService,
};

@Global()
@Module({
  providers: [prismaProvider],
  exports: [PRISMA_SERVICE],
})
export class PrismaModule {}
