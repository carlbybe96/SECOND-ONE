import type { Metadata } from "next";
import Link from "next/link";
import DemoBanner from "@/components/demo-banner";
import Logo from "@/components/logo";
import { APP } from "@/lib/config";
import "../flow.css";

export const metadata: Metadata = { title: "Charte, confidentialité et conditions" };

export default function LegalPage() {
  return (
    <div className="flow">
      <DemoBanner />
      <header className="flow-header">
        <div className="flow-topbar">
          <Logo />
          <Link href="/register" className="btn btn-primary btn-sm">
            Créer mon profil
          </Link>
        </div>
      </header>
      <main className="onb-main legal">
        <div className="flow-card">
          <div className="eyebrow">Informations légales</div>
          <h1>Charte, confidentialité et conditions d&apos;utilisation</h1>
          <p className="sub">
            Document de démonstration : à faire relire par un juriste avant la mise en ligne, et à adapter à la réglementation sur les données personnelles du pays de
            lancement (au Burkina Faso, déclaration auprès de la CIL).
          </p>

          <section id="charte">
            <h2>1. Charte de bonne conduite</h2>
            <ul>
              <li>{APP.name} est réservé aux personnes majeures qui recherchent sincèrement le mariage ou une relation sérieuse qui y mène.</li>
              <li>Un seul compte par personne, avec des informations et des photos qui te représentent réellement.</li>
              <li>Respect en toutes circonstances : pas d&apos;insultes, de harcèlement, de propos haineux ni de contenus à caractère sexuel.</li>
              <li>Aucune demande d&apos;argent, de recharge, de carte cadeau ni de transfert, quel que soit le motif.</li>
              <li>La religion est un critère de compatibilité, jamais un motif de moquerie ou de discrimination.</li>
              <li>Tout manquement peut entraîner un avertissement, une suspension ou un bannissement définitif.</li>
            </ul>
          </section>

          <section id="confidentialite">
            <h2>2. Politique de confidentialité</h2>
            <ul>
              <li>Données collectées : informations de profil, réponses au questionnaire, photos, messages, données de paiement (référence de transaction, jamais ton code secret).</li>
              <li>Finalités : calcul de compatibilité, fonctionnement de la messagerie, sécurité de la communauté, gestion des abonnements.</li>
              <li>Les conversations sont privées. Elles ne sont consultées par l&apos;équipe de modération qu&apos;en cas de signalement, et uniquement les messages concernés.</li>
              <li>Le selfie de vérification et les documents d&apos;identité ne sont jamais publiés et sont supprimés après contrôle.</li>
              <li>Tu peux exporter tes données ou supprimer ton compte à tout moment depuis les paramètres.</li>
              <li>Tes données ne sont ni vendues ni partagées avec des tiers sans ton consentement explicite.</li>
            </ul>
          </section>

          <section id="cgu">
            <h2>3. Conditions d&apos;utilisation</h2>
            <ul>
              <li>L&apos;inscription est gratuite. Les offres Premium sont payées d&apos;avance pour 30 jours, sans renouvellement automatique.</li>
              <li>
                Le score de compatibilité est une aide à la décision fondée sur tes réponses : il ne garantit ni la sincérité d&apos;une personne ni la réussite d&apos;une
                relation.
              </li>
              <li>Avant toute rencontre, privilégie un lieu public et informe un proche. Ne transfère jamais d&apos;argent à une personne rencontrée en ligne.</li>
              <li>
                Contact : <a href={`mailto:${APP.supportEmail}`}>{APP.supportEmail}</a>
              </li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
