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

        // Get user profile using the correct column name
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role, onboarding_completed")
          .eq("user_id", authUser.id)
          .single();

        if (error) {
          console.warn("Profile fetch error:", error);
          // If profile doesn't exist, create a default one
          if (error.code === "PGRST116") {
            console.log("Profile not found, creating default profile");
            const { data: newProfile, error: insertError } = await supabase
              .from("profiles")
              .insert({
                user_id: authUser.id,
                role: "patient",
                full_name:
                  authUser.user_metadata?.full_name ||
                  authUser.email?.split("@")[0] ||
                  "User",
                onboarding_completed: false,
              })
              .select()
              .single();

            if (insertError) {
              console.error("Error creating default profile:", insertError);
              // Use default values if we can't create a profile
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
                role: newProfile.role || "patient",
                onboarding_completed: newProfile.onboarding_completed || false,
              });
            }
          } else {
            // For other errors, use default values
            setUser({
              id: authUser.id,
              email: authUser.email || "",
              role: "patient",
              onboarding_completed: false,
            });
          }
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
