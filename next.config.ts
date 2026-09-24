import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Le preview webview charge l'app via http://127.0.0.1 — autorisé pour le dev.
  allowedDevOrigins: ["127.0.0.1"],
  // Pas de badge Next.js en bas d'écran : l'app peut être présentée depuis `npm run dev`.
  devIndicators: false,
  // Un package-lock.json traîne dans le dossier utilisateur : on fixe la racine du projet
  // pour que Turbopack ne cherche pas à remonter jusque-là.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
