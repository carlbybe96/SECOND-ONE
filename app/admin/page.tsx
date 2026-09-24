import type { Metadata } from "next";
import DashboardView from "./dashboard-view";

export const metadata: Metadata = { title: "Administration" };

export default function AdminPage() {
  return <DashboardView />;
}
