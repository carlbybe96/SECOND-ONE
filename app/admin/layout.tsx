"use client";

import { CreditCard, Flag, LayoutDashboard, LogOut, ShieldCheck, UserCheck, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import DemoBanner from "@/components/demo-banner";
import FullPageLoader from "@/components/loader";
import Logo from "@/components/logo";
import { useDemoRuntime } from "@/components/runtime";
import { api } from "@/lib/api";
import { useQuery, useSession } from "@/lib/hooks";
import "./admin.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  useDemoRuntime();
  const router = useRouter();
  const path = usePathname();
  const { data: session, loading } = useSession();
  const isAdmin = session?.account.role === "admin";
  const { data: stats } = useQuery(`admin-nav:${isAdmin}`, () => (isAdmin ? api.adminStats() : Promise.resolve(null)));

  useEffect(() => {
    if (loading) return;
    if (!session) router.replace("/login");
    else if (!isAdmin) router.replace("/home");
  }, [loading, session, isAdmin, router]);

  if (loading || !isAdmin) return <FullPageLoader />;

  const nav = [
    { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
    { href: "/admin/validations", label: "Validations", icon: UserCheck, badge: stats?.pending },
    { href: "/admin/signalements", label: "Signalements", icon: Flag, badge: stats?.openReports },
    { href: "/admin/membres", label: "Membres", icon: Users },
    { href: "/admin/paiements", label: "Paiements", icon: CreditCard },
  ];

  return (
    <div className="admin">
      <aside className="adm-side">
        <div className="adm-logo">
          <Logo href="/admin" light />
          <span className="adm-tag">
            <ShieldCheck size={13} /> Modération
          </span>
        </div>
        <nav>
          {nav.map((n) => {
            const active = n.href === "/admin" ? path === "/admin" : path.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} className={`adm-link${active ? " active" : ""}`}>
                <n.icon size={18} />
                <span>{n.label}</span>
                {!!n.badge && <span className="count-dot">{n.badge}</span>}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          className="adm-link adm-logout"
          onClick={async () => {
            await api.signOut();
            router.push("/login");
          }}
        >
          <LogOut size={18} /> <span>Déconnexion</span>
        </button>
      </aside>
      <div className="adm-main">
        <DemoBanner />
        <div className="adm-content">{children}</div>
      </div>
    </div>
  );
}
