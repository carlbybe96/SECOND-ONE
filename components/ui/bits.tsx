import { BadgeCheck, Crown, type LucideIcon } from "lucide-react";
import type { Profile } from "@/lib/types";

export function Empty({ icon: Icon, title, text, children }: { icon: LucideIcon; title: string; text?: string; children?: React.ReactNode }) {
  return (
    <div className="empty">
      <div className="e-ico">
        <Icon size={28} />
      </div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}

export function Verified({ profile, withLabel = false }: { profile: Pick<Profile, "verification">; withLabel?: boolean }) {
  if (profile.verification.photo !== "verified") return null;
  return withLabel ? (
    <span className="badge badge-green" title="Selfie de vérification validé par l'équipe">
      <BadgeCheck size={13} /> Profil vérifié
    </span>
  ) : (
    <BadgeCheck size={17} color="var(--primary)" aria-label="Profil vérifié" style={{ flexShrink: 0 }} />
  );
}

export function PremiumBadge({ plan }: { plan: Profile["plan"] }) {
  if (plan === "free") return null;
  return (
    <span className="badge badge-gold">
      <Crown size={12} /> {plan === "premium_plus" ? "Premium+" : "Premium"}
    </span>
  );
}

export function Skeleton({ h = 120, w = "100%", r = 14 }: { h?: number; w?: number | string; r?: number }) {
  return <div className="skeleton" style={{ height: h, width: w, borderRadius: r }} />;
}
