import { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Inscription',
};

export default function RegisterPage() {
  return (
    <div className="glass rounded-2xl p-8 animate-slide-up">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Inscription</h1>
        <p className="text-[var(--muted)]">
          Rejoignez WebRadios gratuitement
        </p>
      </div>

      <RegisterForm />

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        Déjà un compte ?{' '}
        <Link
          href="/login"
          className="text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}
