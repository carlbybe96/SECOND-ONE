import { EDUCATION_LEVELS, MARITAL_LABELS, PRACTICE_LEVELS, religionLabel } from "./config";
import { QUIZ } from "./questions";
import type { Profile } from "./types";

export type Completion = { pct: number; missing: { label: string; href: string }[] };

export function completion(p: Profile): Completion {
  const checks: [boolean, string, string][] = [
    [!!p.profession && p.languages.length > 0, "Compléter tes informations", "/profile"],
    [p.bio.trim().length >= 80, "Enrichir ta présentation (80 caractères)", "/profile"],
    [!!p.photo, "Ajouter une vraie photo", "/profile"],
    [Object.keys(p.answers).length >= QUIZ.length, "Terminer le questionnaire", "/onboarding?step=5"],
    [p.verification.phone === "verified", "Vérifier ton téléphone", "/settings#verification"],
    [p.verification.photo === "verified", "Faire vérifier ton profil (selfie)", "/settings#verification"],
  ];
  const done = checks.filter(([ok]) => ok).length;
  return {
    pct: Math.round((done / checks.length) * 100),
    missing: checks.filter(([ok]) => !ok).map(([, label, href]) => ({ label, href })),
  };
}

/** Question du jour (PRD §21) : change chaque jour, identique pour tout le monde. */
export const DAILY_QUESTIONS = [
  "Quelle est la chose la plus importante que tu recherches dans un mariage ?",
  "Comment imagines-tu un dimanche idéal en famille ?",
  "Quelle place la prière aura-t-elle dans votre foyer ?",
  "Qu'as-tu appris de tes parents sur le couple ?",
  "Comment aimes-tu régler un désaccord ?",
  "Quel rêve aimerais-tu réaliser dans les cinq prochaines années ?",
  "Qu'est-ce qui te fait te sentir respecté(e) ?",
  "Comment vois-tu la gestion de l'argent dans un couple ?",
  "Quelles valeurs veux-tu transmettre à tes enfants ?",
  "Qu'est-ce qui te rend fier ou fière de toi ?",
];

export function dailyQuestion(date = new Date()): string {
  const day = Math.floor(date.getTime() / 86_400_000);
  return DAILY_QUESTIONS[day % DAILY_QUESTIONS.length];
}

/** Idées de premiers messages, par thème (PRD §21). */
export const ICE_BREAKERS: { theme: string; text: string }[] = [
  { theme: "Mariage", text: "Qu'est-ce qui compte le plus pour toi dans un mariage ?" },
  { theme: "Famille", text: "Comment imagines-tu ta future famille ?" },
  { theme: "Foi", text: "Quelle place la foi aura-t-elle dans votre foyer ?" },
  { theme: "Quotidien", text: "À quoi ressemble une journée type pour toi ?" },
  { theme: "Avenir", text: "Où te vois-tu dans cinq ans ?" },
  { theme: "Valeurs", text: "Quelle valeur de tes parents veux-tu transmettre à tes enfants ?" },
];

export function practiceLabel(p: Profile) {
  const label = PRACTICE_LEVELS[p.religion.practice] ?? "";
  return p.gender === "homme" ? label.replace("(e)", "") : label.replace("(e)", "e");
}

export function religionLine(p: Profile) {
  const branch = p.religion.branch && !p.religion.branch.startsWith("Préfère") ? ` · ${p.religion.branch.split(" (")[0]}` : "";
  return `${religionLabel(p.religion.key)}${branch}`;
}

export function maritalLabel(p: Profile) {
  return MARITAL_LABELS[p.marital]?.[p.gender] ?? p.marital;
}

export function educationLabel(p: Profile) {
  return EDUCATION_LEVELS[p.education] ?? p.education;
}

export function childrenLabel(p: Profile) {
  if (p.children === 0) return "Pas d'enfant";
  return p.children === 1 ? "1 enfant" : `${p.children} enfants`;
}

export function kidsProjectLabel(p: Profile) {
  const k = p.family.kids;
  if (k === "oui") return `Veut des enfants (${p.family.kidsCount >= 4 ? "4 ou plus" : p.family.kidsCount})`;
  if (k === "deja") return "A des enfants, en veut encore";
  if (k === "non") return "Ne souhaite pas d'enfants";
  return "Ne sait pas encore pour les enfants";
}
