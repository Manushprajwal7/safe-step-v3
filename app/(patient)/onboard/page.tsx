import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import OnboardingForm from "@/components/patient/onboarding-form"

export default async function OnboardPage() {
  const supabase = await createClient() // await the async factory
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("onboarding_completed").eq("id", user.id).single()

  if (profile?.onboarding_completed) {
    redirect("/home") // align to (patient) route group path
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-green-50 to-teal-50 p-4">
      <OnboardingForm />
    </div>
  )
}
