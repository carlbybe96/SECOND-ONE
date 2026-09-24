import { QUIZ } from "@/lib/questions";

export default function StepQuiz({
  index,
  selected,
  onSelect,
  onPrev,
  onNext,
  done,
}: {
  index: number;
  selected: Record<number, number>;
  onSelect: (i: number) => void;
  onPrev: () => void;
  onNext: () => void;
  done: boolean;
}) {
  const item = QUIZ[index];
  const isLast = index === QUIZ.length - 1;
  const hasAnswer = selected[index] !== undefined;

  return (
    <>
      <div className="q-meta">
        <span className="q-count">
          Question {index + 1} / {QUIZ.length}
        </span>
        <span className="cat-chip">{item.cat}</span>
      </div>
      <div className="q-bar">
        <span style={{ width: `${((index + 1) / QUIZ.length) * 100}%` }} />
      </div>
      <div className="q-title">{item.q}</div>
      <div className="opts">
        {item.o.map((opt, idx) => (
          <button
            key={idx}
            type="button"
            className={`opt${selected[index] === idx ? " sel" : ""}`}
            onClick={() => onSelect(idx)}
          >
            <span className="o-ico">{idx === 0 ? "💚" : "🌿"}</span>
            <span>{opt}</span>
          </button>
        ))}
      </div>
      <div className="q-nav">
        <button type="button" className="btn btn-ghost" onClick={onPrev} disabled={index === 0 || done}>
          ← Précédent
        </button>
        <button type="button" className="btn btn-primary" onClick={onNext} disabled={!hasAnswer || done}>
          {isLast ? "Terminer ✓" : "Suivant →"}
        </button>
      </div>
    </>
  );
}