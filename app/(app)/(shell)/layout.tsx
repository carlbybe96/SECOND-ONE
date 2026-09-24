"use client";

import { Bell, Compass, Crown, Heart, House, LogOut, MessageCircle, Settings, ShieldX, User, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import DemoBanner from "@/components/demo-banner";
import Logo from "@/components/logo";
import NotificationsSheet from "@/components/notifications-sheet";
import { PremiumBadge } from "@/components/ui/bits";
import ProfilePhoto from "@/components/ui/photo";
import { api } from "@/lib/api";
import { APP, PLANS } from "@/lib/config";
import { useQuery, useSession } from "@/lib/hooks";
import "../../flow.css";
import "./shell.css";

type NavItem = { href: string; label: string; icon: LucideIcon; badge?: number };

const TITLES: [string, string][] = [
  ["/home", "Accueil"],
  ["/discover", "Découvrir"],
  ["/matches", "Matchs"],
  ["/messages", "Messages"],
  ["/profile/", "Profil"],
  ["/profile", "Mon profil"],
  ["/settings", "Paramètres"],
  ["/subscription", "Abonnement"],
];

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { data: badges } = useQuery("badges", api.badges);
  const { data: sub } = useQuery("subscription-state", api.subscriptionState);
  const [notifOpen, setNotifOpen] = useState(false);
  const me = session?.profile;
  if (!me) return null;

  async function logout() {
    await api.signOut();
    router.push("/");
  }

  if (me.status === "suspended" || me.status === "banned") {
    return (
      <div className="suspended">
        <div className="panel panel-pad">
          <ShieldX size={40} color="var(--danger)" />
          <h1>{me.status === "banned" ? "Compte banni" : "Compte suspendu"}</h1>
          <p className="muted">
            Suite à des signalements confirmés par notre équipe de modération, ton compte n&apos;a plus accès à {APP.name}. Pour contester cette décision, écris à{" "}
            {APP.supportEmail}.
          </p>
          <button type="button" className="btn btn-outline" onClick={logout}>
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  const nav: NavItem[] = [
    { href: "/home", label: "Accueil", icon: House },
    { href: "/discover", label: "Découvrir", icon: Compass },
    { href: "/matches", label: "Matchs", icon: Heart, badge: badges?.interests },
    { href: "/messages", label: "Messages", icon: MessageCircle, badge: badges?.messages },
    { href: "/profile", label: "Profil", icon: User },
  ];
  const isActive = (href: string) => (href === "/profile" ? path === "/profile" : path === href || path.startsWith(`${href}/`));
  const title = TITLES.find(([prefix]) => path === prefix || path.startsWith(prefix))?.[1] ?? "";
  const chatOpen = /^\/messages\/.+/.test(path);
  const plan = sub?.plan ?? "free";

  return (
    <div className={`shell${chatOpen ? " chat-open" : ""}`}>
      <aside className="sidebar">
        <div className="sb-logo">
          <Logo href="/home" />
        </div>
        <nav className="sb-nav" aria-label="Navigation principale">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={`sb-link${isActive(item.href) ? " active" : ""}`}>
              <item.icon size={19} />
              <span>{item.label}</span>
              {!!item.badge && <span className="count-dot">{item.badge}</span>}
            </Link>
          ))}
          <div className="sb-sep" />
          <Link href="/subscription" className={`sb-link${isActive("/subscription") ? " active" : ""}`}>
            <Crown size={19} />
            <span>Abonnement</span>
            {plan !== "free" && <span className="sb-plan">{PLANS[plan].name}</span>}
          </Link>
          <Link href="/settings" className={`sb-link${isActive("/settings") ? " active" : ""}`}>
            <Settings size={19} />
            <span>Paramètres</span>
          </Link>
        </nav>
        {plan === "free" && (
          <Link href="/subscription" className="sb-premium">
            <Crown size={18} />
            <b>Passe Premium</b>
            <span>Intérêts illimités, visiteurs, score détaillé.</span>
          </Link>
        )}
        <div className="sb-user">
          <Link href="/profile" className="sb-me">
            <ProfilePhoto profile={me} size={38} round />
            <span>
              <b>{me.firstName}</b>
              <small>Voir mon profil</small>
            </span>
          </Link>
          <button type="button" className="icon-btn plain" onClick={logout} aria-label="Se déconnecter" title="Se déconnecter">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <div className="shell-main">
        <DemoBanner />
        <header className="topbar">
          <div className="tb-left">
            <span className="tb-logo">
              <Logo href="/home" />
            </span>
            <h1 className="tb-title">{title}</h1>
          </div>
          <div className="tb-right">
            {plan === "free" ? (
              <Link href="/subscription" className="btn btn-gold btn-sm tb-premium">
                <Crown size={15} /> <span>Premium</span>
              </Link>
            ) : (
              <span className="tb-plan">
                <PremiumBadge plan={plan} />
              </span>
            )}
            <button type="button" className="icon-btn" onClick={() => setNotifOpen(true)} aria-label="Notifications">
              <Bell size={19} />
              {!!badges?.notifications && <span className="count-dot">{badges.notifications}</span>}
            </button>
            <Link href="/settings" className="icon-btn tb-settings" aria-label="Paramètres">
              <Settings size={19} />
            </Link>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>

      <nav className="tabbar" aria-label="Navigation">
        {nav.map((item) => (
          <Link key={item.href} href={item.href} className={`tab-link${isActive(item.href) ? " active" : ""}`}>
            <span className="tl-ico">
              <item.icon size={22} />
              {!!item.badge && <span className="count-dot">{item.badge}</span>}
            </span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <NotificationsSheet open={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}
