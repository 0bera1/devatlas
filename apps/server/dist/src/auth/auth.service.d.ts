import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { type IUserRepository } from '../users/interfaces/user-repository.interface';
import { type IRefreshTokenRepository } from './interfaces/refresh-token-repository.interface';
import type { AuthResult, IAuthService } from './interfaces/auth-service.interface';
export declare class AuthService implements IAuthService {
    private readonly userRepository;
    private readonly refreshTokenRepository;
    private readonly jwtService;
    private readonly configService;
    constructor(userRepository: IUserRepository, refreshTokenRepository: IRefreshTokenRepository, jwtService: JwtService, configService: ConfigService);
    register(email: string, password: string, name: string | null | undefined, birthDate: Date): Promise<AuthResult>;
    login(email: string, password: string): Promise<AuthResult>;
    refresh(plainRefreshToken: string): Promise<AuthResult>;
    tryGetSubjectFromAccessToken(accessToken: string | undefined): Promise<string | null>;
    private issueSession;
    private signAccessToken;
    private generateOpaqueRefreshToken;
    private hashRefreshToken;
    private computeRefreshExpiry;
}
