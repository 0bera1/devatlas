import type { User } from '@prisma/client';
import type { CreateUserData } from './user-repository.interface';

export const USERS_SERVICE: unique symbol = Symbol('USERS_SERVICE');

export interface IUsersService {
  getAllUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | null>;
  createUser(data: CreateUserData): Promise<User>;
  deleteUser(id: string): Promise<User>;
}
