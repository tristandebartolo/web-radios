'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useFavorites, FAVORITE_LEVELS, type FavoriteLevel } from '@/context/FavoritesContext';
import { RadioGrid } from '@/components/radio/RadioGrid';
import type { RadioForPlayer } from '@/context/PlayerContext';

interface Genre {
  id: string;
  name: string;
  slug: string;
}

interface Radio extends RadioForPlayer {
  genres: Genre[];
}

interface FavoritesPageClientProps {
  radios: Radio[];
  genres: Genre[];
}

type SortField = 'name' | 'addedAt' | 'level';
type SortOrder = 'asc' | 'desc';

const FILTERS_STORAGE_KEY = 'webradios_favorites_filters';

interface FiltersState {
  search: string;
  level: FavoriteLevel | 'all';
  genre: string;
  sortField: SortField;
  sortOrder: SortOrder;
}

const defaultFilters: FiltersState = {
  search: '',
  level: 'all',
  genre: '',
  sortField: 'addedAt',
  sortOrder: 'desc',
};

function loadFiltersFromStorage(): FiltersState {
  if (typeof window === 'undefined') return defaultFilters;

  try {
    const stored = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (stored) {
      return { ...defaultFilters, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading filters from localStorage:', error);
  }
  return defaultFilters;
}

function saveFiltersToStorage(filters: FiltersState) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
  } catch (error) {
    console.error('Error saving filters to localStorage:', error);
  }
}

const LEVEL_ORDER: Record<FavoriteLevel, number> = {
  enorme: 3,
  genial: 2,
  top: 1,
};

