"use client";

import { useEffect, useState } from "react";
import { computeScore } from "@/lib/questions";
import type { OnboardingData } from "@/lib/types";

export default function StepDone({
  firstName,
  data,
  onExplore,
}: {
  firstName: string;
  data: OnboardingData;
  onExplore: () => void;
}) {
  const score = computeScore(data.quiz);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    let n = 0;
    const timer = setInterval(() => {
      n += 3;
      if (n >= score) {
        n = score;
        clearInterval(timer);
      }
      setShown(n);
    }, 40);
    return () => clearInterval(timer);
  }, [score]);

  const tags = [
    ["Religion", (data.religion?.religion || "").split(" — ")[0] || "—"],
    ["Pratique", data.religion?.pratique || "—"],
    ["Âge", (data.pref?.age || "").replace(" ans", "") || "—"],
    ["Enfants", data.famille?.enfants || "—"],
    ["Famille", data.famille?.importance || "—"],
  ];

  return (
    <div className="card success">
      <div className="check-badge">✓</div>
      <div className="eyebrow">Onboarding terminé</div>
      <h1>Ton profil est prêt, {firstName} ✨</h1>
      <p className="sub">
        Ta compatibilité est en cours de calcul. Voici un aperçu de ton profil — tu pourras le modifier à tout moment.
      </p>
      <div className="ring-wrap">
        <svg width="170" height="170" viewBox="0 0 170 170">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00A575" />
              <stop offset="100%" stopColor="#2FBF97" />
            </linearGradient>
          </defs>
          <circle className="ring-bg" cx="85" cy="85" r="72" />
          <circle
            className="ring-fg"
            cx="85"
            cy="85"
            r="72"
            style={{ strokeDashoffset: 452 - (452 * shown) / 100 }}
          />
        </svg>
        <div className="ring-num">
          <strong>{shown}%</strong>
          <span>compatibilité</span>
        </div>
      </div>
      <div className="summary">
        {tags.map(([k, v]) => (
          <span key={k} className="tag">
            {k} : <b>{v}</b>
          </span>
        ))}
      </div>
      <button className="btn btn-primary" onClick={onExplore}>
        Voir mes matchs 🔥
      </button>
    </div>
  );
}