import type { Metadata } from "next";
import SubscriptionView from "./subscription-view";

export const metadata: Metadata = { title: "Abonnement" };

export default function SubscriptionPage() {
  return <SubscriptionView />;
}
