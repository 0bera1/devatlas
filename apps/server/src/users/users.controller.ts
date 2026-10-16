import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  USERS_SERVICE,
  type IUsersService,
} from './interfaces/users-service.interface';
import type { PublicUser } from './interfaces/public-user.interface';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  public constructor(
    @Inject(USERS_SERVICE)
    private readonly usersService: IUsersService,
  ) {}

  @Get(':id')
  public async getUserById(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<PublicUser | null> {
    this.assertSelf(id, req);
    return this.usersService.getUserById(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  public async deleteUser(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<PublicUser> {
    this.assertSelf(id, req);
    return this.usersService.deleteUser(id);
  }

  private assertSelf(id: string, req: Request): void {
    if (req.user?.id !== id) {
      throw new ForbiddenException('Bu kaynağa erişim yetkiniz yok');
    }
  }
}
