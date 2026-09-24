import { BadgeCheck, Camera, Flag, IdCard, Phone } from "lucide-react";
import Link from "next/link";
import FinalCta from "@/components/marketing/final-cta";
import MarketingFooter from "@/components/marketing/footer";
import MarketingHeader, { TopicHero } from "@/components/marketing/header";
import TrustGrid from "@/components/marketing/trust-grid";

const BADGES = [
  { icon: Phone, name: "Téléphone vérifié", text: "Un code est envoyé par SMS au numéro que tu indiques. Confirme-le pour débloquer ce premier badge." },
  { icon: Camera, name: "Profil vérifié", text: "Un selfie comparé à tes photos par notre équipe. Il n'est jamais publié : il sert uniquement à confirmer que c'est bien toi." },
  { icon: IdCard, name: "Identité vérifiée", text: "CNIB ou passeport, contrôlé par un prestataire spécialisé. Facultatif, pour aller plus loin dans la confiance." },
];

const MODERATION = [
  ["Message envoyé", "Chaque message passe par une analyse automatique avant d'arriver à destination."],
  ["Analyse du contenu", "Demande d'argent, lien suspect, propos déplacés : les signaux à risque sont repérés."],
  ["Selon le risque", "Faible : envoyé normalement. Moyen : un conseil de prudence s'affiche. Élevé : le message est bloqué."],
  ["Signalement humain", "Si un membre signale malgré tout, un modérateur examine les messages concernés sous 24 h."],
];

export default function SecurityView() {
  return (
    <div className="landing">
      <MarketingHeader />
      <TopicHero
        eyebrow="Confiance et pudeur"
        title="Ta sécurité n'est pas négociable"
        lead="Des règles claires, une équipe de modération, et des outils pensés pour notre culture : pudeur, famille, discrétion."
      />

      <section className="l-section">
        <div className="l-wrap">
          <TrustGrid />
        </div>
      </section>

      <section className="l-section alt">
        <div className="l-wrap">
          <div className="l-head">
            <span className="eyebrow">Les badges</span>
            <h2>Trois niveaux de vérification, trois significations claires</h2>
            <p>Un badge ne garantit jamais qu&apos;une personne est fiable à 100 % : reste prudent(e), comme pour toute rencontre.</p>
          </div>
          <div className="badge-grid">
            {BADGES.map((b) => (
              <div className="badge-card" key={b.name}>
                <span className="t-ico">
                  <b.icon size={20} />
                </span>
                <h3>
                  <BadgeCheck size={15} color="var(--primary)" /> {b.name}
                </h3>
                <p>{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="l-section">
        <div className="l-wrap">
          <div className="l-head">
            <span className="eyebrow">Modération</span>
            <h2>Ce qui se passe quand tu envoies un message</h2>
          </div>
          <div className="mod-flow">
            {MODERATION.map(([t, d], i) => (
              <div className="mod-step" key={t}>
                <span className="mod-num">{i + 1}</span>
                <div>
                  <b>{t}</b>
                  <p>{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="l-section alt">
        <div className="l-wrap">
          <div className="l-head" style={{ textAlign: "left", margin: 0, maxWidth: 760 }}>
            <span className="eyebrow">
              <Flag size={13} style={{ verticalAlign: "-2px" }} /> Mode famille
            </span>
            <h2>Implique ton tuteur, en toute transparence</h2>
            <p>
              Tu peux inviter un parent, ton tuteur (wali), un frère ou une sœur, ou une personne de confiance. Une fois l&apos;invitation acceptée, elle peut voir tes matchs
              et te donner son avis — mais elle n&apos;a <b>jamais accès à tes conversations privées</b> sans que tu le décides toi-même, explicitement. Tu peux retirer cet
              accès à tout moment depuis les paramètres.
            </p>
            <p className="muted small" style={{ marginTop: 14 }}>
              Le détail complet de nos règles (charte de bonne conduite, confidentialité, conditions d&apos;utilisation) est sur la page{" "}
              <Link href="/legal" className="link" style={{ display: "inline" }}>
                Informations légales
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <FinalCta title="Rejoins une communauté qui se protège mutuellement." text="Profils vérifiés, messages modérés, signalement en un geste." />
      <MarketingFooter />
    </div>
  );
}
