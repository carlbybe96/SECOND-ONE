"use client";

import { ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import FullPageLoader from "@/components/loader";
import Progress from "@/components/onboarding/progress";
import StepDone from "@/components/onboarding/step-done";
import StepFamily from "@/components/onboarding/step-family";
import StepPreferences from "@/components/onboarding/step-preferences";
import StepProfile, { profileStepValid } from "@/components/onboarding/step-profile";
import StepQuiz from "@/components/onboarding/step-quiz";
import StepReligion, { religionStepValid } from "@/components/onboarding/step-religion";
import { toast } from "@/components/ui/toaster";
import { api } from "@/lib/api";
import { useSession } from "@/lib/hooks";
import { QUIZ } from "@/lib/questions";
import type { Profile } from "@/lib/types";

export default function OnboardingView() {
  const { data: session } = useSession();
  const search = useSearchParams();
  if (!session?.profile) return <FullPageLoader />;
  const requested = Number(search.get("step"));
  const start = requested >= 1 && requested <= 5 ? requested : 1;
  return <OnboardingFlow key={session.profile.id} initial={session.profile} startStep={start} />;
}

function OnboardingFlow({ initial, startStep }: { initial: Profile; startStep: number }) {
  const router = useRouter();
  const redo = initial.onboarded;
  const [draft, setDraft] = useState<Profile>(initial);
  const [step, setStep] = useState(startStep);
  const [qi, setQi] = useState(() => (startStep === 5 ? 0 : Math.max(0, QUIZ.findIndex((q) => initial.answers[q.id] === undefined))));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (patch: Partial<Profile>) => setDraft((d) => ({ ...d, ...patch }));

  const valid = step === 1 ? profileStepValid(draft) : step === 2 ? religionStepValid(draft) : true;
  const hint =
    step === 1 && !valid
      ? draft.profession.trim().length < 2
        ? "Indique ta profession."
        : draft.languages.length === 0
          ? "Choisis au moins une langue."
          : "Écris quelques phrases sur toi (30 caractères minimum)."
      : step === 2 && !valid
        ? "Choisis ta religion puis ton courant."
        : "";

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function next() {
    if (!valid || busy) return;
    setBusy(true);
    setError("");
    try {
      const { firstName: _f, id: _id, ...patch } = draft;
      await api.updateMe(patch);
      setStep((s) => s + 1);
      scrollTop();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
  }

  function back() {
    if (step === 5 && qi > 0) return setQi((q) => q - 1);
    setStep((s) => Math.max(1, s - 1));
    scrollTop();
  }

  async function answer(option: number) {
    if (busy) return;
    const q = QUIZ[qi];
    const answers = { ...draft.answers, [q.id]: option };
    set({ answers });
    if (qi < QUIZ.length - 1) {
      window.setTimeout(() => setQi((i) => i + 1), 260);
      return;
    }
    setBusy(true);
    try {
      const { firstName: _f, id: _id, ...patch } = { ...draft, answers };
      await api.completeOnboarding(patch);
      if (redo) {
        toast({ title: "Questionnaire mis à jour", body: "Tes compatibilités ont été recalculées." });
        router.push("/profile");
        return;
      }
      setStep(6);
      scrollTop();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flow">
      <header className="flow-header">
        <Progress step={step} onBack={back} />
      </header>
      <main className="onb-main">
        {step === 6 ? (
          <StepDone firstName={draft.firstName} />
        ) : (
          <div className="flow-card" key={step}>
            {step === 1 && <StepProfile p={draft} set={set} />}
            {step === 2 && <StepReligion p={draft} set={set} />}
            {step === 3 && <StepPreferences p={draft} set={set} />}
            {step === 4 && <StepFamily p={draft} set={set} />}
            {step === 5 && <StepQuiz index={qi} answers={draft.answers} onSelect={answer} onPrev={() => setQi((q) => Math.max(0, q - 1))} busy={busy} />}
            {error && <p className="error-msg">{error}</p>}
            {step < 5 && (
              <div className="onb-actions">
                <span className="tiny muted" style={{ alignSelf: "center" }}>
                  {hint || (step === 4 ? "Dernière étape ensuite : le questionnaire (21 questions, 3 minutes)." : "Tes réponses sont enregistrées à chaque étape.")}
                </span>
                <button type="button" className="btn btn-primary btn-lg" onClick={next} disabled={!valid || busy}>
                  {busy ? <span className="spinner" /> : "Continuer"} <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
