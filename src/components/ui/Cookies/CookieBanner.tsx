"use client";

import { useCookieConsent } from "@/hooks/useCookieConsent";

type CookieBannerProps = {
  onOpenSettings: () => void;
};

export function CookieBanner({ onOpenSettings }: CookieBannerProps) {
  const { hasConsented, acceptAll, rejectAll } = useCookieConsent();

  if (hasConsented) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 left-0 z-50 p-4 md:p-6 w-full">
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-lg dark:border-zinc-700 dark:bg-zinc-900 md:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Gestion des cookies
            </h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Nous utilisons des cookies pour améliorer votre expérience. Vous
              pouvez personnaliser vos préférences ou accepter tous les cookies.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              onClick={onOpenSettings}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Personnaliser
            </button>
            <button
              onClick={rejectAll}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Refuser tout
            </button>
            <button
              onClick={acceptAll}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Accepter tout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
