import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import type { User } from '@prisma/client';
import type { StringValue } from 'ms';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../users/interfaces/user-repository.interface';
import type { PublicUser } from '../users/interfaces/public-user.interface';
import {
  REFRESH_TOKEN_REPOSITORY,
  type IRefreshTokenRepository,
} from './interfaces/refresh-token-repository.interface';
import type {
  AuthResult,
  IAuthService,
} from './interfaces/auth-service.interface';
import type { JwtPayload } from './interfaces/jwt-payload.interface';

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class AuthService implements IAuthService {
  public constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async register(
    email: string,
    password: string,
    name: string | null | undefined,
    birthDate: Date,
  ): Promise<AuthResult> {
    const existing: User | null =
      await this.userRepository.findByEmailWithPassword(email);

    if (existing !== null) {
      throw new ConflictException(`User with email "${email}" already exists`);
    }

    const hashedPassword: string = await bcrypt.hash(
      password,
      BCRYPT_SALT_ROUNDS,
    );

    const user: PublicUser = await this.userRepository.create({
      email,
      name: name ?? null,
      password: hashedPassword,
      birthDate,
    });

    return await this.issueSession(user);
  }

  public async login(email: string, password: string): Promise<AuthResult> {
    const stored: User | null =
      await this.userRepository.findByEmailWithPassword(email);

    if (stored === null) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const match: boolean = await bcrypt.compare(password, stored.password);

    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user: PublicUser = {
      id: stored.id,
      email: stored.email,
      name: stored.name,
      createdAt: stored.createdAt,
      birthDate: stored.birthDate,
    };

    return await this.issueSession(user);
  }

  public async refresh(plainRefreshToken: string): Promise<AuthResult> {
    const tokenHash: string = this.hashRefreshToken(plainRefreshToken);
    const record = await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (record === null) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (record.expiresAt.getTime() <= Date.now()) {
      await this.refreshTokenRepository.deleteById(record.id);
      throw new UnauthorizedException('Refresh token expired');
    }

    const user: PublicUser | null = await this.userRepository.findById(
      record.userId,
    );

    if (user === null) {
      await this.refreshTokenRepository.deleteById(record.id);
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newPlain: string = this.generateOpaqueRefreshToken();
    const newHash: string = this.hashRefreshToken(newPlain);
    const newExpires: Date = this.computeRefreshExpiry();

    await this.refreshTokenRepository.replaceToken(record.id, {
      userId: user.id,
      tokenHash: newHash,
      expiresAt: newExpires,
    });

    return {
      accessToken: this.signAccessToken(user),
      refreshToken: newPlain,
      user,
    };
  }

  private async issueSession(user: PublicUser): Promise<AuthResult> {
    const plainRefresh: string = this.generateOpaqueRefreshToken();
    const tokenHash: string = this.hashRefreshToken(plainRefresh);
    const expiresAt: Date = this.computeRefreshExpiry();

    await this.refreshTokenRepository.insertToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    return {
      accessToken: this.signAccessToken(user),
      refreshToken: plainRefresh,
      user,
    };
  }

  private signAccessToken(user: PublicUser): string {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    const expiresIn = (this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ??
      '10m') as StringValue;
    return this.jwtService.sign(payload, { expiresIn });
  }

  private generateOpaqueRefreshToken(): string {
    return randomBytes(48).toString('base64url');
  }

  private hashRefreshToken(plain: string): string {
    return createHash('sha256').update(plain, 'utf8').digest('hex');
  }

  private computeRefreshExpiry(): Date {
    const raw: string =
      this.configService.get<string>('REFRESH_TOKEN_EXPIRES_DAYS') ?? '7';
    const parsed: number = Number.parseInt(raw, 10);
    const days: number =
      Number.isFinite(parsed) && parsed > 0 ? parsed : 7;
    const expiry: Date = new Date();
    expiry.setUTCDate(expiry.getUTCDate() + days);
    return expiry;
  }
}
