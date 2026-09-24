"use client";

import Link from "next/link";
import { useState } from "react";
import DemoBanner from "@/components/demo-banner";

const FAQ = [
  {
    q: "FaithMatch est-il comme Tinder ?",
    a: "Non. FaithMatch est une plateforme matrimoniale : les recommandations sont basées sur la foi, les valeurs et le projet de vie — pas uniquement sur les photos. Vous recevez 5 à 10 profils très pertinents par jour, pas des centaines.",
  },
  {
    q: "Comment fonctionne le score de compatibilité ?",
    a: "Après avoir répondu à un questionnaire (50 questions réparties en 7 catégories : religion, couple, famille, enfants, argent, carrière, lifestyle), nous calculons un score global de 0 à 100 % et un détail par domaine, avec les points à discuter.",
  },
  {
    q: "Quelles religions sont représentées ?",
    a: "Islam, christianisme, judaïsme et autres — avec des précisions (sunnite/chiite, catholique/protestant/évangélique/orthodoxe…). La religion est un critère central mais jamais un motif de discrimination ou de harcèlement.",
  },
  {
    q: "Comment la plateforme protège-t-elle les utilisateurs ?",
    a: "Vérification en plusieurs niveaux (téléphone, photo, identité), modération des messages, signalement et blocage en un geste, et détection automatique des demandes d'argent et des faux profils.",
  },
  {
    q: "Que coûte FaithMatch ?",
    a: "L'inscription et la création de profil sont gratuites. Un abonnement Premium à 2 500 FCFA/mois débloque des fonctionnalités avancées, et Premium+ à 5 000 FCFA/mois ajoute le matching IA et l'assistant personnel.",
  },
];

