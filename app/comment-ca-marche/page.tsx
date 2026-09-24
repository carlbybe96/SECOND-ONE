import type { Metadata } from "next";
import "../landing.css";
import HowView from "./how-view";

export const metadata: Metadata = { title: "Comment ça marche" };

export default function HowPage() {
  return <HowView />;
}
