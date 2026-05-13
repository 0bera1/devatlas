import type { Request } from 'express';
import type { PublicUser } from '../users/interfaces/public-user.interface';
import type { UserActivityEntry } from '../user-activity/interfaces/user-activity-entry.interface';
import { ActivityQueryDto } from './dto/activity-query.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import type { FavoriteDiagramEntry } from './interfaces/favorite-diagram-entry.interface';
import type { FavoriteDocumentEntry } from './interfaces/favorite-document-entry.interface';
import { type IProfileService } from './interfaces/profile-service.interface';
export declare class ProfileController {
    private readonly profileService;
    constructor(profileService: IProfileService);
    getMe(req: Request): Promise<PublicUser>;
    updateMe(req: Request, dto: UpdateProfileDto): Promise<PublicUser>;
    changePassword(req: Request, dto: ChangePasswordDto): Promise<void>;
    getFavoriteDocuments(req: Request): Promise<FavoriteDocumentEntry[]>;
    getFavoriteDiagrams(req: Request): Promise<FavoriteDiagramEntry[]>;
    getActivity(req: Request, query: ActivityQueryDto): Promise<UserActivityEntry[]>;
    private static requireUser;
}
