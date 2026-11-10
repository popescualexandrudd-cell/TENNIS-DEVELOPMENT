import type { MetadataRoute } from 'next'

/** Manifest web: nume, culori și iconițe pentru „Adaugă pe ecranul principal”. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Daniel Popescu — antrenor de tenis',
    short_name: 'Daniel Popescu',
    start_url: '/ro',
    display: 'browser',
    background_color: '#F4F7FB',
    theme_color: '#1C2633',
    lang: 'ro',
    icons: [
      { src: '/brand/dp-monogram.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/brand/icon-192.png', type: 'image/png', sizes: '192x192' },
      { src: '/brand/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
  }
}
