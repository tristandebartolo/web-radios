import Link from "next/link";
import { UserMenu } from "@/components/auth/UserMenu";

export default function HomePage() {
  return (
    <div className="min-h-screen">

      {/* Hero */}
      <main className="flex min-h-screen flex-col items-center justify-center p-8 pt-24">
        <div className="text-center animate-slide-up w-full">
          <h1 className="p-8">
            <Link
              href="/radios"
              className="text-7xl md:text-9xl gradient-text font-cinderela w-full"
            >
              Elvis Rds
            </Link>
          </h1>

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
