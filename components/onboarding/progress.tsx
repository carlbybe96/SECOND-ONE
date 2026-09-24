import { ArrowLeft } from "lucide-react";
import Logo from "@/components/logo";

export const STEP_LABELS = ["Profil", "Foi", "Préférences", "Famille", "Questionnaire"];

/** step : 1 à 5 ; 6 = terminé. */
export default function Progress({ step, onBack }: { step: number; onBack: () => void }) {
  const total = STEP_LABELS.length;
  const done = Math.min(step - 1, total);
  return (
    <>
      <div className="flow-topbar">
        <Logo href="/" />
        <button type="button" className="btn btn-ghost btn-sm" onClick={onBack} disabled={step <= 1 || step > total} style={{ visibility: step <= 1 || step > total ? "hidden" : "visible" }}>
          <ArrowLeft size={16} /> Retour
        </button>
      </div>
      <div className="progress-wrap">
        <div className="step-labels">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className={`lab${i + 1 === step ? " active" : i + 1 < step ? " done" : ""}`}>
              {label}
            </div>
          ))}
        </div>
        <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
          <div className="bar-fill" style={{ width: `${Math.max(4, (done / total) * 100)}%` }} />
        </div>
      </div>
    </>
  );
}
