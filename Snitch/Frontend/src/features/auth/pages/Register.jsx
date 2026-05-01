import React, { useState } from 'react';
import { User, Phone, Mail, Lock, Store, ArrowRight } from 'lucide-react';
import { useAuth } from "../hook/useAuth.js";
import { useNavigate } from 'react-router';
import ContinueWithGoogle from '../components/ContinueWithGoogle.jsx';

const BEBAS = "'Bebas Neue', sans-serif";
const DM    = "'DM Sans', sans-serif";

const Register = () => {
  const { handleRegister } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    contactNumber: '',
    email: '',
    password: '',
    isSeller: false,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await handleRegister({
        email: formData.email,
        contact: formData.contactNumber,
        password: formData.password,
        fullname: formData.fullName,
        isSeller: formData.isSeller,
      });
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-[#060606]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#060606]" />

        <div className="relative z-10 flex flex-col justify-end h-full w-full p-14 pb-16">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[11px] text-zinc-400 font-semibold tracking-[0.28em] uppercase">Join the Movement</span>
            <div className="h-px w-10 bg-zinc-600" />
          </div>
          <h1
            className="text-[clamp(3.5rem,5.5vw,5rem)] text-white uppercase leading-[0.9] mb-4"
            style={{ fontFamily: BEBAS, letterSpacing: '0.04em' }}
          >
            Snitch
          </h1>
          <p className="text-[13px] text-zinc-400 tracking-wide leading-[1.7] max-w-xs">
            Redefining modern streetwear.<br />Create your account today.
          </p>
        </div>
      </div>

      {/* ── RIGHT — form panel (no scroll) ── */}
      <div className="flex-1 h-full flex items-center justify-center px-6 sm:px-10 lg:px-14 relative overflow-hidden">
        {/* ambient glow */}
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-zinc-800 rounded-full filter blur-[160px] opacity-10 pointer-events-none" />

        <div className="w-full max-w-sm relative z-10">

          {/* Mobile wordmark */}
          <div className="lg:hidden mb-6">
            <span
              className="text-[2.2rem] text-white uppercase leading-none tracking-[0.06em]"
              style={{ fontFamily: BEBAS }}
            >
              Snitch
            </span>
            <p className="text-[11px] text-zinc-500 font-semibold tracking-[0.2em] uppercase mt-0.5">
              Join the movement
            </p>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] text-zinc-600 font-bold tracking-[0.25em] uppercase">01</span>
              <div className="h-px flex-1 bg-white/[0.06]" />
              <span className="text-[10px] text-zinc-500 font-bold tracking-[0.22em] uppercase">New Account</span>
            </div>
            <h2
              className="text-[2.4rem] text-white uppercase leading-[0.9]"
              style={{ fontFamily: BEBAS, letterSpacing: '0.04em' }}
            >
              Register
            </h2>
            <p className="mt-1.5 text-[12px] text-zinc-400 tracking-wide leading-[1.6]">
              Access exclusive drops and manage your orders.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 border border-red-800/60 bg-red-950/20 px-3 py-2.5">
                <div className="w-[3px] self-stretch bg-red-500 shrink-0" />
                <p className="text-red-300 text-[12px] font-medium tracking-wide">{error}</p>
              </div>
            )}

            {/* Two-column row: Full Name + Contact */}
            <div className="grid grid-cols-2 gap-4">
              <CompactField id="fullName"      name="fullName"      type="text"  label="Full Name"    icon={<User  className="w-3.5 h-3.5" strokeWidth={1.5} />} value={formData.fullName}      onChange={handleChange} required />
              <CompactField id="contactNumber" name="contactNumber" type="tel"   label="Contact"      icon={<Phone className="w-3.5 h-3.5" strokeWidth={1.5} />} value={formData.contactNumber} onChange={handleChange} required />
            </div>

            <CompactField id="email"    name="email"    type="email"    label="Email Address" icon={<Mail className="w-3.5 h-3.5" strokeWidth={1.5} />} value={formData.email}    onChange={handleChange} required />
            <CompactField id="password" name="password" type="password" label="Password"      icon={<Lock className="w-3.5 h-3.5" strokeWidth={1.5} />} value={formData.password} onChange={handleChange} required />

            {/* isSeller toggle */}
            <div
              className="flex items-center gap-2.5 cursor-pointer group"
              onClick={() => setFormData((p) => ({ ...p, isSeller: !p.isSeller }))}
            >
              <div
                className={`w-3.5 h-3.5 shrink-0 flex items-center justify-center border transition-all duration-300 ${
                  formData.isSeller ? 'bg-white border-white' : 'border-zinc-600 group-hover:border-zinc-400'
                }`}
              >
                {formData.isSeller && (
                  <svg className="w-2 h-2 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <Store
                className={`w-3.5 h-3.5 transition-colors duration-300 ${formData.isSeller ? 'text-white' : 'text-zinc-600 group-hover:text-zinc-400'}`}
                strokeWidth={1.5}
              />
              <span className={`text-[12px] tracking-wide select-none transition-colors duration-300 font-medium ${
                formData.isSeller ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'
              }`}>
                Register as a Seller
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative flex items-center justify-between w-full bg-white text-black font-black tracking-[0.15em] py-3.5 px-5 uppercase text-[11px] hover:bg-zinc-100 active:scale-[0.99] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
              style={{ fontFamily: DM }}
            >
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-black/10 to-transparent pointer-events-none" />
              <span className="relative">{isLoading ? 'Creating account…' : 'Create Account'}</span>
              <ArrowRight className="relative w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2.5} />
            </button>

            <ContinueWithGoogle />

            <p className="text-[11px] text-zinc-500 font-semibold tracking-wide text-center">
              Already a member?{' '}
              <a href="/login" className="text-white underline underline-offset-4 decoration-zinc-700 hover:decoration-white transition-all duration-300 ml-1">
                Log in
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ── Compact field (tighter than Login's full-size AuthField) ── */
const CompactField = ({ id, name, type, label, icon, value, onChange, required }) => (
  <div className="relative group">
    <div className="flex items-center gap-1.5 mb-1.5">
      <span className="text-zinc-600 group-focus-within:text-zinc-300 transition-colors duration-300">{icon}</span>
      <label
        htmlFor={id}
        className="text-[10px] text-zinc-500 font-bold tracking-[0.2em] uppercase transition-colors duration-300 group-focus-within:text-white cursor-text"
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
        className="peer w-full bg-transparent border-b border-zinc-700 focus:border-white py-2 text-[13px] text-white placeholder-transparent outline-none transition-all duration-400 tracking-wide font-medium"
        style={{ fontFamily: DM }}
      />
      <span className="absolute bottom-0 left-0 h-px w-0 bg-white transition-all duration-500 peer-focus:w-full" />
    </div>
  </div>
);

export default Register;