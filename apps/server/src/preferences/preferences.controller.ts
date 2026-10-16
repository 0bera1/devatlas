import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { IsIn, IsObject, IsOptional, IsString } from 'class-validator';
import type { Request } from 'express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FONT_SCALES, LOCALES, THEME_KEYS } from './preferences.constants';
import { AVATAR_MAX_BYTES, PreferencesService, type PreferencesView } from './preferences.service';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsIn([...LOCALES])
  public readonly locale?: string;

  @IsOptional()
  @IsIn([...THEME_KEYS])
  public readonly themeKey?: string;

  @IsOptional()
  @IsIn([...FONT_SCALES])
  public readonly fontScale?: string;

  @IsOptional()
  @IsObject()
  public readonly customThemes?: Record<string, unknown>;
}

@ApiTags('Profil tercihleri')
@ApiBearerAuth()
@Controller('profile')
@UseGuards(JwtAuthGuard)
export class PreferencesController {
  public constructor(private readonly preferences: PreferencesService) {}

  @Get('preferences')
  public async get(@Req() req: Request): Promise<PreferencesView> {
    return this.preferences.get(req.user!.id);
  }

  @Patch('preferences')
  public async update(
    @Req() req: Request,
    @Body() dto: UpdatePreferencesDto,
  ): Promise<PreferencesView> {
    return this.preferences.update(req.user!.id, dto);
  }

  @Post('avatar')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: AVATAR_MAX_BYTES, files: 1 },
    }),
  )
  public async uploadAvatar(
    @Req() req: Request,
    @UploadedFile() file: { buffer: Buffer } | undefined,
  ): Promise<{ avatarUrl: string }> {
    if (file === undefined) {
      throw new BadRequestException('Dosya gönderilmedi');
    }
    return this.preferences.setAvatar(req.user!.id, file.buffer);
  }

  @Delete('avatar')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async removeAvatar(@Req() req: Request): Promise<void> {
    await this.preferences.removeAvatar(req.user!.id);
  }
}
