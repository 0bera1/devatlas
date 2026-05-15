import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DiagramsModule } from './diagrams/diagrams.module';
import { DocumentsModule } from './documents/documents.module';
import { FeedModule } from './feed/feed.module';
import { IntelligenceModule } from './intelligence/intelligence.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './profile/profile.module';
import { SearchModule } from './search/search.module';
import { KnowledgeBaseModule } from './knowledge-base/knowledge-base.module';
import { SystemContentModule } from './system-content/system-content.module';
import { UserActivityModule } from './user-activity/user-activity.module';
import { UsersModule } from './users/users.module';
import { CollaborationModule } from './collaboration/collaboration.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    DocumentsModule,
    DiagramsModule,
    CollaborationModule,
    IntelligenceModule,
    FeedModule,
    SearchModule,
    SystemContentModule,
    KnowledgeBaseModule,
    UserActivityModule,
    ProfileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
