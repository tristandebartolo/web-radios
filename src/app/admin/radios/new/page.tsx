import { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/db/prisma';
import { RadioForm } from '@/components/admin/RadioForm';

export const metadata: Metadata = {
  title: 'Nouvelle radio',
};

export default async function NewRadioPage() {
  const genres = await prisma.genre.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/radios"
          className="p-2 hover:bg-(--secondary) rounded-lg transition-colors"
        >
          ←
        </Link>
        <h1 className="text-3xl font-bold gradient-text">Nouvelle radio</h1>
      </div>

      <div className="max-w-2xl">
        <div className="glass rounded-2xl p-6">
          <RadioForm genres={genres} />
        </div>
      </div>
    </div>
  );
}
