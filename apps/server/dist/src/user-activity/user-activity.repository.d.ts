import { type IPrismaService } from '../prisma/interfaces/prisma-service.interface';
import type { UserActivityEntry } from './interfaces/user-activity-entry.interface';
import type { IUserActivityRepository } from './interfaces/user-activity-repository.interface';
export declare class UserActivityRepository implements IUserActivityRepository {
    private readonly prisma;
    constructor(prisma: IPrismaService);
    upsertIncrementByUserAndDate(userId: string, bucketDate: Date): Promise<void>;
    selectActivityInRange(userId: string, fromInclusive: Date, toInclusive: Date): Promise<UserActivityEntry[]>;
}
