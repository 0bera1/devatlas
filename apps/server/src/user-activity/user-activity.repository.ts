import { Inject, Injectable } from '@nestjs/common';
import {
  PRISMA_SERVICE,
  type IPrismaService,
} from '../prisma/interfaces/prisma-service.interface';
import type { UserActivityEntry } from './interfaces/user-activity-entry.interface';
import type { IUserActivityRepository } from './interfaces/user-activity-repository.interface';

@Injectable()
export class UserActivityRepository implements IUserActivityRepository {
  public constructor(
    @Inject(PRISMA_SERVICE)
    private readonly prisma: IPrismaService,
  ) {}

  public async upsertIncrementByUserAndDate(
    userId: string,
    bucketDate: Date,
  ): Promise<void> {
    await this.prisma.userActivityBucket.upsert({
      where: {
        userId_bucketDate: {
          userId,
          bucketDate,
        },
      },
      create: {
        userId,
        bucketDate,
        count: 1,
      },
      update: {
        count: { increment: 1 },
      },
    });
  }

  public async selectActivityInRange(
    userId: string,
    fromInclusive: Date,
    toInclusive: Date,
  ): Promise<UserActivityEntry[]> {
    const rows = await this.prisma.userActivityBucket.findMany({
      where: {
        userId,
        bucketDate: {
          gte: fromInclusive,
          lte: toInclusive,
        },
      },
      select: {
        bucketDate: true,
        count: true,
      },
      orderBy: { bucketDate: 'asc' },
    });

    return rows.map(
      (r: (typeof rows)[number]): UserActivityEntry => ({
        bucketDate: r.bucketDate,
        count: r.count,
      }),
    );
  }
}
