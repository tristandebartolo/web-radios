'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erreur lors de l\'inscription');
        return;
      }

      // Auto-login après inscription
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        router.push('/login');
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-(--error)/10 border border-(--error)/20 text-(--error) text-sm">
          {error}
        </div>
      )}

      <Input
        id="name"
        name="name"
        type="text"
        label="Nom"
        placeholder="Votre nom"
        required
        autoComplete="name"
      />

      <Input
        id="email"
        name="email"
        type="email"
        label="Email"
        placeholder="vous@exemple.com"
        required
        autoComplete="email"
      />

      <Input
        id="password"
        name="password"
        type="password"
        label="Mot de passe"
        placeholder="••••••••"
        required
        autoComplete="new-password"
        minLength={6}
      />

      <Input
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        label="Confirmer le mot de passe"
        placeholder="••••••••"
        required
        autoComplete="new-password"
      />

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Créer un compte
      </Button>
    </form>
  );
}
