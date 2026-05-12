import { Module } from '@nestjs/common';
import { DiagramsModule } from '../diagrams/diagrams.module';
import { DocumentsModule } from '../documents/documents.module';
import { SearchController } from './search.controller';

@Module({
  imports: [DocumentsModule, DiagramsModule],
  controllers: [SearchController],
})
export class SearchModule {}
