import { Module, Provider } from '@nestjs/common';
import { USER_REPOSITORY } from './interfaces/user-repository.interface';
import { USERS_SERVICE } from './interfaces/users-service.interface';
import { UserRepository } from './user.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const userRepositoryProvider: Provider = {
  provide: USER_REPOSITORY,
  useClass: UserRepository,
};

const usersServiceProvider: Provider = {
  provide: USERS_SERVICE,
  useClass: UsersService,
};

@Module({
  controllers: [UsersController],
  providers: [userRepositoryProvider, usersServiceProvider],
  exports: [USERS_SERVICE],
})
export class UsersModule {}
