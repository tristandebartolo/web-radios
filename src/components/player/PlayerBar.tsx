'use client';

import Image from 'next/image';
import { usePlayer } from '@/context/PlayerContext';
import { VolumeSlider } from './VolumeSlider';
import { PlayButton } from './PlayButton';

export function PlayerBar() {
  const { currentRadio, isPlaying, isLoading, error } = usePlayer();

  if (!currentRadio) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-(--border)">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Radio info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Logo */}
            <div className="relative shrink-0">
              {currentRadio.logoUrl ? (
                <Image
                  src={currentRadio.logoUrl}
                  alt={currentRadio.name}
                  width={56}
                  height={56}
                  className="rounded-lg object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-(--secondary) flex items-center justify-center text-2xl">
                  📻
                </div>
              )}
              {/* Playing indicator */}
              {isPlaying && !isLoading && (
                <div className="absolute -top-1 -right-1 w-3 h-3">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-(--success) opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-(--success)" />
                </div>
              )}
            </div>

            {/* Text info */}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold truncate">{currentRadio.name}</h3>
              {error ? (
                <p className="text-sm text-(--error) truncate">{error}</p>
              ) : (
                <p className="text-sm text-(--muted) truncate">
                  {isLoading
                    ? 'Connexion...'
                    : currentRadio.genres.map((g) => g.name).join(', ') || currentRadio.description || 'En direct'}
                </p>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <PlayButton size="lg" />
          </div>

          {/* Volume - hidden on mobile */}
          <div className="hidden sm:flex items-center gap-3 w-40">
            <VolumeSlider />
          </div>
        </div>
      </div>
    </div>
  );
}
