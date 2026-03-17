import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (!formData.username || !formData.email || !formData.password) {
        setError('Please fill in all fields')
        setLoading(false)
        return
      }

      // Simple validation matching your logic
      if (formData.username.length < 3) {
        setError('Username must be at least 3 characters')
        setLoading(false)
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email')
        setLoading(false)
        return
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters')
        setLoading(false)
        return
      }

      console.log('Register Data:', formData)

      setTimeout(() => {
        setSuccess('Account created successfully!')
        setLoading(false)
        // navigate("/login") // Optional: redirect after success
      }, 1000)
    } catch (err) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#191A19] text-[#E8E8E3] flex items-center justify-center px-4 font-sans antialiased">
      <div className="w-full max-w-100">
        
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 text-2xl font-semibold tracking-tighter text-white mb-4">
            <span className="text-[#20B8CD]">●</span> perplexity
          </div>
          <h1 className="text-2xl font-medium text-white tracking-tight">Create Account</h1>
          <p className="text-[#999998] text-sm mt-1">Join the community today</p>
        </div>

        {/* Register Form */}
        <div className="bg-[#202222] border border-[#333333] rounded-xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-[#666666] uppercase tracking-widest mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="johndoe"
                required
                className="w-full bg-[#191A19] border border-[#333333] rounded-md px-4 py-2.5 text-white placeholder-[#444444] focus:outline-none focus:border-[#20B8CD] transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-[#666666] uppercase tracking-widest mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full bg-[#191A19] border border-[#333333] rounded-md px-4 py-2.5 text-white placeholder-[#444444] focus:outline-none focus:border-[#20B8CD] transition-colors"
              />
            </div>

            {/* Messages */}
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
            {success && <p className="text-[#20B8CD] text-xs mt-1">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#20B8CD] hover:bg-[#1DAABF] text-[#000000] font-bold py-3 rounded-md flex items-center justify-center gap-2 transition-all mt-4 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Account'} <ArrowRight size={18} />
            </button>
          </form>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-[#999998] text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-[#20B8CD] hover:underline font-medium">
              Sign In
            </Link>
          </p>
          <div className="text-[#555555] text-[11px] leading-relaxed max-w-70 mx-auto">
            By signing up, you agree to our <span className="underline decoration-[#444]">Terms of Service</span> and <span className="underline decoration-[#444]">Privacy Policy</span>.
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register