export function FavoritesPageClient({ radios, genres }: FavoritesPageClientProps) {
  const { favorites } = useFavorites();
  const [filters, setFilters] = useState<FiltersState>(defaultFilters);
  const [isHydrated, setIsHydrated] = useState(false);

  // Charger les filtres depuis localStorage au montage
  useEffect(() => {
    setFilters(loadFiltersFromStorage());
    setIsHydrated(true);
  }, []);

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    if (isHydrated) {
      saveFiltersToStorage(filters);
    }
  }, [filters, isHydrated]);

  // Filtrer et trier les radios favorites
  const filteredRadios = useMemo(() => {
    // D'abord, ne garder que les radios favorites
    const favoriteRadios = radios.filter((radio) =>
      favorites.some((f) => f.radioId === radio.id)
    );

    // Appliquer les filtres
    let result = favoriteRadios.filter((radio) => {
      const favorite = favorites.find((f) => f.radioId === radio.id);
      if (!favorite) return false;

      // Filtre par recherche
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const nameMatch = radio.name.toLowerCase().includes(searchLower);
        const descMatch = radio.description?.toLowerCase().includes(searchLower);
        if (!nameMatch && !descMatch) return false;
      }

      // Filtre par niveau
      if (filters.level !== 'all' && favorite.level !== filters.level) {
        return false;
      }

      // Filtre par genre
      if (filters.genre && !radio.genres.some((g) => g.slug === filters.genre)) {
        return false;
      }

      return true;
    });

    // Trier
    result.sort((a, b) => {
      const favA = favorites.find((f) => f.radioId === a.id)!;
      const favB = favorites.find((f) => f.radioId === b.id)!;

      let comparison = 0;

      switch (filters.sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'addedAt':
          comparison = favA.addedAt - favB.addedAt;
          break;
        case 'level':
          comparison = LEVEL_ORDER[favA.level] - LEVEL_ORDER[favB.level];
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [radios, favorites, filters]);

  // Genres disponibles parmi les favoris
  const availableGenres = useMemo(() => {
    const favoriteRadioIds = new Set(favorites.map((f) => f.radioId));
    const genreSlugs = new Set<string>();

    radios
      .filter((r) => favoriteRadioIds.has(r.id))
      .forEach((r) => r.genres.forEach((g) => genreSlugs.add(g.slug)));

    return genres.filter((g) => genreSlugs.has(g.slug));
  }, [radios, favorites, genres]);

  function updateFilter<K extends keyof FiltersState>(key: K, value: FiltersState[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function resetFilters() {
    setFilters(defaultFilters);
  }

  const hasActiveFilters =
    filters.search !== '' ||
    filters.level !== 'all' ||
    filters.genre !== '' ||
    filters.sortField !== 'addedAt' ||
    filters.sortOrder !== 'desc';

  // Générer la liste des filtres actifs
  const activeFilterTags = useMemo(() => {
    const tags: { key: string; label: string }[] = [];

    if (filters.search) {
      tags.push({ key: 'search', label: `"${filters.search}"` });
    }
    if (filters.level !== 'all') {
      const levelInfo = FAVORITE_LEVELS.find((l) => l.value === filters.level);
      tags.push({ key: 'level', label: `${levelInfo?.emoji} ${levelInfo?.label}` });
    }
    if (filters.genre) {
      const genreInfo = genres.find((g) => g.slug === filters.genre);
      tags.push({ key: 'genre', label: genreInfo?.name || filters.genre });
    }
    if (filters.sortField !== 'addedAt') {
      const sortLabels: Record<SortField, string> = {
        name: 'Nom',
        addedAt: "Date d'ajout",
        level: 'Niveau',
      };
      tags.push({ key: 'sort', label: `Tri: ${sortLabels[filters.sortField]}` });
    }
    if (filters.sortOrder !== 'desc') {
      tags.push({ key: 'order', label: 'Ordre: Asc' });
    }

    return tags;
  }, [filters, genres]);

  if (!isHydrated) {
    return (
      <div className="pb-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Mes favoris</h1>
          <p className="text-(--muted)">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Mes favoris</h1>
        <p className="text-(--muted)">
          {favorites.length} radio{favorites.length > 1 ? 's' : ''} en favoris
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">☆</div>
          <h2 className="text-xl font-semibold mb-2">Aucun favori</h2>
          <p className="text-(--muted) mb-6">
            Ajoutez des radios à vos favoris pour les retrouver facilement ici.
          </p>
          <Link
            href="/radios"
            className="inline-flex px-6 py-3 rounded-xl bg-(--primary) text-white hover:bg-(--primary-hover) transition-colors"
          >
            Découvrir les radios
          </Link>
        </div>
      ) : (
        <>
          {/* Filtres */}
          <div className="glass rounded-2xl p-4 mb-8 space-y-4">
            {/* Recherche */}
            <div>
              <input
                type="text"
                placeholder="Rechercher une radio..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-(--secondary) border border-(--border) text-(--foreground) placeholder:text-(--muted) focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent"
              />
            </div>

            {/* Filtres en ligne */}
            <div className="flex flex-wrap gap-3">
              {/* Filtre par niveau */}
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs text-(--muted) mb-1">Niveau</label>
                <select
                  value={filters.level}
                  onChange={(e) => updateFilter('level', e.target.value as FavoriteLevel | 'all')}
                  className="w-full px-3 py-2 rounded-lg bg-(--secondary) border border-(--border) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
                >
                  <option value="all">Tous les niveaux</option>
                  {FAVORITE_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.emoji} {level.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtre par genre */}
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs text-(--muted) mb-1">Genre</label>
                <select
                  value={filters.genre}
                  onChange={(e) => updateFilter('genre', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-(--secondary) border border-(--border) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
                >
                  <option value="">Tous les genres</option>
                  {availableGenres.map((genre) => (
                    <option key={genre.slug} value={genre.slug}>
                      {genre.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tri */}
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs text-(--muted) mb-1">Trier par</label>
                <select
                  value={filters.sortField}
                  onChange={(e) => updateFilter('sortField', e.target.value as SortField)}
                  className="w-full px-3 py-2 rounded-lg bg-(--secondary) border border-(--border) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
                >
                  <option value="addedAt">Date d'ajout</option>
                  <option value="name">Nom</option>
                  <option value="level">Niveau</option>
                </select>
              </div>

              {/* Ordre */}
              <div className="min-w-[100px]">
                <label className="block text-xs text-(--muted) mb-1">Ordre</label>
                <button
                  onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="w-full px-3 py-2 rounded-lg bg-(--secondary) border border-(--border) text-(--foreground) hover:bg-(--card-hover) transition-colors flex items-center justify-center gap-2"
                >
                  {filters.sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
                </button>
              </div>
            </div>

            {/* Reset */}
            {hasActiveFilters && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-(--border)">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-(--muted)">Filtres actifs :</span>
                  {activeFilterTags.map((tag) => (
                    <span
                      key={tag.key}
                      className="px-2 py-1 text-xs rounded-full bg-(--primary)/10 text-(--primary)"
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-(--error)/10 text-(--error) hover:bg-(--error)/20 transition-colors shrink-0"
                >
                  <span>✕</span>
                  <span>Réinitialiser</span>
                </button>
              </div>
            )}
          </div>

          {/* Résultats */}
          {filteredRadios.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-(--muted)">Aucune radio ne correspond à vos critères.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-(--muted) mb-4">
                {filteredRadios.length} radio{filteredRadios.length > 1 ? 's' : ''} trouvée{filteredRadios.length > 1 ? 's' : ''}
              </p>
              <RadioGrid radios={filteredRadios} />
            </>
          )}
        </>
      )}
    </div>
  );
}
