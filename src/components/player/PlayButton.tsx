'use client';

import { usePlayer, type RadioForPlayer } from '@/context/PlayerContext';
import { cn } from '@/lib/utils/cn';

interface PlayButtonProps {
  radio?: RadioForPlayer;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PlayButton({ radio, size = 'md', className }: PlayButtonProps) {
  const { currentRadio, isPlaying, isLoading, play, pause, resume } = usePlayer();

  const isCurrentRadio = radio ? currentRadio?.id === radio.id : true;
  const showPause = isCurrentRadio ? isPlaying : false;
  const showLoading = isCurrentRadio ? isLoading : false;

  function handleClick() {
    if (radio) {
      if (isCurrentRadio) {
        if (isPlaying) {
          pause();
        } else {
          resume();
        }
      } else {
        play(radio);
      }
    } else {
      // Control current radio
      if (isPlaying) {
        pause();
      } else {
        resume();
      }
    }
  }

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      onClick={handleClick}
      disabled={showLoading}
      className={cn(
        'flex items-center justify-center rounded-full transition-all',
        'gradient-bg text-white hover:bg-(--primary-hover)',
        // 'hover:scale-105 active:scale-95',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizes[size],
        className
      )}
      aria-label={showPause ? 'Pause' : 'Lecture'}
    >
      {showLoading ? (
        <svg
          className={cn('animate-spin', iconSizes[size])}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : showPause ? (
        <span className="text-2xl wrd-pause"></span>
      ) : (
        <span className="text-2xl wrd-play_arrow"></span>
      )}
    </button>
  );
}
