import type { User } from '@prisma/client';
import { type CreateUserData, type IUserRepository } from './interfaces/user-repository.interface';
import type { IUsersService } from './interfaces/users-service.interface';
export declare class UsersService implements IUsersService {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    getAllUsers(): Promise<User[]>;
    getUserById(id: string): Promise<User | null>;
    createUser(data: CreateUserData): Promise<User>;
    deleteUser(id: string): Promise<User>;
}
