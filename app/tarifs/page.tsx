import type { Metadata } from "next";
import "../landing.css";
import PricingView from "./pricing-view";

export const metadata: Metadata = { title: "Tarifs" };

export default function PricingPage() {
  return <PricingView />;
}
