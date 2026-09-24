import { CircleCheck, MessageCircleQuestion } from "lucide-react";
import type { CategoryScore, Compat } from "@/lib/types";

function toneColor(score: number) {
  if (score >= 70) return "var(--primary)";
  if (score >= 50) return "#e0a526";
  return "#94a3b8";
}

export function ScoreRing({ score, size = 72, stroke = 7, label = "compatibles" }: { score: number; size?: number; stroke?: number; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="score-ring" style={{ width: size, height: size }} aria-label={`${score} % de compatibilité`}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--mint-soft)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={toneColor(score)}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * score) / 100}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div className="num">
        <strong style={{ fontSize: size * 0.27 }}>{score}%</strong>
        {size >= 84 && <span>{label}</span>}
      </div>
    </div>
  );
}

export function ScoreChip({ score }: { score: number }) {
  const tone = score >= 70 ? "" : score >= 50 ? " mid" : " low";
  return <span className={`score-chip${tone}`}>♥ {score}%</span>;
}

export function CategoryBars({ categories }: { categories: CategoryScore[] }) {
  return (
    <div className="cat-bars">
      {categories.map((c) => (
        <div className="cat-bar" key={c.key}>
          <span className="k">{c.label}</span>
          <div className="track">
            <div className={`fill${c.score >= 70 ? "" : c.score >= 50 ? " mid" : " low"}`} style={{ width: `${c.score}%` }} />
          </div>
          <span className="v">{c.score}%</span>
        </div>
      ))}
    </div>
  );
}

export function CompatPoints({ compat, max = 4 }: { compat: Compat; max?: number }) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      {compat.strengths.length > 0 && (
        <div>
          <div className="tiny muted" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
            Pourquoi vous êtes compatibles
          </div>
          <ul className="points good">
            {compat.strengths.slice(0, max).map((s) => (
              <li key={s}>
                <CircleCheck size={16} />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
      {compat.discuss.length > 0 && (
        <div>
          <div className="tiny muted" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
            Points à discuter
          </div>
          <ul className="points talk">
            {compat.discuss.slice(0, 3).map((s) => (
              <li key={s}>
                <MessageCircleQuestion size={16} />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
