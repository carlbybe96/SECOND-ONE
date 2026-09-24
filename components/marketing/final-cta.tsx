import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import Link from "next/link";

export default function FinalCta({
  title = "Ta personne compatible t'attend peut-être déjà.",
  text = "Inscription gratuite, deux minutes pour créer ton profil.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="l-final">
      <div className="l-wrap final-inner">
        <Sparkles size={26} />
        <h2>{title}</h2>
        <p>{text}</p>
        <div className="hero-actions" style={{ justifyContent: "center" }}>
          <Link href="/register" className="btn btn-white btn-lg">
            Créer mon profil <ArrowRight size={18} />
          </Link>
          <Link href="/login" className="btn btn-lg final-ghost">
            <MessageCircle size={18} /> Essayer la démo
          </Link>
        </div>
      </div>
    </section>
  );
}
