import Link from "next/link";
import Logo from "@/components/logo";
import { APP } from "@/lib/config";
import MobileCta from "./mobile-cta";
import { NAV } from "./nav";

export default function MarketingFooter({ hideMobileCta = false, ctaAfter = 0 }: { hideMobileCta?: boolean; ctaAfter?: number }) {
  return (
    <>
      <footer className="l-footer">
        <div className="l-wrap footer-grid">
          <div>
            <Logo light />
            <p>{APP.tagline} La plateforme matrimoniale fondée sur la foi, les valeurs et le projet de vie.</p>
          </div>
          <div>
            <h4>Produit</h4>
            {NAV.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
          <div>
            <h4>Confiance</h4>
            <Link href="/legal#charte">Charte de bonne conduite</Link>
            <Link href="/legal#confidentialite">Confidentialité</Link>
            <Link href="/legal#cgu">Conditions d&apos;utilisation</Link>
            <a href={`mailto:${APP.supportEmail}`}>Nous contacter</a>
          </div>
        </div>
        <div className="l-wrap footer-bottom">
          <span>
            © {APP.year} {APP.name}. Tous droits réservés.
          </span>
          <span>
            Conçu à {APP.hometown}, {APP.market}
          </span>
        </div>
      </footer>

      {!hideMobileCta && <MobileCta after={ctaAfter} />}
    </>
  );
}
