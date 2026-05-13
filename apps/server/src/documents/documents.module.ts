import { Module, Provider, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { IntelligenceModule } from '../intelligence/intelligence.module';
import { UserActivityModule } from '../user-activity/user-activity.module';
import { DocumentRepository } from './document.repository';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { EngagementRepository } from './engagement.repository';
import { DOCUMENT_REPOSITORY } from './interfaces/document-repository.interface';
import { DOCUMENTS_SERVICE } from './interfaces/documents-service.interface';
import { ENGAGEMENT_REPOSITORY } from './interfaces/engagement-repository.interface';

const documentRepositoryProvider: Provider = {
  provide: DOCUMENT_REPOSITORY,
  useClass: DocumentRepository,
};

const engagementRepositoryProvider: Provider = {
  provide: ENGAGEMENT_REPOSITORY,
  useClass: EngagementRepository,
};

const documentsServiceProvider: Provider = {
  provide: DOCUMENTS_SERVICE,
  useClass: DocumentsService,
};

@Module({
  imports: [forwardRef(() => AuthModule), IntelligenceModule, UserActivityModule],
  controllers: [DocumentsController],
  providers: [
    documentRepositoryProvider,
    engagementRepositoryProvider,
    documentsServiceProvider,
  ],
  exports: [documentsServiceProvider],
})
export class DocumentsModule {}
