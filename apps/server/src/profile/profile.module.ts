import { Module, Provider, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserActivityModule } from '../user-activity/user-activity.module';
import { UsersModule } from '../users/users.module';
import { PROFILE_REPOSITORY } from './interfaces/profile-repository.interface';
import { PROFILE_SERVICE } from './interfaces/profile-service.interface';
import { ProfileController } from './profile.controller';
import { ProfileRepository } from './profile.repository';
import { ProfileService } from './profile.service';

const profileRepositoryProvider: Provider = {
  provide: PROFILE_REPOSITORY,
  useClass: ProfileRepository,
};

const profileServiceProvider: Provider = {
  provide: PROFILE_SERVICE,
  useClass: ProfileService,
};

@Module({
  imports: [forwardRef(() => AuthModule), UsersModule, UserActivityModule],
  controllers: [ProfileController],
  providers: [profileRepositoryProvider, profileServiceProvider],
})
export class ProfileModule {}
