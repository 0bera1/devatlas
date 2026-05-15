import type { PublicUser } from '../../users/interfaces/public-user.interface';
import type { UserActivityEntry } from '../../user-activity/interfaces/user-activity-entry.interface';
import type { FavoriteDiagramEntry } from './favorite-diagram-entry.interface';
import type { FavoriteDocumentEntry } from './favorite-document-entry.interface';
export declare const PROFILE_SERVICE: unique symbol;
export interface UpdateProfileCommand {
    name?: string | null;
    birthDate?: Date;
}
export interface ChangePasswordCommand {
    currentPassword: string;
    newPassword: string;
}
export interface IProfileService {
    getProfile(userId: string): Promise<PublicUser>;
    updateProfile(userId: string, command: UpdateProfileCommand): Promise<PublicUser>;
    changePassword(userId: string, command: ChangePasswordCommand): Promise<void>;
    listFavoriteDocuments(userId: string): Promise<FavoriteDocumentEntry[]>;
    listFavoriteDiagrams(userId: string): Promise<FavoriteDiagramEntry[]>;
    getActivity(userId: string, fromInclusive: Date, toInclusive: Date): Promise<UserActivityEntry[]>;
}
