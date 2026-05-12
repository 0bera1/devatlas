import { Inject, Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import {
  PRISMA_SERVICE,
  type IPrismaService,
} from '../prisma/interfaces/prisma-service.interface';
import type { SystemContentRecord } from './interfaces/system-content-record.interface';
import type { ISystemContentRepository } from './interfaces/system-content-repository.interface';

const systemContentSelect = {
  id: true,
  type: true,
  title: true,
  content: true,
  createdAt: true,
} satisfies Prisma.SystemContentSelect;

@Injectable()
export class SystemContentRepository implements ISystemContentRepository {
  public constructor(
    @Inject(PRISMA_SERVICE)
    private readonly prisma: IPrismaService,
  ) {}

  public async selectAllByCreatedAtDesc(): Promise<SystemContentRecord[]> {
    return this.prisma.systemContent.findMany({
      select: systemContentSelect,
      orderBy: { createdAt: 'desc' },
    });
  }
}
