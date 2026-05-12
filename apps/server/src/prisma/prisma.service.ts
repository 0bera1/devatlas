import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { IPrismaService } from './interfaces/prisma-service.interface';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements IPrismaService, OnModuleInit, OnModuleDestroy
{
  private readonly logger: Logger = new Logger(PrismaService.name);

  public async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Prisma connected to database');
  }

  public async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Prisma disconnected from database');
  }
}
