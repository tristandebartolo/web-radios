import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { UserMenu } from '@/components/auth/UserMenu';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

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
              <span className="px-2 py-1 text-xs bg-(--primary)/20 text-(--primary) rounded-full">
                Admin
              </span>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="fixed left-0 top-16 bottom-0 w-64 glass border-r border-(--border) p-4 overflow-y-auto">
          <nav className="space-y-2">
            <NavLink href="/admin" icon="📊">
              Dashboard
            </NavLink>
            <NavLink href="/admin/users" icon="👥">
              Utilisateurs
            </NavLink>
            <NavLink href="/admin/radios" icon="📻">
              Radios
            </NavLink>
            <NavLink href="/admin/genres" icon="🎵">
              Genres
            </NavLink>
          </nav>

          <div className="mt-8 pt-4 border-t border-(--border)">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-(--muted) hover:bg-(--secondary) hover:text-(--foreground) transition-colors"
            >
              <span>←</span>
              <span>Retour au site</span>
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="ml-64 flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-(--foreground) hover:bg-(--secondary) transition-colors"
    >
      <span>{icon}</span>
      <span>{children}</span>
    </Link>
  );
}
