import Link from "next/link";
// import { UserMenu } from "@/components/auth/UserMenu";

export default function HomePage() {
  return (
    <div className="min-h-screen">

      {/* Hero */}
      <main className="flex min-h-screen flex-col items-center justify-center p-8 pt-24">
        <div className="text-center animate-slide-up w-full">
          <h1 className="p-8">
            <Link
              href="/radios"
              className="text-7xl md:text-8xl lg:text-9xl gradient-text font-cinderela w-full flex flex-col md:flex-row items-center justify-center"
            >
              <span>Elvis</span><span className="text-9xl wrd-elvis"></span><span>Rds</span>
            </Link>
          </h1>

          <p className="text-xl text-(--muted) mb-8">
            Votre application de streaming radio moderne
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          <FeatureCard
            icon="wrd-bolt"
            title="Flux HLS & MP3"
            description="Support natif des flux audio modernes"
            fontSize="text-5xl"
          />
          <FeatureCard
            icon="wrd-boombox"
            title="Radios du monde"
            description="Découvrez des stations du monde entier"
            fontSize="text-5xl"
          />
          <FeatureCard
            icon="wrd-mobile-devices"
            title="Mobile friendly"
            description="Écoutez partout, même en arrière-plan"
            fontSize="text-5xl"
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
  fontSize,
}: {
  icon: string;
  title: string;
  description: string;
  fontSize: string;
}) {
  return (
    <div className="glass rounded-xl p-6 text-center">
      <div className={`${fontSize} mb-3`}>
        <span className={`${icon}`}></span>
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-(--muted)">{description}</p>
    </div>
  );
}
