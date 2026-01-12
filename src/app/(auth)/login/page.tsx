import { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Connexion',
};

export default function LoginPage() {
  return (
    <div className="glass rounded-2xl p-8 animate-slide-up">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Connexion</h1>
        <p className="text-(--muted)">
          Accédez à vos radios préférées
        </p>
      </div>

      <LoginForm />

      <p className="mt-6 text-center text-sm text-(--muted)">
        Pas encore de compte ?{' '}
        <Link
          href="/register"
          className="text-(--primary) hover:text-(--primary-hover) font-medium"
        >
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
