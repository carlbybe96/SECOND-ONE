import Link from "next/link";
import { APP } from "@/lib/config";

/** Deux alliances entrelacées : le mariage, sans symbole religieux particulier. */
export function LogoMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} aria-hidden="true">
      <circle cx="9" cy="13.4" r="5.6" />
      <circle cx="15" cy="10.6" r="5.6" />
    </svg>
  );
}

export default function Logo({ light = false, href = "/", compact = false }: { light?: boolean; href?: string; compact?: boolean }) {
  return (
    <Link href={href} className={`logo${light ? " light" : ""}`} aria-label={`${APP.name}, accueil`}>
      <span className="logo-mark">
        <LogoMark />
      </span>
      {!compact && <span>{APP.name}</span>}
    </Link>
  );
}
