'use client';

import { PlayButton } from '@/components/player/PlayButton';
import type { RadioForPlayer } from '@/context/PlayerContext';

interface PlayButtonClientProps {
  radio: RadioForPlayer;
}

export function PlayButtonClient({ radio }: PlayButtonClientProps) {
  return <PlayButton radio={radio} size="lg" />;
}
