import type { DocumentVisibility } from './documentsDomains';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  birthDate: string;
}

export interface UpdateProfileBody {
  name?: string | null;
  birthDate?: string;
}

export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export interface FavoriteDocumentEntry {
  id: string;
  title: string;
  ownerId: string;
  visibility: DocumentVisibility;
  favoritedAt: string;
  updatedAt: string;
  favoriteCount: number;
  viewCount: number;
}

export interface FavoriteDiagramEntry {
  id: string;
  title: string;
  ownerId: string;
  visibility: DocumentVisibility;
  favoritedAt: string;
  updatedAt: string;
  favoriteCount: number;
  nodeCount: number;
}

/**
 * Heatmap için bir UTC günü. `bucketDate` ISO string'tir.
 */
export interface UserActivityEntry {
  bucketDate: string;
  count: number;
}

export interface ActivityQuery {
  from?: string;
  to?: string;
}
