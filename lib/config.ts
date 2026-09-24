/**
 * Configuration centrale de l'application.
 * Pour rebrander la démo au nom d'un client : changer APP (nom, slogan, contact)
 * et les couleurs dans app/globals.css (bloc :root). Tout le reste suit.
 */

export const APP = {
  name: "FaithMatch",
  tagline: "Pas seulement une rencontre. Une vraie compatibilité.",
  promise: "Trouve quelqu'un qui partage ta foi, tes valeurs et ton projet de vie.",
  market: "Burkina Faso",
  hometown: "Ouagadougou",
  supportEmail: "contact@faithmatch.app",
  year: 2026,
} as const;

/* ── Géographie ─────────────────────────────────────────── */

export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  "Burkina Faso": ["Ouagadougou", "Bobo-Dioulasso", "Koudougou", "Ouahigouya", "Banfora", "Kaya", "Tenkodogo", "Fada N'Gourma"],
  "Côte d'Ivoire": ["Abidjan", "Bouaké", "Yamoussoukro", "San-Pédro"],
  Mali: ["Bamako", "Sikasso", "Ségou"],
  Sénégal: ["Dakar", "Thiès", "Saint-Louis", "Touba"],
  Niger: ["Niamey", "Zinder", "Maradi"],
  Togo: ["Lomé", "Kara"],
  Bénin: ["Cotonou", "Porto-Novo", "Parakou"],
  France: ["Paris", "Lyon", "Marseille", "Lille"],
  Belgique: ["Bruxelles", "Liège"],
  Canada: ["Montréal", "Québec", "Ottawa"],
};

export const COUNTRIES = Object.keys(CITIES_BY_COUNTRY);

/** Pays d'Afrique de l'Ouest (sert au calcul de distance : même région = plus proche). */
export const WEST_AFRICA = ["Burkina Faso", "Côte d'Ivoire", "Mali", "Sénégal", "Niger", "Togo", "Bénin"];

/* ── Religion ───────────────────────────────────────────── */

export type ReligionKey = "islam" | "christianisme" | "autre";

export const RELIGIONS: { key: ReligionKey; label: string; icon: string; branches: string[] }[] = [
  {
    key: "islam",
    label: "Islam",
    icon: "🕌",
    branches: ["Sunnite", "Confrérie soufie (Tidjane, Mouride, Qadiriyya…)", "Chiite", "Autre courant", "Préfère ne pas préciser"],
  },
  {
    key: "christianisme",
    label: "Christianisme",
    icon: "⛪",
    branches: ["Catholique", "Protestant", "Évangélique", "Orthodoxe", "Autre église"],
  },
  {
    key: "autre",
    label: "Autre / sans religion",
    icon: "✨",
    branches: ["Religion traditionnelle", "Judaïsme", "Spiritualité personnelle", "Préfère ne pas préciser"],
  },
];

export const PRACTICE_LEVELS = ["Très pratiquant(e)", "Pratiquant(e)", "Peu pratiquant(e)", "Non pratiquant(e)"];

export function religionLabel(key: ReligionKey): string {
  return RELIGIONS.find((r) => r.key === key)?.label ?? key;
}

/* ── Profil ─────────────────────────────────────────────── */

export const EDUCATION_LEVELS: Record<string, string> = {
  secondaire: "Secondaire",
  bac: "Baccalauréat",
  licence: "Licence (Bac+3)",
  master: "Master (Bac+5)",
  doctorat: "Doctorat",
  pro: "Formation professionnelle",
};

export const MARITAL_LABELS: Record<string, { homme: string; femme: string }> = {
  celibataire: { homme: "Célibataire", femme: "Célibataire" },
  divorce: { homme: "Divorcé", femme: "Divorcée" },
  veuf: { homme: "Veuf", femme: "Veuve" },
};

export const INTENTIONS: Record<string, string> = {
  mariage: "Mariage",
  serieux: "Relation sérieuse menant au mariage",
};

export const LANGUAGES = ["Français", "Mooré", "Dioula", "Fulfuldé", "Wolof", "Bambara", "Gourmantché", "Anglais", "Arabe"];

/* ── Offres & limites ───────────────────────────────────── */

export type PlanKey = "free" | "premium" | "premium_plus";

export const PLANS: Record<PlanKey, { name: string; price: number; tagline: string; features: string[] }> = {
  free: {
    name: "Gratuit",
    price: 0,
    tagline: "Pour commencer sérieusement",
    features: [
      "Profil complet et questionnaire",
      "15 profils recommandés par jour",
      "5 intérêts par jour",
      "Messagerie avec tes matchs",
      "Score de compatibilité global",
    ],
  },
  premium: {
    name: "Premium",
    price: 2500,
    tagline: "Pour multiplier tes chances",
    features: [
      "Profils et intérêts illimités",
      "3 super-intérêts par jour, avec message",
      "Voir qui a visité ton profil",
      "Score détaillé par domaine",
      "Filtres avancés (profils vérifiés…)",
      "Badge Premium",
    ],
  },
  premium_plus: {
    name: "Premium+",
    price: 5000,
    tagline: "L'accompagnement complet",
    features: [
      "Tout Premium",
      "10 super-intérêts par jour",
      "Mode famille : implique ton tuteur (wali)",
      "1 boost de visibilité par semaine",
      "Priorité dans les recommandations",
      "Coach matrimonial",
    ],
  },
};

export const LIMITS: Record<PlanKey, { profilesPerDay: number; interestsPerDay: number; superPerDay: number }> = {
  free: { profilesPerDay: 15, interestsPerDay: 5, superPerDay: 0 },
  premium: { profilesPerDay: Infinity, interestsPerDay: Infinity, superPerDay: 3 },
  premium_plus: { profilesPerDay: Infinity, interestsPerDay: Infinity, superPerDay: 10 },
};

export const BOOST = { price: 500, minutes: 30 };

export const VIP = { priceFrom: 25000, priceTo: 50000 };

export type PayMethod = "orange" | "moov" | "wave" | "card";

export const PAY_METHODS: { key: PayMethod; label: string; color: string; hint: string }[] = [
  { key: "orange", label: "Orange Money", color: "#FF7900", hint: "Tu valides avec ton code secret Orange Money." },
  { key: "moov", label: "Moov Money", color: "#0B5CAB", hint: "Tu valides avec ton code secret Moov Money." },
  { key: "wave", label: "Wave", color: "#1DC3FF", hint: "Tu valides dans l'application Wave." },
  { key: "card", label: "Carte bancaire", color: "#0F172A", hint: "Visa ou Mastercard, paiement sécurisé 3-D Secure." },
];

/* ── Signalement ────────────────────────────────────────── */

export const REPORT_REASONS: Record<string, string> = {
  faux_profil: "Faux profil",
  arnaque: "Arnaque",
  argent: "Demande d'argent",
  harcelement: "Harcèlement",
  contenu_sexuel: "Contenu sexuel",
  offensant: "Contenu offensant",
  usurpation: "Usurpation d'identité",
  autre: "Autre",
};

/* ── Parcours relationnel (PRD §22) ─────────────────────── */

export const STAGES = [
  { icon: "💬", label: "Conversation", short: "Conversation" },
  { icon: "📞", label: "Appel", short: "Appel" },
  { icon: "❤️", label: "Relation sérieuse", short: "Sérieux" },
  { icon: "👨‍👩‍👧", label: "Présentation aux familles", short: "Familles" },
  { icon: "💍", label: "Projet de mariage", short: "Mariage" },
];
