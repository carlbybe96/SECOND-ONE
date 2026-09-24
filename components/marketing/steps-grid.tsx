import { MessageCircleHeart, ShieldCheck, Sparkles, UserPlus } from "lucide-react";
import { QUIZ } from "@/lib/questions";

export const STEPS = [
  {
    n: "01",
    icon: UserPlus,
    title: "Crée ton profil",
    text: "Prénom, âge, ville, profession, ta religion et ton niveau de pratique, ce que tu recherches. Cinq minutes suffisent. Notre équipe vérifie ensuite ton profil à la main, avant qu'il soit visible.",
  },
  {
    n: "02",
    icon: Sparkles,
    title: "Réponds au questionnaire",
    text: `${QUIZ.length} questions réparties en 7 thèmes : religion, valeurs, couple, famille, enfants, finances, mode de vie. Trois minutes, et c'est ce qui alimente ton score de compatibilité avec chaque profil.`,
  },
  {
    n: "03",
    icon: ShieldCheck,
    title: "Découvre des profils compatibles",
    text: "Une sélection quotidienne, pas un flux infini. Chaque carte affiche un score et explique pourquoi vous êtes compatibles, avec les points à discuter.",
  },
  {
    n: "04",
    icon: MessageCircleHeart,
    title: "Échangez en toute pudeur",
    text: "Un intérêt réciproque ouvre la conversation. Photos floutées si tu le souhaites, messages modérés, et un parcours qui avance à votre rythme.",
  },
] as const;

export default function StepsGrid() {
  return (
    <div className="steps4">
      {STEPS.map((s) => (
        <div className="step4" key={s.n}>
          <span className="s-num">
            <s.icon size={20} />
          </span>
          <h3>{s.title}</h3>
          <p>{s.text}</p>
        </div>
      ))}
    </div>
  );
}
