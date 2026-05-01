import React, { useState } from 'react';
import { User, Phone, Mail, Lock, ArrowRight, Store } from 'lucide-react';
import {useAuth} from "../hook/useAuth.js";
import { useNavigate } from 'react-router';
import ContinueWithGoogle from '../components/ContinueWithGoogle.jsx';

const Register = () => {

  const {handleRegister} = useAuth();
  const navigate = useNavigate();


  const [formData, setFormData] = useState({
    fullName: '',
    contactNumber: '',
    email: '',
    password: '',
    isSeller: false,
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
      await handleRegister({
        email:formData.email,
        contact:formData.contactNumber,
        password:formData.password,
        fullname:formData.fullName,
        isSeller:formData.isSeller
      });
      navigate("/");
    } catch (err) {
      const errorMessage = err?.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMessage);
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden flex bg-black font-sans selection:bg-white selection:text-black">
      {/* Left Column: Brand/Image (Hidden on mobile, visible on desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-black relative items-center justify-center overflow-hidden h-full">
        {/* Generated custom fashion image */}
        <div className="absolute inset-0 opacity-80 bg-[url('/snitch-aesthetic.png')] bg-cover bg-center transition-transform hover:scale-105 duration-[20s] ease-out"></div>
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black"></div>

        <div className="relative z-10 text-white p-12 flex flex-col justify-end h-full w-full pb-16">
          <h1 className="text-5xl xl:text-6xl font-black tracking-tighter uppercase mb-2 opacity-90">Snitch</h1>
          <p className="text-lg xl:text-xl font-light tracking-wide max-w-md text-zinc-300">
            Redefining modern streetwear.
            <br /> Join the movement.
          </p>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 relative text-white h-full overflow-hidden">
        {/* Subtle cinematic ambient glows */}
        <div className="absolute top-1/4 right-0 w-72 h-72 lg:w-96 lg:h-96 bg-zinc-800 rounded-full mix-blend-screen filter blur-[150px] opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-72 h-72 lg:w-96 lg:h-96 bg-zinc-900 rounded-full mix-blend-screen filter blur-[120px] opacity-30 pointer-events-none"></div>

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Header (Shows only on mobile) */}
          <div className="lg:hidden mb-6">
            <h1 className="text-3xl font-black tracking-tighter uppercase mb-1">Snitch</h1>
            <p className="text-xs text-zinc-500 font-light tracking-wide">Join the movement.</p>
          </div>

          <div className="mb-6 xl:mb-10">
            <h2 className="text-2xl sm:text-3xl font-normal tracking-tight mb-2">Create Account</h2>
            <p className="text-zinc-400 text-xs sm:text-sm font-semibold tracking-wide leading-relaxed">
              Register to access exclusive drops, manage orders, and enjoy swift checkout.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 xl:space-y-6">
            {error && (
              <div className="bg-transparent border-l-2 border-red-500 text-red-400 px-3 py-2 text-xs sm:text-sm font-medium tracking-wide">
                {error}
              </div>
            )}
            {/* Full Name */}
            <div className="relative group">
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="peer w-full bg-transparent border-b border-zinc-700 py-2.5 xl:py-3 pr-8 text-sm text-white outline-none focus:border-white transition-colors duration-300 placeholder-transparent"
                placeholder="Full Name"
                required
              />
              <label
                htmlFor="fullName"
                className="absolute left-0 -top-3.5 text-xs text-zinc-500 transition-all duration-300 peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-500 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-white cursor-text"
              >
                Full Name
              </label>
              <User className="absolute right-0 top-2.5 w-4 h-4 text-zinc-600 peer-focus:text-white transition-colors duration-300" />
            </div>

            {/* Contact Number */}
            <div className="relative group">
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className="peer w-full bg-transparent border-b border-zinc-700 py-2.5 xl:py-3 pr-8 text-sm text-white outline-none focus:border-white transition-colors duration-300 placeholder-transparent"
                placeholder="Contact Number"
                required
              />
              <label
                htmlFor="contactNumber"
                className="absolute left-0 -top-3.5 text-xs text-zinc-500 transition-all duration-300 peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-500 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-white cursor-text"
              >
                Contact Number
              </label>
              <Phone className="absolute right-0 top-2.5 w-4 h-4 text-zinc-600 peer-focus:text-white transition-colors duration-300" />
            </div>

            {/* Email */}
            <div className="relative group">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="peer w-full bg-transparent border-b border-zinc-700 py-2.5 xl:py-3 pr-8 text-sm text-white outline-none focus:border-white transition-colors duration-300 placeholder-transparent"
                placeholder="Email Address"
                required
              />
              <label
                htmlFor="email"
                className="absolute left-0 -top-3.5 text-xs text-zinc-500 transition-all duration-300 peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-500 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-white cursor-text"
              >
                Email Address
              </label>
              <Mail className="absolute right-0 top-2.5 w-4 h-4 text-zinc-600 peer-focus:text-white transition-colors duration-300" />
            </div>

            {/* Password */}
            <div className="relative group">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="peer w-full bg-transparent border-b border-zinc-700 py-2.5 xl:py-3 pr-8 text-sm text-white outline-none focus:border-white transition-colors duration-300 placeholder-transparent"
                placeholder="Password"
                required
              />
              <label
                htmlFor="password"
                className="absolute left-0 -top-3.5 text-xs text-zinc-500 transition-all duration-300 peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-500 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-white cursor-text"
              >
                Password
              </label>
              <Lock className="absolute right-0 top-2.5 w-4 h-4 text-zinc-600 peer-focus:text-white transition-colors duration-300" />
            </div>

            {/* isSeller Checkbox */}
            <div className="pt-2 xl:pt-4 flex items-center group cursor-pointer w-max">
              <input
                type="checkbox"
                id="isSeller"
                name="isSeller"
                checked={formData.isSeller}
                onChange={handleChange}
                className="hidden peer"
              />
              <div
                className={`w-4 h-4 flex flex-shrink-0 items-center justify-center border transition-all duration-300 mr-3 mt-0.5
                  ${formData.isSeller ? 'bg-white border-white' : 'border-zinc-500 bg-transparent group-hover:border-white'}`
                }
              >
                {formData.isSeller && (
                  <svg className="w-2.5 h-2.5 text-black pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </div>
              <Store className={`w-3.5 h-3.5 mr-2 transition-colors duration-300 ${formData.isSeller ? 'text-white' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
              <label htmlFor="isSeller" className="text-zinc-400 font-light cursor-pointer text-xs md:text-sm tracking-wide select-none group-hover:text-white transition-colors duration-300">
                Register as a Seller
              </label>
            </div>

            <ContinueWithGoogle />

            {/* Submit Button */}
            <div className="pt-4 xl:pt-6">
              <button
                type="submit"
                className="flex justify-between items-center w-full bg-white text-black font-semibold tracking-[0.1em] py-3.5 xl:py-4 px-6 uppercase text-xs hover:bg-zinc-200 transition-all duration-500 group active:scale-90 cursor-pointer"
              >
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform duration-500" />
              </button>
            </div>

            <div className="mt-6 xl:mt-8 text-center pb-4">
              <p className="text-zinc-500 text-xs font-semibold tracking-wide">
                Already a member? <a href="/login" className="text-white hover:text-zinc-300 font-medium ml-1 underline underline-offset-4 decoration-zinc-700 hover:decoration-white transition-all duration-300">Log in</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;