import { Module, Provider, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserActivityModule } from '../user-activity/user-activity.module';
import { UsersModule } from '../users/users.module';
import { DiagramRepository } from './diagram.repository';
import { DiagramsController } from './diagrams.controller';
import { DiagramsService } from './diagrams.service';
import { DIAGRAM_REPOSITORY } from './interfaces/diagram-repository.interface';
import { DIAGRAMS_SERVICE } from './interfaces/diagrams-service.interface';

const diagramRepositoryProvider: Provider = {
  provide: DIAGRAM_REPOSITORY,
  useClass: DiagramRepository,
};

const diagramsServiceProvider: Provider = {
  provide: DIAGRAMS_SERVICE,
  useClass: DiagramsService,
};

@Module({
  imports: [forwardRef(() => AuthModule), UsersModule, UserActivityModule],
  controllers: [DiagramsController],
  providers: [diagramRepositoryProvider, diagramsServiceProvider],
  exports: [diagramsServiceProvider],
})
export class DiagramsModule {}
