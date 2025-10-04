import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  onboarding_completed: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        setLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setUser(null);
          return;
        }

        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (!authUser) {
          setUser(null);
          return;
        }

        // Get user profile using the correct column name
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role, onboarding_completed")
          .eq("user_id", authUser.id)
          .single();

        if (error) {
          // If profile doesn't exist, use default values
          setUser({
            id: authUser.id,
            email: authUser.email || "",
            role: "patient",
            onboarding_completed: false,
          });
        } else {
          setUser({
            id: authUser.id,
            email: authUser.email || "",
            role: profile.role || "patient",
            onboarding_completed: profile.onboarding_completed || false,
          });
        }
      } catch (error) {
        console.error("Auth error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
      } else {
        checkUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/auth/login");
  };

  return { user, loading, signOut };
};
