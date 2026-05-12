import type { Request } from 'express';
import type { PublicUser } from '../users/interfaces/public-user.interface';
import type { AuthResult } from './interfaces/auth-service.interface';
import { type IAuthService } from './interfaces/auth-service.interface';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: IAuthService);
    register(dto: RegisterDto): Promise<AuthResult>;
    login(dto: LoginDto): Promise<AuthResult>;
    refresh(dto: RefreshTokenDto): Promise<AuthResult>;
    getProfile(req: Request): PublicUser;
}
