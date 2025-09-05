"use client"

import { useFormState, useFormStatus } from "react-dom"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, Lock, User, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { signUp } from "@/lib/actions"
import { signInWithGoogle } from "@/lib/auth-utils"
import { Icons } from "@/components/icons"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full h-12 text-base font-medium">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating account...
        </>
      ) : (
        "Create Account"
      )}
    </Button>
  )
}

export default function RegisterForm() {
  const [state, formAction] = useFormState(signUp, null)
  const [showPassword, setShowPassword] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        console.error('Google sign in error:', error)
        // The error will be handled by the auth callback
      }
    } catch (error) {
      console.error('Unexpected error during Google sign in:', error)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-serif text-center">Create Account</CardTitle>
        <CardDescription className="text-center text-base">
          Join Safe Step to start monitoring your health
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* OAuth Buttons */}
        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base font-medium relative"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Icons.google className="mr-2 h-5 w-5" />
            )}
            Continue with Google
          </Button>
        </div>

       
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
              {state.error}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-sm font-medium text-foreground">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Enter your full name"
                required
                className="pl-10 h-12 bg-background border-border focus:border-primary"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="pl-10 h-12 bg-background border-border focus:border-primary"
              />
            </div>
          </div>

          {/* Password with eye toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                required
                minLength={6}
                className="pl-10 pr-10 h-12 bg-background border-border focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Password must be at least 6 characters long</p>
          </div>

          {/* Submit */}
          <SubmitButton />
          <div className="text-xs text-muted-foreground text-center leading-relaxed">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
