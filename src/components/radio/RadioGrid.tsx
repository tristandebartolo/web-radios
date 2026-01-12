'use client';

import { RadioCard } from './RadioCard';
import type { RadioForPlayer } from '@/context/PlayerContext';

interface RadioGridProps {
  radios: RadioForPlayer[];
}

export function RadioGrid({ radios }: RadioGridProps) {
  if (radios.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📻</div>
        <h3 className="text-xl font-semibold mb-2">Aucune radio trouvée</h3>
        <p className="text-(--muted)">
          Essayez de modifier vos critères de recherche
        </p>
      </div>
    );
  }

  return (
    <div className="ff-card grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {radios.map((radio) => (
        <RadioCard key={radio.id} radio={radio} />
      ))}
    </div>
  );
}
