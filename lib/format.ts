/** Nombre avec un point comme séparateur de milliers (186.000) — jamais toLocaleString. */
export function nombre(n: number | string | null | undefined): string {
  const v = Math.round(Number(n ?? 0)) || 0;
  const signe = v < 0 ? "-" : "";
  return signe + Math.abs(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function fcfa(n: number): string {
  return `${nombre(n)} FCFA`;
}

export function plural(n: number, one: string, many: string): string {
  return `${n} ${n > 1 ? many : one}`;
}

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

/** « à l'instant », « il y a 5 min », « il y a 2 h », « hier », « il y a 3 j », puis la date. */
export function timeAgo(iso: string, now = Date.now()): string {
  const diff = now - new Date(iso).getTime();
  if (diff < MIN) return "à l'instant";
  if (diff < HOUR) return `il y a ${Math.floor(diff / MIN)} min`;
  if (diff < DAY) return `il y a ${Math.floor(diff / HOUR)} h`;
  if (diff < 2 * DAY) return "hier";
  if (diff < 7 * DAY) return `il y a ${Math.floor(diff / DAY)} j`;
  return shortDate(iso);
}

export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function longDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export function timeHM(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Libellé de séparateur dans une conversation : « Aujourd'hui », « Hier », « lundi 22 septembre ». */
export function dayLabel(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const start = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((start(now) - start(d)) / DAY);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

/** Clé de jour locale (AAAA-MM-JJ) pour les quotas quotidiens. */
export function dayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Statut de présence à partir de la dernière activité. */
export function presence(iso: string, gender?: "homme" | "femme", now = Date.now()): { online: boolean; label: string } {
  const diff = now - new Date(iso).getTime();
  if (diff < 5 * MIN) return { online: true, label: "En ligne" };
  const seen = gender === "femme" ? "Vue" : gender === "homme" ? "Vu" : "Vu(e)";
  return { online: false, label: `${seen} ${timeAgo(iso, now)}` };
}

export function capitalize(s: string): string {
  const t = s.trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
}

/** Prénom propre : « aïcha » → « Aïcha », « jean-marc » → « Jean-Marc ». */
export function cleanFirstName(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/(^|[\s-])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase());
}
