import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../../users/interfaces/user-repository.interface';
import type { PublicUser } from '../../users/interfaces/public-user.interface';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  public constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  public async validate(payload: JwtPayload): Promise<PublicUser> {
    const user: PublicUser | null = await this.userRepository.findById(
      payload.sub,
    );

    if (user === null || user.email !== payload.email) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
