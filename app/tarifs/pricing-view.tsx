import { Check, HeartHandshake, Rocket } from "lucide-react";
import Link from "next/link";
import FinalCta from "@/components/marketing/final-cta";
import MarketingFooter from "@/components/marketing/footer";
import MarketingHeader, { TopicHero } from "@/components/marketing/header";
import { BOOST, PAY_METHODS, PLANS, VIP } from "@/lib/config";
import { fcfa } from "@/lib/format";

const BILLING_FAQ = [
  { q: "Y a-t-il un engagement ?", a: "Aucun. Chaque abonnement couvre 30 jours. Tu peux désactiver le renouvellement à tout moment depuis la page Abonnement, sans justification." },
  { q: "Le paiement est-il prélevé automatiquement ?", a: "Non. Chaque renouvellement est un nouveau paiement que tu confirmes toi-même sur ton téléphone. Aucun prélèvement surprise sur ton compte Mobile Money." },
  { q: "Puis-je changer d'offre en cours de mois ?", a: "Oui, à tout moment. Le nouvel abonnement prend le relais dès le paiement confirmé." },
  { q: "Le paiement est-il sécurisé ?", a: "Oui. Les paiements Mobile Money sont confirmés directement par ton opérateur, et les paiements par carte passent par un protocole 3-D Secure." },
];

export default function PricingView() {
  return (
    <div className="landing">
      <MarketingHeader />
      <TopicHero
        eyebrow="Tarifs"
        title="Gratuit pour commencer. Premium pour avancer plus vite."
        lead="Paiement par Orange Money, Moov Money, Wave ou carte bancaire. Sans engagement, sans prélèvement automatique."
      />

      <section className="l-section">
        <div className="l-wrap">
          <div className="l-plans">
            {(["free", "premium", "premium_plus"] as const).map((k) => (
              <div key={k} className={`l-plan${k === "premium" ? " featured" : ""}`}>
                {k === "premium" && <span className="plan-ribbon">Le plus choisi</span>}
                <b className="lp-name">{PLANS[k].name}</b>
                <div className="lp-price">
                  <strong>{PLANS[k].price === 0 ? "0" : fcfa(PLANS[k].price).replace(" FCFA", "")}</strong> FCFA{PLANS[k].price > 0 && <span> / mois</span>}
                </div>
                <p className="lp-tag">{PLANS[k].tagline}</p>
                <ul>
                  {PLANS[k].features.map((f) => (
                    <li key={f}>
                      <Check size={15} /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={`btn btn-block ${k === "premium" ? "btn-gold" : "btn-outline"}`}>
                  {k === "free" ? "Commencer gratuitement" : `Choisir ${PLANS[k].name}`}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="l-section alt">
        <div className="l-wrap">
          <div className="l-head">
            <span className="eyebrow">En complément</span>
            <h2>Pour aller encore plus loin</h2>
          </div>
          <div className="addon-grid">
            <div className="addon-card">
              <span className="t-ico">
                <Rocket size={20} />
              </span>
              <div>
                <h3>Boost de visibilité — {fcfa(BOOST.price)}</h3>
                <p>Ton profil passe en tête des recommandations pendant {BOOST.minutes} minutes. Idéal le soir, quand les membres sont les plus actifs.</p>
              </div>
            </div>
            <div className="addon-card">
              <span className="t-ico">
                <HeartHandshake size={20} />
              </span>
              <div>
                <h3>
                  Accompagnement VIP — de {fcfa(VIP.priceFrom)} à {fcfa(VIP.priceTo)}
                </h3>
                <p>Une conseillère analyse ton profil, sélectionne des personnes pour toi et t&apos;accompagne jusqu&apos;à la rencontre. Premier échange gratuit.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="l-section">
        <div className="l-wrap">
          <div className="l-head">
            <span className="eyebrow">Moyens de paiement</span>
            <h2>Ce que tu utilises déjà</h2>
          </div>
          <div className="pay-grid">
            {PAY_METHODS.map((m) => (
              <div className="pay-card" key={m.key}>
                <span className="pm-dot lg" style={{ background: m.color }} />
                <b>{m.label}</b>
                <p>{m.hint}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="l-section alt">
        <div className="l-wrap faq-wrap">
          <div className="l-head">
            <span className="eyebrow">Questions sur la facturation</span>
            <h2>Ce qu&apos;il faut savoir avant de payer</h2>
          </div>
          <div className="faq">
            {BILLING_FAQ.map((item) => (
              <div key={item.q} className="faq-item static">
                <div className="faq-q static">{item.q}</div>
                <div className="faq-a" style={{ maxHeight: "none" }}>
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FinalCta />
      <MarketingFooter />
    </div>
  );
}
