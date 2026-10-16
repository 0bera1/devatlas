import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ShareLinksService, type CreatedShareLink, type ShareLinkView } from './share-links.service';

export class CreateShareLinkDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30)
  public readonly expiresInDays!: number;

  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(64)
  public readonly password?: string;
}

@ApiTags('Diyagram paylaşım bağlantıları')
@ApiBearerAuth()
@Controller('diagrams/:diagramId/share-links')
@UseGuards(JwtAuthGuard)
export class ShareLinksController {
  public constructor(private readonly shareLinks: ShareLinksService) {}

  @Post()
  @ApiBody({ type: CreateShareLinkDto })
  public async create(
    @Req() req: Request,
    @Param('diagramId') diagramId: string,
    @Body() dto: CreateShareLinkDto,
  ): Promise<CreatedShareLink> {
    return this.shareLinks.create(req.user!.id, diagramId, dto.expiresInDays, dto.password);
  }

  @Get()
  public async list(
    @Req() req: Request,
    @Param('diagramId') diagramId: string,
  ): Promise<ShareLinkView[]> {
    return this.shareLinks.list(req.user!.id, diagramId);
  }

  @Delete(':linkId')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async revoke(
    @Req() req: Request,
    @Param('diagramId') diagramId: string,
    @Param('linkId') linkId: string,
  ): Promise<void> {
    await this.shareLinks.revoke(req.user!.id, diagramId, linkId);
  }
}
