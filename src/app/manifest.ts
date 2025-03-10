import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Smart Portfolio",
    short_name: "Smart Portfolio",
    description: "A decentralized portfolio management app",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: '/SmartPortfolioMobile.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
  }
}