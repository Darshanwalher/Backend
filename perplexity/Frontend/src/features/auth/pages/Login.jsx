import React, { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '../hook/useAuth.js'
import { useSelector, useDispatch } from "react-redux"
import { setError } from "../auth.slice.js"
import { useEffect } from 'react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const user = useSelector(state => state.auth.user)
  const loading = useSelector(state => state.auth.loading)
  const error = useSelector(state => state.auth.error)

  const dispatch = useDispatch()
  const { handleLogin } = useAuth()
  const navigate = useNavigate()

  
 
  const submitForm = async (event) => {
    event.preventDefault()

    const payload = { email, password }

    const res = await handleLogin(payload)

    if (res.success) {
      navigate("/")
    }
  }

  // ✅ Redirect if already logged in
  if (!loading && user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-[#191A19] text-[#E8E8E3] flex items-center justify-center px-4 font-sans antialiased">
      <div className="w-full max-w-100">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 text-2xl font-semibold tracking-tighter text-white mb-4">
            <span className="text-[#20B8CD]">●</span> perplexity
          </div>
          <h1 className="text-2xl font-medium text-white tracking-tight">Welcome back</h1>
          <p className="text-[#999998] text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-[#202222] border border-[#333333] rounded-xl p-8 shadow-2xl">

          {/* 🔥 ERROR / VERIFY MESSAGE */}
          {error && (
            <div className={`mb-4 text-sm text-center px-4 py-2 rounded-md 
              ${error.includes("verify")
                ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                : "bg-red-500/10 text-red-400 border border-red-500/30"
              }`}>
              
              {error}

              {/* 🔥 Show extra help if not verified */}
              {error.includes("verify") && (
                <div className="mt-2 text-xs text-yellow-300">
                  Please check your inbox or spam folder 📩
                </div>
              )}
            </div>
          )}

          <form onSubmit={submitForm} className="space-y-5">
            
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
                className="w-full bg-[#191A19] border border-[#333333] rounded-md px-4 py-2.5 text-white placeholder-[#444444] focus:outline-none focus:border-[#20B8CD] transition-colors"
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
                className="w-full bg-[#191A19] border border-[#333333] rounded-md px-4 py-2.5 text-white placeholder-[#444444] focus:outline-none focus:border-[#20B8CD] transition-colors"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#20B8CD] hover:bg-[#1DAABF] text-black font-bold py-3 rounded-md flex items-center justify-center gap-2 transition-all mt-4 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Continue"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-[#999998] text-sm">
            New to Perplexity?{' '}
            <Link to="/register" className="text-[#20B8CD] hover:underline font-medium">
              Sign Up
            </Link>
          </p>

          {/* 🔥 Optional resend button (UI only) */}
          {error && error.includes("verify") && (
            <button className="text-[#20B8CD] text-sm hover:underline">
              Resend verification email
            </button>
          )}

          <div className="text-[#555555] text-[11px] leading-relaxed max-w-70 mx-auto">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login