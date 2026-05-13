import { Module, Provider } from '@nestjs/common';
import { USER_ACTIVITY_REPOSITORY } from './interfaces/user-activity-repository.interface';
import { USER_ACTIVITY_SERVICE } from './interfaces/user-activity-service.interface';
import { UserActivityRepository } from './user-activity.repository';
import { UserActivityService } from './user-activity.service';

const userActivityRepositoryProvider: Provider = {
  provide: USER_ACTIVITY_REPOSITORY,
  useClass: UserActivityRepository,
};

const userActivityServiceProvider: Provider = {
  provide: USER_ACTIVITY_SERVICE,
  useClass: UserActivityService,
};

@Module({
  providers: [userActivityRepositoryProvider, userActivityServiceProvider],
  exports: [USER_ACTIVITY_SERVICE, USER_ACTIVITY_REPOSITORY],
})
export class UserActivityModule {}
