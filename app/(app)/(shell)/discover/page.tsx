import type { Metadata } from "next";
import DiscoverView from "./discover-view";

export const metadata: Metadata = { title: "Découvrir" };

export default function DiscoverPage() {
  return <DiscoverView />;
}
