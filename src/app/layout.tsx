import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { PlayerProvider } from '@/context/PlayerContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { PlayerBar } from '@/components/player/PlayerBar';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'WebRadios - Écouter des radios en ligne',
    template: '%s | WebRadios',
  },
  description: 'Application moderne pour écouter vos webradios préférées. Flux HLS et MP3 supportés.',
  keywords: ['radio', 'webradio', 'streaming', 'music', 'hls', 'audio'],
  authors: [{ name: 'WebRadios Team' }],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'WebRadios',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#8b5cf6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen bg-(--background) text-(--foreground) antialiased">
        <AuthProvider>
          <FavoritesProvider>
            <PlayerProvider>
              {children}
              <PlayerBar />
            </PlayerProvider>
          </FavoritesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
