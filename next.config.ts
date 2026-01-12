import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Configuration des images distantes pour les logos des radios
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Exclusion de better-sqlite3 du bundling webpack (module natif)
  serverExternalPackages: ['better-sqlite3'],

  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
           // === PARTIE CRITIQUE POUR RÉSOUDRE LE PROBLÈME localhost ===
          {
            key: 'X-Forwarded-Proto',
            value: 'https', // Force https (ton domaine est en HTTPS)
          },
          {
            key: 'X-Forwarded-Host',
            value: 'radios.tissudemensonges.fr', // Ton domaine exact
          },
          // Optionnel mais souvent utile
          // {
          //   key: 'X-Forwarded-For',
          //   value: '127.0.0.1', // ou laisser vide / dynamique si possible
          // },
        ],
      },
    ];
  },
};

export default nextConfig;
