import type { Metadata } from "next";
import ReportsView from "./reports-view";

export const metadata: Metadata = { title: "Signalements" };

export default function ReportsPage() {
  return <ReportsView />;
}
