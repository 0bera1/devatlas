import { Module, Provider } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { StudyController } from './study.controller';
import { StudyRepository } from './study.repository';
import { STUDY_REPOSITORY } from './interfaces/study-repository.interface';
import { StudyService } from './study.service';

const studyRepositoryProvider: Provider = {
  provide: STUDY_REPOSITORY,
  useClass: StudyRepository,
};

@Module({
  imports: [AuthModule],
  controllers: [StudyController],
  providers: [studyRepositoryProvider, StudyService],
})
export class StudyModule {}
