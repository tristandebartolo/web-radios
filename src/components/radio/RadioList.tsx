'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePlayer, type RadioForPlayer } from '@/context/PlayerContext';
import { PlayButton } from '@/components/player/PlayButton';
import { FavoriteButton } from '@/components/radio/FavoriteButton';
import { cn } from '@/lib/utils/cn';

interface RadioListProps {
  radios: RadioForPlayer[];
}

export function RadioList({ radios }: RadioListProps) {
  if (radios.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-(--muted)">Aucune radio trouvée</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {radios.map((radio) => (
        <RadioListItem key={radio.id} radio={radio} />
      ))}
    </div>
  );
}

function RadioListItem({ radio }: { radio: RadioForPlayer }) {
  const { currentRadio, isPlaying } = usePlayer();

  const isCurrentRadio = currentRadio?.id === radio.id;
  const isActive = isCurrentRadio && isPlaying;

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-3 rounded-xl glass transition-all',
        'hover:bg-(--card-hover)',
        isActive && 'ring-2 ring-(--primary)'
      )}
    >
      {/* Logo */}
      <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-(--secondary)">
        {radio.logoUrl ? (
          <Image
            src={radio.logoUrl}
            alt={radio.name}
            fill
            className="object-cover"
            sizes="56px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            📻
          </div>
        )}
        {isActive && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="flex items-end gap-0.5 h-4">
              <span className="w-1 bg-(--success) rounded-full animate-[bounce_0.5s_ease-in-out_infinite]" style={{ height: '60%', animationDelay: '0ms' }} />
              <span className="w-1 bg-(--success) rounded-full animate-[bounce_0.5s_ease-in-out_infinite]" style={{ height: '100%', animationDelay: '150ms' }} />
              <span className="w-1 bg-(--success) rounded-full animate-[bounce_0.5s_ease-in-out_infinite]" style={{ height: '40%', animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/radios/${radio.id}`} className="group">
          <h3 className="font-semibold truncate group-hover:text-(--primary) transition-colors">
            {radio.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 text-sm text-(--muted)">
          {radio.description && (
            <span className="truncate">{radio.description}</span>
          )}
        </div>
        {/* Genres */}
        <div className="flex flex-wrap gap-1 mt-1">
          {radio.genres.slice(0, 3).map((genre) => (
            <span
              key={genre.id}
              className="px-2 py-0.5 text-xs rounded-full bg-(--primary)/10 text-(--primary)"
            >
              {genre.name}
            </span>
          ))}
        </div>
      </div>

      {/* Stream type */}
      <span className="hidden sm:block px-2 py-1 text-xs rounded-full bg-(--secondary) text-(--muted)">
        {radio.streamType}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <FavoriteButton radioId={radio.id} size="sm" />
        <PlayButton radio={radio} size="md" />
      </div>
    </div>
  );
}
