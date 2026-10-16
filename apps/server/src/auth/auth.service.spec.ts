import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import type { IUserRepository } from '../users/interfaces/user-repository.interface';
import type { IMailService } from '../mail/mail.interfaces';
import type { IRefreshTokenRepository } from './interfaces/refresh-token-repository.interface';
import type { IAuthTokenRepository } from './interfaces/auth-token-repository.interface';
import { AuthService } from './auth.service';

const sha256 = (value: string): string =>
  createHash('sha256').update(value, 'utf8').digest('hex');

const USER = {
  id: 'user-1',
  email: 'ayse@example.com',
  firstName: 'Ayşe',
  lastName: 'Demir',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  birthDate: new Date('1995-05-05T00:00:00Z'),
};

interface Mocks {
  users: jest.Mocked<Pick<IUserRepository, 'findById' | 'findByEmailWithPassword' | 'create' | 'markEmailVerified' | 'updatePasswordHashById'>>;
  refresh: jest.Mocked<IRefreshTokenRepository>;
  authTokens: jest.Mocked<IAuthTokenRepository>;
  mail: jest.Mocked<IMailService>;
}

function createMocks(): Mocks {
  return {
    users: {
      findById: jest.fn().mockResolvedValue(USER),
      findByEmailWithPassword: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(USER),
      markEmailVerified: jest.fn().mockResolvedValue(undefined),
      updatePasswordHashById: jest.fn().mockResolvedValue(true),
    },
    refresh: {
      insertToken: jest.fn().mockResolvedValue({ id: 'rt-new' }),
      findByTokenHash: jest.fn().mockResolvedValue(null),
      deleteById: jest.fn().mockResolvedValue(undefined),
      rotateToken: jest.fn().mockResolvedValue({ id: 'rt-next' }),
      deleteByFamilyId: jest.fn().mockResolvedValue(2),
      deleteByUserId: jest.fn().mockResolvedValue(3),
    },
    authTokens: {
      deleteUnusedByUser: jest.fn().mockResolvedValue(undefined),
      insertToken: jest.fn().mockResolvedValue(undefined),
      findByTokenHash: jest.fn().mockResolvedValue(null),
      markUsed: jest.fn().mockResolvedValue(undefined),
    },
    mail: {
      send: jest.fn().mockResolvedValue(undefined),
    },
  };
}

function createService(mocks: Mocks): AuthService {
  const jwt = {
    sign: jest.fn().mockReturnValue('access-token'),
    verifyAsync: jest.fn(),
  } as unknown as JwtService;
  const config = {
    get: jest.fn((key: string) => {
      if (key === 'APP_URL') return 'http://localhost:3000/';
      if (key === 'REFRESH_TOKEN_EXPIRES_DAYS') return '7';
      if (key === 'JWT_ACCESS_EXPIRES_IN') return '10m';
      return undefined;
    }),
  } as unknown as ConfigService;

  return new AuthService(
    mocks.users as unknown as IUserRepository,
    mocks.refresh,
    mocks.authTokens,
    mocks.mail,
    jwt,
    config,
  );
}

