'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ProfileFormProps {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: string;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Validate passwords if changing
    if (newPassword || confirmPassword) {
      if (!currentPassword) {
        setError('Mot de passe actuel requis pour changer de mot de passe');
        setIsLoading(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Les nouveaux mots de passe ne correspondent pas');
        setIsLoading(false);
        return;
      }
      if (newPassword.length < 6) {
        setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
        setIsLoading(false);
        return;
      }
    }

    try {
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || null,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erreur lors de la mise à jour');
        return;
      }

      setSuccess('Profil mis à jour avec succès');
      router.refresh();
    } catch {
      setError('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-(--error)/10 border border-(--error)/20 text-(--error) text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-(--success)/10 border border-(--success)/20 text-(--success) text-sm">
          {success}
        </div>
      )}

      {/* Info section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Informations</h2>

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
          placeholder="Votre nom"
          defaultValue={user.name || ''}
        />

        <div className="flex items-center gap-2">
          <span className="text-sm text-(--muted)">Rôle :</span>
          <span className={`px-2 py-0.5 text-xs rounded-full ${
            user.role === 'ADMIN'
              ? 'bg-(--primary)/20 text-(--primary)'
              : 'bg-(--secondary) text-(--muted)'
          }`}>
            {user.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
          </span>
        </div>
      </div>

      {/* Password section */}
      <div className="space-y-4 pt-6 border-t border-(--border)">
        <h2 className="text-lg font-semibold">Changer le mot de passe</h2>
        <p className="text-sm text-(--muted)">
          Laissez vide si vous ne souhaitez pas changer de mot de passe
        </p>

        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          label="Mot de passe actuel"
          placeholder="••••••••"
          autoComplete="current-password"
        />

        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          label="Nouveau mot de passe"
          placeholder="••••••••"
          autoComplete="new-password"
        />

        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirmer le nouveau mot de passe"
          placeholder="••••••••"
          autoComplete="new-password"
        />
      </div>

      <div className="pt-4">
        <Button type="submit" isLoading={isLoading}>
          Enregistrer les modifications
        </Button>
      </div>
    </form>
  );
}
