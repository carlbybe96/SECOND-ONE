"use client";

import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import ProfilePhoto from "@/components/ui/photo";
import { ScoreChip } from "@/components/ui/score";
import { api } from "@/lib/api";
import { useQuery } from "@/lib/hooks";

export default function StepDone({ firstName }: { firstName: string }) {
  const { data } = useQuery("onboarding-done", () => api.discover(api.DEFAULT_FILTERS));
  const items = data?.items ?? [];
  const top = items.slice(0, 3);

  return (
    <div className="flow-card success">
      <div className="check-badge">
        <Check size={34} strokeWidth={3} />
      </div>
      <div className="eyebrow">Profil terminé</div>
      <h1>Bravo {firstName}, ton profil est prêt</h1>
      <p className="sub">
        {data ? (
          items.length > 0 ? (
            <>
              Nous avons trouvé <strong>{items.length} profils compatibles</strong> avec toi. Notre équipe valide ton profil en ce moment : tu peux déjà les découvrir.
            </>
          ) : (
            <>Notre équipe valide ton profil. Élargis un peu tes critères pour voir plus de profils compatibles.</>
          )
        ) : (
          "Calcul de tes compatibilités…"
        )}
      </p>
      {top.length > 0 && (
        <div className="preview-matches">
          {top.map((c) => (
            <div className="preview-match" key={c.profile.id}>
              <ProfilePhoto profile={c.profile} locked={c.photoLocked} size={72} round />
              <b>
                {c.profile.firstName}, {c.profile.age}
              </b>
              <small>{c.profile.city}</small>
              <ScoreChip score={c.compat.score} />
            </div>
          ))}
        </div>
      )}
      <Link href="/discover" className="btn btn-primary btn-lg" style={{ marginTop: 18 }}>
        Découvrir mes profils compatibles <ArrowRight size={18} />
      </Link>
      <p className="tiny muted" style={{ marginTop: 14 }}>
        Tu pourras modifier ton profil et refaire le questionnaire à tout moment.
      </p>
    </div>
  );
}
