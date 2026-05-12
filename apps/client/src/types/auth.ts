export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  birthDate: string;
}

export interface AuthResponse {
  accessToken: string;
  user: PublicUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  birthDate: string;
}
