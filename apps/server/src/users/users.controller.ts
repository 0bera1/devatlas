import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  UseGuards,
} from '@nestjs/common';
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

  @Get()
  public async getUsers(): Promise<PublicUser[]> {
    return this.usersService.getAllUsers();
  }

  @Get(':id')
  public async getUserById(@Param('id') id: string): Promise<PublicUser | null> {
    return this.usersService.getUserById(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  public async deleteUser(@Param('id') id: string): Promise<PublicUser> {
    return this.usersService.deleteUser(id);
  }
}
