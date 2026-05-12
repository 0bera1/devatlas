import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { User } from '@prisma/client';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../users/interfaces/user-repository.interface';
import type { PublicUser } from '../users/interfaces/public-user.interface';
import type {
  AuthResult,
  IAuthService,
} from './interfaces/auth-service.interface';
import type { JwtPayload } from './interfaces/jwt-payload.interface';


@Injectable()
export class AuthService implements IAuthService {
  public constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) { }

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
      10,
    );

    const user: PublicUser = await this.userRepository.create({
      email,
      name: name ?? null,
      password: hashedPassword,
      birthDate,
    });

    return {
      accessToken: this.signAccessToken(user),
      user,
    };
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

    return {
      accessToken: this.signAccessToken(user),
      user,
    };
  }

  private signAccessToken(user: PublicUser): string {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }
}
