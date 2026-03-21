import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import useAuth from '../hook/useAuth'

const Register = () => {
  const auth = useAuth()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    setError('')
    setSuccess('')

    const payload = { username, email, password }

    const res = await auth.handleRegister(payload)

    if (res.success) {
      setSuccess(res.message) // ✅ "Please verify your email..."

      // ⏳ wait before redirect
      setTimeout(() => {
        navigate("/login")
      }, 3000)

    } else {
      setError(res.message)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#191A19] text-[#E8E8E3] flex items-center justify-center px-4 font-sans antialiased">
      <div className="w-full max-w-100">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 text-2xl font-semibold tracking-tighter text-white mb-4">
            <span className="text-[#20B8CD]">●</span> perplexity
          </div>
          <h1 className="text-2xl font-medium text-white tracking-tight">Create Account</h1>
          <p className="text-[#999998] text-sm mt-1">Join the community today</p>
        </div>

        {/* Form Container */}
        <div className="bg-[#202222] border border-[#333333] rounded-xl p-8 shadow-2xl">

          {/* ✅ SUCCESS MESSAGE */}
          {success && (
            <div className="bg-[#1e2f2f] border border-[#20B8CD] text-[#20B8CD] text-sm p-3 rounded-md mb-4 text-center">
              {success}
            </div>
          )}

          {/* ❌ ERROR MESSAGE */}
          {error && (
            <div className="bg-[#2a1f1f] border border-red-500 text-red-400 text-sm p-3 rounded-md mb-4 text-center">
              {error}
            </div>
          )}

          {/* ✅ HIDE FORM AFTER SUCCESS */}
          {!success && (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-[#666666] uppercase tracking-widest mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                  required
                  className="w-full bg-[#191A19] border border-[#333333] rounded-md px-4 py-2.5 text-white placeholder-[#444444] focus:outline-none focus:border-[#20B8CD]"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-[#666666] uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  className="w-full bg-[#191A19] border border-[#333333] rounded-md px-4 py-2.5 text-white placeholder-[#444444] focus:outline-none focus:border-[#20B8CD]"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-[#666666] uppercase tracking-widest mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#191A19] border border-[#333333] rounded-md px-4 py-2.5 text-white placeholder-[#444444] focus:outline-none focus:border-[#20B8CD]"
                />
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#20B8CD] hover:bg-[#1DAABF] text-black font-bold py-3 rounded-md flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Account'} <ArrowRight size={18} />
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-[#999998] text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-[#20B8CD] hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register