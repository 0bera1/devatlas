import type { PublicUser } from './public-user.interface';

export const USERS_SERVICE: unique symbol = Symbol('USERS_SERVICE');

export interface IUsersService {
  getAllUsers(): Promise<PublicUser[]>;
  getUserById(id: string): Promise<PublicUser | null>;
  deleteUser(id: string): Promise<PublicUser>;
}
