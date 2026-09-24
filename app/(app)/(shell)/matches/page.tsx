import type { Metadata } from "next";
import { Suspense } from "react";
import MatchesView from "./matches-view";

export const metadata: Metadata = { title: "Matchs" };

export default function MatchesPage() {
  return (
    <Suspense fallback={null}>
      <MatchesView />
    </Suspense>
  );
}
