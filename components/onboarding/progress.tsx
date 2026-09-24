const LABELS = ["Compte", "Religion", "Préférences", "Famille", "Questions"];

export default function Progress({ step, onBack }: { step: number; onBack: () => void }) {
  const total = 5;
  return (
    <>
      <div className="topbar">
        <a href="/" className="logo">
          <span className="logo-mark">❤️</span> FaithMatch
        </a>
        <button className="back-link" onClick={onBack} disabled={step <= 1}>
          ← Retour
        </button>
      </div>
      <div className="progress-wrap">
        <div className="step-labels">
          {LABELS.map((label, i) => (
            <div
              key={label}
              className={`lab${i === 0 ? " done" : i === step ? " active" : i < step ? " done" : ""}`}
            >
              {label}
            </div>
          ))}
        </div>
        <div className="bar">
          <div className="bar-fill" style={{ width: `${(step / total) * 100}%` }} />
        </div>
        <div className="counter">
          {step === 4 ? "Étape 5 sur 5 — Questionnaire" : `Étape ${step + 1} sur 5`}
        </div>
      </div>
    </>
  );
}