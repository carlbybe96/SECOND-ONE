"use client";

import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { CATEGORY_LABEL, QUIZ } from "@/lib/questions";

const LETTERS = ["a", "b", "c", "d"];

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

  // Sur ordinateur, on peut répondre au clavier : A, B, C, D (ou 1 à 4).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (busy || e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key.toLowerCase();
      const idx = LETTERS.includes(key) ? LETTERS.indexOf(key) : ["1", "2", "3", "4"].indexOf(key);
      if (idx >= 0 && idx < item.options.length) {
        e.preventDefault();
        onSelect(idx);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, busy, onSelect]);

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
          <ArrowLeft size={16} /> Précédente
        </button>
        <span className="tiny muted hide-sm" style={{ alignSelf: "center" }}>
          Astuce : réponds avec les touches A, B, C, D
        </span>
      </div>
    </>
  );
}
