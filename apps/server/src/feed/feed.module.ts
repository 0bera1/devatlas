import { Module } from '@nestjs/common';
import { DocumentsModule } from '../documents/documents.module';
import { FeedController } from './feed.controller';

@Module({
  imports: [DocumentsModule],
  controllers: [FeedController],
})
export class FeedModule {}
