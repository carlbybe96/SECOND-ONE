import { AlertTriangle, CircleAlert, Info, OctagonAlert } from "lucide-react";
import type { Profile, Report } from "@/lib/types";

const RISK: Record<Report["priority"], { label: string; cls: string; icon: typeof Info }> = {
  low: { label: "Faible", cls: "badge-gray", icon: Info },
  medium: { label: "Moyen", cls: "badge-amber", icon: CircleAlert },
  high: { label: "Élevé", cls: "badge-red", icon: AlertTriangle },
  critical: { label: "Critique", cls: "badge-red strong", icon: OctagonAlert },
};

export function RiskBadge({ risk }: { risk: Report["priority"] }) {
  const r = RISK[risk];
  return (
    <span className={`badge ${r.cls}`}>
      <r.icon size={12} /> Risque {r.label.toLowerCase()}
    </span>
  );
}

const STATUS: Record<Profile["status"], { label: string; cls: string }> = {
  pending: { label: "En attente", cls: "badge-amber" },
  approved: { label: "Actif", cls: "badge-green" },
  rejected: { label: "Refusé", cls: "badge-gray" },
  suspended: { label: "Suspendu", cls: "badge-red" },
  banned: { label: "Banni", cls: "badge-red strong" },
};

export function StatusBadge({ status }: { status: Profile["status"] }) {
  const s = STATUS[status];
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}
