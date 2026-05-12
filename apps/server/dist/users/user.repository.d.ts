import type { User } from '@prisma/client';
import { type IPrismaService } from '../prisma/interfaces/prisma-service.interface';
import type { PublicUser } from './interfaces/public-user.interface';
import type { CreateUserData, IUserRepository } from './interfaces/user-repository.interface';
export declare class UserRepository implements IUserRepository {
    private readonly prisma;
    constructor(prisma: IPrismaService);
    findAll(): Promise<PublicUser[]>;
    findById(id: string): Promise<PublicUser | null>;
    findPublicByEmailNormalized(email: string): Promise<PublicUser | null>;
    findByEmailWithPassword(email: string): Promise<User | null>;
    create(data: CreateUserData): Promise<PublicUser>;
    deleteById(id: string): Promise<PublicUser>;
    private static mapToPublicUser;
}
