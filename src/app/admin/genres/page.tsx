import { Metadata } from 'next';
import prisma from '@/lib/db/prisma';
import { GenresList } from '@/components/admin/GenresList';

export const metadata: Metadata = {
  title: 'Gestion des genres',
};

export default async function AdminGenresPage() {
  const genres = await prisma.genre.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { radios: true },
      },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Genres</h1>
          <p className="text-[var(--muted)] mt-1">{genres.length} genre(s)</p>
        </div>
      </div>

      <GenresList genres={genres} />
    </div>
  );
}
