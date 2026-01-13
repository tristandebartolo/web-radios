import { Metadata } from 'next';
import { Suspense } from 'react';
import prisma from '@/lib/db/prisma';
import { RadiosPageClient } from './RadiosPageClient';

export const metadata: Metadata = {
  title: 'Toutes les radios',
};

function RadiosPageLoading() {
  return (
    <div className="pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2 font-cinderela">
          Radios
        </h1>
        <p className="text-(--muted)">Chargement...</p>
      </div>
    </div>
  );
}

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

  return (
    <Suspense fallback={<RadiosPageLoading />}>
      <RadiosPageClient genres={genres} countries={countries} />
    </Suspense>
  );
}
