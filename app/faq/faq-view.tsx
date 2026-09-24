"use client";

import { MessageCircle, Search, ShieldCheck, UserCog, Wallet } from "lucide-react";
import { useState } from "react";
import FinalCta from "@/components/marketing/final-cta";
import MarketingFooter from "@/components/marketing/footer";
import MarketingHeader, { TopicHero } from "@/components/marketing/header";
import { APP, LIMITS, PLANS } from "@/lib/config";
import { fcfa } from "@/lib/format";

const CATEGORIES = [
  {
    icon: UserCog,
    title: "Inscription et compte",
    items: [
      { q: "Comment créer un compte ?", a: "Clique sur « Créer mon profil », indique si tu es un homme ou une femme, ton prénom, ton âge, ta ville et un mot de passe. Tu complètes ensuite ton profil en 5 étapes guidées (informations, foi, critères, projet familial, questionnaire)." },
      { q: "Pourquoi mon profil est-il en attente de validation ?", a: "Pour garantir la qualité de la communauté, chaque profil est vérifié par notre équipe avant d'être visible. Ce délai est généralement de moins de 24 heures." },
      { q: "Puis-je modifier mes informations après l'inscription ?", a: "Oui, à tout moment depuis « Mon profil ». Tu peux aussi refaire le questionnaire de compatibilité quand tu le souhaites : tes scores sont recalculés immédiatement." },
      { q: "Comment supprimer mon compte ?", a: "Depuis Paramètres → Mes données → Supprimer mon compte. Il te sera demandé de taper SUPPRIMER pour confirmer. Cette action efface définitivement ton profil, tes photos, tes matchs et tes conversations." },
    ],
  },
  {
    icon: Search,
    title: "Recherche et compatibilité",
    items: [
      { q: "Comment fonctionne la recherche de profils ?", a: "Les filtres sont réciproques : tu ne vois que des profils dont les critères d'âge, de religion et de situation matrimoniale te correspondent, et qui te correspondent en retour. Tu peux trier par compatibilité, activité récente ou proximité." },
      { q: "Combien de profils puis-je voir par jour ?", a: `L'offre gratuite propose ${LIMITS.free.profilesPerDay} profils par jour, pour privilégier la qualité à la quantité. Premium et Premium+ retirent cette limite.` },
      { q: "Comment est calculé le score de compatibilité ?", a: "À partir de vos réponses au questionnaire de 21 questions, sur 8 dimensions pondérées (religion, valeurs, couple, famille, enfants, finances, mode de vie, distance). Le détail complet est expliqué sur la page Compatibilité." },
      { q: "Puis-je voir qui a consulté mon profil ?", a: "Cette fonctionnalité fait partie de l'offre Premium. En gratuit, tu sais seulement que des personnes ont visité ton profil, sans savoir lesquelles." },
    ],
  },
  {
    icon: MessageCircle,
    title: "Contact et messagerie",
    items: [
      { q: "Comment contacter quelqu'un ?", a: "Depuis son profil, clique sur « Je suis intéressé(e) » ou « Super-intérêt » (avec un message). Si la personne accepte, un match se crée et la conversation s'ouvre." },
      { q: "Qu'est-ce qu'un super-intérêt ?", a: `Un intérêt mis en avant, accompagné d'un message : ton profil apparaît en tête de ses demandes. Free : aucun. Premium : ${LIMITS.premium.superPerDay} par jour. Premium+ : ${LIMITS.premium_plus.superPerDay} par jour.` },
      { q: "Ma demande a été déclinée, puis-je en renvoyer une autre ?", a: "Non. Pour respecter la volonté de chaque membre, une demande refusée ne peut pas être renvoyée à la même personne." },
      { q: "Les conversations sont-elles surveillées ?", a: "Non. Nous ne lisons pas les conversations privées. Un message est simplement analysé automatiquement (demande d'argent, lien suspect) avant l'envoi. En cas de signalement, un modérateur examine uniquement les messages concernés." },
    ],
  },
  {
    icon: Wallet,
    title: "Abonnement et paiement",
    items: [
      { q: "Quels sont les avantages Premium ?", a: `Pour ${fcfa(PLANS.premium.price)} par mois : ${PLANS.premium.features.join(", ").toLowerCase()}. Le détail des offres est sur la page Tarifs.` },
      { q: "Comment payer mon abonnement ?", a: "Par Orange Money, Moov Money, Wave, ou carte bancaire (Visa, Mastercard). Le paiement est sécurisé, confirmé directement sur ton téléphone." },
      { q: "Puis-je annuler mon abonnement ?", a: "Oui, à tout moment depuis la page Abonnement. Tu conserves tes avantages Premium jusqu'à la fin de la période déjà payée : aucun remboursement au prorata." },
      { q: "Y a-t-il une période d'essai ?", a: "Nous proposons régulièrement des offres de lancement. La création de compte et le questionnaire, eux, sont gratuits en permanence." },
    ],
  },
  {
    icon: ShieldCheck,
    title: "Sécurité et confidentialité",
    items: [
      { q: "Comment mes données sont-elles protégées ?", a: "Tes données sont chiffrées et ne sont jamais partagées avec des tiers sans ton consentement explicite. Tu peux exporter toutes tes données ou supprimer ton compte à tout moment. Détails complets sur la page Sécurité et dans nos informations légales." },
      { q: "Comment signaler un comportement inapproprié ?", a: "Depuis le profil ou la conversation concernée, bouton « Signaler ». Notre équipe traite chaque signalement sous 24 heures et peut avertir, suspendre ou bannir le compte." },
      { q: "Comment bloquer quelqu'un ?", a: "Depuis son profil ou une conversation. Une fois bloquée, la personne ne peut plus te voir ni te contacter, et disparaît de tes recommandations, dans les deux sens." },
    ],
  },
];

export default function FaqView() {
  const [open, setOpen] = useState<string | null>(`${CATEGORIES[0].title}:0`);

  return (
    <div className="landing">
      <MarketingHeader />
      <TopicHero eyebrow="Questions fréquentes" title="Tout ce qu'il faut savoir" lead="Classées par thème. Une question sans réponse ici ? Écris-nous directement." />

      <section className="l-section">
        <div className="l-wrap faq-wrap">
          {CATEGORIES.map((cat) => (
            <div key={cat.title} className="faq-cat">
              <h2 className="faq-cat-title">
                <cat.icon size={18} /> {cat.title}
              </h2>
              <div className="faq">
                {cat.items.map((item, i) => {
                  const id = `${cat.title}:${i}`;
                  const isOpen = open === id;
                  return (
                    <div key={id} className={`faq-item${isOpen ? " open" : ""}`}>
                      <button type="button" className="faq-q" onClick={() => setOpen(isOpen ? null : id)} aria-expanded={isOpen}>
                        {item.q}
                        <span className="faq-ico">+</span>
                      </button>
                      {isOpen && <div className="faq-a">{item.a}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="faq-contact">
            <p>Tu n&apos;as pas trouvé ta réponse ?</p>
            <a href={`mailto:${APP.supportEmail}`} className="btn btn-outline">
              Nous contacter
            </a>
          </div>
        </div>
      </section>

      <FinalCta />
      <MarketingFooter />
    </div>
  );
}
