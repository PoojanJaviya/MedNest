import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"

function SignupPage() {
  // Three pieces of state — like three variables that React watches
  const [fullName, setFullName] = useState("")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState("")   // stores error message

  // useNavigate — React Router's way to redirect programmatically
  // Python parallel: like a redirect() in Flask/FastAPI
  const navigate = useNavigate()

  // This runs when the form is submitted
  const handleSignup = async (e) => {
  e.preventDefault()

  try {
    // Step 1: Create account
    await api.post('/auth/signup', { full_name: fullName, email, password })

    // Step 2: Auto-login
    const response = await api.post('/auth/login', { email, password })
    localStorage.setItem("token", response.data.access_token)

    // Step 3: Redirect
    navigate('/patients')

  } catch (err) {
    // ✅ After
const detail = err.response?.data?.detail
if (Array.isArray(detail)) {
  setError(detail[0]?.msg || "Signup failed")  // extract first error message
} else {
  setError(detail || "Signup failed")           // for plain string errors
}
  }
}
  
  // JSX — looks like HTML but it's JavaScript
  // className instead of class (class is a reserved word in JS)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">

        <h1 className="text-2xl font-bold text-center mb-2">🪺 MedNest</h1>
        <p className="text-center text-gray-500 mb-6">Caregiver Register</p>

        {/* error && ... — Python equivalent: if error: show_div() */}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
        
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="Full Name"
              value={fullName}                          /* controlled by state */
              onChange={(e) => setFullName(e.target.value)}  /* updates state on every keystroke */
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}                          /* controlled by state */
              onChange={(e) => setEmail(e.target.value)}  /* updates state on every keystroke */
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            SignUp
          </button>

        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Log in
          </a>
        </p>

      </div>
    </div>
  )
}

export default SignupPage