import type { User } from '@prisma/client';
import type { PublicUser } from './public-user.interface';

export const USER_REPOSITORY: unique symbol = Symbol('USER_REPOSITORY');

export interface CreateUserData {
  email: string;
  name?: string | null;
  password: string;
  birthDate: Date;
}

export interface UpdateUserProfileData {
  name?: string | null;
  birthDate?: Date;
}

export interface IUserRepository {
  findAll(): Promise<PublicUser[]>;
  findById(id: string): Promise<PublicUser | null>;
  findPublicByEmailNormalized(email: string): Promise<PublicUser | null>;
  findByEmailWithPassword(email: string): Promise<User | null>;
  create(data: CreateUserData): Promise<PublicUser>;
  deleteById(id: string): Promise<PublicUser>;
  /**
   * Yalnızca verilen alanları günceller. Email değiştirilmez.
   * Yoksa null döner.
   */
  updateProfileById(
    id: string,
    patch: UpdateUserProfileData,
  ): Promise<PublicUser | null>;
  /**
   * Hash'i hesaplanmış password'ü yazar. Çağıran tarafında bcrypt yapılmalıdır.
   */
  updatePasswordHashById(id: string, newPasswordHash: string): Promise<boolean>;
  /**
   * Mevcut password ile karşılaştırma için (bcrypt) hash'i okur.
   */
  selectPasswordHashById(id: string): Promise<string | null>;
}
