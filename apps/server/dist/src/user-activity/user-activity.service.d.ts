import type { UserActivityEntry } from './interfaces/user-activity-entry.interface';
import { type IUserActivityRepository } from './interfaces/user-activity-repository.interface';
import type { IUserActivityService } from './interfaces/user-activity-service.interface';
export declare class UserActivityService implements IUserActivityService {
    private readonly userActivityRepository;
    private readonly logger;
    constructor(userActivityRepository: IUserActivityRepository);
    recordActivity(userId: string): Promise<void>;
    getActivityInRange(userId: string, fromInclusive: Date, toInclusive: Date): Promise<UserActivityEntry[]>;
}
