import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from './interfaces/user-repository.interface';
import type { PublicUser } from './interfaces/public-user.interface';
import type { IUsersService } from './interfaces/users-service.interface';

@Injectable()
export class UsersService implements IUsersService {
  public constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  public async getAllUsers(): Promise<PublicUser[]> {
    return this.userRepository.findAll();
  }

  public async getUserById(id: string): Promise<PublicUser | null> {
    const user: PublicUser | null = await this.userRepository.findById(id);

    if (user === null) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    return user;
  }

  public async deleteUser(id: string): Promise<PublicUser> {
    await this.getUserById(id);
    return this.userRepository.deleteById(id);
  }
}
