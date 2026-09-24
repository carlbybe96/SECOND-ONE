import type { Metadata } from "next";
import "../landing.css";
import FaqView from "./faq-view";

export const metadata: Metadata = { title: "FAQ" };

export default function FaqPage() {
  return <FaqView />;
}
