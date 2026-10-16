import { ForbiddenException } from '@nestjs/common';
import type { Request } from 'express';
import type { PublicUser } from './interfaces/public-user.interface';
import type { IUsersService } from './interfaces/users-service.interface';
import { UsersController } from './users.controller';

const ME: PublicUser = {
  id: 'user-1',
  email: 'me@example.com',
  firstName: 'Ayşe',
  lastName: 'Demir',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  birthDate: new Date('1995-05-05T00:00:00Z'),
};

function createService(): jest.Mocked<IUsersService> {
  return {
    getUserById: jest.fn().mockResolvedValue(ME),
    deleteUser: jest.fn().mockResolvedValue(ME),
  };
}

function requestAs(user: PublicUser | undefined): Request {
  return { user } as unknown as Request;
}

describe('UsersController', () => {
  it('başka bir kullanıcının kaydını okumaya çalışınca 403 döner', async () => {
    const service = createService();
    const controller = new UsersController(service);

    await expect(
      controller.getUserById('user-2', requestAs(ME)),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(service.getUserById).not.toHaveBeenCalled();
  });

  it('kendi kaydını okuyabilir', async () => {
    const service = createService();
    const controller = new UsersController(service);

    await expect(controller.getUserById(ME.id, requestAs(ME))).resolves.toEqual(
      ME,
    );
  });

  it('başka bir kullanıcının hesabını silemez', async () => {
    const service = createService();
    const controller = new UsersController(service);

    await expect(
      controller.deleteUser('user-2', requestAs(ME)),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(service.deleteUser).not.toHaveBeenCalled();
  });

  it('kimliği olmayan istek reddedilir', async () => {
    const service = createService();
    const controller = new UsersController(service);

    await expect(
      controller.getUserById(ME.id, requestAs(undefined)),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
