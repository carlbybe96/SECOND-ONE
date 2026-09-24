import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { APP } from "@/lib/config";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${APP.name} · Rencontres sérieuses par compatibilité`,
    template: `%s · ${APP.name}`,
  },
  description:
    "La plateforme matrimoniale pour les personnes qui cherchent une relation sérieuse : foi, valeurs et projet de vie. Profils vérifiés, messagerie modérée, paiement Mobile Money.",
  applicationName: APP.name,
  appleWebApp: { capable: true, title: APP.name, statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#00a575",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-scroll-behavior : Next 16 ne neutralise plus le défilement fluide pendant les navigations.
    <html lang="fr" data-scroll-behavior="smooth" className={`${inter.variable} ${manrope.variable}`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
