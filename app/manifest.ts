import type { MetadataRoute } from "next";
import { APP } from "@/lib/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP.name} · Rencontres sérieuses`,
    short_name: APP.name,
    description: APP.promise,
    lang: "fr",
    start_url: "/home",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6faf8",
    theme_color: "#00a575",
    categories: ["lifestyle", "social"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
