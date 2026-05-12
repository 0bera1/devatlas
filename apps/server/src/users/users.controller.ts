import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import {
  USERS_SERVICE,
  type IUsersService,
} from './interfaces/users-service.interface';

@Controller('users')
export class UsersController {
  public constructor(
    @Inject(USERS_SERVICE)
    private readonly usersService: IUsersService,
  ) {}

  @Get()
  public async getUsers(): Promise<User[]> {
    return this.usersService.getAllUsers();
  }

  @Get(':id')
  public async getUserById(@Param('id') id: string): Promise<User | null> {
    return this.usersService.getUserById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async createUser(@Body() dto: CreateUserDto): Promise<User> {
    return this.usersService.createUser({
      email: dto.email,
      name: dto.name ?? null,
    });
  }

  @Delete(':id')
  public async deleteUser(@Param('id') id: string): Promise<User> {
    return this.usersService.deleteUser(id);
  }
}
