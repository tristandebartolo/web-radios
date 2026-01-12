"use client";

import { useEffect, useRef } from "react";
import {
  useCookieConsent,
  cookieCategories,
  type CookieCategory,
} from "@/hooks/useCookieConsent";

type CookieModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function CookieModal({ isOpen, onClose }: CookieModalProps) {
  const { consent, setCategory, acceptAll, rejectAll } = useCookieConsent();
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = Object.entries(cookieCategories) as [
    CookieCategory,
    (typeof cookieCategories)[CookieCategory]
  ][];

  const handleAcceptAll = () => {
    acceptAll();
    onClose();
  };

  const handleRejectAll = () => {
    rejectAll();
    onClose();
  };

  const handleSavePreferences = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Paramètres des cookies
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="Fermer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
            Gérez vos préférences de cookies. Les cookies requis sont
            nécessaires au fonctionnement du site et ne peuvent pas être
            désactivés.
          </p>

          <div className="space-y-4">
            {categories.map(([key, category]) => (
              <div
                key={key}
                className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                        {category.label}
                      </h3>
                      {category.required && (
                        <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                          Requis
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {category.description}
                    </p>
                  </div>

                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={consent[key]}
                      onChange={() => setCategory(key, !consent[key])}
                      disabled={category.required}
                      className="peer sr-only"
                    />
                    <div
                      className={`h-6 w-11 rounded-full transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2 dark:peer-focus:ring-offset-zinc-900 ${
                        consent[key]
                          ? "bg-blue-600"
                          : "bg-zinc-300 dark:bg-zinc-600"
                      } ${
                        category.required
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer"
                      }`}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 border-t border-zinc-200 px-6 py-4 dark:border-zinc-700 sm:flex-row sm:justify-between">
          <div className="flex gap-2">
            <button
              onClick={handleRejectAll}
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800 sm:flex-none"
            >
              Tout refuser
            </button>
            <button
              onClick={handleAcceptAll}
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800 sm:flex-none"
            >
              Tout accepter
            </button>
          </div>
          <button
            onClick={handleSavePreferences}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
