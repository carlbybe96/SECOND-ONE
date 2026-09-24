"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthSwitch() {
  const path = usePathname();
  const onLogin = path.startsWith("/login");
  return (
    <div className="aside">
      <span className="hide-sm">{onLogin ? "Pas encore membre ?" : "Déjà membre ?"}</span>
      <Link href={onLogin ? "/register" : "/login"} className="btn btn-outline btn-sm">
        {onLogin ? (
          <>
            <span className="hide-xs">Créer un compte</span>
            <span className="only-xs">S&apos;inscrire</span>
          </>
        ) : (
          "Se connecter"
        )}
      </Link>
    </div>
  );
}
