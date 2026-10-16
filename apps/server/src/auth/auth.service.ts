import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes, randomUUID } from 'crypto';
import type { User } from '@prisma/client';
import type { StringValue } from 'ms';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../users/interfaces/user-repository.interface';
import type { PublicUser } from '../users/interfaces/public-user.interface';
import { MAIL_SERVICE, type IMailService } from '../mail/mail.interfaces';
import {
  buildPasswordResetMail,
  buildVerificationMail,
} from '../mail/mail-templates';
import {
  REFRESH_TOKEN_REPOSITORY,
  type IRefreshTokenRepository,
} from './interfaces/refresh-token-repository.interface';
import {
  AUTH_TOKEN_REPOSITORY,
  type AuthTokenPurposeValue,
  type IAuthTokenRepository,
} from './interfaces/auth-token-repository.interface';
import type {
  AuthResult,
  IAuthService,
} from './interfaces/auth-service.interface';
import type { JwtPayload } from './interfaces/jwt-payload.interface';

const BCRYPT_SALT_ROUNDS = 10;
const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;
const DEFAULT_APP_URL = 'http://localhost:3000';

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger: Logger = new Logger(AuthService.name);

  public constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject(AUTH_TOKEN_REPOSITORY)
    private readonly authTokenRepository: IAuthTokenRepository,
    @Inject(MAIL_SERVICE)
    private readonly mailService: IMailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
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
      firstName,
      lastName,
      password: hashedPassword,
      birthDate,
    });

    await this.sendVerificationEmail(user);

    return await this.issueSession(user, randomUUID());
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
      firstName: stored.firstName,
      lastName: stored.lastName,
      createdAt: stored.createdAt,
      birthDate: stored.birthDate,
    };

    return await this.issueSession(user, randomUUID());
  }

  /**
   * Refresh token'ı döndürür. Kullanılmış (iptal edilmiş) bir token tekrar
   * gelirse, token çalınmış olabilir: aynı oturum ailesinin tamamı kapatılır.
   */
  public async refresh(plainRefreshToken: string): Promise<AuthResult> {
    const tokenHash: string = this.hashToken(plainRefreshToken);
    const record = await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (record === null) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (record.revokedAt !== null) {
      if (record.familyId !== null) {
        const revoked: number = await this.refreshTokenRepository.deleteByFamilyId(
          record.familyId,
        );
        this.logger.warn(
          `Refresh token yeniden kullanıldı (kullanıcı ${record.userId}); oturum ailesi kapatıldı (${revoked} token).`,
        );
      }
      throw new UnauthorizedException('Oturum geçersiz, lütfen yeniden giriş yapın');
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

    const newPlain: string = this.generateOpaqueToken();
    const newHash: string = this.hashToken(newPlain);
    const newExpires: Date = this.computeRefreshExpiry();

    await this.refreshTokenRepository.rotateToken(record.id, {
      userId: user.id,
      familyId: record.familyId ?? randomUUID(),
      tokenHash: newHash,
      expiresAt: newExpires,
    });

    return {
      accessToken: this.signAccessToken(user),
      refreshToken: newPlain,
      user,
    };
  }

  public async verifyEmail(token: string): Promise<void> {
    const record = await this.findUsableAuthToken(token, 'EMAIL_VERIFICATION');
    await this.authTokenRepository.markUsed(record.id, new Date());
    await this.userRepository.markEmailVerified(record.userId, new Date());
  }

  public async resendVerification(email: string): Promise<void> {
    const stored: User | null =
      await this.userRepository.findByEmailWithPassword(email.trim());

    if (stored === null || stored.emailVerifiedAt !== null) {
      return;
    }

    await this.sendVerificationEmail({
      id: stored.id,
      email: stored.email,
      firstName: stored.firstName,
      lastName: stored.lastName,
      createdAt: stored.createdAt,
      birthDate: stored.birthDate,
    });
  }

  public async forgotPassword(email: string): Promise<void> {
    const stored: User | null =
      await this.userRepository.findByEmailWithPassword(email.trim());

    if (stored === null) {
      return;
    }

    await this.authTokenRepository.deleteUnusedByUser(
      stored.id,
      'PASSWORD_RESET',
    );

    const plain: string = this.generateOpaqueToken();
    await this.authTokenRepository.insertToken({
      userId: stored.id,
      purpose: 'PASSWORD_RESET',
      tokenHash: this.hashToken(plain),
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
    });

    const mail = buildPasswordResetMail(this.appBaseUrl(), plain);
    await this.mailService.send({ to: stored.email, ...mail });
  }

  public async resetPassword(token: string, newPassword: string): Promise<void> {
    const record = await this.findUsableAuthToken(token, 'PASSWORD_RESET');
    const hashed: string = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

    await this.userRepository.updatePasswordHashById(record.userId, hashed);
    await this.authTokenRepository.markUsed(record.id, new Date());
    await this.refreshTokenRepository.deleteByUserId(record.userId);
  }

  public async tryGetSubjectFromAccessToken(
    accessToken: string | undefined,
  ): Promise<string | null> {
    if (accessToken === undefined || accessToken.trim().length === 0) {
      return null;
    }
    try {
      const payload: JwtPayload = await this.jwtService.verifyAsync<JwtPayload>(
        accessToken.trim(),
      );
      const user: PublicUser | null = await this.userRepository.findById(
        payload.sub,
      );
      if (user === null || user.email !== payload.email) {
        return null;
      }
      return user.id;
    } catch {
      return null;
    }
  }

  private async findUsableAuthToken(
    plain: string,
    purpose: AuthTokenPurposeValue,
  ): Promise<{ id: string; userId: string }> {
    const record = await this.authTokenRepository.findByTokenHash(
      this.hashToken(plain),
      purpose,
    );

    if (
      record === null ||
      record.usedAt !== null ||
      record.expiresAt.getTime() <= Date.now()
    ) {
      throw new BadRequestException(
        'Bağlantı geçersiz veya süresi dolmuş. Lütfen yeni bir bağlantı isteyin.',
      );
    }

    return { id: record.id, userId: record.userId };
  }

  private async sendVerificationEmail(user: PublicUser): Promise<void> {
    await this.authTokenRepository.deleteUnusedByUser(
      user.id,
      'EMAIL_VERIFICATION',
    );

    const plain: string = this.generateOpaqueToken();
    await this.authTokenRepository.insertToken({
      userId: user.id,
      purpose: 'EMAIL_VERIFICATION',
      tokenHash: this.hashToken(plain),
      expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
    });

    const mail = buildVerificationMail(this.appBaseUrl(), plain);
    await this.mailService.send({ to: user.email, ...mail });
  }

  private async issueSession(user: PublicUser, familyId: string): Promise<AuthResult> {
    const plainRefresh: string = this.generateOpaqueToken();
    const tokenHash: string = this.hashToken(plainRefresh);
    const expiresAt: Date = this.computeRefreshExpiry();

    await this.refreshTokenRepository.insertToken({
      userId: user.id,
      familyId,
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
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    const expiresIn = (this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ??
      '10m') as StringValue;
    return this.jwtService.sign(payload, { expiresIn });
  }

  private generateOpaqueToken(): string {
    return randomBytes(48).toString('base64url');
  }

  private hashToken(plain: string): string {
    return createHash('sha256').update(plain, 'utf8').digest('hex');
  }

  private appBaseUrl(): string {
    const raw: string =
      this.configService.get<string>('APP_URL') ?? DEFAULT_APP_URL;
    return raw.trim().replace(/\/+$/, '');
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
