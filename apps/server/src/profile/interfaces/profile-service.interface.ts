import type { PublicUser } from '../../users/interfaces/public-user.interface';
import type { UserActivityEntry } from '../../user-activity/interfaces/user-activity-entry.interface';
import type { FavoriteDiagramEntry } from './favorite-diagram-entry.interface';
import type { FavoriteDocumentEntry } from './favorite-document-entry.interface';

export const PROFILE_SERVICE: unique symbol = Symbol('PROFILE_SERVICE');

export interface UpdateProfileCommand {
  firstName?: string;
  lastName?: string;
  birthDate?: Date;
}

export interface ChangePasswordCommand {
  currentPassword: string;
  newPassword: string;
}

export interface IProfileService {
  getProfile(userId: string): Promise<PublicUser>;
  updateProfile(
    userId: string,
    command: UpdateProfileCommand,
  ): Promise<PublicUser>;
  changePassword(
    userId: string,
    command: ChangePasswordCommand,
  ): Promise<void>;
  listFavoriteDocuments(userId: string): Promise<FavoriteDocumentEntry[]>;
  listFavoriteDiagrams(userId: string): Promise<FavoriteDiagramEntry[]>;
  /**
   * Heatmap; çağıran açıkça aralık vermezse son 1 yıl varsayılır.
   */
  getActivity(
    userId: string,
    fromInclusive: Date,
    toInclusive: Date,
  ): Promise<UserActivityEntry[]>;
}
