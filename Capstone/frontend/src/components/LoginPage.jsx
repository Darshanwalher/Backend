import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, clearError } from '../store/authSlice';
import { Cpu, Mail, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [shake, setShake] = useState(false);
  const [successPulse, setSuccessPulse] = useState(false);

  const canvasRef = useRef(null);

  // Clear errors on load
  useEffect(() => {
    dispatch(clearError());
    setLocalError('');
  }, [dispatch]);

  // Particle background animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Create drifting particles
    const particles = [];
    const colors = ['rgba(86, 156, 214, 0.15)', 'rgba(78, 201, 176, 0.15)'];
    const particleCount = Math.min(40, Math.floor((window.innerWidth * window.innerHeight) / 30000));
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1.5, // 1.5px to 3.5px
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      });
    }

    const animate = () => {
      ctx.fillStyle = '#121214';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw dot grid texture
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      for (let x = 0; x < canvas.width; x += 24) {
        for (let y = 0; y < canvas.height; y += 24) {
          ctx.fillRect(x, y, 1, 1);
        }
      }

      // Draw particles
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        // Wrap boundaries
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Shake card on error
  useEffect(() => {
    if (error || localError) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error, localError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email.trim() || !password.trim()) {
      setLocalError('All fields are required.');
      return;
    }

    const action = await dispatch(loginUser({ email: email.trim(), password }));
    
    if (loginUser.fulfilled.match(action)) {
      setSuccessPulse(true);
      setTimeout(() => {
        navigate('/');
      }, 800);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'https://code-spaces.online/api/auth/google';
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-4 relative bg-[#121214] overflow-hidden select-none">
      {/* Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Main Glassmorphic Card */}
      <div 
        className={`auth-card z-10 w-full max-w-[420px] p-8 sm:p-10 transition-all duration-300 ease-in-out flex flex-col animate-card-entrance ${
          shake ? 'animate-shake border-error-flash shadow-[0_0_20px_rgba(241,76,76,0.25)]' : ''
        } ${
          successPulse ? 'animate-success-pulse' : ''
        }`}
      >
        {/* Header Branding */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="relative w-12 h-12 mb-4 flex items-center justify-center bg-[#1e1e1e] rounded-full border border-border">
            <Cpu className="w-6 h-6 text-[#569cd6] animate-icon-glow rounded-full" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            CodeSpace
          </h1>
          <p className="text-[#858585] text-sm mt-1.5 font-normal">
            Sign in to your workspace
          </p>
        </div>

        {/* Error Messaging */}
        {(localError || error) && (
          <div className="mb-5 p-3.5 bg-red-950/20 border border-[#f14c4c]/30 text-[#f14c4c] rounded-lg text-xs flex gap-3 animate-fade-in">
            <AlertCircle className="w-4.5 h-4.5 shrink-0" />
            <span>{localError || error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email Field */}
          <div className="form-input-container">
            <input
              type="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading'}
              className="form-input-field w-full pl-10 pr-4 py-3.5 text-xs"
            />
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#858585]" />
            <label className="form-label text-[10px]">Email Address</label>
          </div>

          {/* Password Field */}
          <div className="form-input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={status === 'loading'}
              className="form-input-field w-full pl-10 pr-10 py-3.5 text-xs"
            />
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#858585]" />
            <label className="form-label text-[10px]">Password</label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#858585] hover:text-white cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="animate-border-shimmer mt-2 w-full bg-[#569cd6] hover:bg-[#6db3f2] active:bg-[#4a8bc2] disabled:bg-[#3e3e42] disabled:opacity-50 text-[#121214] font-semibold py-3.5 rounded-lg active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider border border-[#569cd6] hover:shadow-[0_0_20px_rgba(86,156,214,0.3)] hover:-translate-y-0.5 active:translate-y-0 focus:outline-none"
          >
            {status === 'loading' ? (
              <span className="w-4 h-4 border-2 border-[#121214] border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Toggle link */}
        <div className="text-center mt-4 text-xs text-[#858585]">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#569cd6] hover:underline font-semibold transition-colors">
            Sign up
          </Link>
        </div>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-[#3e3e42]"></div>
          <span className="px-3 text-[10px] text-[#858585] uppercase tracking-wider relative">
            or continue with
          </span>
          <div className="flex-1 border-t border-[#3e3e42]"></div>
        </div>

        {/* Google Login Button (Outlined style) */}
        <button
          onClick={handleGoogleLogin}
          disabled={status === 'loading'}
          className="w-full border border-[#3e3e42] bg-transparent text-[#d4d4d4] hover:border-[#569cd6] active:scale-[0.98] font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer text-xs focus:outline-none"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Continue with Google</span>
        </button>
      </div>
    </div>
  );
}
