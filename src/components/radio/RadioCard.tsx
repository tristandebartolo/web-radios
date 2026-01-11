'use client';

import Image from 'next/image';
import { usePlayer, type RadioForPlayer } from '@/context/PlayerContext';
import { PlayButton } from '@/components/player/PlayButton';
import { cn } from '@/lib/utils/cn';

interface RadioCardProps {
  radio: RadioForPlayer;
}

export function RadioCard({ radio }: RadioCardProps) {
  const { currentRadio, isPlaying } = usePlayer();

  const isCurrentRadio = currentRadio?.id === radio.id;
  const isActive = isCurrentRadio && isPlaying;

  return (
    <div
      className={cn(
        'group relative glass rounded-2xl p-4 transition-all duration-300',
        'hover:bg-[var(--card-hover)] hover:scale-[1.02]',
        isActive && 'ring-2 ring-[var(--primary)] animate-pulse-glow'
      )}
    >
      {/* Logo */}
      <div className="relative aspect-square mb-4 rounded-xl overflow-hidden bg-[var(--secondary)]">
        {radio.logoUrl ? (
          <Image
            src={radio.logoUrl}
            alt={radio.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl">
            📻
          </div>
        )}

        {/* Play button overlay */}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            'bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity',
            isActive && 'opacity-100'
          )}
        >
          <PlayButton radio={radio} size="lg" />
        </div>

        {/* Stream type badge */}
        <div className="absolute top-2 right-2">
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-black/60 text-white backdrop-blur-sm">
            {radio.streamType}
          </span>
        </div>

        {/* Playing indicator */}
        {isActive && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1">
            <div className="flex items-end gap-0.5 h-4">
              <span className="w-1 bg-[var(--success)] rounded-full animate-[bounce_0.5s_ease-in-out_infinite]" style={{ height: '60%', animationDelay: '0ms' }} />
              <span className="w-1 bg-[var(--success)] rounded-full animate-[bounce_0.5s_ease-in-out_infinite]" style={{ height: '100%', animationDelay: '150ms' }} />
              <span className="w-1 bg-[var(--success)] rounded-full animate-[bounce_0.5s_ease-in-out_infinite]" style={{ height: '40%', animationDelay: '300ms' }} />
              <span className="w-1 bg-[var(--success)] rounded-full animate-[bounce_0.5s_ease-in-out_infinite]" style={{ height: '80%', animationDelay: '450ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <h3 className="font-semibold truncate mb-1">{radio.name}</h3>
        {radio.description && (
          <p className="text-sm text-[var(--muted)] truncate mb-2">
            {radio.description}
          </p>
        )}

        {/* Genres */}
        <div className="flex flex-wrap gap-1">
          {radio.genres.slice(0, 2).map((genre) => (
            <span
              key={genre.id}
              className="px-2 py-0.5 text-xs rounded-full bg-[var(--primary)]/10 text-[var(--primary)]"
            >
              {genre.name}
            </span>
          ))}
          {radio.genres.length > 2 && (
            <span className="px-2 py-0.5 text-xs text-[var(--muted)]">
              +{radio.genres.length - 2}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
