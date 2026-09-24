import { CircleCheck, Clock3, Sparkles } from "lucide-react";
import Link from "next/link";
import FinalCta from "@/components/marketing/final-cta";
import MarketingFooter from "@/components/marketing/footer";
import MarketingHeader, { TopicHero } from "@/components/marketing/header";
import StepsGrid from "@/components/marketing/steps-grid";
import { STAGES } from "@/lib/config";

export default function HowView() {
  return (
    <div className="landing">
      <MarketingHeader />
      <TopicHero
        eyebrow="Comment ça marche"
        title="De l'inscription au mariage, pas à pas"
        lead="Un parcours sérieux et guidé, loin du swipe à l'infini. Chaque étape a un objectif clair."
      />

      <section className="l-section">
        <div className="l-wrap">
          <StepsGrid />
        </div>
      </section>

      <section className="l-section alt">
        <div className="l-wrap">
          <div className="l-head">
            <span className="eyebrow">À quoi t&apos;attendre</span>
            <h2>Des délais clairs, pas d&apos;attente inutile</h2>
          </div>
          <div className="expect-grid">
            <div className="expect-item">
              <Clock3 size={20} />
              <div>
                <b>Moins de 5 minutes</b>
                <p>Pour créer ton profil et répondre au questionnaire de compatibilité.</p>
              </div>
            </div>
            <div className="expect-item">
              <CircleCheck size={20} />
              <div>
                <b>Moins de 24 heures</b>
                <p>Pour la validation manuelle de ton profil par notre équipe (souvent bien plus rapide).</p>
              </div>
            </div>
            <div className="expect-item">
              <Sparkles size={20} />
              <div>
                <b>Dès la validation</b>
                <p>Tes premières recommandations compatibles apparaissent, 5 à 10 profils pertinents par jour.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="l-section">
        <div className="l-wrap">
          <div className="l-head">
            <span className="eyebrow">Parcours relationnel</span>
            <h2>Une relation qui avance, étape par étape</h2>
            <p>Depuis la messagerie, indique où en est chaque relation. Ce n&apos;est pas automatique : c&apos;est vous qui décidez.</p>
          </div>
          <div className="journey">
            {STAGES.map((s, i) => (
              <div className="j-step" key={s.label}>
                <span className="j-ico">{s.icon}</span>
                <b>{s.label}</b>
                {i < STAGES.length - 1 && <span className="j-line" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="l-section alt">
        <div className="l-wrap">
          <div className="l-head">
            <span className="eyebrow">Validation des profils</span>
            <h2>Ce que notre équipe vérifie avant de valider ton profil</h2>
          </div>
          <ul className="l-checks">
            <li>
              <CircleCheck size={17} /> Une photo qui montre un vrai visage, cohérente avec le reste du profil.
            </li>
            <li>
              <CircleCheck size={17} /> Une présentation sincère, sans contenu déplacé ni publicité.
            </li>
            <li>
              <CircleCheck size={17} /> Des informations cohérentes (âge, ville, intention affichée).
            </li>
            <li>
              <CircleCheck size={17} /> Aucun signe de faux profil ou de compte en double.
            </li>
          </ul>
          <p className="muted small" style={{ marginTop: 16 }}>
            Le détail complet de nos règles de sécurité et de modération est sur la page{" "}
            <Link href="/securite" className="link" style={{ display: "inline" }}>
              Sécurité
            </Link>
            .
          </p>
        </div>
      </section>

      <FinalCta />
      <MarketingFooter />
    </div>
  );
}
