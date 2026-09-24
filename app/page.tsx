import type { Metadata } from "next";
import { APP } from "@/lib/config";
import LandingView from "./landing-view";
import "./landing.css";

export const metadata: Metadata = {
  title: { absolute: `${APP.name} · Rencontres sérieuses par compatibilité de foi et de valeurs` },
};

export default function LandingPage() {
  return <LandingView />;
}
