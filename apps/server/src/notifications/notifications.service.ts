import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PRISMA_SERVICE, type IPrismaService } from '../prisma/interfaces/prisma-service.interface';
import type { NotificationType } from '@prisma/client';
import type { Prisma } from '@prisma/client';

export const NOTIFICATIONS_SERVICE: unique symbol = Symbol('NOTIFICATIONS_SERVICE');

export interface NotificationView {
  id: string;
  type: NotificationType;
  payload: Prisma.JsonValue;
  readAt: Date | null;
  createdAt: Date;
}

export interface INotificationsService {
  notify(userId: string, type: NotificationType, payload: Prisma.InputJsonObject): Promise<void>;
  list(userId: string, onlyUnread: boolean): Promise<NotificationView[]>;
  unreadCount(userId: string): Promise<number>;
  markRead(userId: string, id: string): Promise<void>;
  markAllRead(userId: string): Promise<void>;
}

const LIST_LIMIT = 50;

@Injectable()
export class NotificationsService implements INotificationsService {
  public constructor(
    @Inject(PRISMA_SERVICE)
    private readonly prisma: IPrismaService,
  ) {}

  public async notify(
    userId: string,
    type: NotificationType,
    payload: Prisma.InputJsonObject,
  ): Promise<void> {
    await this.prisma.notification.create({
      data: { userId, type, payload },
    });
  }

  public async list(userId: string, onlyUnread: boolean): Promise<NotificationView[]> {
    return this.prisma.notification.findMany({
      where: { userId, ...(onlyUnread ? { readAt: null } : {}) },
      orderBy: { createdAt: 'desc' },
      take: LIST_LIMIT,
      select: { id: true, type: true, payload: true, readAt: true, createdAt: true },
    });
  }

  public async unreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({ where: { userId, readAt: null } });
  }

  public async markRead(userId: string, id: string): Promise<void> {
    const result = await this.prisma.notification.updateMany({
      where: { id, userId, readAt: null },
      data: { readAt: new Date() },
    });
    if (result.count === 0) {
      const exists = await this.prisma.notification.findFirst({ where: { id, userId }, select: { id: true } });
      if (exists === null) {
        throw new NotFoundException('Bildirim bulunamadı');
      }
    }
  }

  public async markAllRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }
}