export default function LandingPage() {
  const [navOpen, setNavOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <DemoBanner />
      <header>
        <nav className="nav">
          <a href="#" className="logo">
            <span className="logo-mark">❤️</span> FaithMatch
          </a>
          <ul className={`nav-links${navOpen ? " open" : ""}`} id="navLinks">
            <li>
              <a href="#how">Comment ça marche</a>
            </li>
            <li>
              <a href="#compatibility">Compatibilité</a>
            </li>
            <li>
              <a href="#trust">Sécurité</a>
            </li>
            <li>
              <a href="#faq">FAQ</a>
            </li>
            <li>
              <a href="#pricing">Tarifs</a>
            </li>
          </ul>
          <div className="nav-cta">
            <Link href="/login" className="btn btn-outline" style={{ padding: "10px 18px" }}>
              Se connecter
            </Link>
            <Link href="/register" className="btn btn-primary" style={{ padding: "10px 18px" }}>
              Créer mon profil
            </Link>
          </div>
          <button className="nav-toggle" aria-label="Menu" onClick={() => setNavOpen(!navOpen)}>
            <span />
            <span />
            <span />
          </button>
        </nav>
      </header>

      {/* HERO */}
      <section className="hero" style={{ maxWidth: "none", paddingBottom: 0 }}>
        <div className="hero-inner">
          <div>
            <div className="hero-badge">💍 Rencontres sérieuses · Foi · Valeurs · Projet de vie</div>
            <h1>
              Trouve quelqu&apos;un qui partage <em>ta foi</em>, <em>tes valeurs</em> et{" "}
              <em>ton projet de vie</em>.
            </h1>
            <p className="sub">
              Une plateforme matrimoniale pensée pour les personnes qui recherchent une relation sérieuse et
              compatible — pas seulement une rencontre.
            </p>
            <div className="hero-cta">
              <Link href="/register" className="btn btn-primary btn-lg">
                Créer mon profil
              </Link>
              <a href="#how" className="btn btn-outline btn-lg">
                Découvrir comment ça marche
              </a>
            </div>
            <div className="hero-proof">
              <div>
                <strong>92 %</strong>
                <span>compatibilité moyenne</span>
              </div>
              <div>
                <strong>50</strong>
                <span>questions de compatibilité</span>
              </div>
              <div>
                <strong>5–10</strong>
                <span>recommandations par jour</span>
              </div>
            </div>
          </div>
          <div>
            <div className="hero-card">
              <div className="photo">
                <span className="emoji">💍</span>
                <span className="ring-badge">✓ Profil vérifié</span>
              </div>
              <div className="who">
                <div>
                  <div className="name">Sarah, 28 ans</div>
                  <div className="meta">Ouagadougou · Catholique · Marketing</div>
                </div>
                <span className="score-chip">❤️ 94 %</span>
              </div>
              <div className="tags">
                <span className="tag">Famille</span>
                <span className="tag">Mariage</span>
                <span className="tag">Enfants</span>
                <span className="tag">Foi</span>
              </div>
              <div className="actions">
                <button className="round-btn pass" title="Passer">
                  ✕
                </button>
                <button className="round-btn like" title="Intéressé">
                  ❤️
                </button>
                <button className="round-btn super" title="Super intérêt">
                  ⭐
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how">
        <div className="center">
          <div className="section-label">Comment ça marche</div>
          <h2 className="section-title">Trois étapes vers une vraie compatibilité</h2>
          <p className="section-sub">Pas de swipe à l&apos;infini. Un parcours sérieux, guidé et progressif.</p>
        </div>
        <div className="steps">
          <div className="step">
            <div className="step-num">01</div>
            <h3>Crée ton profil</h3>
            <p>
              Présente ta personnalité, ta foi et ton projet de vie. Précise ta religion, ta dénomination et ton
              niveau de pratique.
            </p>
          </div>
          <div className="step">
            <div className="step-num">02</div>
            <h3>Découvre ta compatibilité</h3>
            <p>
              Notre système analyse tes valeurs, tes réponses et tes objectifs pour calculer un score de
              compatibilité honnête.
            </p>
          </div>
          <div className="step">
            <div className="step-num">03</div>
            <h3>Rencontre la bonne personne</h3>
            <p>
              Discutez, apprenez à vous connaître et avancez progressivement — jusqu&apos;au projet matrimonial, si
              tout se passe bien.
            </p>
          </div>
        </div>
        <div className="band">
          <div>
            <h2>Rejoins une communauté qui prend le mariage au sérieux</h2>
            <p>
              Commençant à Ouagadougou, FaithMatch grandit avec toi — une communauté, une ville, puis toute
              l&apos;Afrique francophone.
            </p>
          </div>
          <Link href="/register" className="btn btn-white btn-lg">
            Créer mon profil
          </Link>
        </div>
      </section>

      {/* COMPATIBILITY */}
      <section id="compatibility">
        <div className="compat-wrap">
          <div>
            <div className="section-label">Compatibilité</div>
            <h2 className="section-title">Plus qu&apos;une photo. Une vraie compatibilité.</h2>
            <p className="section-sub">
              Nous comparons la religion, les valeurs, la vision du couple, de la famille, des enfants, des finances
              et du lifestyle. Chaque recommandation explique pourquoi vous êtes compatibles.
            </p>
          </div>
          <div className="compat-card">
            <div className="who">
              <div className="avatar">S</div>
              <div>
                <div className="name">Sarah, 28 ans</div>
                <div className="meta">Ouagadougou · Catholique · Marketing</div>
              </div>
            </div>
            <div className="score-big">
              <div className="value">94 %</div>
              <div className="label">compatibles ❤️</div>
            </div>
            <div className="bars">
              {[
                ["Religion", 98],
                ["Valeurs", 95],
                ["Famille", 93],
                ["Enfants", 96],
                ["Lifestyle", 89],
                ["Finance", 86],
              ].map(([k, v]) => (
                <div className="bar-row" key={k as string}>
                  <span className="k">{k}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${v}%` }} />
                  </div>
                  <span className="v">{v}%</span>
                </div>
              ))}
            </div>
            <p className="compat-note">
              <strong>Vous partagez :</strong> religion · vision familiale · projet d&apos;enfants · lifestyle
            </p>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section id="trust">
        <div className="trust">
          <div className="center">
            <div className="section-label">Sécurité &amp; confiance</div>
            <h2 className="section-title">Des rencontres pensées pour être plus sûres.</h2>
          </div>
          <div className="trust-grid">
            {[
              ["Profils vérifiés", "Téléphone, photo et identité — chaque badge a une signification claire."],
              ["Modération", "Analyse automatique des messages et intervention humaine sur les signalements."],
              ["Signalement & blocage", "Signalez ou bloquez en un geste. Une fois bloqué, plus aucun contact possible."],
              ["Détection anti-arnaque", "Alertes sur les demandes d'argent, liens suspects et comportements automatisés."],
              ["Protection des données", "Conversations privées, données protégées, consentement respecté (RGPD)."],
              ["Consentement", "Aucune information privée partagée sans votre accord explicite."],
            ].map(([t, d]) => (
              <div className="trust-item" key={t}>
                <div className="trust-check">✓</div>
                <div>
                  <h4>{t}</h4>
                  <p>{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials">
        <div className="center">
          <div className="section-label">Témoignages</div>
          <h2 className="section-title">Ils ont trouvé une vraie compatibilité</h2>
        </div>
        <div className="quotes">
          {[
            {
              stars: "★★★★★",
              text: "« J'ai enfin rencontré quelqu'un qui partageait ma foi et ma vision de la famille. Le questionnaire change tout. »",
              initial: "A",
              name: "Aïcha, 29",
              city: "Ouagadougou",
            },
            {
              stars: "★★★★★",
              text: "« On voit directement si on est compatibles sur les sujets qui comptent : enfants, argent, religion. Très rassurant. »",
              initial: "J",
              name: "Jean-Marc, 34",
              city: "Bobo-Dioulasso",
            },
            {
              stars: "★★★★★",
              text: "« Vivant en France, je cherchais quelqu'un qui partage mes valeurs et mon projet de retour. FaithMatch m'a aidé. »",
              initial: "M",
              name: "Mariam, 31",
              city: "Diaspora",
            },
          ].map((t) => (
            <div className="quote" key={t.name}>
              <div className="stars">{t.stars}</div>
              <p>{t.text}</p>
              <div className="person">
                <div className="avatar">{t.initial}</div>
                <div>
                  <div className="n">{t.name}</div>
                  <div className="r">{t.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq">
        <div className="center">
          <div className="section-label">Questions fréquentes</div>
          <h2 className="section-title">Tout ce qu&apos;il faut savoir</h2>
        </div>
        <div className="faq" style={{ marginTop: 40 }}>
          {FAQ.map((item, i) => (
            <div key={item.q} className={`faq-item${openFaq === i ? " open" : ""}`}>
              <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {item.q} <span className="icon">+</span>
              </button>
              <div className="faq-a" style={openFaq === i ? { maxHeight: 300 } : undefined}>
                <div>{item.a}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing">
        <div className="center">
          <div className="section-label">Abonnement</div>
          <h2 className="section-title">Commence gratuitement. Avance à ton rythme.</h2>
          <p className="section-sub">Un accompagnement progressif, du premier profil jusqu&apos;au projet matrimonial.</p>
        </div>
        <div className="pricing">
          <div className="plan">
            <div className="pname">FREE</div>
            <div className="price">
              <span className="amount">0 FCFA</span>
            </div>
            <div className="pdesc">Pour commencer sérieusement.</div>
            <ul>
              <li>Création de profil</li>
              <li>Questionnaire de compatibilité</li>
              <li>Recommandations limitées</li>
              <li>Likes limités</li>
              <li>Matchs &amp; messagerie de base</li>
            </ul>
            <Link href="/register" className="btn btn-outline">
              Commencer gratuitement
            </Link>
          </div>
          <div className="plan featured">
            <div className="pname">PREMIUM</div>
            <div className="price">
              <span className="amount">2 500 FCFA</span> <span className="per">/ mois</span>
            </div>
            <div className="pdesc">Pour aller plus loin.</div>
            <ul>
              <li>Recommandations illimitées</li>
              <li>Filtres avancés</li>
              <li>Likes supplémentaires</li>
              <li>Voir certains intérêts</li>
              <li>Questions matrimoniales</li>
              <li>Meilleure visibilité</li>
            </ul>
            <Link href="/register" className="btn btn-primary">
              Passer Premium
            </Link>
          </div>
          <div className="plan">
            <div className="pname">PREMIUM+</div>
            <div className="price">
              <span className="amount">5 000 FCFA</span> <span className="per">/ mois</span>
            </div>
            <div className="pdesc">L&apos;expérience complète.</div>
            <ul>
              <li>Tout Premium</li>
              <li>Matching IA avancé</li>
              <li>Score détaillé par domaine</li>
              <li>Mode famille</li>
              <li>Boost de visibilité</li>
              <li>Assistant IA (Faith Coach)</li>
            </ul>
            <Link href="/register" className="btn btn-outline">
              Passer Premium+
            </Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section id="signup">
        <div className="final-cta">
          <h2>Ta personne compatible t&apos;attend.</h2>
          <p>
            Rejoins la plateforme matrimoniale qui prend au sérieux ta foi, tes valeurs et ton projet de vie.
          </p>
          <Link href="/register" className="btn btn-white btn-lg">
            Créer mon profil — c&apos;est gratuit
          </Link>
        </div>
      </section>

      <footer>
        <div className="footer-inner">
          <div>
            <a href="#" className="logo" style={{ color: "#fff", marginBottom: 14 }}>
              <span className="logo-mark">❤️</span> FaithMatch
            </a>
            <p style={{ fontSize: ".88rem", marginTop: 12, maxWidth: 280 }}>
              « Pas seulement une rencontre. Une vraie compatibilité. » Une plateforme matrimoniale intelligente
              basée sur la foi, les valeurs et le projet de vie.
            </p>
          </div>
          <div>
            <h4>Produit</h4>
            <a href="#how">Comment ça marche</a>
            <a href="#compatibility">Compatibilité</a>
            <a href="#pricing">Abonnements</a>
            <a href="#faq">FAQ</a>
          </div>
          <div>
            <h4>Sécurité</h4>
            <a href="#trust">Vérification</a>
            <a href="#trust">Signalement</a>
            <a href="#trust">Confidentialité</a>
            <a href="#trust">RGPD</a>
          </div>
          <div>
            <h4>Entreprise</h4>
            <a href="#">À propos</a>
            <a href="#">Contact</a>
            <a href="#">Conditions d&apos;utilisation</a>
            <a href="#">Politique de confidentialité</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 FaithMatch — Burkina Faso</span>
          <span>Fait avec ❤️ à Ouagadougou</span>
        </div>
      </footer>

      <div className="mobile-cta">
        <Link href="/register" className="btn btn-primary">
          Créer mon profil
        </Link>
      </div>
    </>
  );
}