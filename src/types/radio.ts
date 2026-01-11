import type { Radio, Genre, StreamType } from '@prisma/client';

// Radio with its genres included
export interface RadioWithGenres extends Radio {
  genres: Genre[];
}

// Input types for API
export interface RadioCreateInput {
  name: string;
  streamUrl: string;
  streamType: StreamType;
  logoUrl?: string;
  description?: string;
  country?: string;
  region?: string;
  genreIds?: string[];
}

export interface RadioUpdateInput extends Partial<RadioCreateInput> {
  isActive?: boolean;
}

// Search/filter params
export interface RadioFilters {
  search?: string;
  genreSlug?: string;
  country?: string;
  isActive?: boolean;
}
