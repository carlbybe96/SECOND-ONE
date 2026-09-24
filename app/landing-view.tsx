"use client";

import { ArrowRight, BadgeCheck, Check, CircleHelp, Compass, EyeOff, Heart, HeartHandshake, ShieldAlert, ShieldCheck, Star, UserCheck, Users, Wallet, X } from "lucide-react";
import Link from "next/link";
import { LogoMark } from "@/components/logo";
import FinalCta from "@/components/marketing/final-cta";
import MarketingFooter from "@/components/marketing/footer";
import MarketingHeader from "@/components/marketing/header";
import ProfilePhoto from "@/components/ui/photo";
import { ScoreRing } from "@/components/ui/score";

const EXPLORE = [
  {
    href: "/comment-ca-marche",
    icon: Compass,
    title: "Comment ça marche",
    text: "Un parcours guidé en 4 étapes, de l'inscription au projet de mariage.",
  },
  {
    href: "/compatibilite",
    icon: HeartHandshake,
    title: "Compatibilité",
    text: "8 dimensions analysées, un score expliqué, jamais une boîte noire.",
  },
  {
    href: "/securite",
    icon: ShieldCheck,
    title: "Sécurité",
    text: "Profils validés à la main, messagerie modérée, anti-arnaque intégré.",
  },
  {
    href: "/tarifs",
    icon: Wallet,
    title: "Tarifs",
    text: "Gratuit pour commencer. Orange Money, Moov Money, Wave ou carte.",
  },
  {
    href: "/faq",
    icon: CircleHelp,
    title: "FAQ",
    text: "Toutes les réponses, de l'inscription à la sécurité de tes données.",
  },
];

const TESTIMONIALS = [
  { i: "A", n: "Aïssata, 29 ans", c: "Ouagadougou", t: "J'ai enfin rencontré quelqu'un qui partage ma foi et ma vision de la famille. Le questionnaire change tout." },
  { i: "J", n: "Jean-Marc, 34 ans", c: "Bobo-Dioulasso", t: "On voit directement si on est d'accord sur les sujets qui comptent : enfants, argent, religion. C'est rassurant." },
  { i: "M", n: "Mariam, 31 ans", c: "Diaspora, Paris", t: "Je cherchais quelqu'un qui partage mon projet de retour au pays. Les photos floutées m'ont permis de rester discrète." },
];

export default function LandingView() {
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

      <section className="l-section">
        <div className="l-wrap">
          <div className="l-head">
            <span className="eyebrow">À découvrir</span>
            <h2>Tout ce qu&apos;il faut savoir avant de commencer</h2>
            <p>Cinq pages, un sujet à la fois.</p>
          </div>
          <div className="explore-grid">
            {EXPLORE.map((item) => (
              <Link href={item.href} className="explore-card" key={item.href}>
                <span className="ex-ico">
                  <item.icon size={22} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <span className="ex-more">
                  En savoir plus <ArrowRight size={15} />
                </span>
              </Link>
            ))}
          </div>
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

      <FinalCta />
      <MarketingFooter />
    </div>
  );
}
