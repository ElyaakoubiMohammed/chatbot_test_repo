
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginForm({ onLoginSuccess }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const VALID_USERS = {
    "demo@demo.com": "demo123",
    "elyaakoubimohammed@gmail.com": "employee456"
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800))

      if (!email || !password) {
        setError("Email and password are required")
        return
      }

      if (VALID_USERS[email] && VALID_USERS[email] === password) {
        // Mock user object
        const mockUser = {
          id: email === "demo@demo.com" ? "user1" : "user2",
          email,
          app_metadata: { provider: "email" },
          user_metadata: {},
          confirmed_at: new Date().toISOString(),
          role: "authenticated"
        }

        // Call success callback
        onLoginSuccess(mockUser)

        // Set fake session in localStorage
        localStorage.setItem("user", JSON.stringify({ email }))

        // Redirect
        router.push("/")
      } else {
        setError("Invalid email or password")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your account</p>

        <form onSubmit={handleLogin} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="auth-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="auth-button w-full bg-[#2b725e] hover:bg-[#235e4c] text-white py-6 text-lg font-medium rounded-lg h-[60px] disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
        <br />
      </div>
    </div>
  )
}
