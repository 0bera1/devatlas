import type { Request } from 'express';
import type { PublicUser } from '../users/interfaces/public-user.interface';
import { type IAuthService } from './interfaces/auth-service.interface';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: IAuthService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        user: PublicUser;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: PublicUser;
    }>;
    getProfile(req: Request): PublicUser;
}
