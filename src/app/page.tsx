import Link from "next/link";
import { UserMenu } from "@/components/auth/UserMenu";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 left-0 right-0 z-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-5">
              <Link href="/" className="text-xl font-bold gradient-text">
                WebRadios
              </Link>
              <Link href="/radios" className="text-md text-(--muted) hover:text-(--foreground) transition-colors">
                Radios
              </Link>
              <Link href="/favorites" className="text-md text-(--muted) hover:text-(--foreground) transition-colors">
                Favoris
              </Link>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex min-h-screen flex-col items-center justify-center p-8 pt-24">
        <div className="text-center animate-slide-up">
          <h1 className="text-5xl font-bold gradient-text mb-4">WebRadios</h1>
          <p className="text-xl text-(--muted) mb-8">
            Votre application de streaming radio moderne
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          <FeatureCard
            icon="🎵"
            title="Flux HLS & MP3"
            description="Support natif des flux audio modernes"
          />
          <FeatureCard
            icon="🌍"
            title="Radios du monde"
            description="Découvrez des stations du monde entier"
          />
          <FeatureCard
            icon="📱"
            title="Mobile friendly"
            description="Écoutez partout, même en arrière-plan"
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="glass rounded-xl p-6 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-(--muted)">{description}</p>
    </div>
  );
}
