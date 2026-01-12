// prisma/prisma.config.ts
import { defineConfig } from 'prisma/config';
import path from 'node:path';

export default defineConfig({
  schema: path.join(__dirname, 'schema.prisma'),

  migrations: {
    path: path.join(__dirname, 'migrations'),
    seed: 'tsx prisma/seed.ts',
  },
});