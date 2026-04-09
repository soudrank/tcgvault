import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { hostname: 'images.pokemontcg.io' },
      { hostname: 'assets.tcgdex.net' },
      { hostname: 'storage.googleapis.com' },
      { hostname: 'images.ygoprodeck.com' },
      { hostname: 'optcgapi.com' },
      { hostname: 'en.onepiece-cardgame.com' },
      { hostname: 'www.onepiece-cardgame.com' },
      { hostname: 'mhmnjmohlivtajtmyywm.supabase.co' },
    ],
  },
};

export default nextConfig;
