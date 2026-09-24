import { Baby, Check, HandHeart, HeartHandshake, MapPin, Scale, Smile, TriangleAlert, Users, Wallet } from "lucide-react";
import CompatDemoCard from "@/components/marketing/compat-demo";
import FinalCta from "@/components/marketing/final-cta";
import MarketingFooter from "@/components/marketing/footer";
import MarketingHeader, { TopicHero } from "@/components/marketing/header";
import { CATEGORIES } from "@/lib/questions";

const DIMENSIONS = [
  { key: "religion", icon: HandHeart, text: "Ta religion, ton courant et ton niveau de pratique. Le critère le plus lourd, mais jamais un motif de discrimination." },
  { key: "valeurs", icon: Scale, text: "Ta vision des rôles dans le couple, du travail, de l'autorité et des décisions communes." },
  { key: "couple", icon: HeartHandshake, text: "Comment vous prenez les décisions, gérez les désaccords, et à quel rythme vous envisagez le mariage." },
  { key: "famille", icon: Users, text: "La place de vos parents respectifs, la fréquence des visites, le soutien à la famille élargie." },
  { key: "enfants", icon: Baby, text: "Voulez-vous des enfants, combien, et quelle éducation religieuse leur donner." },
  { key: "finances", icon: Wallet, text: "Comptes communs ou séparés, qui gère le budget, épargner ou profiter du moment présent." },
  { key: "lifestyle", icon: Smile, text: "Ton rythme de vie, ta sociabilité, tes habitudes de sorties et de voyages." },
  { key: "distance", icon: MapPin, text: "Même ville, même pays, ou diaspora : la distance réelle entre vous, et votre mobilité." },
] as const;

export default function CompatibilityView() {
  return (
    <div className="landing">
      <MarketingHeader />
      <TopicHero
        eyebrow="Compatibilité"
        title="Plus qu'une photo : une vraie compatibilité"
        lead="Un score qui s'appuie sur 8 dimensions, avec la pondération d'un conseiller matrimonial plutôt que celle d'un algorithme opaque."
      />

      <section className="l-section">
        <div className="l-wrap compat-grid">
          <div>
            <span className="eyebrow">Comment ça se calcule</span>
            <h2>Deux niveaux de filtrage</h2>
            <p className="l-lead">
              D&apos;abord des <b>filtres stricts</b>, réciproques : âge, religion, situation matrimoniale, ville. Un profil hors de tes critères — ou pour qui tu es hors de
              ses critères — n&apos;apparaît jamais. Ensuite, un <b>score pondéré</b> sur ce qui reste, calculé à partir de vos réponses au questionnaire.
            </p>
            <ul className="l-checks">
              <li>
                <Check size={17} /> Les points bloquants (projet d&apos;enfants, type d&apos;union) sont repérés et pénalisent fortement le score.
              </li>
              <li>
                <Check size={17} /> Les filtres fonctionnent dans les deux sens : tu ne vois que des personnes qui te recherchent aussi.
              </li>
              <li>
                <Check size={17} /> Jamais « l&apos;âme sœur garantie » : des facteurs concrets, à discuter ensemble.
              </li>
            </ul>
          </div>
          <CompatDemoCard />
        </div>
      </section>

      <section className="l-section alt">
        <div className="l-wrap">
          <div className="l-head">
            <span className="eyebrow">Les 8 dimensions</span>
            <h2>Chaque dimension pèse selon son importance</h2>
            <p>La religion et les valeurs comptent le plus. La distance, le moins, car elle se résout souvent d&apos;elle-même.</p>
          </div>
          <div className="dim-grid">
            {DIMENSIONS.map((d) => {
              const cat = CATEGORIES.find((c) => c.key === d.key)!;
              return (
                <div className="dim-item" key={d.key}>
                  <div className="dim-top">
                    <span className="t-ico">
                      <d.icon size={19} />
                    </span>
                    <span className="dim-weight">{cat.weight}%</span>
                  </div>
                  <h3>{cat.label}</h3>
                  <p>{d.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="l-section">
        <div className="l-wrap">
          <div className="l-head" style={{ textAlign: "left", margin: 0, maxWidth: 720 }}>
            <span className="eyebrow">
              <TriangleAlert size={13} style={{ verticalAlign: "-2px" }} /> Points bloquants
            </span>
            <h2>Certains écarts pèsent plus que d&apos;autres</h2>
            <p>
              Deux profils avec un bon score global peuvent quand même avoir un désaccord de fond. FaithMatch le signale clairement, au lieu de le noyer dans une moyenne.
              Exemple : si l&apos;un veut des enfants et l&apos;autre non, ou si votre vision du type d&apos;union diverge fortement, le score global baisse et le point
              apparaît noir sur blanc dans « points à discuter », pour que vous en parliez avant d&apos;aller plus loin.
            </p>
          </div>
        </div>
      </section>

      <FinalCta />
      <MarketingFooter />
    </div>
  );
}
