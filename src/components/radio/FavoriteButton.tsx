'use client';

import { useState, useRef, useEffect } from 'react';
import { useFavorites, FAVORITE_LEVELS, type FavoriteLevel } from '@/context/FavoritesContext';
import { cn } from '@/lib/utils/cn';

interface FavoriteButtonProps {
  radioId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FavoriteButton({ radioId, size = 'md', className }: FavoriteButtonProps) {
  const { isFavorite, getFavoriteLevel, addFavorite, removeFavorite } = useFavorites();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentLevel = getFavoriteLevel(radioId);
  const isRadioFavorite = isFavorite(radioId);

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  function handleToggleMenu(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  }

  function handleSelectLevel(level: FavoriteLevel) {
    addFavorite(radioId, level);
    setIsOpen(false);
  }

  function handleRemoveFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    removeFavorite(radioId);
    setIsOpen(false);
  }

  const sizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const iconSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  };

  const currentEmoji = currentLevel
    ? FAVORITE_LEVELS.find((l) => l.value === currentLevel)?.emoji
    : '☆';

  return (
    <div ref={menuRef} className={cn('relative', className)}>
      <button
        onClick={handleToggleMenu}
        className={cn(
          'flex items-center justify-center rounded-full transition-all',
          'hover:scale-110 active:scale-95',
          isRadioFavorite
            ? 'bg-amber-500/20 text-amber-500'
            : 'bg-(--secondary) text-(--muted) hover:text-amber-500',
          sizes[size]
        )}
        aria-label={isRadioFavorite ? 'Modifier le favori' : 'Ajouter aux favoris'}
      >
        <span className={iconSizes[size]}>{currentEmoji}</span>
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 z-50 min-w-[140px] py-2 rounded-xl glass border border-(--border) shadow-lg animate-slide-up">
          {FAVORITE_LEVELS.map((level) => (
            <button
              key={level.value}
              onClick={() => handleSelectLevel(level.value)}
              className={cn(
                'w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors',
                'hover:bg-(--secondary)',
                currentLevel === level.value && 'bg-(--primary)/10 text-(--primary)'
              )}
            >
              <span>{level.emoji}</span>
              <span>{level.label}</span>
              {currentLevel === level.value && (
                <span className="ml-auto text-(--primary)">✓</span>
              )}
            </button>
          ))}

          {isRadioFavorite && (
            <>
              <div className="my-2 border-t border-(--border)" />
              <button
                onClick={handleRemoveFavorite}
                className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-(--error) hover:bg-(--error)/10 transition-colors"
              >
                <span>✕</span>
                <span>Retirer</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
