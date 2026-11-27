import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BBS Connect — Téléphones et accessoires à Dakar",
    short_name: "BBS Connect",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#121315",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
