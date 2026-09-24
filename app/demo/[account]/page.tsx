import type { Metadata } from "next";
import { Suspense } from "react";
import FullPageLoader from "@/components/loader";
import DemoEntry from "./demo-entry";

export const metadata: Metadata = { title: "Accès démo" };

/** Lien direct vers la démo : /demo/aicha, /demo/ibrahim ou /demo/admin (optionnel : ?next=/discover). */
export default function DemoEntryPage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <DemoEntry />
    </Suspense>
  );
}
