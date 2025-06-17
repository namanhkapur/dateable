import { GalleryVerticalEnd } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "../api/auth"
import { userApi } from "../api/user"
import { useAuth } from "../context/AuthContext"

export function CompleteProfileForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate name
    if (!name || name.trim().length === 0) {
      setError('Please enter your name')
      setLoading(false)
      return
    }

    try {
      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) {
        console.error('Session error:', sessionError)
        throw new Error('No active session')
      }

      // Try to create user on the server
      try {
        const response = await userApi.createUser({
          name: name.trim(),
          email: session.user.email || undefined,
          authId: session.user.id
        })

        if (!response.success) {
          throw new Error(response.message || 'Failed to create user')
        }
        
        console.log('User created successfully:', response.user)
      } catch (createError) {
        // If creation fails due to existing email, try to find the existing user
        if (createError.message?.includes('duplicate key') || createError.message?.includes('email')) {
          console.log('User already exists, trying to fetch existing user...')
          
          // Try to find existing user by email
          const existingUserResponse = await userApi.getUser({ email: session.user.email });
          if (existingUserResponse.success && existingUserResponse.user) {
            console.log('Found existing user:', existingUserResponse.user)
            // User exists, just continue to refresh
          } else {
            // Couldn't find or create user, re-throw the original error
            throw createError;
          }
        } else {
          throw createError;
        }
      }

      // Refresh the user data in AuthContext
      await refreshUser()

      // Navigate to home
      navigate('/home', { replace: true })
    } catch (err) {
      console.error('Error:', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold">Complete your profile</h1>
            <p className="text-center text-sm text-muted-foreground">
              Please provide your name to continue
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating profile..." : "Create profile"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
} 