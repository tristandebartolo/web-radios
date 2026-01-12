'use client';

import { useState, useEffect, useMemo } from 'react';
import { RadioGrid } from '@/components/radio/RadioGrid';
import { RadioList } from '@/components/radio/RadioList';
import { Select } from '@/components/ui/Select';
import type { RadioForPlayer } from '@/context/PlayerContext';

interface Genre {
  id: string;
  name: string;
  slug: string;
}

interface Radio extends RadioForPlayer {
  country: string | null;
  genres: Genre[];
}

interface RadiosPageClientProps {
  radios: Radio[];
  genres: Genre[];
  countries: string[];
}

type SortField = 'name' | 'country';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

const FILTERS_STORAGE_KEY = 'webradios_radios_filters';

interface FiltersState {
  search: string;
  genre: string;
  country: string;
  sortField: SortField;
  sortOrder: SortOrder;
  viewMode: ViewMode;
}

const defaultFilters: FiltersState = {
  search: '',
  genre: '',
  country: '',
  sortField: 'name',
  sortOrder: 'asc',
  viewMode: 'grid',
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

export function RadiosPageClient({ radios, genres, countries }: RadiosPageClientProps) {
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

  // Filtrer et trier les radios
  const filteredRadios = useMemo(() => {
    let result = radios.filter((radio) => {
      // Filtre par recherche
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const nameMatch = radio.name.toLowerCase().includes(searchLower);
        const descMatch = radio.description?.toLowerCase().includes(searchLower);
        if (!nameMatch && !descMatch) return false;
      }

      // Filtre par genre
      if (filters.genre && !radio.genres.some((g) => g.slug === filters.genre)) {
        return false;
      }

      // Filtre par pays
      if (filters.country && radio.country !== filters.country) {
        return false;
      }

      return true;
    });

    // Trier
    result.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'country':
          comparison = (a.country || '').localeCompare(b.country || '');
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [radios, filters]);

  function updateFilter<K extends keyof FiltersState>(key: K, value: FiltersState[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function resetFilters() {
    setFilters({ ...defaultFilters, viewMode: filters.viewMode });
  }

  const hasActiveFilters =
    filters.search !== '' ||
    filters.genre !== '' ||
    filters.country !== '' ||
    filters.sortField !== 'name' ||
    filters.sortOrder !== 'asc';

  // Générer la liste des filtres actifs
  const activeFilterTags = useMemo(() => {
    const tags: { key: string; label: string }[] = [];

    if (filters.search) {
      tags.push({ key: 'search', label: `"${filters.search}"` });
    }
    if (filters.genre) {
      const genreInfo = genres.find((g) => g.slug === filters.genre);
      tags.push({ key: 'genre', label: genreInfo?.name || filters.genre });
    }
    if (filters.country) {
      tags.push({ key: 'country', label: filters.country });
    }
    if (filters.sortField !== 'name') {
      tags.push({ key: 'sort', label: 'Tri: Pays' });
    }
    if (filters.sortOrder !== 'asc') {
      tags.push({ key: 'order', label: 'Ordre: Desc' });
    }

    return tags;
  }, [filters, genres]);

  if (!isHydrated) {
    return (
      <div className="pb-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Radios</h1>
          <p className="text-(--muted)">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="relative z-30 mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Radios</h1>
        <p className="text-(--muted)">
          {filteredRadios.length} radio{filteredRadios.length > 1 ? 's' : ''} disponible{filteredRadios.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Filtres */}
      <div className="ff-filter relative z-30 glass rounded-2xl p-4 mb-8 space-y-4">
        {/* Ligne 1 : Recherche + Toggle vue */}
        <div className="flex gap-3">
          {/* Recherche */}
          <div className="relative flex-1">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--muted)"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Rechercher une radio..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 rounded-lg bg-(--secondary) border border-(--border) text-(--foreground) placeholder:text-(--muted) focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent"
            />
          </div>

          {/* Toggle vue */}
          <div className="flex rounded-lg overflow-hidden border border-(--border)">
            <button
              onClick={() => updateFilter('viewMode', 'grid')}
              className={`px-3 py-2 transition-colors ${
                filters.viewMode === 'grid'
                  ? 'bg-(--primary) text-white'
                  : 'bg-(--secondary) text-(--muted) hover:text-(--foreground)'
              }`}
              aria-label="Vue grille"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/>
              </svg>
            </button>
            <button
              onClick={() => updateFilter('viewMode', 'list')}
              className={`px-3 py-2 transition-colors ${
                filters.viewMode === 'list'
                  ? 'bg-(--primary) text-white'
                  : 'bg-(--secondary) text-(--muted) hover:text-(--foreground)'
              }`}
              aria-label="Vue liste"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Ligne 2 : Filtres */}
        <div className="flex flex-wrap gap-3">
          {/* Filtre par genre */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs text-(--muted) mb-1">Genre</label>
            <Select
              value={filters.genre}
              onChange={(value) => updateFilter('genre', value)}
              placeholder="Tous les genres"
              options={[
                { value: '', label: 'Tous les genres' },
                ...genres.map((genre) => ({ value: genre.slug, label: genre.name })),
              ]}
            />
          </div>

          {/* Filtre par pays */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs text-(--muted) mb-1">Pays</label>
            <Select
              value={filters.country}
              onChange={(value) => updateFilter('country', value)}
              placeholder="Tous les pays"
              options={[
                { value: '', label: 'Tous les pays' },
                ...countries.map((country) => ({ value: country, label: country })),
              ]}
            />
          </div>

          {/* Tri */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs text-(--muted) mb-1">Trier par</label>
            <Select
              value={filters.sortField}
              onChange={(value) => updateFilter('sortField', value as SortField)}
              options={[
                { value: 'name', label: 'Nom' },
                { value: 'country', label: 'Pays' },
              ]}
            />
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

        {/* Ligne 3 : Genres rapides */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-(--border)">
          <button
            onClick={() => updateFilter('genre', '')}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              !filters.genre
                ? 'bg-(--primary) text-white'
                : 'bg-(--secondary) text-(--foreground) hover:bg-(--card-hover)'
            }`}
          >
            Tous
          </button>
          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => updateFilter('genre', genre.slug)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                filters.genre === genre.slug
                  ? 'bg-(--primary) text-white'
                  : 'bg-(--secondary) text-(--foreground) hover:bg-(--card-hover)'
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>

        {/* Filtres actifs et Reset */}
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
          <div className="text-6xl mb-4">📻</div>
          <p className="text-(--muted)">Aucune radio ne correspond à vos critères.</p>
        </div>
      ) : filters.viewMode === 'grid' ? (
        <RadioGrid radios={filteredRadios} />
      ) : (
        <RadioList radios={filteredRadios} />
      )}
    </div>
  );
}
