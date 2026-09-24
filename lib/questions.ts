export type QuizQuestion = {
  cat: string;
  q: string;
  o: string[];
};

export const QUIZ: QuizQuestion[] = [
  { cat: "Religion", q: "Quelle importance la foi occupe-t-elle dans ta vie ?", o: ["Elle est tout pour moi", "Très importante", "Importante", "Secondaire"] },
  { cat: "Religion", q: "Souhaites-tu pratiquer ta religion en couple ?", o: ["Oui, c'est essentiel", "Oui, autant que possible", "Chacun son rythme"] },
  { cat: "Religion", q: "Ton partenaire doit-il partager exactement ta religion ?", o: ["Oui, exactement la même", "Une confession compatible", "Peu importe"] },
  { cat: "Couple", q: "Que signifie un mariage réussi pour toi ?", o: ["L'amour et la foi d'abord", "La confiance et la communication", "Une famille unie", "Le respect des engagements"] },
  { cat: "Couple", q: "Qui doit prendre les décisions importantes dans le couple ?", o: ["Ensemble, toujours", "L'homme principalement", "Selon les domaines", "Celui qui sait"] },
  { cat: "Famille", q: "Quelle place les parents doivent-ils avoir dans ton couple ?", o: ["Une grande place", "Ils conseillent, ils ne décident pas", "Une place limitée"] },
  { cat: "Famille", q: "Es-tu favorable à vivre avec tes parents après le mariage ?", o: ["Oui, famille élargie", "À proximité seulement", "Non, en couple"] },
  { cat: "Enfants", q: "Quelle éducation religieuse souhaites-tu pour tes enfants ?", o: ["Une éducation religieuse stricte", "Les valeurs, puis ils choisissent", "Aucune en particulier"] },
  { cat: "Enfants", q: "Selon toi, les enfants doivent-ils être élevés dans ta religion ?", o: ["Oui, obligatoirement", "Oui, dans la foi du couple", "Ils choisiront plus tard"] },
  { cat: "Argent", q: "Comptes bancaires : communs ou séparés ?", o: ["Comptes communs", "Comptes séparés", "Communs + un compte perso"] },
  { cat: "Argent", q: "Qui gère le budget du foyer ?", o: ["Le couple ensemble", "Un seul des deux", "Chacun le sien"] },
  { cat: "Carrière", q: "Ton partenaire peut-il travailler après le mariage ?", o: ["Oui, bien sûr", "Oui, mais sa place est aussi à la maison", "Non, je préfère qu'il/elle reste au foyer"] },
  { cat: "Carrière", q: "Ta carrière passe-t-elle avant un déménagement ?", o: ["Oui, ma carrière d'abord", "On décidera ensemble", "Non, la famille d'abord"] },
  { cat: "Lifestyle", q: "Quel est ton rythme de vie idéal ?", o: ["Calme et posé", "Équilibré", "Dynamique et social", "Intense"] },
  { cat: "Lifestyle", q: "Sorties et voyages, à quelle fréquence ?", o: ["Souvent, j'adore voyager", "Régulièrement", "Rarement", "Jamais"] },
];

export const QUIZ_CATEGORIES = [...new Set(QUIZ.map((q) => q.cat))];

/** Score 0–99 based on how aligned the answers are (first option = most committed). */
export function computeScore(answers: Record<number, number>): number {
  let s = 50;
  QUIZ.forEach((_, i) => {
    const a = answers[i] ?? 1;
    s += a === 0 ? 2.6 : a === 1 ? 1.6 : a === 2 ? 0.8 : 0.3;
  });
  return Math.max(40, Math.min(99, Math.round(s)));
}