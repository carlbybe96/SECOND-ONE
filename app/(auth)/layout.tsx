import DemoBanner from "@/components/demo-banner";
import Logo from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DemoBanner />
      <header>
        <div className="topbar">
          <Logo />
          <span />
        </div>
      </header>
      {children}
    </>
  );
}