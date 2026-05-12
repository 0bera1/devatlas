import type { PublicUser } from '../users/interfaces/public-user.interface';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends PublicUser {}
  }
}

export {};
