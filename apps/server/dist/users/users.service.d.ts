import { type IUserRepository } from './interfaces/user-repository.interface';
import type { PublicUser } from './interfaces/public-user.interface';
import type { IUsersService } from './interfaces/users-service.interface';
export declare class UsersService implements IUsersService {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    getAllUsers(): Promise<PublicUser[]>;
    getUserById(id: string): Promise<PublicUser | null>;
    deleteUser(id: string): Promise<PublicUser>;
}
