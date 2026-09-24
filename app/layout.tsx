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
  // iOS transformerait les montants (2.500, 5.000…) en numéros de téléphone cliquables.
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#00a575",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  // Chrome Android : le clavier réduit la page au lieu de la recouvrir (le champ de message reste visible).
  interactiveWidget: "resizes-content",
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
