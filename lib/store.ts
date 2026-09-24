import type { OnboardingData } from "./types";
import { getSupabase } from "./supabase";

/** Saves onboarding progress for a user. Returns an error message on failure. */
export async function saveOnboarding(userId: string, data: OnboardingData): Promise<string | undefined> {
  const sb = getSupabase();
  if (sb) {
    const { error } = await sb
      .from("profiles")
      .upsert({ user_id: userId, onboarding: data, updated_at: new Date().toISOString() });
    return error?.message;
  }
  localStorage.setItem(`fm_onboarding_${userId}`, JSON.stringify(data));
}

export async function loadOnboarding(userId: string): Promise<OnboardingData | null> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.from("profiles").select("onboarding").eq("user_id", userId).maybeSingle();
    if (error || !data) return null;
    return (data.onboarding as OnboardingData) ?? null;
  }
  try {
    const raw = localStorage.getItem(`fm_onboarding_${userId}`);
    return raw ? (JSON.parse(raw) as OnboardingData) : null;
  } catch {
    return null;
  }
}