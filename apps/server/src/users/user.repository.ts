import { Inject, Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import {
  PRISMA_SERVICE,
  type IPrismaService,
} from '../prisma/interfaces/prisma-service.interface';
import type {
  CreateUserData,
  IUserRepository,
} from './interfaces/user-repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  public constructor(
    @Inject(PRISMA_SERVICE)
    private readonly prisma: IPrismaService,
  ) {}

  public async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  public async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  public async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  public async create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name ?? null,
      },
    });
  }

  public async deleteById(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
