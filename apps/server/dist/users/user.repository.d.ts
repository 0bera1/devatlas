import type { User } from '@prisma/client';
import { type IPrismaService } from '../prisma/interfaces/prisma-service.interface';
import type { PublicUser } from './interfaces/public-user.interface';
import type { CreateUserData, IUserRepository, UpdateUserProfileData } from './interfaces/user-repository.interface';
export declare class UserRepository implements IUserRepository {
    private readonly prisma;
    constructor(prisma: IPrismaService);
    findAll(): Promise<PublicUser[]>;
    findById(id: string): Promise<PublicUser | null>;
    findPublicByEmailNormalized(email: string): Promise<PublicUser | null>;
    findByEmailWithPassword(email: string): Promise<User | null>;
    create(data: CreateUserData): Promise<PublicUser>;
    deleteById(id: string): Promise<PublicUser>;
    updateProfileById(id: string, patch: UpdateUserProfileData): Promise<PublicUser | null>;
    updatePasswordHashById(id: string, newPasswordHash: string): Promise<boolean>;
    selectPasswordHashById(id: string): Promise<string | null>;
    private static mapToPublicUser;
}
