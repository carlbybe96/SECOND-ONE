"use client";

import { ArrowRight, BadgeCheck, Check, EyeOff, Heart, HeartHandshake, ShieldAlert, ShieldCheck, Star, UserCheck, Users, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { LogoMark } from "@/components/logo";
import CompatDemoCard from "@/components/marketing/compat-demo";
import FinalCta from "@/components/marketing/final-cta";
import MarketingFooter from "@/components/marketing/footer";
import MarketingHeader from "@/components/marketing/header";
import PricingCards from "@/components/marketing/pricing-cards";
import SectionMore from "@/components/marketing/section-more";
import StepsGrid from "@/components/marketing/steps-grid";
import TrustGrid from "@/components/marketing/trust-grid";
import ProfilePhoto from "@/components/ui/photo";
import { ScoreRing } from "@/components/ui/score";
import { APP, PLANS } from "@/lib/config";
import { fcfa } from "@/lib/format";
import { QUIZ } from "@/lib/questions";

const TESTIMONIALS = [
  { i: "A", n: "Aïssata, 29 ans", c: "Ouagadougou", t: "J'ai enfin rencontré quelqu'un qui partage ma foi et ma vision de la famille. Le questionnaire change tout." },
  { i: "J", n: "Jean-Marc, 34 ans", c: "Bobo-Dioulasso", t: "On voit directement si on est d'accord sur les sujets qui comptent : enfants, argent, religion. C'est rassurant." },
  { i: "M", n: "Mariam, 31 ans", c: "Diaspora, Paris", t: "Je cherchais quelqu'un qui partage mon projet de retour au pays. Les photos floutées m'ont permis de rester discrète." },
];

const FAQ_PREVIEW = [
  { q: `${APP.name} est-il une application de drague ?`, a: "Non. C'est une plateforme matrimoniale : profils validés à la main, messages modérés, recommandations limitées pour privilégier la qualité." },
  { q: "Comment la compatibilité est-elle calculée ?", a: `${QUIZ.length} questions sur 7 thèmes, comparées entre deux profils sur 8 dimensions pondérées. Tu obtiens un score, les points communs et ceux à discuter.` },
  { q: "Combien ça coûte ?", a: `L'inscription est gratuite. Premium coûte ${fcfa(PLANS.premium.price)} par mois, payable par Orange Money, Moov Money, Wave ou carte. Sans engagement.` },
  { q: "Puis-je rester discret ou discrète ?", a: "Oui. Photos floutées jusqu'au match, mode invisible, et mode famille pour impliquer un tuteur sans exposer tes conversations." },
];

export default function LandingView() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="landing">
      <MarketingHeader />

      <section className="l-hero">
        <div className="l-wrap hero-grid">
          <div>
            <span className="hero-badge">
              <HeartHandshake size={15} /> Rencontres sérieuses · Foi · Valeurs · Projet de vie
            </span>
            <h1>
              Trouve quelqu&apos;un qui partage <em>ta foi</em>, <em>tes valeurs</em> et <em>ton projet de vie</em>.
            </h1>
            <p className="hero-sub">
              Pas une application de drague : une plateforme matrimoniale, avec des profils vérifiés à la main, une compatibilité expliquée et une messagerie qui protège ta
              pudeur.
            </p>
            <div className="hero-actions">
              <Link href="/register" className="btn btn-primary btn-lg">
                Créer mon profil gratuitement <ArrowRight size={18} />
              </Link>
              <Link href="/login" className="btn btn-outline btn-lg">
                Essayer la démo
              </Link>
            </div>
            <ul className="hero-proof">
              <li>
                <Check size={16} /> 8 dimensions de compatibilité
              </li>
              <li>
                <Check size={16} /> Chaque profil validé à la main
              </li>
              <li>
                <Check size={16} /> Orange Money, Moov Money, Wave
              </li>
            </ul>
          </div>

          <div className="phone" aria-hidden="true">
            <div className="phone-notch" />
            <div className="phone-screen">
              <div className="ph-top">
                <span className="logo-mark" style={{ width: 26, height: 26, borderRadius: 8 }}>
                  <LogoMark size={15} />
                </span>
                <b>Découvrir</b>
              </div>
              <div className="ph-card">
                <ProfilePhoto profile={{ gender: "femme", firstName: "Aminata", photo: null, avatar: { hair: "tresses", headwear: "hijab", skin: 0, bg: 0, outfit: 0, wrap: 1 } }} className="ph-photo" />
                <div className="ph-info">
                  <div className="ph-name">
                    <b>Aminata, 26</b> <BadgeCheck size={16} color="var(--primary)" />
                  </div>
                  <small>Ouagadougou · Sage-femme</small>
                  <div className="ph-score">
                    <ScoreRing score={91} size={52} stroke={5} />
                    <span>
                      <b>Excellente compatibilité</b>
                      <small>Même foi · Même projet familial</small>
                    </span>
                  </div>
                </div>
                <div className="ph-actions">
                  <span className="round-mini pass">
                    <X size={18} />
                  </span>
                  <span className="round-mini super">
                    <Star size={15} />
                  </span>
                  <span className="round-mini like">
                    <Heart size={18} fill="currentColor" />
                  </span>
                </div>
              </div>
            </div>
            <div className="float-chip chip-a">
              <ShieldCheck size={15} /> Profil vérifié
            </div>
            <div className="float-chip chip-b">
              <HeartHandshake size={15} /> C&apos;est réciproque !
            </div>
          </div>
        </div>
      </section>

      <section className="l-strip">
        <div className="l-wrap strip-grid">
          <span>
            <UserCheck size={18} /> Validation humaine sous 24 h
          </span>
          <span>
            <EyeOff size={18} /> Photos floutées jusqu&apos;au match
          </span>
          <span>
            <ShieldAlert size={18} /> Détection des demandes d&apos;argent
          </span>
          <span>
            <Users size={18} /> Mode famille (wali, parents)
          </span>
        </div>
      </section>

      <section id="fonctionnement" className="l-section">
        <div className="l-wrap">
          <div className="l-head">
            <span className="eyebrow">Comment ça marche</span>
            <h2>De l&apos;inscription au mariage, pas à pas</h2>
            <p>Un parcours sérieux et guidé, loin du swipe à l&apos;infini.</p>
          </div>
          <StepsGrid />
          <SectionMore href="/comment-ca-marche" label="Voir le parcours complet, avec les délais" />
        </div>
      </section>

      <section id="compatibilite" className="l-section alt">
        <div className="l-wrap compat-grid">
          <div>
            <span className="eyebrow">Compatibilité</span>
            <h2>Plus qu&apos;une photo : une vraie compatibilité.</h2>
            <p className="l-lead">
              Nous comparons vos réponses sur 8 dimensions, avec la pondération d&apos;un conseiller matrimonial : la religion et les valeurs d&apos;abord, puis le couple, la
              famille, les enfants, les finances, le mode de vie et la distance.
            </p>
            <ul className="l-checks">
              <li>
                <Check size={17} /> Les points bloquants (enfants, type d&apos;union) sont repérés et signalés.
              </li>
              <li>
                <Check size={17} /> Les filtres fonctionnent dans les deux sens : tu ne vois que des personnes qui te recherchent aussi.
              </li>
              <li>
                <Check size={17} /> Jamais « l&apos;âme sœur garantie » : des facteurs concrets, à discuter ensemble.
              </li>
            </ul>
            <SectionMore href="/compatibilite" label="Voir les 8 dimensions en détail" />
          </div>
          <CompatDemoCard />
        </div>
      </section>

      <section id="securite" className="l-section">
        <div className="l-wrap">
          <div className="l-head">
            <span className="eyebrow">Confiance et pudeur</span>
            <h2>Ta sécurité n&apos;est pas négociable</h2>
            <p>Des règles claires, une équipe de modération, et des outils pensés pour notre culture.</p>
          </div>
          <TrustGrid />
          <SectionMore href="/securite" label="Voir les badges et la modération en détail" />
        </div>
      </section>

      <section className="l-section alt">
        <div className="l-wrap">
          <div className="l-head">
            <span className="eyebrow">Témoignages</span>
            <h2>Ils ont trouvé une vraie compatibilité</h2>
            <p>Exemples de retours de membres (démonstration).</p>
          </div>
          <div className="quotes">
            {TESTIMONIALS.map((q) => (
              <figure className="quote" key={q.n}>
                <div className="stars">★★★★★</div>
                <blockquote>« {q.t} »</blockquote>
                <figcaption>
                  <span className="q-ava">{q.i}</span>
                  <span>
                    <b>{q.n}</b>
                    <small>{q.c}</small>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="tarifs" className="l-section">
        <div className="l-wrap">
          <div className="l-head">
            <span className="eyebrow">Tarifs</span>
            <h2>Gratuit pour commencer. Premium pour avancer plus vite.</h2>
            <p>Paiement par Orange Money, Moov Money, Wave ou carte. Sans engagement, sans prélèvement automatique.</p>
          </div>
          <PricingCards />
          <SectionMore href="/tarifs" label="Boost, accompagnement VIP et moyens de paiement" />
        </div>
      </section>

      <section id="faq" className="l-section alt">
        <div className="l-wrap faq-wrap">
          <div className="l-head">
            <span className="eyebrow">Questions fréquentes</span>
            <h2>Tout ce qu&apos;il faut savoir</h2>
          </div>
          <div className="faq">
            {FAQ_PREVIEW.map((item, i) => (
              <div key={item.q} className={`faq-item${openFaq === i ? " open" : ""}`}>
                <button type="button" className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                  {item.q}
                  <span className="faq-ico">+</span>
                </button>
                {openFaq === i && <div className="faq-a">{item.a}</div>}
              </div>
            ))}
          </div>
          <SectionMore href="/faq" label="Voir toutes les questions" />
        </div>
      </section>

      <FinalCta />
      <MarketingFooter />
    </div>
  );
}
