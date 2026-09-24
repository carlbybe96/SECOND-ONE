"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import DemoBanner from "@/components/demo-banner";
import Logo from "@/components/logo";
import { NAV } from "./nav";

export default function MarketingHeader() {
  const [navOpen, setNavOpen] = useState(false);
  const path = usePathname();

  return (
    <>
      <DemoBanner />
      <header className="l-header">
        <nav className="l-nav">
          <Logo />
          <ul className={`l-links${navOpen ? " open" : ""}`} onClick={() => setNavOpen(false)}>
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={path === item.href ? "active" : undefined}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="l-cta">
            <Link href="/login" className="btn btn-ghost btn-sm">
              Se connecter
            </Link>
            <Link href="/register" className="btn btn-primary btn-sm">
              Créer mon profil
            </Link>
            <button type="button" className="icon-btn plain l-burger" onClick={() => setNavOpen((o) => !o)} aria-label="Menu" aria-expanded={navOpen}>
              {navOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
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
