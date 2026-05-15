import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { PublicUser } from '../users/interfaces/public-user.interface';
import type { UserActivityEntry } from '../user-activity/interfaces/user-activity-entry.interface';
import { ActivityQueryDto } from './dto/activity-query.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import type { FavoriteDiagramEntry } from './interfaces/favorite-diagram-entry.interface';
import type { FavoriteDocumentEntry } from './interfaces/favorite-document-entry.interface';
import {
  PROFILE_SERVICE,
  type IProfileService,
} from './interfaces/profile-service.interface';

const ONE_YEAR_DAYS: number = 365;

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  public constructor(
    @Inject(PROFILE_SERVICE)
    private readonly profileService: IProfileService,
  ) {}

  @Get('me')
  public async getMe(@Req() req: Request): Promise<PublicUser> {
    const user: PublicUser = ProfileController.requireUser(req);
    return this.profileService.getProfile(user.id);
  }

  @Patch('me')
  public async updateMe(
    @Req() req: Request,
    @Body() dto: UpdateProfileDto,
  ): Promise<PublicUser> {
    const user: PublicUser = ProfileController.requireUser(req);
    return this.profileService.updateProfile(user.id, {
      firstName: dto.firstName,
      lastName: dto.lastName,
      birthDate: dto.birthDate,
    });
  }

  @Post('me/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async changePassword(
    @Req() req: Request,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    const user: PublicUser = ProfileController.requireUser(req);
    await this.profileService.changePassword(user.id, {
      currentPassword: dto.currentPassword,
      newPassword: dto.newPassword,
    });
  }

  @Get('me/favorites/documents')
  public async getFavoriteDocuments(
    @Req() req: Request,
  ): Promise<FavoriteDocumentEntry[]> {
    const user: PublicUser = ProfileController.requireUser(req);
    return this.profileService.listFavoriteDocuments(user.id);
  }

  @Get('me/favorites/diagrams')
  public async getFavoriteDiagrams(
    @Req() req: Request,
  ): Promise<FavoriteDiagramEntry[]> {
    const user: PublicUser = ProfileController.requireUser(req);
    return this.profileService.listFavoriteDiagrams(user.id);
  }

  @Get('me/activity')
  public async getActivity(
    @Req() req: Request,
    @Query() query: ActivityQueryDto,
  ): Promise<UserActivityEntry[]> {
    const user: PublicUser = ProfileController.requireUser(req);
    const today: Date = new Date();
    const defaultFrom: Date = new Date(today);
    defaultFrom.setUTCDate(defaultFrom.getUTCDate() - ONE_YEAR_DAYS);

    const from: Date = query.from ?? defaultFrom;
    const to: Date = query.to ?? today;

    return this.profileService.getActivity(user.id, from, to);
  }

  private static requireUser(req: Request): PublicUser {
    if (req.user === undefined) {
      throw new UnauthorizedException();
    }
    return req.user;
  }
}
