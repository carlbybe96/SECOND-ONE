import { WEST_AFRICA, religionLabel } from "./config";
import { CATEGORIES, QUIZ, answerSimilarity, type QuizCategory } from "./questions";
import type { Compat, FamilyProject, Profile } from "./types";

/* ── Niveau 1 : filtres stricts (PRD §15) ───────────────── */

function ageOk(p: Profile, other: Profile) {
  return other.age >= p.prefs.ageMin && other.age <= p.prefs.ageMax;
}

function religionOk(p: Profile, other: Profile) {
  if (p.prefs.religion === "exact") return p.religion.key === other.religion.key && p.religion.branch === other.religion.branch;
  if (p.prefs.religion === "same") return p.religion.key === other.religion.key;
  return true;
}

function practiceOk(p: Profile, other: Profile) {
  if (p.prefs.practice === "same") return Math.abs(p.religion.practice - other.religion.practice) <= 1;
  if (p.prefs.practice === "more") return other.religion.practice <= p.religion.practice;
  return true;
}

function maritalOk(p: Profile, other: Profile) {
  return p.prefs.marital.length === 0 || p.prefs.marital.includes(other.marital);
}

function childrenOk(p: Profile, other: Profile) {
  return p.prefs.acceptsChildren || other.children === 0;
}

function locationOk(p: Profile, other: Profile) {
  if (p.prefs.location === "city") return p.city === other.city;
  if (p.prefs.location === "country") return p.country === other.country;
  return true;
}

export type FilterReason = "gender" | "age" | "religion" | "practice" | "marital" | "children" | "location";

/** Renvoie la raison d'exclusion, ou null si les deux profils peuvent se voir. */
export function hardFilter(me: Profile, other: Profile): FilterReason | null {
  if (me.gender === other.gender) return "gender";
  if (!ageOk(me, other) || !ageOk(other, me)) return "age";
  if (!religionOk(me, other) || !religionOk(other, me)) return "religion";
  if (!practiceOk(me, other) || !practiceOk(other, me)) return "practice";
  if (!maritalOk(me, other) || !maritalOk(other, me)) return "marital";
  if (!childrenOk(me, other) || !childrenOk(other, me)) return "children";
  if (!locationOk(me, other)) return "location";
  return null;
}

/* ── Niveau 2 : score pondéré ───────────────────────────── */

const KIDS: Record<FamilyProject["kids"], Record<FamilyProject["kids"], number>> = {
  oui: { oui: 1, deja: 0.8, non: 0, indecis: 0.6 },
  deja: { oui: 0.8, deja: 0.9, non: 0.5, indecis: 0.6 },
  non: { oui: 0, deja: 0.5, non: 1, indecis: 0.5 },
  indecis: { oui: 0.6, deja: 0.6, non: 0.5, indecis: 0.7 },
};

const ORD3 = { elargie: 0, proximite: 1, non: 2, tres: 0, importante: 1, mesuree: 2, oui: 0, choix: 1 } as const;

function sim3(a: number, b: number) {
  return 1 - Math.abs(a - b) / 2;
}

/** Moyenne pondérée des réponses communes d'une catégorie ; null si aucune réponse commune. */
function quizScore(a: Profile, b: Profile, cat: QuizCategory): number | null {
  let sum = 0;
  let w = 0;
  for (const q of QUIZ) {
    if (q.cat !== cat) continue;
    const x = a.answers[q.id];
    const y = b.answers[q.id];
    if (x === undefined || y === undefined) continue;
    const weight = q.weight ?? 1;
    sum += answerSimilarity(q, x, y) * weight;
    w += weight;
  }
  return w ? sum / w : null;
}

/** Mélange des sous-scores ; les valeurs null (pas encore répondu) sont ignorées. */
function blend(parts: [number | null, number][]): number {
  let sum = 0;
  let w = 0;
  for (const [v, weight] of parts) {
    if (v === null) continue;
    sum += v * weight;
    w += weight;
  }
  return w ? sum / w : 0.6;
}

function distanceScore(a: Profile, b: Profile) {
  if (a.city === b.city && a.country === b.country) return 1;
  if (a.country === b.country) return 0.8;
  const aw = WEST_AFRICA.includes(a.country);
  const bw = WEST_AFRICA.includes(b.country);
  let s = aw && bw ? 0.55 : aw || bw ? 0.4 : 0.6;
  if (a.family.relocate === "oui" || b.family.relocate === "oui") s += 0.2;
  return Math.min(1, s);
}

/** Croise « souhaites-tu travailler ? » de l'un avec « ton conjoint pourra-t-il travailler ? » de l'autre. */
function workCross(a: Profile, b: Profile): number | null {
  const scores: number[] = [];
  if (b.answers.v2 !== undefined) scores.push(sim3(ORD3[a.family.work], b.answers.v2));
  if (a.answers.v2 !== undefined) scores.push(sim3(ORD3[b.family.work], a.answers.v2));
  return scores.length ? scores.reduce((x, y) => x + y, 0) / scores.length : null;
}

