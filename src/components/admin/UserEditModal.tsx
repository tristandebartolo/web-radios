'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface UserEditModalProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserEditModal({ user, onClose, onSuccess }: UserEditModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const role = formData.get('role') as string;
    const newPassword = formData.get('newPassword') as string;

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || null,
          role,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erreur lors de la mise à jour');
        return;
      }

      onSuccess();
    } catch {
      setError('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md glass rounded-2xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Modifier l&apos;utilisateur</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-(--secondary) rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-(--error)/10 border border-(--error)/20 text-(--error) text-sm">
              {error}
            </div>
          )}

          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            defaultValue={user.email}
            disabled
            className="opacity-60"
          />

          <Input
            id="name"
            name="name"
            type="text"
            label="Nom"
            placeholder="Nom de l'utilisateur"
            defaultValue={user.name || ''}
          />

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-(--foreground) mb-1.5">
              Rôle
            </label>
            <select
              id="role"
              name="role"
              defaultValue={user.role}
              className="w-full px-4 py-2.5 rounded-lg bg-(--secondary) border border-(--border) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent"
            >
              <option value="USER">Utilisateur</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>

          <div className="pt-4 border-t border-(--border)">
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              label="Nouveau mot de passe (optionnel)"
              placeholder="Laisser vide pour ne pas changer"
              autoComplete="new-password"
            />
            <p className="mt-1 text-xs text-(--muted)">
              Minimum 6 caractères
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" isLoading={isLoading} className="flex-1">
              Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
