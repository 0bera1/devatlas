import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpThrottlerGuard } from './common/throttler/http-throttler.guard';
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
import { StudyModule } from './study/study.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PreferencesModule } from './preferences/preferences.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 120 }]),
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
    StudyModule,
    NotificationsModule,
    PreferencesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: HttpThrottlerGuard },
  ],
})
export class AppModule {}
