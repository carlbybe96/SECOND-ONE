import type { Metadata } from "next";
import ValidationsView from "./validations-view";

export const metadata: Metadata = { title: "Validations" };

export default function ValidationsPage() {
  return <ValidationsView />;
}
