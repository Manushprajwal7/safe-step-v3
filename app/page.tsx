"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heart, Loader2, Activity, Shield, Users } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import Image from "next/image";

// Simple card component since we're not importing from UI components
const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 ${className}`}
  >
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4">{children}</div>
);

const CardTitle = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <h3 className={`text-xl font-semibold mb-2 ${className}`}>{children}</h3>;

const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-gray-600">{children}</p>
);

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          // Fetch user profile to determine where to redirect
          const { data: profile } = await supabase
            .from("profiles")
            .select("onboarding_completed, role")
            .eq("user_id", session.user.id)
            .single();

          if (profile) {
            if (!profile.onboarding_completed) {
              router.push("/onboard");
              return;
            } else if (profile.role === "admin") {
              router.push("/admin/dashboard");
              return;
            } else {
              router.push("/home");
              return;
            }
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-serif font-bold text-gray-800">
              Safe Step
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-800 leading-tight">
                Advanced Foot Health
                <span className="text-green-600 block">Monitoring</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Comprehensive diabetic foot care with real-time pressure
                monitoring, AI-powered analysis, and personalized health
                insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    className="text-base px-8 py-6 bg-green-600 hover:bg-green-700"
                  >
                    Start Monitoring
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-8 py-6 bg-white border-green-600 text-green-600 hover:bg-green-50"
                >
                  Learn More
                </Button>
              </div>
            </div>

            {/* Device Image */}
            <div className="flex justify-center">
              <div className="relative">
                <Image
                  src="/device-image.jpg"
                  alt="Safe Step Prototype Device"
                  width={400}
                  height={400}
                  className="rounded-2xl shadow-xl"
                />
                <div className="mt-6 text-center">
                  <p className="text-2xl font-serif font-semibold text-gray-800">
                    Our Prototype Device
                  </p>
                  <p className="text-gray-600 mt-2">
                    Advanced technology for precise foot health monitoring
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-serif font-bold text-center mb-12 text-gray-800">
            Comprehensive Health Monitoring
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Real-time Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Live pressure and temperature tracking with instant feedback
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-teal-600" />
                </div>
                <CardTitle className="text-xl">AI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Advanced algorithms detect early warning signs and risks
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Personalized Care</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Tailored recommendations based on your health profile
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">
                  Healthcare Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Seamless communication with your healthcare providers
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl font-serif font-bold mb-6">
            Take Control of Your Foot Health Today
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of patients who trust Safe Step for comprehensive
            diabetic foot care monitoring.
          </p>
          <Link href="/auth/register">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-6 bg-white text-green-600 hover:bg-gray-100"
            >
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-6 md:mb-0">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-serif font-bold text-gray-800">
                Safe Step
              </span>
            </div>
            <p className="text-gray-600 text-center md:text-right">
              © 2024 Safe Step Health. Advanced diabetic foot care monitoring.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
