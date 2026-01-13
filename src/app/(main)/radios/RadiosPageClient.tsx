"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RadioGrid } from "@/components/radio/RadioGrid";
import { RadioList } from "@/components/radio/RadioList";
import { Select } from "@/components/ui/Select";
import type { RadioForPlayer } from "@/context/PlayerContext";

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
  genres: Genre[];
  countries: string[];
}

type SortField = "name" | "country";
type SortOrder = "asc" | "desc";
type ViewMode = "grid" | "list";

const LIMIT = 20;

interface FiltersState {
  search: string;
  genre: string;
  country: string;
  sortField: SortField;
  sortOrder: SortOrder;
  viewMode: ViewMode;
}

const defaultFilters: FiltersState = {
  search: "",
  genre: "",
  country: "",
  sortField: "name",
  sortOrder: "asc",
  viewMode: "grid",
};

export function RadiosPageClient({
  genres,
  countries,
}: RadiosPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [radios, setRadios] = useState<Radio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Lire les filtres depuis l'URL
  const getFiltersFromURL = useCallback((): FiltersState => {
    const viewMode = (localStorage.getItem("webradios_viewMode") as ViewMode) || "grid";
    return {
      search: searchParams.get("search") || "",
      genre: searchParams.get("genre") || "",
      country: searchParams.get("country") || "",
      sortField: (searchParams.get("sortField") as SortField) || "name",
      sortOrder: (searchParams.get("sortOrder") as SortOrder) || "asc",
      viewMode,
    };
  }, [searchParams]);

  const [filters, setFilters] = useState<FiltersState>(defaultFilters);

  // Synchroniser les filtres avec l'URL au montage
  useEffect(() => {
    setFilters(getFiltersFromURL());
    setIsHydrated(true);
  }, [getFiltersFromURL]);

  // Mettre à jour l'URL quand les filtres changent
  const updateURL = useCallback((newFilters: FiltersState) => {
    const params = new URLSearchParams();

    if (newFilters.search) params.set("search", newFilters.search);
    if (newFilters.genre) params.set("genre", newFilters.genre);
    if (newFilters.country) params.set("country", newFilters.country);
    if (newFilters.sortField !== "name") params.set("sortField", newFilters.sortField);
    if (newFilters.sortOrder !== "asc") params.set("sortOrder", newFilters.sortOrder);

    const queryString = params.toString();
    router.push(queryString ? `?${queryString}` : "/radios", { scroll: false });
  }, [router]);

  // Fetch des radios depuis l'API
  const fetchRadios = useCallback(async (
    currentFilters: FiltersState,
    cursor: string | null = null,
    append: boolean = false
  ) => {
    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const params = new URLSearchParams();
      params.set("limit", String(LIMIT));
      if (currentFilters.search) params.set("search", currentFilters.search);
      if (currentFilters.genre) params.set("genre", currentFilters.genre);
      if (currentFilters.country) params.set("country", currentFilters.country);
      if (currentFilters.sortField) params.set("sortField", currentFilters.sortField);
      if (currentFilters.sortOrder) params.set("sortOrder", currentFilters.sortOrder);
      if (cursor) params.set("cursor", cursor);

      const response = await fetch(`/api/radios?${params.toString()}`, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error("Erreur lors du chargement");

      const data = await response.json();

      if (append) {
        setRadios((prev) => [...prev, ...data.items]);
      } else {
        setRadios(data.items);
      }

      setHasNextPage(data.hasNextPage);
      setNextCursor(data.nextCursor);
      setTotal(data.total);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return; // Requête annulée, on ignore
      }
      console.error("Error fetching radios:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Charger les radios quand les filtres changent
  useEffect(() => {
    if (!isHydrated) return;
    fetchRadios(filters);
  }, [filters, isHydrated, fetchRadios]);

  // Debounce pour la recherche
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    if (!isHydrated) return;
    setSearchInput(filters.search);
  }, [filters.search, isHydrated]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      const newFilters = { ...filters, search: value };
      setFilters(newFilters);
      updateURL(newFilters);
    }, 300);
  };

  // Infinite scroll avec IntersectionObserver
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isLoadingMore) {
          fetchRadios(filters, nextCursor, true);
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isLoadingMore, nextCursor, filters, fetchRadios]);

  function updateFilter<K extends keyof FiltersState>(
    key: K,
    value: FiltersState[K]
  ) {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Sauvegarder viewMode en localStorage (pas dans l'URL)
    if (key === "viewMode") {
      localStorage.setItem("webradios_viewMode", value as string);
    } else {
      updateURL(newFilters);
    }
  }

  function resetFilters() {
    const newFilters = { ...defaultFilters, viewMode: filters.viewMode };
    setFilters(newFilters);
    setSearchInput("");
    router.push("/radios", { scroll: false });
  }

  const hasActiveFilters =
    filters.search !== "" ||
    filters.genre !== "" ||
    filters.country !== "" ||
    filters.sortField !== "name" ||
    filters.sortOrder !== "asc";

  // Générer la liste des filtres actifs
  const activeFilterTags = (() => {
    const tags: { key: string; label: string }[] = [];

    if (filters.search) {
      tags.push({ key: "search", label: `"${filters.search}"` });
    }
    if (filters.genre) {
      const genreInfo = genres.find((g) => g.slug === filters.genre);
      tags.push({ key: "genre", label: genreInfo?.name || filters.genre });
    }
    if (filters.country) {
      tags.push({ key: "country", label: filters.country });
    }
    if (filters.sortField !== "name") {
      tags.push({ key: "sort", label: "Tri: Pays" });
    }
    if (filters.sortOrder !== "asc") {
      tags.push({ key: "order", label: "Ordre: Desc" });
    }

    return tags;
  })();

  if (!isHydrated) {
    return (
      <div className="pb-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2 font-cinderela">
            Radios
          </h1>
          <p className="text-(--muted)">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Filtres */}
      <div className="ff-filter relative z-30 glass rounded-2xl p-4 mb-8 mt-4 space-y-4">
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
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 rounded-lg bg-(--secondary) border border-(--border) text-foreground placeholder:text-(--muted) focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent"
            />
          </div>

          {/* Toggle vue */}
          <div className="flex rounded-lg overflow-hidden border border-(--border)">
            <button
              onClick={() => updateFilter("viewMode", "grid")}
              className={`px-3 py-2 transition-colors ${
                filters.viewMode === "grid"
                  ? "gradient-bg text-white"
                  : "bg-(--secondary) text-(--muted) hover:text-foreground"
              }`}
              aria-label="Vue grille"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
              </svg>
            </button>
            <button
              onClick={() => updateFilter("viewMode", "list")}
              className={`px-3 py-2 transition-colors ${
                filters.viewMode === "list"
                  ? "gradient-bg text-white"
                  : "bg-(--secondary) text-(--muted) hover:text-foreground"
              }`}
              aria-label="Vue liste"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Ligne 2 : Filtres */}
        <div className="flex flex-wrap gap-3">
          {/* Filtre par genre */}
          <div className="flex-1 min-w-37.5">
            <label className="block text-xs text-(--muted) mb-1">Genre</label>
            <Select
              value={filters.genre}
              onChange={(value) => updateFilter("genre", value)}
              placeholder="Tous les genres"
              options={[
                { value: "", label: "Tous les genres" },
                ...genres.map((genre) => ({
                  value: genre.slug,
                  label: genre.name,
                })),
              ]}
            />
          </div>

          {/* Filtre par pays */}
          <div className="flex-1 min-w-37.5">
            <label className="block text-xs text-(--muted) mb-1">Pays</label>
            <Select
              value={filters.country}
              onChange={(value) => updateFilter("country", value)}
              placeholder="Tous les pays"
              options={[
                { value: "", label: "Tous les pays" },
                ...countries.map((country) => ({
                  value: country,
                  label: country,
                })),
              ]}
            />
          </div>

          {/* Tri */}
          <div className="flex-1 min-w-37.5">
            <label className="block text-xs text-(--muted) mb-1">
              Trier par
            </label>
            <Select
              value={filters.sortField}
              onChange={(value) =>
                updateFilter("sortField", value as SortField)
              }
              options={[
                { value: "name", label: "Nom" },
                { value: "country", label: "Pays" },
              ]}
            />
          </div>

          {/* Ordre */}
          <div className="min-w-25">
            <label className="block text-xs text-(--muted) mb-1">Ordre</label>
            <button
              onClick={() =>
                updateFilter(
                  "sortOrder",
                  filters.sortOrder === "asc" ? "desc" : "asc"
                )
              }
              className="w-full px-3 py-2 rounded-lg bg-(--secondary) border border-(--border) text-foreground hover:bg-(--card-hover) transition-colors flex items-center justify-center gap-2"
            >
              {filters.sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
            </button>
          </div>
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

      <div className="relative z-30 mb-8 flex gap-5">
        <h1 className="text-xl font-bold gradient-text mb-2 font-cinderela">
          Radios
        </h1>
        <p className="text-(--muted)">
          {radios.length} / {total} radio{total > 1 ? "s" : ""}{" "}
          disponible{total > 1 ? "s" : ""}
        </p>
      </div>

      {/* Résultats */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-(--primary) border-t-transparent"></div>
          <p className="text-(--muted) mt-4">Chargement des radios...</p>
        </div>
      ) : radios.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">
            <span className="wrd-radio"></span>
          </div>
          <p className="text-(--muted)">
            Aucune radio ne correspond à vos critères.
          </p>
        </div>
      ) : filters.viewMode === "grid" ? (
        <RadioGrid radios={radios} />
      ) : (
        <RadioList radios={radios} />
      )}

      {/* Loader pour infinite scroll */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {isLoadingMore && (
            <div className="flex items-center gap-3">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-(--primary) border-t-transparent"></div>
              <span className="text-(--muted)">Chargement...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
