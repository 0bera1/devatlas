import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { PublicUser } from '../users/interfaces/public-user.interface';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../users/interfaces/user-repository.interface';
import type { UserActivityEntry } from '../user-activity/interfaces/user-activity-entry.interface';
import {
  USER_ACTIVITY_SERVICE,
  type IUserActivityService,
} from '../user-activity/interfaces/user-activity-service.interface';
import type { FavoriteDiagramEntry } from './interfaces/favorite-diagram-entry.interface';
import type { FavoriteDocumentEntry } from './interfaces/favorite-document-entry.interface';
import {
  PROFILE_REPOSITORY,
  type IProfileRepository,
} from './interfaces/profile-repository.interface';
import type {
  ChangePasswordCommand,
  IProfileService,
  UpdateProfileCommand,
} from './interfaces/profile-service.interface';

const BCRYPT_SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;

@Injectable()
export class ProfileService implements IProfileService {
  public constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PROFILE_REPOSITORY)
    private readonly profileRepository: IProfileRepository,
    @Inject(USER_ACTIVITY_SERVICE)
    private readonly userActivityService: IUserActivityService,
  ) {}

  public async getProfile(userId: string): Promise<PublicUser> {
    const user: PublicUser | null = await this.userRepository.findById(userId);
    if (user === null) {
      throw new NotFoundException(`User with id "${userId}" not found`);
    }
    return user;
  }

  public async updateProfile(
    userId: string,
    command: UpdateProfileCommand,
  ): Promise<PublicUser> {
    const hasFirst: boolean = command.firstName !== undefined;
    const hasLast: boolean = command.lastName !== undefined;
    const hasBirth: boolean = command.birthDate !== undefined;

    if (!hasFirst && !hasLast && !hasBirth) {
      throw new BadRequestException(
        'Provide at least one field: firstName, lastName, or birthDate.',
      );
    }

    if (hasFirst !== hasLast) {
      throw new BadRequestException(
        'firstName and lastName must be provided together.',
      );
    }

    if (hasFirst && hasLast) {
      const fn: string = command.firstName as string;
      const ln: string = command.lastName as string;
      if (fn.trim().length === 0 || ln.trim().length === 0) {
        throw new BadRequestException(
          'firstName and lastName must not be empty or whitespace-only.',
        );
      }
    }

    const updated: PublicUser | null = await this.userRepository.updateProfileById(
      userId,
      {
        firstName: command.firstName,
        lastName: command.lastName,
        birthDate: command.birthDate,
      },
    );

    if (updated === null) {
      throw new NotFoundException(`User with id "${userId}" not found`);
    }

    return updated;
  }

  public async changePassword(
    userId: string,
    command: ChangePasswordCommand,
  ): Promise<void> {
    if (command.newPassword.length < MIN_PASSWORD_LENGTH) {
      throw new BadRequestException(
        `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      );
    }
    if (command.newPassword === command.currentPassword) {
      throw new BadRequestException(
        'New password must be different from the current password.',
      );
    }

    const currentHash: string | null =
      await this.userRepository.selectPasswordHashById(userId);
    if (currentHash === null) {
      throw new NotFoundException(`User with id "${userId}" not found`);
    }

    const matches: boolean = await bcrypt.compare(
      command.currentPassword,
      currentHash,
    );
    if (!matches) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    const newHash: string = await bcrypt.hash(
      command.newPassword,
      BCRYPT_SALT_ROUNDS,
    );
    const updated: boolean = await this.userRepository.updatePasswordHashById(
      userId,
      newHash,
    );
    if (!updated) {
      throw new NotFoundException(`User with id "${userId}" not found`);
    }
  }

  public async listFavoriteDocuments(
    userId: string,
  ): Promise<FavoriteDocumentEntry[]> {
    return this.profileRepository.selectFavoriteDocumentsByUserId(userId);
  }

  public async listFavoriteDiagrams(
    userId: string,
  ): Promise<FavoriteDiagramEntry[]> {
    return this.profileRepository.selectFavoriteDiagramsByUserId(userId);
  }

  public async getActivity(
    userId: string,
    fromInclusive: Date,
    toInclusive: Date,
  ): Promise<UserActivityEntry[]> {
    return this.userActivityService.getActivityInRange(
      userId,
      fromInclusive,
      toInclusive,
    );
  }
}
