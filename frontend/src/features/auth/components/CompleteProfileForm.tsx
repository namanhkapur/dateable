import { GalleryVerticalEnd } from "lucide-react"
import { useState, useRef } from "react"
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
  const [username, setUsername] = useState("")
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const checkUsernameChangeDebounce = useRef<number>()

  const checkUsernameAvailability = async (usernameValue: string) => {
    if (!usernameValue || usernameValue.length < 3) {
      setUsernameError(null)
      return
    }

    setCheckingUsername(true)
    setUsernameError(null)

    try {
      const response = await userApi.checkUsernameAvailability({ username: usernameValue })
      if (response.success) {
        if (!response.available) {
          setUsernameError('Username is already taken')
        }
      } else {
        setUsernameError(response.message || 'Error checking username')
      }
    } catch (err) {
      console.error('Error checking username:', err)
      setUsernameError('Error checking username availability')
    } finally {
      setCheckingUsername(false)
    }
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
    setUsername(value)
    
    // Debounce username availability check
    if (value.length < 3) {
      setUsernameError(null);
      return;
    }
    clearTimeout(checkUsernameChangeDebounce.current);
    checkUsernameChangeDebounce.current = window.setTimeout(() => {
      checkUsernameAvailability(value);
    }, 500);
  }

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

    // Validate username
    if (!username || username.trim().length === 0) {
      setError('Please enter a username')
      setLoading(false)
      return
    }

    if (username.length < 3 || username.length > 20) {
      setError('Username must be 3-20 characters')
      setLoading(false)
      return
    }

    if (usernameError) {
      setError('Please fix username issues before continuing')
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
          username: username.trim(),
          email: session.user.email || undefined,
          authId: session.user.id
        })

        if (!response.success) {
          throw new Error(response.message || 'Failed to create user')
        }
        
        if (process.env.NODE_ENV !== 'production') {
          console.log('User created successfully');
        }
      } catch (createError) {
        // If creation fails due to existing email, try to find the existing user
        if (createError.message?.includes('duplicate key') || createError.message?.includes('email')) {
          if (process.env.NODE_ENV !== 'production') {
            console.log('User already exists, trying to fetch existing user...');
          }
          
          // Try to find existing user by email
          const existingUserResponse = await userApi.getUser({ email: session.user.email });
          if (existingUserResponse.success && existingUserResponse.user) {
            if (process.env.NODE_ENV !== 'production') {
              console.log('Found existing user');
            }
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

      // Navigate to the user's profile page
      navigate(`/profile/${username.trim()}`, { replace: true })
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
              Please provide your name and choose a username
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
            <div className="grid gap-3">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="john_doe"
                value={username}
                onChange={handleUsernameChange}
                required
                className={usernameError ? "border-red-500" : ""}
              />
              {checkingUsername && (
                <p className="text-xs text-muted-foreground">Checking availability...</p>
              )}
              {usernameError && (
                <p className="text-xs text-red-500">{usernameError}</p>
              )}
              {username.length >= 3 && !usernameError && !checkingUsername && (
                <p className="text-xs text-green-600">Username is available!</p>
              )}
              <p className="text-xs text-muted-foreground">
                3-20 characters, letters, numbers, underscores, and hyphens only
              </p>
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