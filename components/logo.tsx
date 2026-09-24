import Link from "next/link";

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="logo" style={light ? { color: "#fff" } : undefined}>
      <span className="logo-mark">❤️</span>
      <span>FaithMatch</span>
    </Link>
  );
}