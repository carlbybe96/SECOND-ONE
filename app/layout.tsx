import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
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
    default: "FaithMatch — Rencontres par compatibilité religieuse",
    template: "%s · FaithMatch",
  },
  description:
    "La plateforme matrimoniale pensée pour les personnes qui recherchent une relation sérieuse et compatible : foi, valeurs et projet de vie. Lancement à Ouagadougou.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${manrope.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}