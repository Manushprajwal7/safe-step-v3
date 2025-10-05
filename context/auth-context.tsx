"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase/client";
import { AuthUser } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
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
          setLoading(false);
          return;
        }

        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (!authUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Get user profile
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role, onboarding_completed")
          .eq("user_id", authUser.id)
          .single();

        if (error) {
          console.warn("Profile fetch error:", error);
          // Use default values if profile doesn't exist or there's an error
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
            role: profile?.role || "patient",
            onboarding_completed: profile?.onboarding_completed || false,
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

    // Listen for auth changes if the method exists (not in dummy client)
    let unsubscribe: (() => void) | undefined;

    // Type guard to check if onAuthStateChange exists
    if (
      "onAuthStateChange" in supabase.auth &&
      typeof supabase.auth.onAuthStateChange === "function"
    ) {
      const { data } = (supabase.auth as any).onAuthStateChange(
        (event: any, session: any) => {
          if (!session) {
            setUser(null);
          } else {
            checkUser();
          }
        }
      );
      unsubscribe = data?.subscription?.unsubscribe;
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/auth/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
