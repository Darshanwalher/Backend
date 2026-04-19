import React, { useState, useEffect } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '../hook/useAuth.js'
import { useSelector, useDispatch } from "react-redux"
import { setError } from "../auth.slice.js"

const Login = () => {
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState(null)

  const user = useSelector(state => state.auth.user)
  const loading = useSelector(state => state.auth.loading)

  const dispatch = useDispatch()
  const { handleLogin } = useAuth()
  const navigate = useNavigate()

  // Clear any stale Redux errors on mount
  useEffect(() => {
    dispatch(setError(null))
  }, [])

  const submitForm = async (event) => {
    event.preventDefault()
    setFormError(null)

    const res = await handleLogin({ email, password })

    if (res.success) {
      navigate("/")
    } else {
      setFormError(res.message)
    }
  }

  // Redirect if already logged in
  if (!loading && user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#1C1C1C', fontFamily: "'Sora', sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');

        * { font-family: 'Sora', sans-serif; box-sizing: border-box; }

        /* Fade-up animation for the card */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.4s ease forwards; }

        /* Staggered children */
        .fade-up-1 { animation: fadeUp 0.4s ease 0.05s both; }
        .fade-up-2 { animation: fadeUp 0.4s ease 0.12s both; }
        .fade-up-3 { animation: fadeUp 0.4s ease 0.19s both; }
        .fade-up-4 { animation: fadeUp 0.4s ease 0.26s both; }
        .fade-up-5 { animation: fadeUp 0.4s ease 0.33s both; }

        /* Input focus glow */
        .plex-input {
          background: #252525;
          border: 1px solid #2E2E2E;
          border-radius: 8px;
          padding: 10px 14px;
          color: #EDEDEC;
          font-size: 14px;
          width: 100%;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .plex-input::placeholder { color: #555555; }
        .plex-input:focus {
          border-color: #3E3E3E;
          box-shadow: 0 0 0 3px rgba(32,184,205,0.08);
        }

        /* Submit button */
        .plex-btn {
          width: 100%;
          background: #EDEDEC;
          color: #1C1C1C;
          font-weight: 600;
          font-size: 14px;
          padding: 11px 0;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.15s ease, transform 0.1s ease, opacity 0.15s ease;
          letter-spacing: 0.01em;
        }
        .plex-btn:hover:not(:disabled) { background: #ffffff; transform: scale(1.005); }
        .plex-btn:active:not(:disabled) { transform: scale(0.98); }
        .plex-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* Label */
        .plex-label {
          display: block;
          font-size: 10px;
          font-weight: 600;
          color: #555555;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 7px;
        }
      `}</style>

      <div className="w-full" style={{ maxWidth: '380px' }}>

        {/* ── Logo + heading ── */}
        <div className="text-center mb-8 fade-up-1">

          {/* Perplexity logo */}
          <div className="flex items-center justify-center mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#20B8CD" style={{ width: 32, height: 32 }}>
              <path d="M5.73486 2L11.4299 7.24715V7.24595V2.01211H12.5385V7.27063L18.2591 2V7.98253H20.6078V16.6118H18.2663V21.9389L12.5385 16.9066V21.9967H11.4299V16.9896L5.74131 22V16.6118H3.39258V7.98253H5.73486V2ZM10.5942 9.0776H4.50118V15.5167H5.73992V13.4856L10.5942 9.0776ZM6.84986 13.9715V19.5565L11.4299 15.5225V9.81146L6.84986 13.9715ZM12.5704 15.4691L17.1577 19.4994V16.6118H17.1518V13.9663L12.5704 9.80608V15.4691ZM18.2663 15.5167H19.4992V9.0776H13.4516L18.2663 13.4399V15.5167ZM17.1505 7.98253V4.51888L13.3911 7.98253H17.1505ZM10.6028 7.98253L6.84346 4.51888V7.98253H10.6028Z" />
            </svg>
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#EDEDEC', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: '13px', color: '#9B9B9B', fontWeight: 400 }}>
            Sign in to your account
          </p>
        </div>

        {/* ── Card ── */}
        <div
          className="fade-up-2"
          style={{
            background: '#191919',
            border: '1px solid #2E2E2E',
            borderRadius: '14px',
            padding: '28px 24px',
          }}
        >

          {/* Error / verify message — only shows after form submit */}
          {formError && (
            <div
              className="fade-up"
              style={{
                marginBottom: '18px',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                textAlign: 'center',
                ...(formError.includes("verify")
                  ? { background: 'rgba(234,179,8,0.08)', color: '#FBBF24', border: '1px solid rgba(234,179,8,0.2)' }
                  : { background: 'rgba(239,68,68,0.08)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }
                )
              }}
            >
              {formError}

              {/* Extra hint for unverified email */}
              {formError.includes("verify") && (
                <div style={{ marginTop: '6px', fontSize: '12px', color: '#FCD34D' }}>
                  Please check your inbox or spam folder 📩
                </div>
              )}
            </div>
          )}

          <form onSubmit={submitForm} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* Email */}
            <div className="fade-up-3">
              <label className="plex-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="plex-input"
              />
            </div>

            {/* Password */}
            <div className="fade-up-4">
              <label className="plex-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="plex-input"
              />
            </div>

            {/* Submit */}
            <div className="fade-up-5" style={{ marginTop: '4px' }}>
              <button type="submit" disabled={loading} className="plex-btn">
                {loading ? "Signing in..." : "Continue"}
                {!loading && <ArrowRight size={16} />}
              </button>
            </div>
          </form>
        </div>

        {/* ── Footer ── */}
        <div className="fade-up-5" style={{ marginTop: '24px', textAlign: 'center' }}>

          <p style={{ fontSize: '13px', color: '#9B9B9B', marginBottom: '12px' }}>
            New to Perplexity?{' '}
            <Link
              to="/register"
              style={{ color: '#20B8CD', textDecoration: 'none', fontWeight: 500 }}
              onMouseEnter={e => e.target.style.textDecoration = 'underline'}
              onMouseLeave={e => e.target.style.textDecoration = 'none'}
            >
              Sign Up
            </Link>
          </p>

          {/* Resend verification — only shown when email error */}
          {formError && formError.includes("verify") && (
            <button
              style={{ color: '#20B8CD', background: 'none', border: 'none', fontSize: '13px', cursor: 'pointer', marginBottom: '12px' }}
              onMouseEnter={e => e.target.style.textDecoration = 'underline'}
              onMouseLeave={e => e.target.style.textDecoration = 'none'}
            >
              Resend verification email
            </button>
          )}

          <p style={{ fontSize: '11px', color: '#444444', lineHeight: 1.6, maxWidth: '280px', margin: '0 auto' }}>
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login 