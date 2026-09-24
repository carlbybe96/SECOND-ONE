import { LogoMark } from "@/components/logo";

export default function FullPageLoader() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div style={{ display: "grid", justifyItems: "center", gap: 14 }}>
        <span className="logo-mark" style={{ width: 52, height: 52, borderRadius: 16 }}>
          <LogoMark size={28} />
        </span>
        <span className="spinner dark" />
      </div>
    </div>
  );
}
