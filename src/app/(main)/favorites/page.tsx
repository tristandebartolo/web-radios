import { Metadata } from 'next';
import prisma from '@/lib/db/prisma';
import { FavoritesPageClient } from './FavoritesPageClient';

export const metadata: Metadata = {
  title: 'Mes favoris',
};

export default async function FavoritesPage() {
  // Récupérer toutes les radios actives et genres pour le filtrage côté client
  const [radios, genres] = await Promise.all([
    prisma.radio.findMany({
      where: { isActive: true },
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

  return <FavoritesPageClient radios={radios} genres={genres} />;
}
