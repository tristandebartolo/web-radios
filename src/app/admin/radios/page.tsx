import { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/db/prisma';
import { RadiosList } from '@/components/admin/RadiosList';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Gestion des radios',
};

export default async function AdminRadiosPage() {
  const radios = await prisma.radio.findMany({
    orderBy: { name: 'asc' },
    include: {
      genres: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Radios</h1>
          <p className="text-[var(--muted)] mt-1">{radios.length} radio(s)</p>
        </div>
        <Link href="/admin/radios/new">
          <Button>+ Nouvelle radio</Button>
        </Link>
      </div>

      <RadiosList radios={radios} />
    </div>
  );
}
