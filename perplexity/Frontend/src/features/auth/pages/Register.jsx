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

    const res = await auth.handleRegister({ username, email, password })

    if (res.success) {
      // Show success message then redirect to login after 3s
      setSuccess(res.message)
      setTimeout(() => navigate("/login"), 3000)
    } else {
      setError(res.message)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#1C1C1C', fontFamily: "'Sora', sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');

        * { font-family: 'Sora', sans-serif; box-sizing: border-box; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up-1 { animation: fadeUp 0.4s ease 0.05s both; }
        .fade-up-2 { animation: fadeUp 0.4s ease 0.12s both; }
        .fade-up-3 { animation: fadeUp 0.4s ease 0.17s both; }
        .fade-up-4 { animation: fadeUp 0.4s ease 0.22s both; }
        .fade-up-5 { animation: fadeUp 0.4s ease 0.27s both; }
        .fade-up-6 { animation: fadeUp 0.4s ease 0.32s both; }
        .fade-up   { animation: fadeUp 0.3s ease both; }

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
          <div className="flex items-center justify-center mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#20B8CD" style={{ width: 32, height: 32 }}>
              <path d="M5.73486 2L11.4299 7.24715V7.24595V2.01211H12.5385V7.27063L18.2591 2V7.98253H20.6078V16.6118H18.2663V21.9389L12.5385 16.9066V21.9967H11.4299V16.9896L5.74131 22V16.6118H3.39258V7.98253H5.73486V2ZM10.5942 9.0776H4.50118V15.5167H5.73992V13.4856L10.5942 9.0776ZM6.84986 13.9715V19.5565L11.4299 15.5225V9.81146L6.84986 13.9715ZM12.5704 15.4691L17.1577 19.4994V16.6118H17.1518V13.9663L12.5704 9.80608V15.4691ZM18.2663 15.5167H19.4992V9.0776H13.4516L18.2663 13.4399V15.5167ZM17.1505 7.98253V4.51888L13.3911 7.98253H17.1505ZM10.6028 7.98253L6.84346 4.51888V7.98253H10.6028Z" />
            </svg>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#EDEDEC', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Create Account
          </h1>
          <p style={{ fontSize: '13px', color: '#9B9B9B', fontWeight: 400 }}>
            Join the community today
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
          {/* Success message — shown after registration */}
          {success && (
            <div
              className="fade-up"
              style={{
                marginBottom: '18px',
                padding: '12px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                textAlign: 'center',
                background: 'rgba(32,184,205,0.08)',
                border: '1px solid rgba(32,184,205,0.25)',
                color: '#20B8CD',
                lineHeight: 1.5,
              }}
            >
              {success}
              <div style={{ marginTop: '6px', fontSize: '11px', color: '#9B9B9B' }}>
                Redirecting to login...
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div
              className="fade-up"
              style={{
                marginBottom: '18px',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                textAlign: 'center',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#F87171',
              }}
            >
              {error}
            </div>
          )}

          {/* Form — hidden after successful registration */}
          {!success && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

              {/* Username */}
              <div className="fade-up-3">
                <label className="plex-label">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                  required
                  className="plex-input"
                />
              </div>

              {/* Email */}
              <div className="fade-up-4">
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
              <div className="fade-up-5">
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
              <div className="fade-up-6" style={{ marginTop: '4px' }}>
                <button type="submit" disabled={loading} className="plex-btn">
                  {loading ? 'Creating...' : 'Create Account'}
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="fade-up-6" style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#9B9B9B' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ color: '#20B8CD', textDecoration: 'none', fontWeight: 500 }}
              onMouseEnter={e => e.target.style.textDecoration = 'underline'}
              onMouseLeave={e => e.target.style.textDecoration = 'none'}
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register