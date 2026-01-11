import type { User, Role } from '@prisma/client';

// User without sensitive fields (for client-side)
export type UserSafe = Omit<User, 'passwordHash'>;

// Input types for API
export interface UserCreateInput {
  email: string;
  password: string;
  name?: string;
  role?: Role;
}

export interface UserLoginInput {
  email: string;
  password: string;
}
