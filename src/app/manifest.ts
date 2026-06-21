import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Family Planner',
    short_name: 'Family Planner',
    description: 'Plan your week together as a family.',
    start_url: '/',
    display: 'standalone',
    background_color: '#4F46E5',
    theme_color: '#4F46E5',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
