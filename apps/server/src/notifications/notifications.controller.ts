import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  NOTIFICATIONS_SERVICE,
  type INotificationsService,
  type NotificationView,
} from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  public constructor(
    @Inject(NOTIFICATIONS_SERVICE)
    private readonly notificationsService: INotificationsService,
  ) {}

  @Get()
  public async list(
    @Req() req: Request,
    @Query('unread') unread?: string,
  ): Promise<NotificationView[]> {
    return this.notificationsService.list(req.user!.id, unread === 'true');
  }

  @Get('unread-count')
  public async unreadCount(@Req() req: Request): Promise<{ count: number }> {
    return { count: await this.notificationsService.unreadCount(req.user!.id) };
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async markRead(@Req() req: Request, @Param('id') id: string): Promise<void> {
    await this.notificationsService.markRead(req.user!.id, id);
  }

  @Post('read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async markAllRead(@Req() req: Request): Promise<void> {
    await this.notificationsService.markAllRead(req.user!.id);
  }
}
