import { Inject, Injectable } from '@nestjs/common';
import type { Prisma, User } from '@prisma/client';
import {
  PRISMA_SERVICE,
  type IPrismaService,
} from '../prisma/interfaces/prisma-service.interface';
import type { PublicUser } from './interfaces/public-user.interface';
import type {
  CreateUserData,
  IUserRepository,
  UpdateUserProfileData,
} from './interfaces/user-repository.interface';

const publicUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  createdAt: true,
  birthDate: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UserRepository implements IUserRepository {
  public constructor(
    @Inject(PRISMA_SERVICE)
    private readonly prisma: IPrismaService,
  ) {}

  public async findAll(): Promise<PublicUser[]> {
    return this.prisma.user.findMany({
      select: publicUserSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  public async findById(id: string): Promise<PublicUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });
  }

  public async findPublicByEmailNormalized(
    email: string,
  ): Promise<PublicUser | null> {
    const trimmed: string = email.trim();
    if (trimmed.length === 0) {
      return null;
    }
    return this.prisma.user.findFirst({
      where: { email: { equals: trimmed, mode: 'insensitive' } },
      select: publicUserSelect,
    });
  }

  public async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  public async create(data: CreateUserData): Promise<PublicUser> {
    const created: User = await this.prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        birthDate: data.birthDate,
      },
    });

    return UserRepository.mapToPublicUser(created);
  }

  public async deleteById(id: string): Promise<PublicUser> {
    const removed: User = await this.prisma.user.delete({
      where: { id },
    });

    return UserRepository.mapToPublicUser(removed);
  }

  public async updateProfileById(
    id: string,
    patch: UpdateUserProfileData,
  ): Promise<PublicUser | null> {
    const data: Prisma.UserUpdateInput = {};
    if (patch.firstName !== undefined) {
      data.firstName = patch.firstName;
    }
    if (patch.lastName !== undefined) {
      data.lastName = patch.lastName;
    }
    if (patch.birthDate !== undefined) {
      data.birthDate = patch.birthDate;
    }
    if (Object.keys(data).length === 0) {
      return this.findById(id);
    }

    const existing: { id: string } | null = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    if (existing === null) {
      return null;
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: publicUserSelect,
    });
  }

  public async updatePasswordHashById(
    id: string,
    newPasswordHash: string,
  ): Promise<boolean> {
    const result = await this.prisma.user.updateMany({
      where: { id },
      data: { password: newPasswordHash },
    });
    return result.count > 0;
  }

  public async selectPasswordHashById(id: string): Promise<string | null> {
    const row: { password: string } | null = await this.prisma.user.findUnique({
      where: { id },
      select: { password: true },
    });
    return row === null ? null : row.password;
  }

  private static mapToPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      birthDate: user.birthDate,
    };
  }
}
