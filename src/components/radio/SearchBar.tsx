'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

interface Genre {
  id: string;
  name: string;
  slug: string;
}

interface SearchBarProps {
  genres: Genre[];
}

export function SearchBar({ genres }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const currentGenre = searchParams.get('genre') || '';

  function updateSearch(newSearch: string) {
    setSearch(newSearch);

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (newSearch) {
        params.set('search', newSearch);
      } else {
        params.delete('search');
      }
      router.push(`/radios?${params.toString()}`);
    });
  }

  function updateGenre(genreSlug: string) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (genreSlug) {
        params.set('genre', genreSlug);
      } else {
        params.delete('genre');
      }
      router.push(`/radios?${params.toString()}`);
    });
  }

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]"
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
          value={search}
          onChange={(e) => updateSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--secondary)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
        />
        {isPending && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <svg className="animate-spin w-5 h-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}
      </div>

      {/* Genre filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => updateGenre('')}
          className={`px-4 py-2 text-sm rounded-full transition-colors ${
            !currentGenre
              ? 'bg-[var(--primary)] text-white'
              : 'bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--card-hover)]'
          }`}
        >
          Tous
        </button>
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => updateGenre(genre.slug)}
            className={`px-4 py-2 text-sm rounded-full transition-colors ${
              currentGenre === genre.slug
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--card-hover)]'
            }`}
          >
            {genre.name}
          </button>
        ))}
      </div>
    </div>
  );
}
