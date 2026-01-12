import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/db/prisma';
import { PlayButtonClient } from '@/components/radio/PlayButtonClient';
import { FavoriteButtonClient } from '@/components/radio/FavoriteButtonClient';
import { RadioGrid } from '@/components/radio/RadioGrid';
import { SocialLinks } from '@/components/radio/SocialLinks';

interface RadioPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: RadioPageProps): Promise<Metadata> {
  const { id } = await params;
  const radio = await prisma.radio.findUnique({
    where: { id, isActive: true },
    select: { name: true, description: true },
  });

  if (!radio) {
    return { title: 'Radio non trouvée' };
  }

  return {
    title: radio.name,
    description: radio.description || `Écoutez ${radio.name} en direct sur WebRadios`,
  };
}

export default async function RadioPage({ params }: RadioPageProps) {
  const { id } = await params;

  const radio = await prisma.radio.findUnique({
    where: { id, isActive: true },
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

  if (!radio) {
    notFound();
  }

  // Récupérer les radios similaires (même genre)
  const genreIds = radio.genres.map((g) => g.id);
  const similarRadios = genreIds.length > 0
    ? await prisma.radio.findMany({
        where: {
          isActive: true,
          id: { not: radio.id },
          genres: {
            some: { id: { in: genreIds } },
          },
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
        take: 4,
        orderBy: { name: 'asc' },
      })
    : [];

  return (
    <div className="pb-24">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link href="/radios" className="text-(--muted) hover:text-(--foreground) transition-colors">
          Radios
        </Link>
        <span className="mx-2 text-(--muted)">/</span>
        <span className="text-(--foreground)">{radio.name}</span>
      </nav>

      {/* Radio Info */}
      <div className="glass rounded-2xl p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Logo */}
          <div className="relative w-40 h-40 md:w-48 md:h-48 shrink-0 mx-auto md:mx-0">
            {radio.logoUrl ? (
              <Image
                src={radio.logoUrl}
                alt={radio.name}
                fill
                className="object-cover rounded-xl"
                sizes="(max-width: 768px) 160px, 192px"
                priority
              />
            ) : (
              <div className="w-full h-full rounded-xl bg-(--secondary) flex items-center justify-center text-7xl">
                📻
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{radio.name}</h1>
                {radio.description && (
                  <p className="text-(--muted) text-lg">{radio.description}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <PlayButtonClient radio={radio} />
                <FavoriteButtonClient radioId={radio.id} />
              </div>
            </div>

            {/* Genres */}
            {radio.genres.length > 0 && (
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                {radio.genres.map((genre) => (
                  <Link
                    key={genre.id}
                    href={`/radios?genre=${genre.slug}`}
                    className="px-3 py-1 text-sm rounded-full bg-(--primary)/10 text-(--primary) hover:bg-(--primary)/20 transition-colors"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Location */}
            {(radio.country || radio.region) && (
              <p className="text-(--muted) mb-4">
                📍 {[radio.region, radio.country].filter(Boolean).join(', ')}
              </p>
            )}

            {/* Stream info */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-6">
              <span className="px-3 py-1 text-sm rounded-full bg-(--secondary) text-(--foreground)">
                {radio.streamType}
              </span>
            </div>

            {/* Social Links */}
            <SocialLinks
              websiteUrl={radio.websiteUrl}
              facebookUrl={radio.facebookUrl}
              twitterUrl={radio.twitterUrl}
              youtubeUrl={radio.youtubeUrl}
            />
          </div>
        </div>
      </div>

      {/* Similar Radios */}
      {similarRadios.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Radios similaires</h2>
          <RadioGrid radios={similarRadios} />
        </section>
      )}
    </div>
  );
}
