import { Inject, Injectable, Logger } from '@nestjs/common';
import { startOfUtcDay } from '../documents/utils/utc-date-bucket';
import type { UserActivityEntry } from './interfaces/user-activity-entry.interface';
import {
  USER_ACTIVITY_REPOSITORY,
  type IUserActivityRepository,
} from './interfaces/user-activity-repository.interface';
import type { IUserActivityService } from './interfaces/user-activity-service.interface';

@Injectable()
export class UserActivityService implements IUserActivityService {
  private readonly logger: Logger = new Logger(UserActivityService.name);

  public constructor(
    @Inject(USER_ACTIVITY_REPOSITORY)
    private readonly userActivityRepository: IUserActivityRepository,
  ) {}

  public async recordActivity(userId: string): Promise<void> {
    if (userId.trim().length === 0) {
      return;
    }
    const today: Date = startOfUtcDay(new Date());
    try {
      await this.userActivityRepository.upsertIncrementByUserAndDate(
        userId,
        today,
      );
    } catch (error: unknown) {
      // Asıl iş akışını kesmeyiz; aktivite kaydı bilgi amaçlı.
      this.logger.warn(
        `Failed to record user activity for user "${userId}": ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    }
  }

  public async getActivityInRange(
    userId: string,
    fromInclusive: Date,
    toInclusive: Date,
  ): Promise<UserActivityEntry[]> {
    return this.userActivityRepository.selectActivityInRange(
      userId,
      startOfUtcDay(fromInclusive),
      startOfUtcDay(toInclusive),
    );
  }
}