function labelFor(score: number): Pick<Compat, "label" | "tone"> {
  if (score >= 95) return { label: "Compatibilité exceptionnelle", tone: "top" };
  if (score >= 85) return { label: "Excellente compatibilité", tone: "great" };
  if (score >= 70) return { label: "Bonne compatibilité", tone: "good" };
  if (score >= 50) return { label: "Compatibilité moyenne", tone: "mid" };
  return { label: "Compatibilité faible", tone: "low" };
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const UNION_DIFF = "Vision différente du type d'union";

export function compatibility(a: Profile, b: Profile): Compat {
  const sameRel = a.religion.key === b.religion.key;
  const sameBranch = sameRel && a.religion.branch === b.religion.branch;
  const relBase = sameRel ? (sameBranch ? 1 : 0.85) : a.religion.key === "autre" || b.religion.key === "autre" ? 0.4 : 0.15;
  const practiceSim = 1 - Math.abs(a.religion.practice - b.religion.practice) / 3;

  const wants = (k: FamilyProject["kids"]) => k === "oui" || k === "deja";
  const bothWantKids = wants(a.family.kids) && wants(b.family.kids);
  const kids = KIDS[a.family.kids][b.family.kids];
  const kidsCount = bothWantKids ? 1 - Math.abs(a.family.kidsCount - b.family.kidsCount) / 3 : 1;

  const raw: Record<string, number> = {
    religion: blend([
      [relBase, 0.4],
      [practiceSim, 0.25],
      [quizScore(a, b, "religion"), 0.35],
    ]),
    valeurs: blend([
      [quizScore(a, b, "valeurs"), 0.75],
      [workCross(a, b), 0.25],
    ]),
    couple: blend([[quizScore(a, b, "couple"), 1]]),
    famille: blend([
      [sim3(ORD3[a.family.parents], ORD3[b.family.parents]), 0.2],
      [sim3(ORD3[a.family.importance], ORD3[b.family.importance]), 0.2],
      [quizScore(a, b, "famille"), 0.6],
    ]),
    enfants: blend([
      [kids, 0.45],
      [kidsCount, 0.15],
      [quizScore(a, b, "enfants"), 0.4],
    ]),
    finances: blend([[quizScore(a, b, "finances"), 1]]),
    lifestyle: blend([[quizScore(a, b, "lifestyle"), 1]]),
    distance: distanceScore(a, b),
  };

  let total = 0;
  let weights = 0;
  for (const c of CATEGORIES) {
    total += raw[c.key] * c.weight;
    weights += c.weight;
  }
  let score = (total / weights) * 100;

  /* Points bloquants : pénalité et mention en tête des points à discuter */
  const discuss: string[] = [];
  if (kids === 0) {
    score *= 0.82;
    discuss.push("Projet d'enfants différent");
  }
  const v3a = a.answers.v3;
  const v3b = b.answers.v3;
  if (v3a !== undefined && v3b !== undefined && Math.abs(v3a - v3b) === 2) {
    score *= 0.82;
    discuss.push(UNION_DIFF);
  }
  if (!sameRel) discuss.push("Religions différentes");

  /* Points forts : d'abord les critères structurants, puis les réponses identiques */
  const strengths: string[] = [];
  if (sameRel) {
    const branch = sameBranch ? ` (${a.religion.branch.split(" (")[0]})` : "";
    strengths.push(`Même foi : ${religionLabel(a.religion.key)}${branch}`);
  }
  if (a.religion.practice === b.religion.practice) strengths.push("Même niveau de pratique religieuse");
  if (a.family.kids === "oui" && b.family.kids === "oui") {
    strengths.push(
      a.family.kidsCount === b.family.kidsCount
        ? "Vous voulez tous les deux des enfants, et autant"
        : "Vous voulez tous les deux des enfants",
    );
  }
  if (a.city === b.city && a.country === b.country) strengths.push(`Vous vivez tous les deux à ${a.city}`);

  const catWeight: Record<string, number> = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.weight]));
  const answered = QUIZ.filter((q) => a.answers[q.id] !== undefined && b.answers[q.id] !== undefined)
    .map((q) => ({ q, s: answerSimilarity(q, a.answers[q.id], b.answers[q.id]) }))
    .sort((x, y) => catWeight[y.q.cat] * (y.q.weight ?? 1) - catWeight[x.q.cat] * (x.q.weight ?? 1));

  for (const { q, s } of answered) {
    if (strengths.length >= 5) break;
    if (s === 1 && q.cat !== "religion") strengths.push(`Alignés sur ${q.topic}`);
  }
  for (const { q, s } of answered) {
    if (discuss.length >= 3) break;
    if (s > 0.35) continue;
    if (q.id === "v3" && discuss.includes(UNION_DIFF)) continue;
    discuss.push(cap(q.topic));
  }

  const final = Math.max(0, Math.min(100, Math.round(score)));
  return {
    score: final,
    ...labelFor(final),
    categories: CATEGORIES.map((c) => ({ key: c.key, label: c.label, score: Math.round(raw[c.key] * 100) })),
    strengths,
    discuss,
  };
}
