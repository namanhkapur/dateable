import { GalleryVerticalEnd } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "../api/auth"

export function CompleteProfileForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

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

      // Store all user info in session storage
      sessionStorage.setItem('userId', session.user.id)
      sessionStorage.setItem('userEmail', session.user.email)
      sessionStorage.setItem('userName', name.trim())

      console.log('Profile created for user:', {
        auth_id: session.user.id,
        name: name.trim(),
        email: session.user.email
      })

      // Navigate to home
      navigate('/', { replace: true })
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