import React, { useEffect, useState } from 'react';
import { useCart } from '../hooks/useCart';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Minus, Plus, Trash2, ArrowLeft, Home } from 'lucide-react';
import Nav from '../../Shared/Components/Nav';

const CURRENCY_SYMBOLS = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };

const formatPrice = (amount, currency) => {
    try {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: currency || "INR",
            minimumFractionDigits: 0,
        }).format(amount);
    } catch {
        return `${CURRENCY_SYMBOLS[currency] || ""}${amount}`;
    }
};

const Cart = () => {
    const cartItems = useSelector(state => state.cart) || [];
    const { handleGetCart, handleIncrementItem, handleDecrementItem, handleRemoveItem } = useCart();
    const navigate = useNavigate();
    const [notification, setNotification] = useState(null);

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    useEffect(() => {
        handleGetCart();
    }, []);

    console.log(cartItems);



    return (
        <div
            className="min-h-screen w-full bg-[#060606] text-white selection:bg-white selection:text-black pt-24 pb-32"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
            <Nav title="Checkout" />

            <div className="max-w-screen-2xl mx-auto px-6 lg:px-16">

                {/* ══════════ HERO ══════════ */}
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-6 mt-6">
                    <div>
                        <div className="flex items-center gap-4 mb-5">
                            <span className="text-[11px] text-zinc-400 font-semibold tracking-[0.28em] uppercase">
                                Checkout
                            </span>
                            <div className="h-px w-12 bg-zinc-700" />
                            <span className="text-[11px] text-zinc-600 font-semibold tracking-[0.28em] uppercase">
                                {cartItems.items?.length} Items
                            </span>
                        </div>
                        <h1
                            className="text-[clamp(2.8rem,6vw,5.5rem)] text-white leading-[0.88] uppercase"
                            style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.04em" }}
                        >
                            Your<br />
                            <span className="text-zinc-600">Bag</span>
                        </h1>
                    </div>
                </div>

                <div className="h-px w-full bg-white/[0.05] mb-8"></div>

                {(!cartItems || !cartItems.items || cartItems.items.length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-28 gap-6 border border-white/[0.05] bg-white/[0.01]">
                        <div className="text-center space-y-2">
                            <p className="text-[13px] text-zinc-400 font-semibold tracking-[0.2em] uppercase">
                                Your bag is empty
                            </p>
                            <p className="text-[12px] text-zinc-600 tracking-wide max-w-xs leading-relaxed">
                                Browse our collection to add items to your cart.
                            </p>
                        </div>
                        <button
                            onClick={() => { navigate('/') }}
                            className="flex items-center gap-2 bg-white text-black text-[11px] font-black tracking-[0.18em] uppercase px-6 py-3 hover:bg-zinc-100 active:scale-[0.98] transition-all duration-300 cursor-pointer">
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
                        {/* Cart Items List */}
                        <div className="lg:col-span-8 flex flex-col gap-4">
                            {cartItems.items?.map((item, i) => {
                                const matchedVariant = Array.isArray(item.product?.variants) ? item.product?.variants?.find(v => v._id === item.variant) : item.product?.variants;
                                const imageUrl = matchedVariant?.images?.[0]?.url || item.product?.images?.[0]?.url;
                                const attributes = matchedVariant?.attributes || {};
                                const stock = matchedVariant?.stock || item.product?.stock;
                                const variantPrice = matchedVariant?.price?.amount || item.product?.price?.amount;
                                const displayPriceAmount = item.price?.amount;
                                const currency = item.price?.currency || 'INR';

                                return (
                                    <div
                                        key={item._id}
                                        className="flex flex-col sm:flex-row bg-white/[0.025] border border-white/[0.06] hover:border-white/[0.14] transition-all duration-500 overflow-hidden"
                                    >
                                        <div className="w-full sm:w-40 aspect-[4/5] bg-zinc-900/60 overflow-hidden shrink-0 relative">
                                            {imageUrl ? (
                                                <img src={imageUrl} alt={item.product?.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <span className="text-[10px] text-zinc-600 uppercase tracking-widest">No Image</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 flex flex-col p-5 gap-3">
                                            <div className="flex justify-between items-start gap-4">
                                                <h2 className="text-[16px] font-bold text-white leading-snug tracking-tight">
                                                    {item.product?.title}
                                                </h2>
                                                <button
                                                    onClick={() => handleRemoveItem({ productId: item.product._id, variantId: item.variant })}
                                                    className="text-zinc-500 hover:text-white transition-colors cursor-pointer p-1 "
                                                >
                                                    <Trash2 className="w-4 h-4 hover:text-red-500 cursor-pointer" />
                                                </button>
                                            </div>

                                            {item.product?.description && (
                                                <p className="text-[12px] text-zinc-500 leading-relaxed tracking-wide line-clamp-2 font-normal">
                                                    {item.product.description}
                                                </p>
                                            )}

                                            {Object.entries(attributes).length > 0 && (
                                                <div className="flex flex-wrap gap-4 mt-1">
                                                    {Object.entries(attributes).map(([key, value]) => (
                                                        <div key={key} className="flex gap-1.5 items-center">
                                                            <span className="text-[10px] text-zinc-600 font-bold tracking-[0.2em] uppercase">{key}:</span>
                                                            <span className="text-[11px] text-zinc-300 uppercase tracking-wider">{value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {stock !== undefined && (
                                                <div className="mt-1">
                                                    <span className={`text-[10px] font-bold tracking-[0.2em] uppercase ${stock > 5 ? 'text-zinc-500' : stock > 0 ? 'text-orange-500' : 'text-red-500'}`}>
                                                        {stock > 0 ? `${stock} IN STOCK` : 'OUT OF STOCK'}
                                                    </span>
                                                </div>
                                            )}

                                            {displayPriceAmount !== variantPrice && (
                                                <div className="mt-3 flex items-start gap-2.5 bg-white/[0.02] border border-white/[0.05] p-3">
                                                    <div className={`w-1.5 h-1.5 mt-1 rounded-full shrink-0 ${displayPriceAmount > variantPrice ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'}`} />
                                                    <p className="text-[10px] uppercase tracking-[0.15em] font-bold leading-relaxed text-zinc-400">
                                                        {displayPriceAmount > variantPrice
                                                            ? <>Price Dropped. Get this at <span className="text-white">{formatPrice(variantPrice, currency)}</span> (Save <span className="text-green-500">{formatPrice(Math.abs(variantPrice - displayPriceAmount), currency)}</span>)</>
                                                            : <>Price Updated. This costs <span className="text-red-500">{formatPrice(Math.abs(variantPrice - displayPriceAmount), currency)}</span> more</>
                                                        }
                                                    </p>
                                                </div>
                                            )}

                                            <div className="h-px bg-white/[0.05] mt-auto" />

                                            <div className="flex items-center justify-between pt-1">
                                                <div className="flex items-center border border-white/[0.06] bg-white/[0.02]">
                                                    <button
                                                        onClick={() => {
                                                            if (item.quantity <= 1) {
                                                                showNotification(`Cannot decrease quantity below 1.`);
                                                                return;
                                                            }
                                                            handleDecrementItem({ productId: item.product._id, variantId: item.variant }).catch(err => showNotification(err.message));
                                                        }}
                                                        className="px-3 py-2 text-zinc-400 hover:text-white transition-colors cursor-pointer">
                                                        <Minus className="w-3.5 h-3.5" />
                                                    </button>
                                                    <span className="px-3 py-2 text-[12px] font-bold w-10 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => {
                                                            if (item.quantity >= stock) {
                                                                showNotification(`Only ${stock} items available in stock.`);
                                                                return;
                                                            }
                                                            handleIncrementItem({ productId: item.product._id, variantId: item.variant }).catch(err => showNotification(err.message));
                                                        }}
                                                        className="px-3 py-2 text-zinc-400 hover:text-white transition-colors cursor-pointer">
                                                        <Plus className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] text-zinc-600 font-bold tracking-[0.2em] uppercase">Total</span>
                                                    <span className="text-[16px] font-black text-white tracking-tight leading-tight">
                                                        {formatPrice(variantPrice * item.quantity, currency)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-4">
                            <div className="bg-white/[0.025] border border-white/[0.06] p-6 lg:p-8 sticky top-24">
                                <h3
                                    className="text-2xl text-white uppercase tracking-wider mb-6"
                                    style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.08em" }}
                                >
                                    Summary
                                </h3>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] text-zinc-400 font-bold tracking-[0.2em] uppercase">Subtotal</span>
                                        <span className="text-[14px] font-bold text-white tracking-tight">
                                            {formatPrice(cartItems.totalPrice || 0, cartItems.currency || 'INR')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] text-zinc-400 font-bold tracking-[0.2em] uppercase">Shipping</span>
                                        <span className="text-[11px] text-zinc-300 uppercase tracking-widest">Calculated at checkout</span>
                                    </div>
                                </div>

                                <div className="h-px w-full bg-white/[0.05] mb-6"></div>

                                <div className="flex justify-between items-end mb-8">
                                    <span className="text-[12px] text-white font-bold tracking-[0.2em] uppercase">Total</span>
                                    <span className="text-[24px] font-black text-white tracking-tight leading-none">
                                        {formatPrice(cartItems.totalPrice || 0, cartItems.currency || 'INR')}
                                    </span>
                                </div>

                                <button className="w-full flex items-center justify-center gap-2 bg-white text-black text-[12px] font-black tracking-[0.18em] uppercase px-6 py-4 hover:bg-zinc-100 active:scale-[0.98] transition-all duration-300 cursor-pointer">
                                    Proceed to Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Premium Custom Alert / Toast */}
            {notification && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#0a0a0a] border border-white/[0.08] text-white px-6 py-4 shadow-[0_0_40px_rgba(0,0,0,0.8)] transition-all duration-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                    <span className="text-[11px] font-bold tracking-[0.1em] uppercase">{notification}</span>
                </div>
            )}
        </div>
    );
};

export default Cart;