import React from 'react'
import { ArrowLeft, Home, ShoppingBag } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'

const Nav = ({ title, rightContent, homeRoute }) => {
    const navigate = useNavigate();
    const user = useSelector(state => state.auth?.user);
    const cartItems = useSelector(state => state.cart?.items) || [];
    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    return (
        <>
            {/* ══════════ HEADER ══════════ */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.05] bg-[#060606]/95 backdrop-blur-md">
                <div className="max-w-screen-2xl mx-auto px-6 lg:px-16 h-16 flex items-center justify-between">
                    
                    {/* Wordmark */}
                    <div 
                        className="flex items-center gap-3 cursor-pointer select-none group"
                        onClick={() => navigate(homeRoute || "/")}
                    >
                        <div className="w-8 h-8 bg-white text-black flex items-center justify-center group-hover:rotate-90 transition-transform duration-700 ease-in-out">
                            <span className="font-black text-xl leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>S</span>
                        </div>
                        <div className="flex flex-col items-start">
                            <span
                                className="text-white text-2xl leading-none tracking-[0.3em] uppercase group-hover:text-zinc-300 transition-colors duration-500"
                                style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.3em" }}
                            >
                                Snitch
                            </span>
                            <span className="text-[9px] text-zinc-500 tracking-[0.28em] uppercase mt-0.5 font-bold flex items-center gap-1.5">
                                <span className="w-1 h-1 bg-white inline-block animate-pulse"></span>
                                {title || "Checkout"}
                            </span>
                        </div>
                    </div>

                    {/* Nav Right */}
                    <div className="flex items-center gap-6">
                        {rightContent ? (
                            rightContent
                        ) : (
                            <nav className="flex items-center gap-6">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="text-[11px] font-bold tracking-[0.2em] uppercase transition-colors duration-300 cursor-pointer text-zinc-600 hover:text-white flex items-center gap-2"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                                </button>
                                <button
                                    onClick={() => navigate(homeRoute || "/")}
                                    className="text-[11px] font-bold tracking-[0.2em] uppercase transition-colors duration-300 cursor-pointer text-zinc-600 hover:text-white flex items-center gap-2"
                                >
                                    <Home className="w-3.5 h-3.5" /> Home
                                </button>
                            </nav>
                        )}
                        
                        {user?.role === 'buyer' && (
                            <button
                                onClick={() => navigate("/cart")}
                                className="relative flex items-center justify-center transition-all duration-300 cursor-pointer text-zinc-600 hover:text-white group"
                                aria-label="Cart"
                            >
                                <ShoppingBag className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform duration-300" strokeWidth={2} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2.5 min-w-[16px] h-[16px] flex items-center justify-center bg-white text-black text-[9px] font-bold rounded-full px-1 shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        )}
                    </div>

                </div>
            </header>
        </>
    )
}

export default Nav