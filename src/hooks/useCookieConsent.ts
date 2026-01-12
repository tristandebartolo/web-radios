"use client";

import { useSyncExternalStore, useCallback } from "react";

export type CookieCategory = "required" | "analytics";

export type CookieConsent = {
  required: boolean; // Always true, cannot be changed
  analytics: boolean;
  // facebook: boolean;
  // youtube: boolean;
  consented: boolean; // Has the user made a choice?
};

const STORAGE_KEY = "cookie-consent-radio";

const defaultConsent: CookieConsent = {
  required: true,
  analytics: false,
  // facebook: false,
  // youtube: false,
  consented: false,
};

let cachedConsent: CookieConsent = defaultConsent;

function getSnapshot(): CookieConsent {
  if (typeof window === "undefined") return defaultConsent;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (JSON.stringify(parsed) !== JSON.stringify(cachedConsent)) {
        cachedConsent = { ...defaultConsent, ...parsed, required: true };
      }
    } catch {
      cachedConsent = defaultConsent;
    }
  }
  return cachedConsent;
}

function getServerSnapshot(): CookieConsent {
  return defaultConsent;
}

let listeners: Array<() => void> = [];

function subscribe(callback: () => void): () => void {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

function emitChange() {
  listeners.forEach((l) => l());
}

export const cookieCategories: Record<
  CookieCategory,
  { label: string; description: string; required: boolean }
> = {
  required: {
    label: "Cookies requis",
    description:
      "Ces cookies sont essentiels au fonctionnement du site. Ils permettent de mémoriser vos préférences (thème, favoris, voix).",
    required: true,
  },
  analytics: {
    label: "Cookies analytiques",
    description:
      "Ces cookies nous aident à comprendre comment les visiteurs utilisent le site pour améliorer l'expérience.",
    required: false,
  },
  // facebook: {
  //   label: "Facebook",
  //   description:
  //     "Ces cookies permettent d'intégrer des fonctionnalités de partage Facebook et de suivre les interactions.",
  //   required: false,
  // },
  // youtube: {
  //   label: "YouTube",
  //   description:
  //     "Ces cookies permettent d'intégrer des vidéos YouTube et de suivre les interactions avec le lecteur.",
  //   required: false,
  // },
};

export function useCookieConsent() {
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const updateConsent = useCallback((updates: Partial<CookieConsent>) => {
    const current = getSnapshot();
    const newConsent: CookieConsent = {
      ...current,
      ...updates,
      required: true, // Always true
      consented: true,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConsent));
    cachedConsent = newConsent;
    emitChange();
  }, []);

  const acceptAll = useCallback(() => {
    updateConsent({
      analytics: true,
      // facebook: true,
      // youtube: true,
    });
  }, [updateConsent]);

  const rejectAll = useCallback(() => {
    updateConsent({
      analytics: false,
      // facebook: false,
      // youtube: false,
    });
  }, [updateConsent]);

  const toggleCategory = useCallback(
    (category: CookieCategory) => {
      if (category === "required") return; // Cannot toggle required
      const current = getSnapshot();
      updateConsent({
        [category]: !current[category],
      });
    },
    [updateConsent]
  );

  const setCategory = useCallback(
    (category: CookieCategory, value: boolean) => {
      if (category === "required") return;
      updateConsent({
        [category]: value,
      });
    },
    [updateConsent]
  );

  return {
    consent,
    updateConsent,
    acceptAll,
    rejectAll,
    toggleCategory,
    setCategory,
    hasConsented: consent.consented,
  };
}