describe('AuthService: refresh token rotasyonu', () => {
  it('geçerli token döndürülür, aynı oturum ailesinde yeni token üretilir', async () => {
    const mocks = createMocks();
    mocks.refresh.findByTokenHash.mockResolvedValue({
      id: 'rt-1',
      userId: USER.id,
      familyId: 'family-1',
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
    });
    const service = createService(mocks);

    const result = await service.refresh('plain-token');

    expect(mocks.refresh.rotateToken).toHaveBeenCalledWith(
      'rt-1',
      expect.objectContaining({ userId: USER.id, familyId: 'family-1' }),
    );
    expect(result.refreshToken).not.toBe('plain-token');
    expect(result.accessToken).toBe('access-token');
  });

  it('iptal edilmiş token tekrar gelirse oturum ailesi kapatılır ve 401 döner', async () => {
    const mocks = createMocks();
    mocks.refresh.findByTokenHash.mockResolvedValue({
      id: 'rt-old',
      userId: USER.id,
      familyId: 'family-1',
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: new Date(),
    });
    const service = createService(mocks);

    await expect(service.refresh('stolen-token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(mocks.refresh.deleteByFamilyId).toHaveBeenCalledWith('family-1');
    expect(mocks.refresh.rotateToken).not.toHaveBeenCalled();
  });
});

describe('AuthService: e-posta doğrulama', () => {
  it('kayıtta doğrulama e-postası gönderilir', async () => {
    const mocks = createMocks();
    mocks.users.findByEmailWithPassword.mockResolvedValue(null);
    mocks.users.create.mockResolvedValue(USER);
    const service = createService(mocks);

    await service.register(USER.email, 'Passw0rd!', 'Ayşe', 'Demir', USER.birthDate);

    expect(mocks.mail.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: USER.email,
        text: expect.stringContaining('http://localhost:3000/dogrula?token='),
      }),
    );
  });

  it('geçerli token e-postayı doğrular ve token tek kullanımlık olur', async () => {
    const mocks = createMocks();
    const service = createService(mocks);
    mocks.authTokens.findByTokenHash.mockResolvedValue({
      id: 'at-1',
      userId: USER.id,
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
    });

    await service.verifyEmail('a'.repeat(40));

    expect(mocks.authTokens.findByTokenHash).toHaveBeenCalledWith(
      sha256('a'.repeat(40)),
      'EMAIL_VERIFICATION',
    );
    expect(mocks.authTokens.markUsed).toHaveBeenCalledWith('at-1', expect.any(Date));
    expect(mocks.users.markEmailVerified).toHaveBeenCalledWith(USER.id, expect.any(Date));
  });

  it('kullanılmış token reddedilir', async () => {
    const mocks = createMocks();
    const service = createService(mocks);
    mocks.authTokens.findByTokenHash.mockResolvedValue({
      id: 'at-1',
      userId: USER.id,
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: new Date(),
    });

    await expect(service.verifyEmail('b'.repeat(40))).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(mocks.users.markEmailVerified).not.toHaveBeenCalled();
  });
});

describe('AuthService: şifre sıfırlama', () => {
  it('kayıtlı olmayan e-posta için sessizce döner, e-posta göndermez', async () => {
    const mocks = createMocks();
    const service = createService(mocks);

    await expect(service.forgotPassword('yok@example.com')).resolves.toBeUndefined();
    expect(mocks.mail.send).not.toHaveBeenCalled();
    expect(mocks.authTokens.insertToken).not.toHaveBeenCalled();
  });

  it('kayıtlı e-posta için bağlantı gönderilir ve yalnızca hash saklanır', async () => {
    const mocks = createMocks();
    mocks.users.findByEmailWithPassword.mockResolvedValue({
      ...USER,
      password: 'hash',
      emailVerifiedAt: null,
    } as never);
    const service = createService(mocks);

    await service.forgotPassword(USER.email);

    const insert = mocks.authTokens.insertToken.mock.calls[0][0];
    expect(insert.purpose).toBe('PASSWORD_RESET');
    expect(insert.tokenHash).toHaveLength(64);

    const sent = mocks.mail.send.mock.calls[0][0];
    const plain = new URL(sent.text.match(/http\S+/)?.[0] ?? '').searchParams.get('token');
    expect(plain).not.toBeNull();
    expect(sha256(plain as string)).toBe(insert.tokenHash);
  });

  it('geçerli token ile şifre değişir ve tüm oturumlar kapanır', async () => {
    const mocks = createMocks();
    const service = createService(mocks);
    mocks.authTokens.findByTokenHash.mockResolvedValue({
      id: 'at-2',
      userId: USER.id,
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
    });

    await service.resetPassword('c'.repeat(40), 'YeniSifre123');

    const hashArg = mocks.users.updatePasswordHashById.mock.calls[0][1];
    expect(await bcrypt.compare('YeniSifre123', hashArg)).toBe(true);
    expect(mocks.authTokens.markUsed).toHaveBeenCalledWith('at-2', expect.any(Date));
    expect(mocks.refresh.deleteByUserId).toHaveBeenCalledWith(USER.id);
  });

  it('süresi dolmuş token ile şifre değiştirilemez', async () => {
    const mocks = createMocks();
    const service = createService(mocks);
    mocks.authTokens.findByTokenHash.mockResolvedValue({
      id: 'at-3',
      userId: USER.id,
      expiresAt: new Date(Date.now() - 1_000),
      usedAt: null,
    });

    await expect(service.resetPassword('d'.repeat(40), 'YeniSifre123')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(mocks.users.updatePasswordHashById).not.toHaveBeenCalled();
  });
});
