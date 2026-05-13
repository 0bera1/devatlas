import { Module, Provider, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TechKeywordExtractor } from './auto-tag/tech-keyword-extractor';
import { TECH_KEYWORD_EXTRACTOR } from './auto-tag/interfaces/tech-keyword-extractor.interface';
import { ArchitectureTemplateMatcher } from './diagram-generation/architecture-template-matcher';
import { ARCHITECTURE_TEMPLATE_MATCHER } from './diagram-generation/interfaces/architecture-template-matcher.interface';
import { IntelligenceController } from './intelligence.controller';
import { IntelligenceRepository } from './intelligence.repository';
import { IntelligenceService } from './intelligence.service';
import { INTELLIGENCE_REPOSITORY } from './interfaces/intelligence-repository.interface';
import { INTELLIGENCE_SERVICE } from './interfaces/intelligence-service.interface';
import { InterviewQuestionRepository } from './interview-questions/interview-question.repository';
import { INTERVIEW_QUESTION_REPOSITORY } from './interview-questions/interfaces/interview-question-repository.interface';

const intelligenceRepositoryProvider: Provider = {
  provide: INTELLIGENCE_REPOSITORY,
  useClass: IntelligenceRepository,
};

const techKeywordExtractorProvider: Provider = {
  provide: TECH_KEYWORD_EXTRACTOR,
  useClass: TechKeywordExtractor,
};

const architectureTemplateMatcherProvider: Provider = {
  provide: ARCHITECTURE_TEMPLATE_MATCHER,
  useClass: ArchitectureTemplateMatcher,
};

const interviewQuestionRepositoryProvider: Provider = {
  provide: INTERVIEW_QUESTION_REPOSITORY,
  useClass: InterviewQuestionRepository,
};

const intelligenceServiceProvider: Provider = {
  provide: INTELLIGENCE_SERVICE,
  useClass: IntelligenceService,
};

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [IntelligenceController],
  providers: [
    intelligenceRepositoryProvider,
    techKeywordExtractorProvider,
    architectureTemplateMatcherProvider,
    interviewQuestionRepositoryProvider,
    intelligenceServiceProvider,
  ],
  exports: [intelligenceServiceProvider],
})
export class IntelligenceModule {}
