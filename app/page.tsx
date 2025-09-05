import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Shield, Activity, Users } from "lucide-react"
import Link from "next/link"
import PageTransition from "@/components/ui/page-transition"

export default async function LandingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is logged in, redirect to appropriate dashboard
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed, role")
      .eq("id", user.id)
      .single()

    if (profile?.role === "admin") {
      redirect("/admin/dashboard")
    } else if (profile?.onboarding_completed) {
      redirect("/home")
    } else {
      redirect("/onboard")
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-serif font-semibold text-foreground">Safe Step</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-6">
              Advanced Foot Health
              <span className="text-primary block">Monitoring</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Comprehensive diabetic foot care with real-time pressure monitoring, AI-powered analysis, and personalized
              health insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="text-lg px-8 py-6">
                  Start Monitoring
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-serif font-bold text-center mb-12">Comprehensive Health Monitoring</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Real-time Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Live pressure and temperature tracking with instant feedback</CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg">AI Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Advanced algorithms detect early warning signs and risks</CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-6 h-6 text-chart-2" />
                  </div>
                  <CardTitle className="text-lg">Personalized Care</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Tailored recommendations based on your health profile</CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-chart-4" />
                  </div>
                  <CardTitle className="text-lg">Healthcare Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Seamless communication with your healthcare providers</CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto text-center max-w-3xl">
            <h2 className="text-3xl font-serif font-bold mb-6">Take Control of Your Foot Health Today</h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of patients who trust Safe Step for comprehensive diabetic foot care monitoring.
            </p>
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Get Started Free
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 bg-muted">
          <div className="container mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                <Heart className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-serif font-semibold">Safe Step</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Safe Step Health. Advanced diabetic foot care monitoring.
            </p>
          </div>
        </footer>
      </div>
    </PageTransition>
  )
}
