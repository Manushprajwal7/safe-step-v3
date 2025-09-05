import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import RegisterForm from "@/components/auth/register-form"
import { Heart } from "lucide-react"
import Link from "next/link"

export default async function RegisterPage() {
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      redirect("/onboard")
    }
  } catch (error) {
    console.error("Auth check failed:", error)
    // Continue to show register form even if auth check fails
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-serif font-semibold text-foreground">Safe Step</span>
          </Link>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Create Account</h1>
          <p className="text-muted-foreground">Start your journey to better foot health</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
