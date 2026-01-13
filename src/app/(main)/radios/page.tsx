import { Metadata } from 'next';
import prisma from '@/lib/db/prisma';
import { RadiosPageClient } from './RadiosPageClient';

export const metadata: Metadata = {
  title: 'Toutes les radios',
};

export default async function RadiosPage() {
  const [genres, countriesResult] = await Promise.all([
    prisma.genre.findMany({
      orderBy: { name: 'asc' },
      where: {
        radios: {
          some: { isActive: true },
        },
      },
    }),
    prisma.radio.findMany({
      where: { isActive: true, country: { not: null } },
      select: { country: true },
      distinct: ['country'],
      orderBy: { country: 'asc' },
    }),
  ]);

  const countries = countriesResult.map((r) => r.country).filter(Boolean) as string[];

  return <RadiosPageClient genres={genres} countries={countries} />;
}
