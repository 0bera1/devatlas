import { Module, Provider, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DocumentRepository } from './document.repository';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DOCUMENT_REPOSITORY } from './interfaces/document-repository.interface';
import { DOCUMENTS_SERVICE } from './interfaces/documents-service.interface';

const documentRepositoryProvider: Provider = {
  provide: DOCUMENT_REPOSITORY,
  useClass: DocumentRepository,
};

const documentsServiceProvider: Provider = {
  provide: DOCUMENTS_SERVICE,
  useClass: DocumentsService,
};

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [DocumentsController],
  providers: [documentRepositoryProvider, documentsServiceProvider],
})
export class DocumentsModule {}
