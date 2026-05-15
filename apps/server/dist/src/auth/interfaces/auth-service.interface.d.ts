import type { PublicUser } from '../../users/interfaces/public-user.interface';
export declare const AUTH_SERVICE: unique symbol;
export interface AuthResult {
    accessToken: string;
    refreshToken: string;
    user: PublicUser;
}
export interface IAuthService {
    register(email: string, password: string, name: string | null | undefined, birthDate: Date): Promise<AuthResult>;
    login(email: string, password: string): Promise<AuthResult>;
    refresh(refreshToken: string): Promise<AuthResult>;
    tryGetSubjectFromAccessToken(accessToken: string | undefined): Promise<string | null>;
}
