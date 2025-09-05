"use client"

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useFormState, useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { signIn } from "@/lib/actions"
import { signInWithGoogle } from "@/lib/auth-utils"
import { Separator } from "@/components/ui/separator"
import { Icons } from "@/components/icons"

function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <Button 
      type="submit" 
      disabled={isSubmitting} 
      className="w-full h-12 text-base font-medium"
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        "Sign In"
      )}
    </Button>
  )
}

export default function LoginForm() {
  const [state, formAction] = useFormState(signIn, null)
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle form state changes
  useEffect(() => {
    if (state) {
      if (state.success) {
        router.push('/home')
        router.refresh()
      } else if (state.error) {
        setError(state.error)
      }
      setIsSubmitting(false)
      setIsGoogleLoading(false)
    }
  }, [state, router])

  const handleGoogleSignIn = async () => {
    try {
      setError(null)
      setIsGoogleLoading(true)
      const { error } = await signInWithGoogle()
      if (error) {
        setError(error.message || 'Failed to sign in with Google')
      }
    } catch (error) {
      console.error('Unexpected error during Google sign in:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleFormSubmit = async (formData: FormData) => {
    setError(null)
    setIsSubmitting(true)
    
    // Call the server action
    const result = await signIn({}, formData)
    
    // The state will be updated by the useFormState hook
    if (result?.error) {
      setError(result.error)
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription className="text-muted-foreground">
          Sign in to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="outline"
          type="button"
          disabled={isGoogleLoading}
          onClick={handleGoogleSignIn}
          className="w-full h-12 flex items-center justify-center gap-2 text-base"
        >
          {isGoogleLoading ? (
            <Icons.spinner className="h-5 w-5 animate-spin" />
          ) : (
            <Icons.google className="h-5 w-5" />
          )}
          Continue with Google
        </Button>

     

        <form action={handleFormSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isSubmitting}
                required
                className="pl-10 h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                disabled={isSubmitting}
                required
                className="pl-10 pr-10 h-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={isSubmitting}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <SubmitButton isSubmitting={isSubmitting} />

          <p className="px-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="underline underline-offset-4 hover:text-primary"
            >
              Sign up
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
