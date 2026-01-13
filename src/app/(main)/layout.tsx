import Link from "next/link";
import { UserMenu } from "@/components/auth/UserMenu";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-100 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 p-0 m-0">
            <div className="flex items-center gap-6 ">
              <Link
                href="/"
                className="flex gap-1 text-4xl gradient-text font-cinderela p-2 mt-2"
              >
                <span className="text-5xl wrd-elvis mr-1"></span>
                <span className="pt-2">Elvis Rds</span>
              </Link>

              <nav className="hidden sm:flex items-center gap-4">
                <Link
                  href="/radios"
                  className="text-sm text-(--muted) hover:text-foreground transition-colors"
                  title="Radios"
                >
                  <span className={`wrd-boombox text-lg`}></span>
                </Link>
                <Link
                  href="/favorites"
                  className="text-sm text-(--muted) hover:text-foreground transition-colors"
                  title="Radios"
                >
                  <span className={`wrd-favorite text-lg`}></span>
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
    </div>
  );
}
