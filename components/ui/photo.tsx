import { Lock } from "lucide-react";
import { avatarDataUrl } from "@/lib/avatar";
import type { Profile } from "@/lib/types";

type Props = {
  profile: Pick<Profile, "photo" | "avatar" | "gender" | "firstName">;
  locked?: boolean;
  size?: number;
  round?: boolean;
  className?: string;
  lockLabel?: boolean;
};

/** Photo réelle si le membre en a ajouté une, sinon portrait illustré. Floutée si le membre l'a choisi. */
export default function ProfilePhoto({ profile, locked = false, size, round = false, className = "", lockLabel = true }: Props) {
  const src = profile.photo ?? avatarDataUrl(profile.avatar, profile.gender);
  const small = size !== undefined && size < 96;
  return (
    <div className={`photo${round ? " round" : ""}${locked ? " locked" : ""} ${className}`} style={size ? { width: size, height: size } : undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element -- images locales (data URL), pas d'optimisation utile */}
      <img src={src} alt={`Photo de ${profile.firstName}`} draggable={false} />
      {locked && (
        <div className="lock">
          <div className="lock-inner">
            <Lock size={small ? 14 : 20} />
            {lockLabel && !small && <span>Photo visible après le match</span>}
          </div>
        </div>
      )}
    </div>
  );
}
