import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DiagramsModule } from '../diagrams/diagrams.module';
import { DocumentsModule } from '../documents/documents.module';
import { CollaborationGateway } from './collaboration.gateway';

@Module({
  imports: [AuthModule, DiagramsModule, DocumentsModule],
  providers: [CollaborationGateway],
})
export class CollaborationModule {}
