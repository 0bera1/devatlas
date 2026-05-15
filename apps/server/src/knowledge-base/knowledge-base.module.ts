import { Module, Provider } from '@nestjs/common';
import { KnowledgeBaseController } from './knowledge-base.controller';
import { KnowledgeBaseRepository } from './knowledge-base.repository';
import { KnowledgeBaseService } from './knowledge-base.service';
import { KNOWLEDGE_REPOSITORY } from './interfaces/knowledge-repository.interface';
import { KNOWLEDGE_SERVICE } from './interfaces/knowledge-service.interface';

const knowledgeRepositoryProvider: Provider = {
  provide: KNOWLEDGE_REPOSITORY,
  useClass: KnowledgeBaseRepository,
};

const knowledgeServiceProvider: Provider = {
  provide: KNOWLEDGE_SERVICE,
  useClass: KnowledgeBaseService,
};

@Module({
  controllers: [KnowledgeBaseController],
  providers: [knowledgeRepositoryProvider, knowledgeServiceProvider],
})
export class KnowledgeBaseModule {}
