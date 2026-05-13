import type { UserActivityEntry } from './user-activity-entry.interface';
export declare const USER_ACTIVITY_REPOSITORY: unique symbol;
export interface IUserActivityRepository {
    upsertIncrementByUserAndDate(userId: string, bucketDate: Date): Promise<void>;
    selectActivityInRange(userId: string, fromInclusive: Date, toInclusive: Date): Promise<UserActivityEntry[]>;
}
