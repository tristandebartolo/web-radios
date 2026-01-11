import path from 'node:path';
import type { PrismaConfig } from 'prisma';

export default {
  earlyAccess: [],
  schema: path.join(__dirname, 'schema.prisma'),

  seed: {
    command: 'tsx prisma/seed.ts',
  },
} satisfies PrismaConfig;
