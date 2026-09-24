export type QuizCategory = "religion" | "valeurs" | "couple" | "famille" | "enfants" | "finances" | "lifestyle";

export type QuizQuestion = {
  id: string;
  cat: QuizCategory;
  q: string;
  options: string[];
  /** scale = options ordonnées (distance entre réponses), choice = choix sans ordre. */
  kind: "scale" | "choice";
  /** Option « peu importe » compatible avec toutes les autres. */
  wildcard?: number;
  weight?: number;
  /** Un écart maximal sur cette question pénalise fortement le score global. */
  dealbreaker?: boolean;
  /** Sujet, pour les phrases « Vous êtes alignés sur … » / « À discuter : … ». */
  topic: string;
};

/** Pondération PRD §15 (sur 100). La distance est calculée à part. */
export const CATEGORIES: { key: QuizCategory | "distance"; label: string; weight: number }[] = [
  { key: "religion", label: "Religion", weight: 20 },
  { key: "valeurs", label: "Valeurs", weight: 20 },
  { key: "couple", label: "Couple", weight: 15 },
  { key: "famille", label: "Famille", weight: 15 },
  { key: "enfants", label: "Enfants", weight: 10 },
  { key: "finances", label: "Finances", weight: 10 },
  { key: "lifestyle", label: "Lifestyle", weight: 5 },
  { key: "distance", label: "Distance", weight: 5 },
];

export const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.label]));

