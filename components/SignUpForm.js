
"use client"

import { useState } from "react"

export default function SignUpForm({ onSignUpSuccess }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const VALID_USERS = {
    "chafiaaabida@gmail.com": "abida123",
    "elyaakoubimohammed@gmail.com": "mohammed123"
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800))

      if (!email || !password || !fullName) {
        setError("All fields are required")
        return
      }

      if (!email.endsWith("@company.com") && email !== "chafiaaabida@gmail.com") {
        setError("Registration limited to company emails (except chafiaaabida@gmail.com)")
        return
      }

      if (VALID_USERS[email] && VALID_USERS[email] !== password) {
        setError("Invalid password for this account")
        return
      }

      if (!VALID_USERS[email]) {
        setError("Unauthorized email. Only chafiaaabida@gmail.com and elyaakoubimohammed@gmail.com are allowed.")
        return
      }

      // Mock successful sign-up
      setSuccess("Account ready! Please sign in.")

      // Mock user object
      const mockUser = {
        id: email === "chafiaaabida@gmail.com" ? "user1" : "user2",
        email,
        user_metadata: { full_name: fullName },
        confirmed_at: new Date().toISOString()
      }

      // Call success callback
      if (onSignUpSuccess) {
        onSignUpSuccess(mockUser)
      }

      // Store in localStorage to indicate account exists
      const existingAccounts = JSON.parse(localStorage.getItem('registered_accounts') || '[]')
      if (!existingAccounts.includes(email)) {
        existingAccounts.push(email)
        localStorage.setItem('registered_accounts', JSON.stringify(existingAccounts))
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
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Sign up to get started</p>

        <form onSubmit={handleSignUp} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              required
              className="auth-input"
            />
          </div>

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

          <button
            type="submit"
            disabled={loading}
            className="auth-button w-full bg-[#2b725e] hover:bg-[#235e4c] text-white py-6 text-lg font-medium rounded-lg h-[60px] disabled:opacity-70"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  )
}
