import type { PublicUser } from '../users/interfaces/public-user.interface';
import { type IUserRepository } from '../users/interfaces/user-repository.interface';
import type { UserActivityEntry } from '../user-activity/interfaces/user-activity-entry.interface';
import { type IUserActivityService } from '../user-activity/interfaces/user-activity-service.interface';
import type { FavoriteDiagramEntry } from './interfaces/favorite-diagram-entry.interface';
import type { FavoriteDocumentEntry } from './interfaces/favorite-document-entry.interface';
import { type IProfileRepository } from './interfaces/profile-repository.interface';
import type { ChangePasswordCommand, IProfileService, UpdateProfileCommand } from './interfaces/profile-service.interface';
export declare class ProfileService implements IProfileService {
    private readonly userRepository;
    private readonly profileRepository;
    private readonly userActivityService;
    constructor(userRepository: IUserRepository, profileRepository: IProfileRepository, userActivityService: IUserActivityService);
    getProfile(userId: string): Promise<PublicUser>;
    updateProfile(userId: string, command: UpdateProfileCommand): Promise<PublicUser>;
    changePassword(userId: string, command: ChangePasswordCommand): Promise<void>;
    listFavoriteDocuments(userId: string): Promise<FavoriteDocumentEntry[]>;
    listFavoriteDiagrams(userId: string): Promise<FavoriteDiagramEntry[]>;
    getActivity(userId: string, fromInclusive: Date, toInclusive: Date): Promise<UserActivityEntry[]>;
}
