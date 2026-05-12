import { type IUsersService } from './interfaces/users-service.interface';
import type { PublicUser } from './interfaces/public-user.interface';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: IUsersService);
    getUsers(): Promise<PublicUser[]>;
    getUserById(id: string): Promise<PublicUser | null>;
    deleteUser(id: string): Promise<PublicUser>;
}
