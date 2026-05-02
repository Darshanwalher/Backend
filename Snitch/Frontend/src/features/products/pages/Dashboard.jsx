import React, { useEffect, useState } from "react";
import { useProduct } from "../hooks/useProduct";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Plus, ArrowRight, Package, ImageOff, MoreHorizontal, Tag, Calendar } from "lucide-react";

/* ═══════════════════════════════════════════════════════
   Helpers
═══════════════════════════════════════════════════════ */
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

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

/* ═══════════════════════════════════════════════════════
   ProductCard
═══════════════════════════════════════════════════════ */
const ProductCard = ({ product, index }) => {
  const [imgIdx, setImgIdx] = useState(0);
  const [errorSet, setErrorSet] = useState(new Set());
  const images = (product.images || []).filter((_, i) => !errorSet.has(i));
  const hasImages = images.length > 0;

  const prev = (e) => {
    e.stopPropagation();
    setImgIdx((i) => (i - 1 + images.length) % images.length);
  };
  const next = (e) => {
    e.stopPropagation();
    setImgIdx((i) => (i + 1) % images.length);
  };
  const handleError = (originalIdx) => {
    setErrorSet((prev) => new Set([...prev, originalIdx]));
    setImgIdx(0);
  };

  // Map back to original image list for display
  const allImages = product.images || [];
  const validImages = allImages.filter((_, i) => !errorSet.has(i));
  const safeIdx = Math.min(imgIdx, validImages.length - 1);

  return (
    <article
      className="group relative flex flex-col bg-white/[0.025] border border-white/[0.06] hover:border-white/[0.14] transition-all duration-500 overflow-hidden"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Image area */}
      <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900/60">
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
              className="w-full h-full object-cover transition-all duration-500"
            />

            {/* Dark overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500 pointer-events-none" />

            {/* Prev / Next arrows — appear on hover when >1 image */}
            {validImages.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-black/70 backdrop-blur-sm border border-white/10 text-white opacity-0 group-hover:opacity-100 hover:bg-black/90 transition-all duration-200 cursor-pointer"
                  aria-label="Previous image"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-black/70 backdrop-blur-sm border border-white/10 text-white opacity-0 group-hover:opacity-100 hover:bg-black/90 transition-all duration-200 cursor-pointer"
                  aria-label="Next image"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            )}

            {/* Dot indicators — always visible when >1 image */}
            {validImages.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                {validImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`transition-all duration-300 cursor-pointer rounded-full ${
                      i === safeIdx
                        ? "w-4 h-1.5 bg-white"
                        : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
                    }`}
                    aria-label={`Go to image ${i + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Counter badge — always visible when >1 image */}
            {validImages.length > 1 && (
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1">
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
              No images
            </span>
          </div>
        )}

        {/* Index badge */}
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-2.5 py-1">
          <span className="text-[9px] font-black text-zinc-400 tracking-[0.25em] tabular-nums">
            #{String(index + 1).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col p-4 gap-3">
        {/* Title */}
        <h2
          className="text-[15px] font-bold text-white leading-snug tracking-tight line-clamp-2"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {product.title}
        </h2>

        {/* Description */}
        {product.description && (
          <p className="text-[12px] text-zinc-500 leading-relaxed tracking-wide line-clamp-2 font-normal">
            {product.description}
          </p>
        )}

        {/* Divider */}
        <div className="h-px bg-white/[0.05] mt-auto" />

        {/* Footer row */}
        <div className="flex items-center justify-between pt-1">
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-600 font-bold tracking-[0.2em] uppercase">
              Price
            </span>
            <span
              className="text-[18px] font-black text-white tracking-tight leading-tight"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {formatPrice(product.price?.amount, product.price?.currency)}
            </span>
            <span className="text-[10px] text-zinc-600 font-semibold tracking-wide">
              {product.price?.currency || "INR"}
            </span>
          </div>

          {/* Date */}
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-zinc-600 font-bold tracking-[0.2em] uppercase">
              Listed
            </span>
            <span className="text-[12px] text-zinc-400 font-semibold tracking-wide">
              {formatDate(product.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

/* ═══════════════════════════════════════════════════════
   Empty State
═══════════════════════════════════════════════════════ */
const EmptyState = ({ onAdd }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-28 gap-6">
    <div className="w-20 h-20 border border-dashed border-zinc-700 flex items-center justify-center">
      <Package className="w-8 h-8 text-zinc-600" strokeWidth={1} />
    </div>
    <div className="text-center space-y-2">
      <p className="text-[13px] text-zinc-400 font-semibold tracking-[0.2em] uppercase">
        No products yet
      </p>
      <p className="text-[12px] text-zinc-600 tracking-wide max-w-xs leading-relaxed">
        You haven't listed anything yet. Create your first product to get started.
      </p>
    </div>
    <button
      onClick={onAdd}
      className="flex items-center gap-2 border border-white/20 text-white text-[11px] font-bold tracking-[0.2em] uppercase px-6 py-3 hover:bg-white hover:text-black transition-all duration-300 cursor-pointer group"
    >
      <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
      List First Product
    </button>
  </div>
);

/* ═══════════════════════════════════════════════════════
   Skeleton
═══════════════════════════════════════════════════════ */
const SkeletonCard = () => (
  <div className="flex flex-col bg-white/[0.02] border border-white/[0.04] overflow-hidden animate-pulse">
    <div className="aspect-[4/5] bg-zinc-800/50" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-zinc-800/50 rounded-sm w-3/4" />
      <div className="h-3 bg-zinc-800/30 rounded-sm w-full" />
      <div className="h-3 bg-zinc-800/30 rounded-sm w-2/3" />
      <div className="h-px bg-white/[0.04] mt-2" />
      <div className="flex justify-between pt-1">
        <div className="h-5 w-16 bg-zinc-800/40 rounded-sm" />
        <div className="h-3 w-20 bg-zinc-800/30 rounded-sm mt-1" />
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════
   Dashboard
═══════════════════════════════════════════════════════ */
function Dashboard() {
  const { handleGetSellerProducts } = useProduct();
  const sellerProducts = useSelector((state) => state.product.sellerProducts);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      await handleGetSellerProducts();
      setLoading(false);
    };
    fetch();
  }, []);

  const products = Array.isArray(sellerProducts) ? sellerProducts : [];

  // Group totals by currency — never mix currencies into one number
  const totalsByCurrency = products.reduce((acc, p) => {
    const cur = p.price?.currency || "INR";
    acc[cur] = (acc[cur] || 0) + (p.price?.amount || 0);
    return acc;
  }, {});

  return (
    <div
      className="min-h-screen w-full bg-[#060606] text-white selection:bg-white selection:text-black"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ══════════ HEADER ══════════ */}
      <header className="fixed top-0 left-0 right-0 z-30 border-b border-white/[0.05] bg-[#060606]/95 backdrop-blur-md">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-16 h-16 flex items-center justify-between">
          {/* Wordmark */}
          <div className="flex flex-col items-start pointer-events-none select-none">
            <span
              className="text-white text-2xl leading-none tracking-[0.3em] uppercase"
              style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.3em" }}
            >
              Snitch
            </span>
            <span className="text-[9px] text-zinc-500 tracking-[0.28em] uppercase mt-0.5 font-semibold">
              Seller Studio
            </span>
          </div>

          {/* Nav */}
          <nav className="hidden sm:flex items-center gap-8">
            {["Dashboard", "Analytics", "Orders"].map((item, i) => (
              <button
                key={item}
                className={`text-[11px] font-bold tracking-[0.2em] uppercase transition-colors duration-300 cursor-pointer ${
                  i === 0 ? "text-white" : "text-zinc-600 hover:text-zinc-300"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          {/* Add product CTA */}
          <button
            onClick={() => navigate("/seller/create-product")}
            className="flex items-center gap-2 bg-white text-black text-[11px] font-black tracking-[0.18em] uppercase px-4 py-2.5 hover:bg-zinc-100 active:scale-[0.98] transition-all duration-300 cursor-pointer group"
          >
            <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
            <span className="hidden sm:inline">New Product</span>
          </button>
        </div>
      </header>

      {/* ══════════ HERO / STATS ══════════ */}
      <div className="pt-16 border-b border-white/[0.05]">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-16 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            {/* Heading */}
            <div>
              <div className="flex items-center gap-4 mb-5">
                <span className="text-[11px] text-zinc-400 font-semibold tracking-[0.28em] uppercase">
                  Seller Portal
                </span>
                <div className="h-px w-12 bg-zinc-700" />
                <span className="text-[11px] text-zinc-600 font-semibold tracking-[0.28em] uppercase">
                  SS 2025
                </span>
              </div>
              <h1
                className="text-[clamp(2.8rem,6vw,5.5rem)] text-white leading-[0.88] uppercase"
                style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.04em" }}
              >
                My<br />
                <span className="text-zinc-600">Products</span>
              </h1>
            </div>

            {/* Stats row */}
            <div className="flex items-stretch gap-0 divide-x divide-white/[0.06] border border-white/[0.06]">
              {[
                {
                  label: "Total Listings",
                  value: loading ? "—" : String(products.length).padStart(2, "0"),
                  icon: <Tag className="w-3.5 h-3.5" strokeWidth={1.5} />,
                },
                {
                  label: "Total Value",
                  value: loading
                    ? "—"
                    : Object.keys(totalsByCurrency).length === 0
                    ? "—"
                    : null, // rendered separately below
                  icon: <Package className="w-3.5 h-3.5" strokeWidth={1.5} />,
                  isCurrencyTile: true,
                },
                {
                  label: "Last Listed",
                  value:
                    loading || products.length === 0
                      ? "—"
                      : formatDate(
                          [...products].sort(
                            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                          )[0]?.createdAt
                        ),
                  icon: <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col justify-between px-5 py-4 min-w-[120px] lg:min-w-[160px] bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-300"
                >
                  <div className="flex items-center gap-1.5 text-zinc-600 mb-3">
                    {stat.icon}
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-600">
                      {stat.label}
                    </span>
                  </div>

                  {stat.isCurrencyTile ? (
                    loading ? (
                      <span className="text-[18px] font-black text-white tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>—</span>
                    ) : Object.keys(totalsByCurrency).length === 0 ? (
                      <span className="text-[18px] font-black text-white tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>—</span>
                    ) : (
                      <div className="flex flex-col gap-0.5">
                        {Object.entries(totalsByCurrency).map(([cur, amt]) => (
                          <span
                            key={cur}
                            className="text-[16px] font-black text-white tracking-tight leading-tight"
                            style={{ fontFamily: "'DM Sans', sans-serif" }}
                          >
                            {formatPrice(amt, cur)}
                          </span>
                        ))}
                      </div>
                    )
                  ) : (
                    <span
                      className="text-[18px] font-black text-white tracking-tight"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {stat.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ FILTER BAR ══════════ */}
      <div className="border-b border-white/[0.05] sticky top-16 z-20 bg-[#060606]/90 backdrop-blur-md">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-16 h-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            {["All", "Active", "Draft"].map((tab, i) => (
              <button
                key={tab}
                className={`text-[11px] font-bold tracking-[0.18em] uppercase pb-0.5 transition-all duration-300 cursor-pointer ${
                  i === 0
                    ? "text-white border-b border-white"
                    : "text-zinc-600 hover:text-zinc-300 border-b border-transparent"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-zinc-600 font-semibold tracking-[0.15em] tabular-nums">
            {loading ? "—" : `${products.length} item${products.length !== 1 ? "s" : ""}`}
          </span>
        </div>
      </div>

      {/* ══════════ GRID ══════════ */}
      <main className="max-w-screen-2xl mx-auto px-6 lg:px-16 py-10 lg:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-white/[0.04]">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-[#060606]">
                <SkeletonCard />
              </div>
            ))
          ) : products.length === 0 ? (
            <EmptyState onAdd={() => navigate("/seller/create-product")} />
          ) : (
            products.map((product, i) => (
              <div key={product._id} className="bg-[#060606]">
                <ProductCard product={product} index={i} />
              </div>
            ))
          )}
        </div>
      </main>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="border-t border-white/[0.05] mt-4">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-16 h-14 flex items-center justify-between">
          <span className="text-[11px] text-zinc-600 font-bold tracking-[0.22em] uppercase">
            Snitch © 2025
          </span>
          <span className="text-[11px] text-zinc-600 tracking-[0.22em] uppercase font-semibold">
            Seller Studio v1
          </span>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;