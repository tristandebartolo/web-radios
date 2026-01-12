'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export function UserMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (status === 'loading') {
    return (
      <div className="w-8 h-8 rounded-full bg-(--secondary) animate-pulse" />
    );
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="px-4 py-2 text-sm font-medium text-(--foreground) hover:text-(--primary) transition-colors"
        >
          Connexion
        </Link>
        <Link
          href="/register"
          className="px-4 py-2 text-sm font-medium bg-(--primary) text-white rounded-lg hover:bg-(--primary-hover) transition-colors"
        >
          Inscription
        </Link>
      </div>
    );
  }

  const isAdmin = session.user.role === 'ADMIN';
  const initials = session.user.name
    ? session.user.name.slice(0, 2).toUpperCase()
    : session.user.email.slice(0, 2).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-lg hover:bg-(--secondary) transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-(--primary) flex items-center justify-center text-white text-sm font-medium">
          {initials}
        </div>
        <svg
          className={`w-4 h-4 text-(--muted) transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl glass shadow-xl py-1 z-50 animate-slide-up">
          <div className="px-4 py-3 border-b border-(--border)">
            <p className="text-sm font-medium truncate">{session.user.name || 'Utilisateur'}</p>
            <p className="text-xs text-(--muted) truncate">{session.user.email}</p>
            {isAdmin && (
              <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-(--primary)/20 text-(--primary) rounded-full">
                Admin
              </span>
            )}
          </div>

          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-(--foreground) hover:bg-(--secondary) transition-colors"
            >
              Mon profil
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-sm text-(--foreground) hover:bg-(--secondary) transition-colors"
              >
                Administration
              </Link>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full text-left px-4 py-2 text-sm text-(--error) hover:bg-(--secondary) transition-colors"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
