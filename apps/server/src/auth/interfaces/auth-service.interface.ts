import type { PublicUser } from '../../users/interfaces/public-user.interface';

export const AUTH_SERVICE: unique symbol = Symbol('AUTH_SERVICE');

export interface AuthResult {
  accessToken: string;
  user: PublicUser;
}

export interface IAuthService {
  register(
    email: string,
    password: string,
    name: string | null | undefined,
    birthDate: Date,
  ): Promise<AuthResult>;

  login(email: string, password: string): Promise<AuthResult>;
}
