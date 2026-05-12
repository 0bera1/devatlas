import { Module, Provider, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SystemContentController } from './system-content.controller';
import { SystemContentRepository } from './system-content.repository';
import { SystemContentService } from './system-content.service';
import { SYSTEM_CONTENT_REPOSITORY } from './interfaces/system-content-repository.interface';
import { SYSTEM_CONTENT_SERVICE } from './interfaces/system-content-service.interface';

const systemContentRepositoryProvider: Provider = {
  provide: SYSTEM_CONTENT_REPOSITORY,
  useClass: SystemContentRepository,
};

const systemContentServiceProvider: Provider = {
  provide: SYSTEM_CONTENT_SERVICE,
  useClass: SystemContentService,
};

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [SystemContentController],
  providers: [systemContentRepositoryProvider, systemContentServiceProvider],
})
export class SystemContentModule {}
