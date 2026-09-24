import type { Metadata } from "next";
import "../landing.css";
import SecurityView from "./security-view";

export const metadata: Metadata = { title: "Sécurité" };

export default function SecurityPage() {
  return <SecurityView />;
}
