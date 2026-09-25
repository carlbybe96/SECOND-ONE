"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";

/** Barre d'inscription fixe en bas de l'écran (téléphone). `after` : n'apparaît qu'après ce défilement, pour ne pas doubler le bouton du haut de page. */
export default function MobileCta({ after = 0 }: { after?: number }) {
  const show = useSyncExternalStore(
    (notify) => {
      window.addEventListener("scroll", notify, { passive: true });
      return () => window.removeEventListener("scroll", notify);
    },
    () => after <= 0 || window.scrollY > after,
    () => after <= 0,
  );

  // Quand le grand bandeau d'appel final est à l'écran, la barre fixe ferait doublon : on la range.
  const [overFinal, setOverFinal] = useState(false);
  useEffect(() => {
    const el = document.querySelector(".l-final");
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setOverFinal(entry.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className={`l-mobile-cta${show && !overFinal ? " show" : ""}`}>
      <Link href="/register" className="btn btn-primary btn-block">
        Créer mon profil gratuitement <ArrowRight size={16} />
      </Link>
    </div>
  );
}
