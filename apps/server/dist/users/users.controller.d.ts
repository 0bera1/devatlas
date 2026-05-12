import type { User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { type IUsersService } from './interfaces/users-service.interface';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: IUsersService);
    getUsers(): Promise<User[]>;
    getUserById(id: string): Promise<User | null>;
    createUser(dto: CreateUserDto): Promise<User>;
    deleteUser(id: string): Promise<User>;
}
