import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import {
  USER_REPOSITORY,
  type CreateUserData,
  type IUserRepository,
} from './interfaces/user-repository.interface';
import type { IUsersService } from './interfaces/users-service.interface';

@Injectable()
export class UsersService implements IUsersService {
  public constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  public async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  public async getUserById(id: string): Promise<User | null> {
    const user: User | null = await this.userRepository.findById(id);

    if (user === null) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    return user;
  }

  public async createUser(data: CreateUserData): Promise<User> {
    const existing: User | null = await this.userRepository.findByEmail(
      data.email,
    );

    if (existing !== null) {
      throw new ConflictException(
        `User with email "${data.email}" already exists`,
      );
    }

    return this.userRepository.create(data);
  }

  public async deleteUser(id: string): Promise<User> {
    await this.getUserById(id);
    return this.userRepository.deleteById(id);
  }
}
