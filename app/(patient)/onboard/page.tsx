import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OnboardingForm from "@/components/patient/onboarding-form";

export default async function OnboardPage() {
  const supabase = await createClient(); // await the async factory
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check onboarding completion via the onboarding_completed field in profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("user_id", user.id)
    .single();

  // If onboarding is already completed, redirect to home
  if (profile && profile.onboarding_completed) {
    redirect("/home");
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-green-50 to-teal-50 p-4">
      <OnboardingForm />
    </div>
  );
}
