import { CategoryBars, CompatPoints, ScoreRing } from "@/components/ui/score";
import type { Compat } from "@/lib/types";

export const COMPAT_SAMPLE: Compat = {
  score: 91,
  label: "Excellente compatibilité",
  tone: "great",
  categories: [
    { key: "religion", label: "Religion", score: 97 },
    { key: "valeurs", label: "Valeurs", score: 92 },
    { key: "couple", label: "Couple", score: 90 },
    { key: "famille", label: "Famille", score: 94 },
    { key: "enfants", label: "Enfants", score: 96 },
    { key: "finances", label: "Finances", score: 71 },
    { key: "lifestyle", label: "Lifestyle", score: 88 },
    { key: "distance", label: "Distance", score: 100 },
  ],
  strengths: ["Même foi et même niveau de pratique", "Vous voulez tous les deux des enfants, et autant", "Alignés sur la place des parents", "Vous vivez tous les deux à Ouagadougou"],
  discuss: ["La gestion du budget"],
};

export default function CompatDemoCard() {
  return (
    <div className="panel panel-pad compat-demo">
      <div className="d-score">
        <ScoreRing score={COMPAT_SAMPLE.score} size={96} stroke={8} />
        <div>
          <b>{COMPAT_SAMPLE.label}</b>
          <p className="muted tiny">Aminata et Ibrahim, sur 8 dimensions</p>
        </div>
      </div>
      <div className="divider" />
      <CategoryBars categories={COMPAT_SAMPLE.categories} />
      <div className="divider" />
      <CompatPoints compat={COMPAT_SAMPLE} />
    </div>
  );
}
