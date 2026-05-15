import type { SeedUserInput } from '../types';

export const seedUsers: SeedUserInput[] = [
  {
    email: 'admin@devatlas.local',
    firstName: 'Admin',
    lastName: 'User',
    password: 'Admin123!',
    birthDate: new Date('1990-01-15'),
  },
  {
    email: 'admin2@devatlas.local',
    firstName: 'Admin',
    lastName: 'Demo',
    password: 'Admin123!',
    birthDate: new Date('1992-06-20'),
  },
];
