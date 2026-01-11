// Re-export Prisma generated types for convenience
export type { User, Radio, Genre } from '@prisma/client';
export { Role, StreamType } from '@prisma/client';

// Custom extended types
export * from './radio';
export * from './user';
