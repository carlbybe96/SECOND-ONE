"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import DemoBanner from "@/components/demo-banner";
import Logo from "@/components/logo";
import { NAV } from "./nav";

export default function MarketingHeader() {
  // Le menu se referme tout seul dès que la page change (openFor n'est plus égal à la page courante).
  const [openFor, setOpenFor] = useState<string | null>(null);
  const path = usePathname();
  const navOpen = openFor === path;
  const close = () => setOpenFor(null);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenFor(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen]);

  return (
    <>
      <DemoBanner />
      <header className="l-header">
        <nav className="l-nav" aria-label="Navigation principale">
          <Logo />
          <ul id="l-menu" className={`l-links${navOpen ? " open" : ""}`} onClick={close}>
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={path === item.href ? "active" : undefined}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="l-links-cta l-links-login">
              <Link href="/login" className="btn btn-outline btn-block">
                Se connecter
              </Link>
            </li>
            <li className="l-links-cta">
              <Link href="/register" className="btn btn-primary btn-block">
                Créer mon profil gratuitement
              </Link>
            </li>
          </ul>
          <div className="l-cta">
            <Link href="/login" className="btn btn-ghost btn-sm l-cta-login">
              <span className="hide-sm">Se connecter</span>
              <span className="only-sm">Connexion</span>
            </Link>
            <Link href="/register" className="btn btn-primary btn-sm l-cta-main">
              Créer mon profil
            </Link>
            <button
              type="button"
              className="icon-btn plain l-burger"
              onClick={() => setOpenFor(navOpen ? null : path)}
              aria-label={navOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={navOpen}
              aria-controls="l-menu"
            >
              {navOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
        {navOpen && <button type="button" className="l-scrim" aria-label="Fermer le menu" tabIndex={-1} onClick={close} />}
      </header>
    </>
  );
}

/** Bandeau d'intro pour les pages dédiées (tout sauf la page d'accueil elle-même). */
export function TopicHero({ eyebrow, title, lead }: { eyebrow: string; title: string; lead: string }) {
  return (
    <section className="topic-hero">
      <div className="l-wrap">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{lead}</p>
      </div>
    </section>
  );
}
