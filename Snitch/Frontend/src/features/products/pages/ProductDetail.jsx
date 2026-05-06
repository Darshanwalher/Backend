import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useProduct } from "../hooks/useProduct.js";
import { useCart } from "../../cart/hooks/useCart.js";
import {
    ArrowLeft,
    ShoppingBag,
    Zap,
    ImageOff,
    ChevronLeft,
    ChevronRight,
    Share2,
    Heart,
    Package,
    RefreshCw,
    Shield,
} from "lucide-react";
import Nav from "../../Shared/Components/Nav";

/* ─────────────────── Constants ─────────────────── */
const DM = "'DM Sans', sans-serif";
const BEBAS = "'Bebas Neue', sans-serif";

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

/* ─────────────────── Skeleton ─────────────────── */
const Skeleton = () => (
    <div
        className="min-h-screen w-full bg-[#060606] text-white animate-pulse"
        style={{ fontFamily: DM }}
    >
        {/* nav skeleton */}
        <div className="fixed top-0 left-0 right-0 h-16 border-b border-white/[0.05] bg-[#060606]/95 backdrop-blur-md z-40" />

        <div className="max-w-screen-xl mx-auto px-6 lg:px-16 pt-28 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                {/* image skeleton */}
                <div className="aspect-[3/4] bg-zinc-800/50 w-full" />
                {/* info skeleton */}
                <div className="space-y-6 pt-4">
                    <div className="h-3 bg-zinc-800/40 rounded-sm w-1/3" />
                    <div className="h-12 bg-zinc-800/50 rounded-sm w-full" />
                    <div className="h-4 bg-zinc-800/30 rounded-sm w-full" />
                    <div className="h-4 bg-zinc-800/30 rounded-sm w-3/4" />
                    <div className="h-px bg-white/[0.05]" />
                    <div className="h-10 bg-zinc-800/40 rounded-sm w-1/2" />
                    <div className="h-px bg-white/[0.05]" />
                    <div className="flex gap-4">
                        <div className="h-14 flex-1 bg-zinc-800/40 rounded-sm" />
                        <div className="h-14 flex-1 bg-zinc-800/50 rounded-sm" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

/* ─────────────────── Not Found ─────────────────── */
const NotFound = ({ onBack }) => (
    <div
        className="min-h-screen w-full bg-[#060606] text-white flex flex-col items-center justify-center gap-6"
        style={{ fontFamily: DM }}
    >
        <div className="w-20 h-20 border border-dashed border-zinc-700 flex items-center justify-center">
            <ImageOff className="w-8 h-8 text-zinc-600" strokeWidth={1} />
        </div>
        <p className="text-[13px] text-zinc-400 font-semibold tracking-[0.2em] uppercase">
            Product not found
        </p>
        <button
            onClick={onBack}
            className="flex items-center gap-2 border border-white/20 text-white text-[10px] font-black tracking-[0.2em] uppercase px-5 py-3 hover:bg-white hover:text-black transition-all duration-300 cursor-pointer"
        >
            <ArrowLeft className="w-3 h-3" strokeWidth={3} />
            Go Back
        </button>
    </div>
);

/* ─────────────────── Main Component ─────────────────── */
const ProductDetail = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { handleGetProductById } = useProduct();
    const {handleAddItem} = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imgIdx, setImgIdx] = useState(0);
    const [errorSet, setErrorSet] = useState(new Set());
    const [wishlisted, setWishlisted] = useState(false);
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [currentVariant, setCurrentVariant] = useState(null);
    const [showToast, setShowToast] = useState(false);

    const normalizeAttributes = (attrs) => {
        const normalized = {};
        if (!attrs) return normalized;
        Object.entries(attrs).forEach(([k, v]) => {
            normalized[k.toLowerCase().trim()] = v;
        });
        return normalized;
    };

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            const data = await handleGetProductById(productId);
            setProduct(data);
            if (data?.variants?.length > 0) {
                setSelectedAttributes(normalizeAttributes(data.variants[0].attributes));
                setCurrentVariant(data.variants[0]);
            }
            setLoading(false);
        };
        fetchProduct();
    }, [productId]);

    if (loading) return <Skeleton />;
    if (!product) return <NotFound onBack={() => navigate(-1)} />;

    const attributesMap = {};
    if (product?.variants) {
        product.variants.forEach(variant => {
            Object.entries(normalizeAttributes(variant.attributes)).forEach(([key, value]) => {
                if (!attributesMap[key]) attributesMap[key] = new Set();
                attributesMap[key].add(value);
            });
        });
    }

    const handleAttributeSelect = (attrKey, attrValue) => {
        if (selectedAttributes[attrKey] === attrValue) return;
        
        let newAttributes = { ...selectedAttributes, [attrKey]: attrValue };
        
        if (product?.variants) {
            const reversedVariants = [...product.variants].reverse();
            
            let matched = reversedVariants.find(v => {
                const vAttrs = normalizeAttributes(v.attributes);
                return Object.entries(newAttributes).every(([k, val]) => vAttrs[k] === val) &&
                       Object.keys(vAttrs).length === Object.keys(newAttributes).length;
            });
            
            if (!matched) {
                const partialMatch = reversedVariants.find(v => {
                    const vAttrs = normalizeAttributes(v.attributes);
                    return vAttrs[attrKey] === attrValue;
                });
                if (partialMatch) {
                    newAttributes = { ...normalizeAttributes(partialMatch.attributes) };
                    matched = partialMatch;
                }
            }
            
            setSelectedAttributes(newAttributes);
            setCurrentVariant(matched || null);
        } else {
            setSelectedAttributes(newAttributes);
        }
        
        setImgIdx(0);
        setErrorSet(new Set());
    };

    const allImages = (currentVariant?.images && currentVariant.images.length > 0) 
        ? currentVariant.images 
        : (product.images || []);
    
    const displayPrice = currentVariant?.price?.amount 
        ? currentVariant.price 
        : product.price;
    const validImages = allImages.filter((_, i) => !errorSet.has(i));
    const hasImages = validImages.length > 0;
    const safeIdx = Math.min(imgIdx, Math.max(0, validImages.length - 1));

    const prev = () =>
        setImgIdx((i) => (i - 1 + validImages.length) % validImages.length);
    const next = () =>
        setImgIdx((i) => (i + 1) % validImages.length);
    const handleError = (origIdx) => {
        setErrorSet((prev) => new Set([...prev, origIdx]));
        setImgIdx(0);
    };

    return (
        <div
            className="min-h-screen lg:h-screen w-full bg-[#060606] text-white selection:bg-white selection:text-black lg:overflow-hidden flex flex-col"
            style={{ fontFamily: DM }}
        >
            <Nav title="New Season" />
            {/* ══ MAIN CONTENT ══ */}
            <main className="lg:flex-1 lg:overflow-hidden pt-16">
              <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-16 lg:h-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-12 lg:h-full pt-2">

                    {/* ──── LEFT: Image Gallery ──── */}
                    <div className="flex flex-col gap-2 lg:overflow-hidden lg:h-full py-2">
                        {/* Primary image */}
                        <div className="relative aspect-[3/4] lg:aspect-auto lg:flex-1 w-full overflow-hidden bg-zinc-900/60 group select-none lg:min-h-0">
                            {hasImages ? (
                                <>
                                    <img
                                        key={validImages[safeIdx]?._id || safeIdx}
                                        src={validImages[safeIdx]?.url}
                                        alt={`${product.title} – image ${safeIdx + 1}`}
                                        onError={() => {
                                            const origIdx = allImages.findIndex(
                                                (img) => img._id === validImages[safeIdx]?._id
                                            );
                                            handleError(origIdx >= 0 ? origIdx : safeIdx);
                                        }}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                    />

                                    {/* Subtle overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                                    {/* Nav arrows */}
                                    {validImages.length > 1 && (
                                        <>
                                            <button
                                                onClick={prev}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-black/70 backdrop-blur-sm border border-white/10 text-white opacity-0 group-hover:opacity-100 hover:bg-black transition-all duration-200 cursor-pointer z-10"
                                                aria-label="Previous image"
                                            >
                                                <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
                                            </button>
                                            <button
                                                onClick={next}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-black/70 backdrop-blur-sm border border-white/10 text-white opacity-0 group-hover:opacity-100 hover:bg-black transition-all duration-200 cursor-pointer z-10"
                                                aria-label="Next image"
                                            >
                                                <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                                            </button>

                                            {/* Counter */}
                                            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm border border-white/10 px-2.5 py-1 z-10">
                                                <span className="text-[10px] text-zinc-300 font-black tracking-widest tabular-nums">
                                                    {safeIdx + 1}/{validImages.length}
                                                </span>
                                            </div>
                                        </>
                                    )}

                                    {/* Currency badge */}
                                    <div className="absolute top-4 left-4 z-10">
                                        <span className="bg-black/70 backdrop-blur-sm border border-white/10 text-[9px] font-black text-zinc-400 tracking-[0.22em] uppercase px-2.5 py-1">
                                            {displayPrice?.currency || "USD"}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                    <ImageOff className="w-10 h-10 text-zinc-700" strokeWidth={1} />
                                    <span className="text-[11px] text-zinc-600 font-semibold tracking-[0.2em] uppercase">
                                        No image
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {validImages.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto scrollbar-none shrink-0">
                                {validImages.map((img, i) => (
                                    <button
                                        key={img._id || i}
                                        onClick={() => setImgIdx(i)}
                                        className={`shrink-0 w-12 h-16 overflow-hidden border transition-all duration-200 cursor-pointer ${i === safeIdx
                                                ? "border-white"
                                                : "border-white/[0.08] opacity-50 hover:opacity-80 hover:border-white/30"
                                            }`}
                                        aria-label={`View image ${i + 1}`}
                                    >
                                        <img
                                            src={img.url}
                                            alt={`Thumbnail ${i + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ──── RIGHT: Product Info ──── */}
                    <div className="flex flex-col gap-5 lg:overflow-y-auto lg:h-full py-2 pb-6 lg:pb-2 pr-1">

                        {/* Tag + Wishlist */}
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-zinc-500 tracking-[0.28em] uppercase border border-zinc-800 px-3 py-1.5">
                                New Arrival · SS 2025
                            </span>
                            <button
                                id="wishlist-btn"
                                onClick={() => setWishlisted((w) => !w)}
                                className={`w-9 h-9 flex items-center justify-center border transition-all duration-300 cursor-pointer ${wishlisted
                                        ? "border-white/30 text-white bg-white/5"
                                        : "border-white/[0.08] text-zinc-600 hover:text-white hover:border-white/20"
                                    }`}
                                aria-label="Wishlist"
                            >
                                <Heart
                                    className="w-4 h-4"
                                    strokeWidth={2}
                                    fill={wishlisted ? "currentColor" : "none"}
                                />
                            </button>
                        </div>

                        {/* Title */}
                        <div>
                            <h1
                                className="text-[clamp(2.4rem,5vw,4rem)] text-white uppercase leading-[0.9] tracking-tight"
                                style={{ fontFamily: BEBAS }}
                            >
                                {product.title}
                            </h1>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-3">
                            <span
                                className="text-[2rem] font-black text-white leading-none"
                                style={{ fontFamily: DM }}
                            >
                                {formatPrice(displayPrice?.amount, displayPrice?.currency)}
                            </span>
                            <span className="text-[11px] text-zinc-600 font-semibold tracking-[0.18em] uppercase">
                                {displayPrice?.currency || "USD"}
                            </span>
                        </div>

                        <div className="h-px bg-white/[0.06] shrink-0" />

                        {/* Description */}
                        {product.description && (
                            <div>
                                <p className="text-[13px] text-zinc-400 leading-[1.9] tracking-wide font-normal">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        {/* Variant Attributes Selector */}
                        {Object.keys(attributesMap).length > 0 && (
                            <div className="flex flex-col gap-4">
                                {Object.entries(attributesMap).map(([attrKey, attrValues]) => (
                                    <div key={attrKey}>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-black text-zinc-500 tracking-[0.28em] uppercase">
                                                Select {attrKey}
                                            </span>
                                            {attrKey.toLowerCase() === 'size' && (
                                                <button className="text-[10px] font-bold text-zinc-600 hover:text-white tracking-[0.18em] uppercase transition-colors duration-200 cursor-pointer">
                                                    Size Guide
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {Array.from(attrValues).map((val) => (
                                                <button
                                                    key={val}
                                                    onClick={() => handleAttributeSelect(attrKey, val)}
                                                    className={`h-12 px-5 flex items-center justify-center text-[11px] font-black tracking-[0.15em] uppercase border transition-all duration-200 cursor-pointer ${selectedAttributes[attrKey] === val
                                                            ? "border-white bg-white text-black"
                                                            : "border-white/[0.1] text-zinc-500 hover:border-white/30 hover:text-white"
                                                        }`}
                                                >
                                                    {val}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="h-px bg-white/[0.06] shrink-0" />

                        {/* ── CTA Buttons ── */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Add to Cart */}
                            <button
                                onClick={async () => {
                                    await handleAddItem({
                                        productId: product._id,
                                        variantId: currentVariant?._id
                                    });
                                    setShowToast(true);
                                    setTimeout(() => setShowToast(false), 4000);
                                }}
                                id="add-to-cart-btn"
                                className="w-full flex items-center justify-center gap-2 border border-white/20 text-white text-[10px] sm:text-[11px] font-black tracking-[0.15em] sm:tracking-[0.22em] uppercase h-12 sm:h-14 px-3 sm:px-6 hover:bg-white hover:text-black transition-all duration-300 cursor-pointer group"
                            >
                                <ShoppingBag
                                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 group-hover:scale-110 transition-transform duration-200"
                                    strokeWidth={2.5}
                                />
                                <span className="truncate">Add to Cart</span>
                            </button>

                            {/* Buy Now */}
                            <button
                                id="buy-now-btn"
                                className="w-full flex items-center justify-center gap-2 bg-white text-black text-[10px] sm:text-[11px] font-black tracking-[0.15em] sm:tracking-[0.22em] uppercase h-12 sm:h-14 px-3 sm:px-6 hover:bg-zinc-200 transition-all duration-300 cursor-pointer group"
                            >
                                <Zap
                                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 group-hover:scale-110 transition-transform duration-200"
                                    strokeWidth={2.5}
                                />
                                <span className="truncate">Buy Now</span>
                            </button>
                        </div>

                        {/* Share */}
                        {/* <button
              id="share-btn"
              className="flex items-center gap-2 text-zinc-600 hover:text-white text-[10px] font-bold tracking-[0.18em] uppercase transition-colors duration-300 cursor-pointer w-fit"
            >
              <Share2 className="w-3.5 h-3.5" strokeWidth={2} />
              Share this product
            </button> */}

                        <div className="h-px bg-white/[0.06] shrink-0" />

                        {/* Perks */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-4">
                            {[
                                {
                                    icon: <Package className="w-4 h-4" strokeWidth={1.5} />,
                                    label: "Free Shipping",
                                    sub: "On orders over ₹2000",
                                },
                                {
                                    icon: <RefreshCw className="w-4 h-4" strokeWidth={1.5} />,
                                    label: "Easy Returns",
                                    sub: "30-day return policy",
                                },
                                {
                                    icon: <Shield className="w-4 h-4" strokeWidth={1.5} />,
                                    label: "Secure Checkout",
                                    sub: "100% encrypted",
                                },
                            ].map((perk) => (
                                <div
                                    key={perk.label}
                                    className="flex flex-col gap-1 sm:gap-1.5 p-3 sm:p-4 border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-300"
                                >
                                    <span className="text-zinc-500">{perk.icon}</span>
                                    <span className="text-[9px] sm:text-[11px] font-black text-white tracking-[0.08em] sm:tracking-[0.1em] uppercase leading-tight">
                                        {perk.label}
                                    </span>
                                    <span className="text-[9px] sm:text-[11px] text-zinc-600 font-normal leading-snug hidden sm:block">
                                        {perk.sub}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Meta */}
                        <div className="space-y-2 pt-2 border-t border-white/[0.05]">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-zinc-700 tracking-[0.25em] uppercase w-20">
                                    SKU
                                </span>
                                <span className="text-[11px] text-zinc-500 font-mono tracking-wide">
                                    {product._id?.slice(-10).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-zinc-700 tracking-[0.25em] uppercase w-20">
                                    Seller
                                </span>
                                <span className="text-[11px] text-zinc-500 font-mono tracking-wide">
                                    {product.seller?.slice(-8).toUpperCase() || "—"}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-zinc-700 tracking-[0.25em] uppercase w-20">
                                    Listed
                                </span>
                                <span className="text-[11px] text-zinc-500 font-semibold tracking-wide">
                                    {product.createdAt
                                        ? new Date(product.createdAt).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })
                                        : "—"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            </main>

            {/* ══ FOOTER ══ */}
            <footer className="border-t border-white/[0.05] shrink-0">
                <div className="max-w-screen-xl mx-auto px-6 lg:px-16 h-12 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-700 font-bold tracking-[0.22em] uppercase">
                        Snitch © 2025
                    </span>
                    <span className="text-[11px] text-zinc-700 tracking-[0.22em] uppercase font-semibold">
                        All rights reserved
                    </span>
                </div>
            </footer>

            {/* ══ TOAST NOTIFICATION ══ */}
            {showToast && (
                <div 
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between gap-6 px-4 py-3 sm:px-6 sm:py-4 bg-[#0a0a0a] border border-white/20 shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300 cursor-pointer group"
                    onClick={() => navigate('/cart')}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white flex items-center justify-center">
                            <ShoppingBag className="w-4 h-4 text-black" strokeWidth={2.5} />
                        </div>
                        <span className="text-[11px] text-white font-bold tracking-[0.2em] uppercase">
                            Added to Bag
                        </span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 text-[10px] text-zinc-400 font-bold tracking-[0.2em] uppercase group-hover:text-white transition-colors whitespace-nowrap">
                        View Cart <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;