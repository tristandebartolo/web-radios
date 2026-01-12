'use client';

import { FavoriteButton } from '@/components/radio/FavoriteButton';

interface FavoriteButtonClientProps {
  radioId: string;
}

export function FavoriteButtonClient({ radioId }: FavoriteButtonClientProps) {
  return <FavoriteButton radioId={radioId} size="lg" />;
}
