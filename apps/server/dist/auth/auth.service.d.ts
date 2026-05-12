import { JwtService } from '@nestjs/jwt';
import { type IUserRepository } from '../users/interfaces/user-repository.interface';
import type { AuthResult, IAuthService } from './interfaces/auth-service.interface';
export declare class AuthService implements IAuthService {
    private readonly userRepository;
    private readonly jwtService;
    constructor(userRepository: IUserRepository, jwtService: JwtService);
    register(email: string, password: string, name: string | null | undefined, birthDate: Date): Promise<AuthResult>;
    login(email: string, password: string): Promise<AuthResult>;
    private signAccessToken;
}
