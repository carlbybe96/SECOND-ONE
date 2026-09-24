import { ArrowLeft } from "lucide-react";
import { CATEGORY_LABEL, QUIZ } from "@/lib/questions";

export default function StepQuiz({
  index,
  answers,
  onSelect,
  onPrev,
  busy,
}: {
  index: number;
  answers: Record<string, number>;
  onSelect: (option: number) => void;
  onPrev: () => void;
  busy: boolean;
}) {
  const item = QUIZ[index];
  return (
    <>
      <div className="q-meta">
        <span className="q-count">
          Question {index + 1} sur {QUIZ.length}
        </span>
        <span className="cat-chip">{CATEGORY_LABEL[item.cat]}</span>
      </div>
      <div className="q-bar">
        <span style={{ width: `${((index + 1) / QUIZ.length) * 100}%` }} />
      </div>
      <div className="q-title">{item.q}</div>
      <div className="opts" key={item.id}>
        {item.options.map((opt, idx) => (
          <button key={opt} type="button" className={`opt${answers[item.id] === idx ? " sel" : ""}`} onClick={() => onSelect(idx)} disabled={busy}>
            <span className="letter">{String.fromCharCode(65 + idx)}</span>
            <span>{opt}</span>
          </button>
        ))}
      </div>
      <div className="onb-actions">
        <button type="button" className="btn btn-ghost" onClick={onPrev} disabled={index === 0 || busy}>
          <ArrowLeft size={16} /> Question précédente
        </button>
        <span className="tiny muted" style={{ alignSelf: "center" }}>
          Choisis une réponse pour continuer
        </span>
      </div>
    </>
  );
}
