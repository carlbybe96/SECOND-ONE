import { Ban, EyeOff, Lock, ShieldAlert, UserCheck, Users } from "lucide-react";

const TRUST = [
  [UserCheck, "Profils validés à la main", "Chaque inscription est vérifiée par un modérateur avant d'être visible. Aucun bot, aucun faux profil ne passe."],
  [EyeOff, "Pudeur respectée", "Floute tes photos jusqu'au match, ou passe en mode invisible. C'est toi qui décides qui te voit."],
  [Users, "Mode famille", "Implique ton tuteur (wali), un parent ou une personne de confiance, sans jamais exposer tes conversations privées."],
  [ShieldAlert, "Anti-arnaque", "Les demandes d'argent, liens suspects et comportements automatisés sont détectés dans les messages, en temps réel."],
  [Ban, "Signaler et bloquer", "En un geste, depuis un profil ou une conversation. Les signalements sont traités sous 24 h."],
  [Lock, "Données protégées", "Conversations privées, export et suppression de tes données à tout moment, depuis les paramètres."],
] as const;

export default function TrustGrid() {
  return (
    <div className="trust-grid">
      {TRUST.map(([Icon, t, d]) => (
        <div className="trust-item" key={t}>
          <span className="t-ico">
            <Icon size={20} />
          </span>
          <h3>{t}</h3>
          <p>{d}</p>
        </div>
      ))}
    </div>
  );
}
