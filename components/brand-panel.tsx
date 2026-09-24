import { BadgeCheck, EyeOff, HeartHandshake, ShieldCheck } from "lucide-react";
import ProfilePhoto from "@/components/ui/photo";
import type { AvatarSpec, Gender } from "@/lib/types";

const FACES: { gender: Gender; avatar: AvatarSpec }[] = [
  { gender: "femme", avatar: { hair: "tresses", headwear: "hijab", skin: 0, bg: 0, outfit: 0, wrap: 1 } },
  { gender: "homme", avatar: { hair: "court", beard: true, skin: 2, bg: 2, outfit: 1 } },
  { gender: "femme", avatar: { hair: "chignon", skin: 3, bg: 5, outfit: 8, earrings: true } },
  { gender: "homme", avatar: { hair: "court", headwear: "kufi", skin: 4, bg: 1, outfit: 2 } },
];

export default function BrandPanel() {
  return (
    <aside className="brand-panel">
      <h2>Une plateforme pensée pour le mariage, pas pour le swipe.</h2>
      <p>Chaque profil est vérifié par notre équipe. Chaque recommandation explique pourquoi vous êtes compatibles.</p>
      <ul>
        <li>
          <span className="ico">
            <HeartHandshake size={18} />
          </span>
          <span>
            <b>Compatibilité réelle</b>
            Foi, valeurs, famille, enfants, finances : 8 dimensions analysées.
          </span>
        </li>
        <li>
          <span className="ico">
            <BadgeCheck size={18} />
          </span>
          <span>
            <b>Profils validés à la main</b>
            Téléphone et selfie vérifiés, badges clairs.
          </span>
        </li>
        <li>
          <span className="ico">
            <EyeOff size={18} />
          </span>
          <span>
            <b>Pudeur et discrétion</b>
            Photos floutées jusqu&apos;au match si tu le souhaites.
          </span>
        </li>
        <li>
          <span className="ico">
            <ShieldCheck size={18} />
          </span>
          <span>
            <b>Anti-arnaque</b>
            Les demandes d&apos;argent sont détectées et signalées.
          </span>
        </li>
      </ul>
      <div className="brand-faces">
        <div className="stack">
          {FACES.map((f, i) => (
            <ProfilePhoto key={i} profile={{ ...f, photo: null, firstName: "Membre" }} size={44} round />
          ))}
        </div>
        <span>Des célibataires sérieux, près de chez toi et dans la diaspora.</span>
      </div>
    </aside>
  );
}
