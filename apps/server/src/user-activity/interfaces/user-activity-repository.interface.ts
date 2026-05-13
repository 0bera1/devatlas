import type { UserActivityEntry } from './user-activity-entry.interface';

export const USER_ACTIVITY_REPOSITORY: unique symbol = Symbol(
  'USER_ACTIVITY_REPOSITORY',
);

export interface IUserActivityRepository {
  /**
   * Verilen kullanıcı + UTC günü için kovayı upsert eder; count'u 1 artırır.
   */
  upsertIncrementByUserAndDate(userId: string, bucketDate: Date): Promise<void>;

  /**
   * Verilen tarih aralığındaki kovaları (count > 0) okur.
   * `from` ve `to` UTC günün başlangıcı olmalı (00:00:00Z).
   */
  selectActivityInRange(
    userId: string,
    fromInclusive: Date,
    toInclusive: Date,
  ): Promise<UserActivityEntry[]>;
}
