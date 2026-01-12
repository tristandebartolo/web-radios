"use client";

import { useState, useEffect, useCallback } from "react";
import { CookieBanner } from "@/components/ui/Cookies/CookieBanner";
import { CookieModal } from "@/components/ui/Cookies/CookieModal";

export function CookieConsent() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const checkHash = useCallback(() => {
    if (typeof window !== "undefined" && window.location.hash === "#cookies") {
      setIsModalOpen(true);
      // Remove hash from URL without scrolling
      history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  // Check for #cookies hash on mount
  useEffect(() => {
    checkHash();
  }, [checkHash]);

  // Listen for hash changes (including clicks on #cookies links)
  useEffect(() => {
    const handleHashChange = () => {
      checkHash();
    };

    // Listen for hashchange event
    window.addEventListener("hashchange", handleHashChange);

    // Also listen for clicks on links with #cookies href
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href="#cookies"]');
      if (link) {
        e.preventDefault();
        setIsModalOpen(true);
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      document.removeEventListener("click", handleClick);
    };
  }, [checkHash]);

  const handleOpenSettings = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <CookieBanner onOpenSettings={handleOpenSettings} />
      <CookieModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
}
