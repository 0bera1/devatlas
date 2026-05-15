import type { PublicUser } from './public-user.interface';
export declare const USERS_SERVICE: unique symbol;
export interface IUsersService {
    getAllUsers(): Promise<PublicUser[]>;
    getUserById(id: string): Promise<PublicUser | null>;
    deleteUser(id: string): Promise<PublicUser>;
}
