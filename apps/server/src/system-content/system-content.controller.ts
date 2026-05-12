import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { SystemContentRecord } from './interfaces/system-content-record.interface';
import {
  SYSTEM_CONTENT_SERVICE,
  type ISystemContentService,
} from './interfaces/system-content-service.interface';

/** Kullanıcıya bağlı olmayan platform bilgisi (diyagram, mülakat notu, doküman vb.). */
@Controller('system-content')
@UseGuards(JwtAuthGuard)
export class SystemContentController {
  public constructor(
    @Inject(SYSTEM_CONTENT_SERVICE)
    private readonly systemContentService: ISystemContentService,
  ) {}

  @Get()
  @Public()
  public async list(): Promise<SystemContentRecord[]> {
    return this.systemContentService.listSystemContent();
  }
}
