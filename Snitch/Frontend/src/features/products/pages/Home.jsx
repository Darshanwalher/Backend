import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useProduct } from "../hooks/useProduct.js";
import {
  ShoppingBag,
  ArrowRight,
  ImageOff,
  User,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ══════════════════════════════════════════════════════
   Constants & Helpers
══════════════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════════════
   ProductCard
══════════════════════════════════════════════════════ */
const ProductCard = ({ product, index }) => {
  const [imgIdx, setImgIdx] = useState(0);
  const [errorSet, setErrorSet] = useState(new Set());
  const [hovered, setHovered] = useState(false);

  const allImages = product.images || [];
  const validImages = allImages.filter((_, i) => !errorSet.has(i));
  const hasImages = validImages.length > 0;
  const safeIdx = Math.min(imgIdx, Math.max(0, validImages.length - 1));

  const prev = (e) => {
    e.stopPropagation();
    setImgIdx((i) => (i - 1 + validImages.length) % validImages.length);
  };
  const next = (e) => {
    e.stopPropagation();
    setImgIdx((i) => (i + 1) % validImages.length);
  };
  const handleError = (originalIdx) => {
    setErrorSet((prev) => new Set([...prev, originalIdx]));
    setImgIdx(0);
  };

  return (
    <article
      className="group relative flex flex-col bg-white/[0.025] border border-white/[0.06] hover:border-white/[0.16] transition-all duration-500 overflow-hidden cursor-pointer"
      style={{ animationDelay: `${index * 50}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image area */}
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900/60 select-none">
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
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Arrows */}
            {validImages.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/70 backdrop-blur-sm border border-white/10 text-white opacity-0 group-hover:opacity-100 hover:bg-black transition-all duration-200 cursor-pointer z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
                <button
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/70 backdrop-blur-sm border border-white/10 text-white opacity-0 group-hover:opacity-100 hover:bg-black transition-all duration-200 cursor-pointer z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
              </>
            )}

            {/* Dot indicators */}
            {validImages.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                {validImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setImgIdx(i); }}
                    className={`transition-all duration-300 cursor-pointer rounded-full ${
                      i === safeIdx
                        ? "w-5 h-1.5 bg-white"
                        : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
                    }`}
                    aria-label={`Image ${i + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Counter */}
            {validImages.length > 1 && (
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1 z-10">
                <span className="text-[10px] text-zinc-300 font-bold tracking-widest tabular-nums">
                  {safeIdx + 1}/{validImages.length}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <ImageOff className="w-8 h-8 text-zinc-700" strokeWidth={1} />
            <span className="text-[11px] text-zinc-600 font-semibold tracking-[0.2em] uppercase">
              No image
            </span>
          </div>
        )}

        {/* Currency badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-black/70 backdrop-blur-sm border border-white/10 text-[9px] font-black text-zinc-400 tracking-[0.22em] uppercase px-2 py-1">
            {product.price?.currency || "INR"}
          </span>
        </div>

        {/* Quick-add hover CTA */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-10 p-4">
          <button className="w-full flex items-center justify-between bg-white text-black text-[10px] font-black tracking-[0.2em] uppercase py-3 px-4 hover:bg-zinc-100 transition-colors duration-200 cursor-pointer group/btn">
            <span>Add to Cart</span>
            <ShoppingBag className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform duration-200" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col p-4 gap-2">
        <h2
          className="text-[14px] font-bold text-white leading-snug tracking-tight line-clamp-1"
          style={{ fontFamily: DM }}
        >
          {product.title}
        </h2>

        {product.description && (
          <p className="text-[12px] text-zinc-500 leading-relaxed tracking-wide line-clamp-1 font-normal">
            {product.description}
          </p>
        )}

        <div className="h-px bg-white/[0.05] mt-auto mb-2" />

        <div className="flex items-end justify-between">
          <span
            className="text-[20px] font-black text-white tracking-tight leading-none"
            style={{ fontFamily: DM }}
          >
            {formatPrice(product.price?.amount, product.price?.currency)}
          </span>
          <ArrowRight
            className="w-4 h-4 text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all duration-300"
            strokeWidth={2}
          />
        </div>
      </div>
    </article>
  );
};

/* ══════════════════════════════════════════════════════
   Skeleton Card
══════════════════════════════════════════════════════ */
const SkeletonCard = () => (
  <div className="flex flex-col bg-white/[0.02] border border-white/[0.04] overflow-hidden animate-pulse">
    <div className="aspect-[3/4] bg-zinc-800/50" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-zinc-800/50 rounded-sm w-3/4" />
      <div className="h-3 bg-zinc-800/30 rounded-sm w-full" />
      <div className="h-px bg-white/[0.04]" />
      <div className="h-6 bg-zinc-800/40 rounded-sm w-1/2" />
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════
   Empty State
══════════════════════════════════════════════════════ */
const EmptyState = () => (
  <div className="col-span-full flex flex-col items-center justify-center py-28 gap-6">
    <div className="w-20 h-20 border border-dashed border-zinc-700 flex items-center justify-center">
      <ShoppingBag className="w-8 h-8 text-zinc-600" strokeWidth={1} />
    </div>
    <div className="text-center space-y-2">
      <p className="text-[13px] text-zinc-400 font-semibold tracking-[0.2em] uppercase">
        No products found
      </p>
      <p className="text-[12px] text-zinc-600 tracking-wide max-w-xs leading-relaxed">
        Try a different search or check back later.
      </p>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════
   Home Page
══════════════════════════════════════════════════════ */
export const Home = () => {
  const { handleGetAllProducts } = useProduct();
  const products = useSelector((state) => state.product.products);
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      await handleGetAllProducts();
      setLoading(false);
    };
    fetch();
  }, []);

  const allProducts = Array.isArray(products) ? products : [];

  // Derive unique currencies for filter tabs
  const currencies = useMemo(() => {
    const set = new Set(allProducts.map((p) => p.price?.currency).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [allProducts]);

  // Filtered + searched products
  const filtered = useMemo(() => {
    let list = allProducts;
    if (activeFilter !== "All") {
      list = list.filter((p) => p.price?.currency === activeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allProducts, activeFilter, search]);

  return (
    <div
      className="min-h-screen w-full bg-[#060606] text-white selection:bg-white selection:text-black"
      style={{ fontFamily: DM }}
    >
      {/* ══ NAVBAR ══ */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/[0.05] bg-[#060606]/95 backdrop-blur-md">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-16 h-16 flex items-center justify-between gap-6">

          {/* Wordmark */}
          <a href="/" className="flex flex-col items-start pointer-events-auto select-none no-underline">
            <span
              className="text-white text-2xl leading-none tracking-[0.3em] uppercase"
              style={{ fontFamily: BEBAS, letterSpacing: "0.3em" }}
            >
              Snitch
            </span>
            <span className="text-[9px] text-zinc-500 tracking-[0.28em] uppercase mt-0.5 font-semibold">
              New Season
            </span>
          </a>

          {/* Right — user info or login */}
          <div className="flex items-center gap-3">
            {user ? (
              /* Logged-in: show avatar initial + name */
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 flex items-center justify-center bg-white text-black text-[11px] font-black tracking-widest uppercase shrink-0">
                  {(user.fullname || "U").charAt(0).toUpperCase()}
                </div>
                <span
                  className="text-[12px] font-bold text-white tracking-[0.12em] uppercase hidden sm:block"
                  style={{ fontFamily: DM }}
                >
                  {user.fullname}
                </span>
              </div>
            ) : (
              /* Not logged in: show login icon button only */
              <button
                id="login-btn"
                onClick={() => navigate("/login")}
                className="w-9 h-9 flex items-center justify-center border border-white/[0.08] text-zinc-500 hover:text-white hover:border-white/20 transition-all duration-300 cursor-pointer"
                aria-label="Login"
              >
                <User className="w-4 h-4" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ══ HERO ══ */}
      <section className="pt-16">
        <div className="relative border-b border-white/[0.05] overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-zinc-800 rounded-full filter blur-[160px] opacity-10 pointer-events-none" />

          <div className="relative max-w-screen-2xl mx-auto px-6 lg:px-16 py-16 lg:py-24">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
              {/* Headline */}
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-[11px] text-zinc-400 font-semibold tracking-[0.28em] uppercase">
                    New Arrivals
                  </span>
                  <div className="h-px w-12 bg-zinc-700" />
                  <span className="text-[11px] text-zinc-600 font-semibold tracking-[0.28em] uppercase">
                    SS 2025
                  </span>
                </div>
                <h1
                  className="text-[clamp(3.5rem,9vw,8rem)] text-white uppercase leading-[0.88]"
                  style={{ fontFamily: BEBAS, letterSpacing: "0.04em" }}
                >
                  Shop the
                  <br />
                  <span className="text-zinc-600">Collection</span>
                </h1>
                <p className="mt-6 text-[14px] text-zinc-400 tracking-wide leading-[1.8] max-w-md font-normal">
                  Discover premium streetwear crafted for the bold. Every piece tells a story — wear yours.
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-stretch divide-x divide-white/[0.06] border border-white/[0.06]">
                {[
                  { label: "Products", value: loading ? "—" : String(allProducts.length).padStart(2, "0") },
                  { label: "Brands", value: "01" },
                  { label: "Currencies", value: loading ? "—" : String(currencies.length - 1).padStart(2, "0") },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex flex-col justify-between px-6 py-4 min-w-[100px] bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-300"
                  >
                    <span className="text-[10px] text-zinc-600 font-bold tracking-[0.22em] uppercase mb-3">
                      {s.label}
                    </span>
                    <span
                      className="text-[22px] font-black text-white tracking-tight"
                      style={{ fontFamily: DM }}
                    >
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FILTER BAR ══ */}
      <div className="sticky top-16 z-30 border-b border-white/[0.05] bg-[#060606]/90 backdrop-blur-md">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-16 h-12 flex items-center justify-between gap-4">
          {/* Currency tabs */}
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-none">
            {currencies.map((cur, i) => (
              <button
                key={cur}
                id={`filter-tab-${cur}`}
                onClick={() => setActiveFilter(cur)}
                className={`shrink-0 text-[11px] font-bold tracking-[0.18em] uppercase pb-0.5 transition-all duration-300 cursor-pointer ${
                  activeFilter === cur
                    ? "text-white border-b border-white"
                    : "text-zinc-600 hover:text-zinc-300 border-b border-transparent"
                }`}
              >
                {cur}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-600" strokeWidth={2} />
            <span className="text-[11px] text-zinc-600 font-semibold tracking-[0.15em] tabular-nums">
              {loading ? "—" : `${filtered.length} item${filtered.length !== 1 ? "s" : ""}`}
            </span>
          </div>
        </div>
      </div>

      {/* ══ PRODUCT GRID ══ */}
      <main className="max-w-screen-2xl mx-auto px-6 lg:px-16 py-10 lg:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-white/[0.04]">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-[#060606]">
                <SkeletonCard />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            filtered.map((product, i) => (
              <div key={product._id} className="bg-[#060606]">
                <ProductCard product={product} index={i} />
              </div>
            ))
          )}
        </div>
      </main>

      {/* ══ FOOTER ══ */}
      <footer className="border-t border-white/[0.05] mt-4">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-16 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <span
              className="text-white text-3xl leading-none tracking-[0.3em] uppercase block mb-2"
              style={{ fontFamily: BEBAS, letterSpacing: "0.3em" }}
            >
              Snitch
            </span>
            <p className="text-[12px] text-zinc-600 tracking-wide leading-[1.8] max-w-[220px]">
              Redefining modern streetwear. Bold by design.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] text-zinc-700 font-bold tracking-[0.25em] uppercase mb-1">
              Quick Links
            </span>
            {["Shop All", "About", "Contact", "Register", "Login"].map((link) => (
              <button
                key={link}
                onClick={() => {
                  if (link === "Login") navigate("/login");
                  else if (link === "Register") navigate("/register");
                }}
                className="text-[12px] text-zinc-500 hover:text-white font-semibold tracking-wide text-left transition-colors duration-300 cursor-pointer w-fit"
              >
                {link}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col justify-between gap-6">
            <div>
              <span className="text-[10px] text-zinc-700 font-bold tracking-[0.25em] uppercase block mb-3">
                Are you a Seller?
              </span>
              <p className="text-[12px] text-zinc-500 tracking-wide leading-[1.8] max-w-[220px]">
                List your products on Snitch and reach thousands of fashion-forward buyers.
              </p>
            </div>
            <button
              onClick={() => navigate("/register")}
              className="w-fit flex items-center gap-2 border border-white/20 text-white text-[10px] font-black tracking-[0.2em] uppercase px-5 py-3 hover:bg-white hover:text-black transition-all duration-300 cursor-pointer group"
            >
              Start Selling
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={3} />
            </button>
          </div>
        </div>

        <div className="border-t border-white/[0.04] max-w-screen-2xl mx-auto px-6 lg:px-16 h-12 flex items-center justify-between">
          <span className="text-[11px] text-zinc-700 font-bold tracking-[0.22em] uppercase">
            Snitch © 2025
          </span>
          <span className="text-[11px] text-zinc-700 tracking-[0.22em] uppercase font-semibold">
            All rights reserved
          </span>
        </div>
      </footer>
    </div>
  );
};
