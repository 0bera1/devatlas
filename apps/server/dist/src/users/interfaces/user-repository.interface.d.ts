import type { User } from '@prisma/client';
import type { PublicUser } from './public-user.interface';
export declare const USER_REPOSITORY: unique symbol;
export interface CreateUserData {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    birthDate: Date;
}
export interface UpdateUserProfileData {
    firstName?: string;
    lastName?: string;
    birthDate?: Date;
}
export interface IUserRepository {
    findAll(): Promise<PublicUser[]>;
    findById(id: string): Promise<PublicUser | null>;
    findPublicByEmailNormalized(email: string): Promise<PublicUser | null>;
    findByEmailWithPassword(email: string): Promise<User | null>;
    create(data: CreateUserData): Promise<PublicUser>;
    deleteById(id: string): Promise<PublicUser>;
    updateProfileById(id: string, patch: UpdateUserProfileData): Promise<PublicUser | null>;
    updatePasswordHashById(id: string, newPasswordHash: string): Promise<boolean>;
    selectPasswordHashById(id: string): Promise<string | null>;
}
