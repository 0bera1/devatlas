import { Body, Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import type { DiagramRecord } from '../interfaces/diagram-record.interface';
import { ShareLinksService } from './share-links.service';

export class OpenShareLinkDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  public readonly password?: string;
}

/** Oturum gerektirmeyen paylaşım bağlantısı uçları. Parola denemeleri sınırlıdır. */
@ApiTags('Paylaşım bağlantıları (genel)')
@Controller('share')
export class PublicShareController {
  public constructor(private readonly shareLinks: ShareLinksService) {}

  @Post(':token/open')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  public async open(
    @Param('token') token: string,
    @Body() dto: OpenShareLinkDto,
  ): Promise<DiagramRecord> {
    return this.shareLinks.open(token, dto.password);
  }
}
