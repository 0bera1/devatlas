export interface PublicUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  birthDate: Date;
  /** Yüklenen profil fotoğrafının yolu (ör. `/uploads/avatars/...`). */
  avatarUrl?: string | null;
}
