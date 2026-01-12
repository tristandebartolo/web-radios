import { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/db/prisma';

export const metadata: Metadata = {
  title: 'Administration',
};

export default async function AdminDashboardPage() {
  const [usersCount, radiosCount, genresCount] = await Promise.all([
    prisma.user.count(),
    prisma.radio.count(),
    prisma.genre.count(),
  ]);

  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold gradient-text mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Utilisateurs"
          value={usersCount}
          icon="👥"
          href="/admin/users"
        />
        <StatCard
          title="Radios"
          value={radiosCount}
          icon="📻"
          href="/admin/radios"
        />
        <StatCard
          title="Genres"
          value={genresCount}
          icon="🎵"
          href="/admin/genres"
        />
      </div>

      {/* Recent users */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Derniers utilisateurs</h2>
          <Link
            href="/admin/users"
            className="text-sm text-(--primary) hover:text-(--primary-hover)"
          >
            Voir tous →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-(--muted) border-b border-(--border)">
                <th className="pb-3 font-medium">Utilisateur</th>
                <th className="pb-3 font-medium">Rôle</th>
                <th className="pb-3 font-medium">Date d&apos;inscription</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border)">
              {recentUsers.map((user) => (
                <tr key={user.id}>
                  <td className="py-3">
                    <div>
                      <p className="font-medium">{user.name || 'Sans nom'}</p>
                      <p className="text-sm text-(--muted)">{user.email}</p>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      user.role === 'ADMIN'
                        ? 'bg-(--primary)/20 text-(--primary)'
                        : 'bg-(--secondary) text-(--muted)'
                    }`}>
                      {user.role === 'ADMIN' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-(--muted)">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  href,
}: {
  title: string;
  value: number;
  icon: string;
  href: string;
}) {
  return (
    <Link href={href} className="glass rounded-xl p-6 hover:bg-(--card-hover) transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-(--muted)">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </Link>
  );
}
