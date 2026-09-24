"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Progress from "@/components/onboarding/progress";
import StepDone from "@/components/onboarding/step-done";
import StepFamily from "@/components/onboarding/step-family";
import StepPreferences from "@/components/onboarding/step-preferences";
import StepQuiz from "@/components/onboarding/step-quiz";
import StepReligion from "@/components/onboarding/step-religion";
import Toast from "@/components/toast";
import { getSession, signOut } from "@/lib/auth";
import { QUIZ } from "@/lib/questions";
import { saveOnboarding } from "@/lib/store";
import type { FamilleData, OnboardingData, PrefData, ReligionData } from "@/lib/types";

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; firstName: string } | null>(null);
  const [step, setStep] = useState(1); // 1=religion, 2=préférences, 3=famille, 4=questions
  const [done, setDone] = useState(false);
  const [toast, setToast] = useState("");

  const [religion, setReligion] = useState<ReligionData>({ religion: "", pratique: "" });
  const [pref, setPref] = useState<Partial<PrefData>>({});
  const [famille, setFamille] = useState<Partial<FamilleData>>({});
  const [quiz, setQuiz] = useState<Record<number, number>>({});
  const [qi, setQi] = useState(0);

  const doneRef = useRef(false);
  const dataRef = useRef<OnboardingData | null>(null);
  dataRef.current = { religion, pref, famille, quiz };

  useEffect(() => {
    getSession().then((u) => {
      if (!u) {
        router.replace("/register");
        return;
      }
      setUser({ id: u.id, firstName: u.firstName });
    });
  }, [router]);

  const persist = useCallback(async (d: OnboardingData) => {
    const u = await getSession();
    if (u) await saveOnboarding(u.id, d);
  }, []);

  const goNext = useCallback(async () => {
    await persist(dataRef.current!);
    setStep((s) => (s < 4 ? s + 1 : s));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [persist]);

  const goBack = useCallback(() => {
    if (step > 1) {
      setStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [step]);

  const prefCount = Object.values(pref).filter(Boolean).length;
  const familleCount = Object.values(famille).filter(Boolean).length;
  const canContinuePrefs = prefCount >= 5;
  const canContinueFamille = familleCount >= 5;
  const religionOk = religion.religion && religion.pratique;

  async function handleLogout() {
    await signOut();
    router.replace("/");
  }

  async function handleQuizSelect(idx: number) {
    const next = { ...quiz, [qi]: idx };
    setQuiz(next);
    if (qi < QUIZ.length - 1) {
      setTimeout(() => setQi((q) => q + 1), 420);
    } else {
      await finishQuiz(next);
    }
  }

  async function finishQuiz(finalQuiz: Record<number, number>) {
    if (doneRef.current) return;
    doneRef.current = true;
    const d: OnboardingData = { religion, pref, famille, quiz: finalQuiz };
    await persist(d);
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!user) return null;

  return (
    <>
      <header>
        <Progress step={step} onBack={goBack} />
      </header>
      <main>
        {!done && step === 1 && (
          <div key="rel" className="card">
            <StepReligion value={religion} onChange={setReligion} />
            <button className="btn btn-primary" onClick={goNext} disabled={!religionOk}>
              Continuer →
            </button>
          </div>
        )}

        {!done && step === 2 && (
          <div key="pref" className="card">
            <StepPreferences value={pref} onChange={setPref} />
            <button className="btn btn-primary" onClick={goNext} disabled={!canContinuePrefs}>
              Continuer →
            </button>
          </div>
        )}

        {!done && step === 3 && (
          <div key="fam" className="card">
            <StepFamily value={famille} onChange={setFamille} />
            <button className="btn btn-primary" onClick={goNext} disabled={!canContinueFamille}>
              Continuer →
            </button>
          </div>
        )}

        {!done && step === 4 && (
          <div key="quiz" className="card">
            <StepQuiz
              index={qi}
              selected={quiz}
              onSelect={handleQuizSelect}
              onPrev={() => setQi((q) => Math.max(0, q - 1))}
              onNext={() => {
                if (qi < QUIZ.length - 1) setQi((q) => q + 1);
                else finishQuiz(quiz);
              }}
              done={done}
            />
          </div>
        )}

        {done && (
          <StepDone
            firstName={user.firstName}
            data={dataRef.current!}
            onExplore={() => setToast("La découverte des profils arrive dans la prochaine version 😉")}
          />
        )}
      </main>

      <div className="foot-note" style={{ textAlign: "center", marginBottom: 40 }}>
        <button
          onClick={handleLogout}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: ".85rem" }}
        >
          Se déconnecter
        </button>
      </div>

      <Toast msg={toast} />
    </>
  );
}