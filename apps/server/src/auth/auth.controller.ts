import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import type { PublicUser } from '../users/interfaces/public-user.interface';
import type { AuthResult } from './interfaces/auth-service.interface';
import {
  AUTH_SERVICE,
  type IAuthService,
} from './interfaces/auth-service.interface';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  public constructor(
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  public async register(@Body() dto: RegisterDto): Promise<AuthResult> {
    return this.authService.register(
      dto.email,
      dto.password,
      dto.firstName,
      dto.lastName,
      dto.birthDate,
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(@Body() dto: LoginDto): Promise<AuthResult> {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  public async refresh(@Body() dto: RefreshTokenDto): Promise<AuthResult> {
    return this.authService.refresh(dto.refreshToken);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  public getProfile(@Req() req: Request): PublicUser {
    if (req.user === undefined) {
      throw new UnauthorizedException();
    }

    return req.user;
  }
}
