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

  // Check onboarding completion via presence of record in onboarding table
  const { data: onboarding } = await supabase
    .from("onboarding")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (onboarding) {
    redirect("/home"); // align to (patient) route group path
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-green-50 to-teal-50 p-4">
      <OnboardingForm />
    </div>
  );
}
