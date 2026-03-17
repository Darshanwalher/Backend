import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '../hook/useAuth.js'
import { useSelector} from "react-redux"
import { Navigate } from 'react-router-dom'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const user = useSelector(state => state.auth.user)
  const loading = useSelector(state=>state.auth.loading)

  const {handleLogin} = useAuth()

  const navigate = useNavigate()

  const submitForm = async (event) => {
    event.preventDefault()
    const payload = {
      email,
      password
    }

    await handleLogin(payload);
    navigate("/")

  }

   if(!loading && user){
        return <Navigate to="/" replace />
    }
    

  return (
    <div className="min-h-screen bg-[#191A19] text-[#E8E8E3] flex items-center justify-center px-4 font-sans antialiased">
      <div className="w-full max-w-100">
        
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 text-2xl font-semibold tracking-tighter text-white mb-4">
            <span className="text-[#20B8CD]">●</span> perplexity
          </div>
          <h1 className="text-2xl font-medium text-white tracking-tight">Welcome back</h1>
          <p className="text-[#999998] text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#202222] border border-[#333333] rounded-xl p-8 shadow-2xl">
          <form onSubmit={submitForm} className="space-y-5">
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

            <button
              type="submit"
              className="w-full bg-[#20B8CD] hover:bg-[#1DAABF] text-[#000000] font-bold py-3 rounded-md flex items-center justify-center gap-2 transition-all mt-4 active:scale-[0.98]"
            >
              Continue <ArrowRight size={18} />
            </button>
          </form>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-[#999998] text-sm">
            New to Perplexity?{' '}
            <Link to="/register" className="text-[#20B8CD] hover:underline font-medium">
              Sign Up
            </Link>
          </p>
          <div className="text-[#555555] text-[11px] leading-relaxed max-w-70 mx-auto">
            By signing in, you agree to our <span className="underline decoration-[#444]">Terms of Service</span> and <span className="underline decoration-[#444]">Privacy Policy</span>.
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login