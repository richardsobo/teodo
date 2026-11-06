import type { MetadataRoute } from "next";

/** PWA manifest – vrátane „Zdieľať → Teodo“ na Androide (share_target). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Teodo – sledovanie cien inzerátov",
    short_name: "Teodo",
    description: "Sleduj ceny inzerátov z bazárov a dostaň upozornenie, keď zlacnejú.",
    lang: "sk",
    start_url: "/prehlad",
    display: "standalone",
    background_color: "#101217",
    theme_color: "#101217",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    share_target: {
      action: "/pridat",
      method: "GET",
      params: { title: "title", text: "text", url: "url" },
    },
  } as MetadataRoute.Manifest;
}
