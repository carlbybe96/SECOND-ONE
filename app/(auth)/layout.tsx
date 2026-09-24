import DemoBanner from "@/components/demo-banner";
import Logo from "@/components/logo";
import AuthSwitch from "./auth-switch";
import "../flow.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flow">
      <DemoBanner />
      <header className="flow-header">
        <div className="flow-topbar">
          <Logo />
          <AuthSwitch />
        </div>
      </header>
      {children}
    </div>
  );
}
