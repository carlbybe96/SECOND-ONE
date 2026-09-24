import { Check } from "lucide-react";
import Link from "next/link";
import { PLANS } from "@/lib/config";
import { fcfa } from "@/lib/format";

export default function PricingCards() {
  return (
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
  );
}
