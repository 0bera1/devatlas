import type { UserActivityEntry } from './user-activity-entry.interface';
export declare const USER_ACTIVITY_SERVICE: unique symbol;
export interface IUserActivityService {
    recordActivity(userId: string): Promise<void>;
    getActivityInRange(userId: string, fromInclusive: Date, toInclusive: Date): Promise<UserActivityEntry[]>;
}
