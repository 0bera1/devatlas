import type { User } from '@prisma/client';
import { type IPrismaService } from '../prisma/interfaces/prisma-service.interface';
import type { CreateUserData, IUserRepository } from './interfaces/user-repository.interface';
export declare class UserRepository implements IUserRepository {
    private readonly prisma;
    constructor(prisma: IPrismaService);
    findAll(): Promise<User[]>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(data: CreateUserData): Promise<User>;
    deleteById(id: string): Promise<User>;
}
