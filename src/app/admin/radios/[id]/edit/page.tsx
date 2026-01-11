import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/db/prisma';
import { RadioForm } from '@/components/admin/RadioForm';

export const metadata: Metadata = {
  title: 'Modifier la radio',
};

interface EditRadioPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRadioPage({ params }: EditRadioPageProps) {
  const { id } = await params;

  const [radio, genres] = await Promise.all([
    prisma.radio.findUnique({
      where: { id },
      include: {
        genres: {
          select: { id: true },
        },
      },
    }),
    prisma.genre.findMany({
      orderBy: { name: 'asc' },
    }),
  ]);

  if (!radio) {
    notFound();
  }

  const radioWithGenreIds = {
    ...radio,
    genreIds: radio.genres.map((g) => g.id),
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/radios"
          className="p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors"
        >
          ←
        </Link>
        <h1 className="text-3xl font-bold gradient-text">Modifier : {radio.name}</h1>
      </div>

      <div className="max-w-2xl">
        <div className="glass rounded-2xl p-6">
          <RadioForm radio={radioWithGenreIds} genres={genres} />
        </div>
      </div>
    </div>
  );
}
