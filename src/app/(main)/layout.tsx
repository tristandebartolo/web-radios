import Link from 'next/link';
import { UserMenu } from '@/components/auth/UserMenu';
import { PlayerBar } from '@/components/player/PlayerBar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-xl font-bold gradient-text">
                WebRadios
              </Link>
              <nav className="hidden sm:flex items-center gap-4">
                <Link
                  href="/radios"
                  className="text-sm text-(--muted) hover:text-(--foreground) transition-colors"
                >
                  Radios
                </Link>
              </nav>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {children}
      </main>
      {/* Player bar */}
      <PlayerBar />
    </div>
  );
}
