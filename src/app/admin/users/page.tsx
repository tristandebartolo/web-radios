import { Metadata } from 'next';
import prisma from '@/lib/db/prisma';
import { UsersList } from '@/components/admin/UsersList';

export const metadata: Metadata = {
  title: 'Gestion des utilisateurs',
};

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold gradient-text">Utilisateurs</h1>
        <span className="text-(--muted)">{users.length} utilisateur(s)</span>
      </div>

      <UsersList users={users} />
    </div>
  );
}
