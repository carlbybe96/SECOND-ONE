import type { Metadata } from "next";
import "../landing.css";
import CompatibilityView from "./compatibility-view";

export const metadata: Metadata = { title: "Compatibilité" };

export default function CompatibilityPage() {
  return <CompatibilityView />;
}
