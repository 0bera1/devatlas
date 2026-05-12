import { Module, Provider, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AUTH_SERVICE } from './interfaces/auth-service.interface';
import { REFRESH_TOKEN_REPOSITORY } from './interfaces/refresh-token-repository.interface';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenRepository } from './refresh-token.repository';

const authServiceProvider: Provider = {
  provide: AUTH_SERVICE,
  useClass: AuthService,
};

const refreshTokenRepositoryProvider: Provider = {
  provide: REFRESH_TOKEN_REPOSITORY,
  useClass: RefreshTokenRepository,
};

@Module({
  imports: [
    forwardRef(() => UsersModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    authServiceProvider,
    refreshTokenRepositoryProvider,
    JwtStrategy,
  ],
  exports: [AUTH_SERVICE, JwtModule, PassportModule, JwtStrategy],
})
export class AuthModule {}
