import { Module } from '@nestjs/common';
import { DiagramsModule } from '../diagrams/diagrams.module';
import { DocumentsModule } from '../documents/documents.module';
import { KnowledgeBaseModule } from '../knowledge-base/knowledge-base.module';
import { LibrarySearchService } from './library-search.service';
import { SearchController } from './search.controller';

@Module({
  imports: [DocumentsModule, DiagramsModule, KnowledgeBaseModule],
  controllers: [SearchController],
  providers: [LibrarySearchService],
})
export class SearchModule {}
