import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Open Ethiopia Map — The Open-Source Geospatial & Routing Authority",
  description:
    "High-performance OSRM turn-by-turn routing, multi-source geocoding, and hardware-accelerated MapLibre GL map tiles for Ethiopia. Zero vendor lock-in.",
  keywords: [
    "Ethiopia map",
    "Addis Ababa routing",
    "MapLibre Ethiopia",
    "OSRM Ethiopia",
    "Ethiopian geocoding",
    "reverse geocode Addis Ababa",
    "open source GIS",
    "Ethiopia logistics",
  ],
  authors: [{ name: "Open Ethiopia Map Contributors" }],
  openGraph: {
    title: "Open Ethiopia Map — The Open-Source Geospatial & Routing Authority",
    description:
      "High-performance turn-by-turn routing, place search, and MapLibre map tiles for Ethiopia. Zero Google Maps fees.",
    url: "https://open-ethiopia-map-isf6.vercel.app",
    siteName: "Open Ethiopia Map",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Open Ethiopia Map — Open Geospatial Platform",
    description:
      "High-performance turn-by-turn routing, place search, and MapLibre map tiles for Ethiopia.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
