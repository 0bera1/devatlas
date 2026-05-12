import type { User } from '@prisma/client';

export const USER_REPOSITORY: unique symbol = Symbol('USER_REPOSITORY');

export interface CreateUserData {
  email: string;
  name?: string | null;
}

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  deleteById(id: string): Promise<User>;
}
