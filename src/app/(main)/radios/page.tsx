import { Metadata } from 'next';
import { Suspense } from 'react';
import prisma from '@/lib/db/prisma';
import { RadioGrid } from '@/components/radio/RadioGrid';
import { SearchBar } from '@/components/radio/SearchBar';

export const metadata: Metadata = {
  title: 'Toutes les radios',
};

interface RadiosPageProps {
  searchParams: Promise<{
    search?: string;
    genre?: string;
  }>;
}

export default async function RadiosPage({ searchParams }: RadiosPageProps) {
  const params = await searchParams;
  const search = params.search || '';
  const genre = params.genre || '';

  const [radios, genres] = await Promise.all([
    prisma.radio.findMany({
      where: {
        isActive: true,
        ...(search && {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        }),
        ...(genre && {
          genres: {
            some: { slug: genre },
          },
        }),
      },
      include: {
        genres: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.genre.findMany({
      orderBy: { name: 'asc' },
      where: {
        radios: {
          some: { isActive: true },
        },
      },
    }),
  ]);

  return (
    <div className="pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Radios</h1>
        <p className="text-[var(--muted)]">
          {radios.length} radio{radios.length > 1 ? 's' : ''} disponible{radios.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="mb-8">
        <Suspense fallback={<div className="h-24 animate-pulse bg-[var(--secondary)] rounded-xl" />}>
          <SearchBar genres={genres} />
        </Suspense>
      </div>

      <RadioGrid radios={radios} />
    </div>
  );
}
