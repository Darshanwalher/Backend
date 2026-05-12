import React from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Check } from 'lucide-react';
import Nav from '../../Shared/Components/Nav';

const OrderSuccess = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const queryParams = new URLSearchParams(location.search)
    const orderId = queryParams.get("order_id") || "PENDING"
    
    // Calculate estimated delivery date
    const getEstimatedDelivery = () => {
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() + 3);
        const end = new Date(today);
        end.setDate(today.getDate() + 5);
        
        const options = { month: 'short', day: 'numeric' };
        return `${start.toLocaleDateString('en-US', options).toUpperCase()} - ${end.toLocaleDateString('en-US', options).toUpperCase()}`;
    }

  return (
    <div className="min-h-screen w-full bg-[#141313] text-white selection:bg-white selection:text-black pt-24 pb-32 flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
        <Nav title="Order Success" />

        <div className="flex-1 flex flex-col items-center justify-center max-w-screen-2xl mx-auto px-6 lg:px-16 w-full mt-10">
            <div className="border border-zinc-800 p-12 md:p-20 flex flex-col items-center max-w-3xl w-full text-center bg-[#141313]">
                {/* Large sharp checkmark or icon container */}
                <div className="w-24 h-24 mb-10 flex items-center justify-center border border-zinc-800">
                    <Check className="w-10 h-10 text-white" strokeWidth={1} />
                </div>

                <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-bold text-white leading-[0.9] uppercase tracking-[-0.04em] mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Thank You<br/>For Your Order
                </h1>

                <p className="text-zinc-400 text-[13px] leading-[1.8] max-w-sm mb-10 font-normal tracking-[0.02em]">
                    Thank you for trusting Snitch. We are deeply honored to be a part of your style journey. Your selections are being meticulously prepared.
                </p>

                <div className="h-px w-24 bg-zinc-800 mb-10"></div>

                <div className="flex flex-col gap-4 mb-12 w-full max-w-sm">
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                        <span className="text-[11px] text-zinc-400 font-semibold tracking-[0.1em] uppercase">Order ID</span>
                        <span className="text-[13px] font-bold text-white tracking-widest">{orderId}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                        <span className="text-[11px] text-zinc-400 font-semibold tracking-[0.1em] uppercase">Estimated Delivery</span>
                        <span className="text-[13px] font-bold text-white tracking-widest">{getEstimatedDelivery()}</span>
                    </div>
                </div>

                <button 
                    onClick={() => navigate('/')}
                    className="bg-white text-black cursor-pointer text-[13px] font-bold tracking-[0.1em] uppercase px-10 py-5 hover:bg-zinc-200 active:scale-[0.98] transition-all duration-300 rounded-none w-full max-w-sm"
                >
                    Continue Shopping
                </button>
            </div>
        </div>
    </div>
  )
}

export default OrderSuccess