export const QUIZ: QuizQuestion[] = [
  /* Religion */
  {
    id: "r1",
    cat: "religion",
    q: "Quelle place la foi occupe-t-elle dans ta vie ?",
    options: ["Elle guide chacune de mes décisions", "Très importante", "Importante", "Discrète et personnelle"],
    kind: "scale",
    weight: 1.5,
    topic: "la place de la foi",
  },
  {
    id: "r2",
    cat: "religion",
    q: "Souhaites-tu pratiquer ta religion en couple ?",
    options: ["Oui, c'est essentiel", "Oui, autant que possible", "Chacun à son rythme"],
    kind: "scale",
    topic: "la pratique religieuse en couple",
  },
  {
    id: "r3",
    cat: "religion",
    q: "À quelle fréquence participes-tu à la vie de ta communauté (mosquée, église, associations) ?",
    options: ["Chaque semaine ou plus", "De temps en temps", "Rarement"],
    kind: "scale",
    topic: "la vie communautaire",
  },
  /* Valeurs */
  {
    id: "v1",
    cat: "valeurs",
    q: "Comment vois-tu le rôle de chacun dans le foyer ?",
    options: ["Des rôles traditionnels bien définis", "Des rôles partagés selon les forces de chacun", "Une égalité totale des tâches"],
    kind: "scale",
    topic: "le rôle de chacun au foyer",
  },
  {
    id: "v2",
    cat: "valeurs",
    q: "Ton conjoint pourra-t-il travailler après le mariage ?",
    options: ["Oui, bien sûr", "Oui, si cela n'empiète pas sur le foyer", "Je préfère qu'il ou elle reste au foyer"],
    kind: "scale",
    topic: "le travail du conjoint",
  },
  {
    id: "v3",
    cat: "valeurs",
    q: "Quel type d'union envisages-tu ?",
    options: ["Monogamie uniquement", "Sans position arrêtée", "Ouvert(e) à la polygamie"],
    kind: "scale",
    weight: 1.5,
    dealbreaker: true,
    topic: "le type d'union",
  },
  /* Couple */
  {
    id: "c1",
    cat: "couple",
    q: "Qui doit prendre les décisions importantes ?",
    options: ["Le couple, ensemble", "Chacun selon son domaine", "L'homme, après concertation"],
    kind: "scale",
    topic: "la prise de décision",
  },
  {
    id: "c2",
    cat: "couple",
    q: "Face à un désaccord important, tu préfères…",
    options: ["En parler tout de suite", "Prendre du recul, puis en parler", "Demander conseil à un proche ou à un guide religieux"],
    kind: "choice",
    weight: 0.6,
    topic: "la gestion des désaccords",
  },
  {
    id: "c3",
    cat: "couple",
    q: "Dans combien de temps souhaites-tu te marier ?",
    options: ["Dans les 6 mois", "D'ici un an", "D'ici deux ans", "Je prends le temps qu'il faut"],
    kind: "scale",
    topic: "le calendrier du mariage",
  },
  /* Famille */
  {
    id: "f1",
    cat: "famille",
    q: "Quelle place tes parents auront-ils dans ton couple ?",
    options: ["Une grande place", "Ils conseillent, ils ne décident pas", "Une place limitée"],
    kind: "scale",
    topic: "la place des parents",
  },
  {
    id: "f2",
    cat: "famille",
    q: "À quelle fréquence veux-tu voir ta famille ?",
    options: ["Chaque semaine", "Chaque mois", "Quelques fois par an"],
    kind: "scale",
    topic: "les visites en famille",
  },
  {
    id: "f3",
    cat: "famille",
    q: "Soutenir financièrement la famille élargie, pour toi c'est…",
    options: ["Un devoir, sans discussion", "Oui, dans la mesure du possible", "Le foyer passe d'abord"],
    kind: "scale",
    topic: "le soutien à la famille élargie",
  },
  /* Enfants */
  {
    id: "e1",
    cat: "enfants",
    q: "Quelle éducation religieuse souhaites-tu pour tes enfants ?",
    options: ["Stricte et encadrée", "Les valeurs de la foi, avec ouverture", "Ils choisiront plus tard"],
    kind: "scale",
    weight: 1.5,
    topic: "l'éducation religieuse des enfants",
  },
  {
    id: "e2",
    cat: "enfants",
    q: "Qui s'occupera principalement des enfants au quotidien ?",
    options: ["Surtout la mère", "Les deux parents à égalité", "Avec l'aide de la famille élargie"],
    kind: "choice",
    weight: 0.6,
    topic: "l'éducation au quotidien",
  },
  {
    id: "e3",
    cat: "enfants",
    q: "Quelle école pour tes enfants ?",
    options: ["Confessionnelle (franco-arabe, catholique…)", "Privée laïque", "Publique", "Peu importe"],
    kind: "choice",
    wildcard: 3,
    topic: "l'école des enfants",
  },
  /* Finances */
  {
    id: "m1",
    cat: "finances",
    q: "Comptes bancaires : communs ou séparés ?",
    options: ["Tout en commun", "Un compte commun et un compte perso", "Séparés"],
    kind: "scale",
    topic: "les comptes du couple",
  },
  {
    id: "m2",
    cat: "finances",
    q: "Qui gère le budget du foyer ?",
    options: ["Le couple, ensemble", "Principalement l'homme", "Celui ou celle qui gère le mieux"],
    kind: "choice",
    topic: "la gestion du budget",
  },
  {
    id: "m3",
    cat: "finances",
    q: "Épargner ou profiter ?",
    options: ["J'épargne avant tout", "Un équilibre entre les deux", "Je profite du moment présent"],
    kind: "scale",
    topic: "l'épargne",
  },
  /* Lifestyle */
  {
    id: "l1",
    cat: "lifestyle",
    q: "Quel est ton rythme de vie idéal ?",
    options: ["Calme et posé", "Équilibré", "Dynamique et social"],
    kind: "scale",
    topic: "le rythme de vie",
  },
  {
    id: "l2",
    cat: "lifestyle",
    q: "Sorties et voyages ?",
    options: ["Souvent, j'adore découvrir", "De temps en temps", "Rarement, je suis plutôt casanier(ère)"],
    kind: "scale",
    topic: "les sorties et les voyages",
  },
  {
    id: "l3",
    cat: "lifestyle",
    q: "Où vois-tu ton foyer dans cinq ans ?",
    options: ["Dans ma ville actuelle", "Ailleurs dans le pays", "À l'étranger", "Là où la vie nous mènera"],
    kind: "choice",
    wildcard: 3,
    topic: "le lieu de vie",
  },
];

export const QUIZ_BY_ID: Record<string, QuizQuestion> = Object.fromEntries(QUIZ.map((q) => [q.id, q]));

/** Similarité 0–1 entre deux réponses à une même question. */
export function answerSimilarity(q: QuizQuestion, a: number, b: number): number {
  if (a === b) return 1;
  if (q.wildcard !== undefined && (a === q.wildcard || b === q.wildcard)) return 0.8;
  if (q.kind === "choice") return 0.35;
  return 1 - Math.abs(a - b) / (q.options.length - 1);
}
