'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';

export type FavoriteLevel = 'top' | 'genial' | 'enorme';

export interface FavoriteRadio {
  radioId: string;
  level: FavoriteLevel;
  addedAt: number;
}

interface FavoritesState {
  favorites: FavoriteRadio[];
}

interface FavoritesContextType extends FavoritesState {
  addFavorite: (radioId: string, level: FavoriteLevel) => void;
  removeFavorite: (radioId: string) => void;
  updateFavoriteLevel: (radioId: string, level: FavoriteLevel) => void;
  getFavoriteLevel: (radioId: string) => FavoriteLevel | null;
  isFavorite: (radioId: string) => boolean;
}

const STORAGE_KEY = 'webradios_favorites';

const FavoritesContext = createContext<FavoritesContextType | null>(null);

function loadFavoritesFromStorage(): FavoriteRadio[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading favorites from localStorage:', error);
  }
  return [];
}

function saveFavoritesToStorage(favorites: FavoriteRadio[]) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Error saving favorites to localStorage:', error);
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteRadio[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Charger les favoris depuis localStorage au montage
  useEffect(() => {
    setFavorites(loadFavoritesFromStorage());
    setIsHydrated(true);
  }, []);

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    if (isHydrated) {
      saveFavoritesToStorage(favorites);
    }
  }, [favorites, isHydrated]);

  const addFavorite = useCallback((radioId: string, level: FavoriteLevel) => {
    setFavorites((prev) => {
      const existing = prev.find((f) => f.radioId === radioId);
      if (existing) {
        return prev.map((f) =>
          f.radioId === radioId ? { ...f, level } : f
        );
      }
      return [...prev, { radioId, level, addedAt: Date.now() }];
    });
  }, []);

  const removeFavorite = useCallback((radioId: string) => {
    setFavorites((prev) => prev.filter((f) => f.radioId !== radioId));
  }, []);

  const updateFavoriteLevel = useCallback((radioId: string, level: FavoriteLevel) => {
    setFavorites((prev) =>
      prev.map((f) => (f.radioId === radioId ? { ...f, level } : f))
    );
  }, []);

  const getFavoriteLevel = useCallback(
    (radioId: string): FavoriteLevel | null => {
      const favorite = favorites.find((f) => f.radioId === radioId);
      return favorite?.level ?? null;
    },
    [favorites]
  );

  const isFavorite = useCallback(
    (radioId: string): boolean => {
      return favorites.some((f) => f.radioId === radioId);
    },
    [favorites]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        updateFavoriteLevel,
        getFavoriteLevel,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}

export const FAVORITE_LEVELS: { value: FavoriteLevel; label: string; emoji: string }[] = [
  { value: 'top', label: 'Top', emoji: '⭐' },
  { value: 'genial', label: 'Génial', emoji: '🌟' },
  { value: 'enorme', label: 'Énorme', emoji: '💫' },
];
