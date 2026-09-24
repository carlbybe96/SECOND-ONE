import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Le preview webview charge l'app via http://127.0.0.1 — autorisé pour le dev.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;