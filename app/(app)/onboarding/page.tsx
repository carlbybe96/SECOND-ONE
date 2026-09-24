import type { Metadata } from "next";
import { Suspense } from "react";
import FullPageLoader from "@/components/loader";
import OnboardingView from "./onboarding-view";
import "../../flow.css";

export const metadata: Metadata = { title: "Mon profil" };

export default function OnboardingPage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <OnboardingView />
    </Suspense>
  );
}
