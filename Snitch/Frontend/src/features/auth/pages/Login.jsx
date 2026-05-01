import React, { useState } from 'react';
import { ArrowRight, Mail, Lock } from 'lucide-react';
import { useAuth } from "../hook/useAuth.js";
import { useNavigate } from 'react-router';
import ContinueWithGoogle from '../components/ContinueWithGoogle.jsx';

const DM = "'DM Sans', sans-serif";
const BEBAS = "'Bebas Neue', sans-serif";

const Login = () => {
  const { handleLogin } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await handleLogin({ email: formData.email, password: formData.password });
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="h-screen w-full overflow-hidden flex bg-[#060606] text-white selection:bg-white selection:text-black"
      style={{ fontFamily: DM }}
    >
      {/* ── LEFT — brand panel ── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        <div
          className="absolute inset-0 bg-[url('/snitch-aesthetic.png')] bg-cover bg-center transition-transform duration-[25s] ease-out hover:scale-105"
          style={{ opacity: 0.75 }}
        />
        {/* gradient vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-[#060606]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#060606]" />

        {/* Brand copy */}
        <div className="relative z-10 flex flex-col justify-end h-full w-full p-14 pb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[11px] text-zinc-400 font-semibold tracking-[0.28em] uppercase">Welcome Back</span>
            <div className="h-px w-10 bg-zinc-600" />
          </div>
          <h1
            className="text-[clamp(3.5rem,5.5vw,5rem)] text-white uppercase leading-[0.9] mb-4"
            style={{ fontFamily: BEBAS, letterSpacing: '0.04em' }}
          >
            Snitch
          </h1>
          <p className="text-[14px] text-zinc-400 font-normal tracking-wide leading-[1.7] max-w-xs">
            Redefining modern streetwear.<br />Sign in to your account.
          </p>
        </div>
      </div>

      {/* ── RIGHT — form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14 relative overflow-y-auto">
        {/* subtle ambient glow */}
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-zinc-800 rounded-full filter blur-[160px] opacity-10 pointer-events-none" />

        <div className="w-full max-w-sm relative z-10">

          {/* Mobile wordmark */}
          <div className="lg:hidden mb-10">
            <span
              className="text-[2.5rem] text-white uppercase leading-none tracking-[0.06em]"
              style={{ fontFamily: BEBAS }}
            >
              Snitch
            </span>
            <p className="text-[12px] text-zinc-500 font-semibold tracking-[0.2em] uppercase mt-1">
              Welcome back
            </p>
          </div>

          {/* Heading */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[11px] text-zinc-600 font-bold tracking-[0.25em] uppercase">01</span>
              <div className="h-px flex-1 bg-white/[0.06]" />
              <span className="text-[11px] text-zinc-500 font-bold tracking-[0.22em] uppercase">Sign In</span>
            </div>
            <h2
              className="text-[2.8rem] text-white uppercase leading-[0.9]"
              style={{ fontFamily: BEBAS, letterSpacing: '0.04em' }}
            >
              Log In
            </h2>
            <p className="mt-2 text-[13px] text-zinc-400 tracking-wide leading-[1.6]">
              Enter your credentials to access your account.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="flex items-start gap-3 border border-red-800/60 bg-red-950/20 px-4 py-3">
                <div className="w-[3px] self-stretch bg-red-500 shrink-0" />
                <p className="text-red-300 text-[13px] font-medium tracking-wide">{error}</p>
              </div>
            )}

            <AuthField id="email" name="email" type="email" label="Email Address" icon={<Mail className="w-4 h-4" strokeWidth={1.5} />} value={formData.email} onChange={handleChange} required />
            <AuthField id="password" name="password" type="password" label="Password" icon={<Lock className="w-4 h-4" strokeWidth={1.5} />} value={formData.password} onChange={handleChange} required />

            <div className="pt-2 space-y-3">
              <AuthButton loading={isLoading} label="Sign In" />
              <ContinueWithGoogle />
            </div>

            <p className="text-[12px] text-zinc-500 font-semibold tracking-wide text-center pt-2">
              Don't have an account?{' '}
              <a href="/register" className="text-white underline underline-offset-4 decoration-zinc-700 hover:decoration-white transition-all duration-300 ml-1">
                Register
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ── shared sub-components ── */
export const AuthField = ({ id, name, type, label, icon, value, onChange, required }) => (
  <div className="relative group">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-zinc-600 group-focus-within:text-zinc-300 transition-colors duration-300">{icon}</span>
      <label
        htmlFor={id}
        className="text-[11px] text-zinc-500 font-bold tracking-[0.2em] uppercase transition-colors duration-300 group-focus-within:text-white cursor-text"
      >
        {label}
      </label>
    </div>
    <div className="relative">
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={label}
        className="peer w-full bg-transparent border-b border-zinc-700 focus:border-white py-2.5 text-[14px] text-white placeholder-transparent outline-none transition-all duration-400 tracking-wide font-medium"
        style={{ fontFamily: DM }}
      />
      <span className="absolute bottom-0 left-0 h-px w-0 bg-white transition-all duration-500 peer-focus:w-full" />
    </div>
  </div>
);

export const AuthButton = ({ loading, label }) => (
  <button
    type="submit"
    disabled={loading}
    className="relative flex items-center justify-between w-full bg-white text-black font-black tracking-[0.15em] py-4 px-6 uppercase text-[11px] hover:bg-zinc-100 active:scale-[0.99] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
    style={{ fontFamily: DM }}
  >
    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-black/10 to-transparent pointer-events-none" />
    <span className="relative">{loading ? 'Signing in…' : label}</span>
    <ArrowRight className="relative w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2.5} />
  </button>
);

export default Login;
