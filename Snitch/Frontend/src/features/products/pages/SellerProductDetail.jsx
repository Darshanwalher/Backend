import React, { useEffect, useState, useRef } from 'react';
import { useProduct } from '../hooks/useProduct';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Plus, Image as ImageIcon, Box, Trash2, Edit3, Save, X, ImageOff, UploadCloud, Tag, Check, ChevronLeft, ChevronRight } from 'lucide-react';

const CURRENCY_OPTIONS = [
  { code: "USD", symbol: "$",  name: "US Dollar",      flag: "🇺🇸" },
  { code: "INR", symbol: "₹",  name: "Indian Rupee",   flag: "🇮🇳" },
  { code: "EUR", symbol: "€",  name: "Euro",           flag: "🇪🇺" },
  { code: "GBP", symbol: "£",  name: "British Pound",  flag: "🇬🇧" },
];

/* ═══════════════════════════════════════════════════════
   Helpers
═══════════════════════════════════════════════════════ */
const formatPrice = (amount, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

/* ═══════════════════════════════════════════════════════
   SellerProductDetail
═══════════════════════════════════════════════════════ */
const SellerProductDetail = () => {
    const { handleGetProductById,handleAddProductVariant } = useProduct();
    const { productId } = useParams();
    const navigate = useNavigate();
    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Local state for variants to manage UI independently of the backend API
    const [variants, setVariants] = useState([]);
    
    // Form state for creating a new variant
    const [showAddForm, setShowAddForm] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [newVariant, setNewVariant] = useState({
        images: [], // array of { file, previewUrl }
        stock: 0,
        price: {
            amount: "",
            currency: "INR"
        },
        attributes: [{ key: "", value: "" }]
    });

    // Edit stock state
    const [editingStockIdx, setEditingStockIdx] = useState(null);
    const [editStockValue, setEditStockValue] = useState("");

    async function fetchProductDetails() {
        try {
            setLoading(true);
            const data = await handleGetProductById(productId);
            const prodData = data?.product || data;
            setProduct(prodData);
            setVariants(prodData?.variants || []);
        } catch (error) {
            console.error("Failed to fetch product details", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchProductDetails();
    }, [productId]);

    // Handle adding a variant
    const handleAddVariant = async(e) => {
        e.preventDefault();
        
        const validAttributes = newVariant.attributes.filter(attr => attr.key.trim() && attr.value.trim());
        if (validAttributes.length === 0) {
            alert("At least one valid attribute is required.");
            return;
        }

        const attributesObj = {};
        validAttributes.forEach(attr => {
            attributesObj[attr.key.trim()] = attr.value.trim();
        });

        const validImages = newVariant.images.map(img => ({ url: img.previewUrl }));

        const variantObj = {
            _id: Math.random().toString(36).substr(2, 9), // Mock ID
            images: validImages,
            stock: Number(newVariant.stock) || 0,
            attributes: attributesObj,
            price: {
                amount: newVariant.price.amount ? Number(newVariant.price.amount) : (product?.price?.amount || 0),
                currency: newVariant.price.currency || "INR"
            }
        };
        const finalPayload = {
            ...newVariant,
            attributes: attributesObj
        };

       await handleAddProductVariant(productId,finalPayload);
        
        setVariants([...variants, variantObj]);
        setShowAddForm(false);
        setNewVariant({ images: [], stock: 0, price: { amount: "", currency: "INR" }, attributes: [{ key: "", value: "" }] });
    };

    const processFiles = (files) => {
        if (!files || files.length === 0) return;
        
        const remainingSlots = 7 - newVariant.images.length;
        const filesToAdd = files.slice(0, remainingSlots);
        
        const newImages = filesToAdd.map(file => ({
            file,
            previewUrl: URL.createObjectURL(file)
        }));
        
        setNewVariant(prev => ({
            ...prev,
            images: [...prev.images, ...newImages]
        }));
    };

    const handleImageUpload = (e) => {
        processFiles(Array.from(e.target.files));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            processFiles(Array.from(e.dataTransfer.files));
        }
    };

    // Handle saving edited stock
    const handleSaveStock = (index) => {
        const updatedVariants = [...variants];
        updatedVariants[index].stock = Number(editStockValue) || 0;
        setVariants(updatedVariants);
        setEditingStockIdx(null);
    };

    // Handle deleting a variant
    const handleDeleteVariant = (index) => {
        const updatedVariants = variants.filter((_, i) => i !== index);
        setVariants(updatedVariants);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#060606] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-zinc-800 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-[#060606] flex flex-col items-center justify-center gap-4 text-white">
                <p className="text-[13px] tracking-[0.2em] uppercase font-bold text-zinc-500">Product Not Found</p>
                <button onClick={() => navigate(-1)} className="text-[11px] uppercase tracking-[0.1em] border border-white/20 px-4 py-2 hover:bg-white hover:text-black transition-colors">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#060606] text-white selection:bg-white selection:text-black pb-20" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-30 border-b border-white/[0.05] bg-[#060606]/95 backdrop-blur-md">
                <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => navigate('/seller/dashboard')}
                            className="w-8 h-8 flex items-center justify-center bg-white/[0.05] hover:bg-white/10 transition-colors rounded-sm"
                        >
                            <ArrowLeft className="w-4 h-4 text-zinc-400" />
                        </button>
                        <div className="flex flex-col">
                            <span className="text-[14px] leading-none tracking-[0.2em] uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                                Product Details
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-screen-xl mx-auto px-6 pt-24 space-y-12">
                
                {/* ═══════════════════════════════════════════════════════
                   Product Summary
                ═══════════════════════════════════════════════════════ */}
                <section className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-0 bg-[#0a0a0a] border border-white/[0.08] overflow-hidden group hover:border-white/[0.15] transition-colors duration-500">
                    <div className="aspect-[4/5] bg-[#0f0f0f] relative flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-white/[0.08]">
                        {product.images && product.images.length > 0 ? (
                            <img 
                                src={product.images[0].url} 
                                alt={product.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                        ) : (
                            <ImageOff className="w-8 h-8 text-zinc-700" strokeWidth={1} />
                        )}
                        <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 border border-white/10">
                            <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase">Base Product</span>
                        </div>
                    </div>

                    <div className="flex flex-col p-6 lg:p-12">
                        <div>
                            <h1
                                className="text-[clamp(2rem,4vw,3.5rem)] font-black text-white tracking-wider leading-[1.1] uppercase"
                                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                            >
                                {product.title}
                            </h1>
                            <p className="text-[14px] text-zinc-400 mt-4 leading-relaxed max-w-2xl font-light">
                                {product.description || "No description provided."}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mt-auto pt-8 sm:pt-10 border-t border-white/[0.08]">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-zinc-500 font-bold tracking-[0.2em] uppercase mb-2">Base Price</span>
                                <span className="text-[28px] font-black tracking-tight text-white leading-none">
                                    {formatPrice(product.price?.amount, product.price?.currency)}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-zinc-500 font-bold tracking-[0.2em] uppercase mb-2">Listed On</span>
                                <span className="text-[16px] font-medium text-zinc-300">
                                    {formatDate(product.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════
                   Variants Management
                ═══════════════════════════════════════════════════════ */}
                <section className="space-y-8 pt-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between border-b border-white/[0.08] pb-6 gap-4 sm:gap-0">
                        <div>
                            <h2 className="text-[32px] uppercase tracking-wider leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                                Inventory & Variants
                            </h2>
                            <p className="text-[12px] text-zinc-500 tracking-[0.1em] mt-2 uppercase font-semibold">Manage stock, specific pricing, and styles</p>
                        </div>
                        <button 
                            onClick={() => setShowAddForm(!showAddForm)}
                            className={`w-full sm:w-auto flex items-center justify-center gap-2 text-[11px] font-black tracking-[0.2em] uppercase px-6 py-3.5 transition-all duration-300 cursor-pointer active:scale-[0.98] ${
                                showAddForm 
                                    ? "bg-transparent border border-white/20 text-white hover:bg-white/5" 
                                    : "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:bg-zinc-200"
                            }`}
                        >
                            {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {showAddForm ? "Cancel" : "Add Variant"}
                        </button>
                    </div>

                    {/* Add Variant Form */}
                    {showAddForm && (
                        <form onSubmit={handleAddVariant} className="bg-[#0a0a0a] border border-white/[0.08] p-5 sm:p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 animate-in slide-in-from-top-8 fade-in duration-500 relative overflow-hidden">
                            {/* Decorative background glow */}
                            <div className="absolute top-0 left-1/4 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            
                            <div className="space-y-2 lg:col-span-3 border-b border-white/[0.05] pb-4">
                                <h3 className="text-[14px] font-bold tracking-[0.25em] uppercase text-white flex items-center gap-3">
                                    <span className="w-2 h-2 bg-white rounded-full inline-block animate-pulse" />
                                    Configure New Variant
                                </h3>
                            </div>
                            
                            {/* Dynamic Images */}
                            <div className="space-y-3 lg:col-span-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Images (Up to 7)</label>
                                    <span className="text-[10px] text-zinc-600 font-bold tracking-widest">
                                        {newVariant.images.length} / 7
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mt-2">
                                    {newVariant.images.map((img, idx) => (
                                        <div key={idx} className="relative aspect-[4/5] bg-zinc-900 border border-white/[0.1] rounded-md overflow-hidden group shadow-lg">
                                            <img src={img.previewUrl} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    const newImgs = newVariant.images.filter((_, i) => i !== idx);
                                                    setNewVariant({...newVariant, images: newImgs});
                                                }}
                                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {newVariant.images.length < 7 && (
                                        <label 
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            className={`relative aspect-[4/5] flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-md transition-all duration-300 cursor-pointer group overflow-hidden ${
                                                isDragging 
                                                    ? "border-white bg-white/[0.05] scale-105" 
                                                    : "bg-[#0a0a0a] border-white/[0.1] hover:border-white/[0.4] hover:bg-white/[0.02]"
                                            }`}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            <div className="w-12 h-12 rounded-full bg-[#141414] border border-white/[0.05] group-hover:border-white/[0.2] flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg relative z-10">
                                                <UploadCloud className={`w-5 h-5 transition-colors ${isDragging ? "text-white" : "text-zinc-400 group-hover:text-white"}`} />
                                            </div>
                                            <span className={`text-[10px] font-black tracking-[0.2em] uppercase transition-colors relative z-10 ${isDragging ? "text-white" : "text-zinc-500 group-hover:text-white"}`}>
                                                {isDragging ? "Drop Here" : "Upload Image"}
                                            </span>
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                            
                            {/* Stock */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.15em] flex items-center gap-2">
                                    <Box className="w-3.5 h-3.5" />
                                    Available Stock
                                </label>
                                <div className="relative group">
                                    <input 
                                        type="number" 
                                        min="0"
                                        required
                                        value={newVariant.stock}
                                        onChange={(e) => setNewVariant({...newVariant, stock: e.target.value})}
                                        className="w-full bg-[#0a0a0a] border border-white/[0.1] rounded-md text-white text-[16px] font-bold px-5 py-4 outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all duration-300 shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] group-focus-within:text-white transition-colors">Units</span>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="space-y-3 lg:col-span-2">
                                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.15em] flex items-center gap-2">
                                    <Tag className="w-3.5 h-3.5" />
                                    Price Override <span className="text-zinc-600 font-normal ml-1">(Optional)</span>
                                </label>
                                <div className="flex flex-col sm:flex-row gap-3 lg:w-2/3">
                                    <div className="relative flex-1 group">
                                        <input 
                                            type="number" 
                                            min="0"
                                            placeholder={product?.price?.amount}
                                            value={newVariant.price.amount}
                                            onChange={(e) => setNewVariant({...newVariant, price: { ...newVariant.price, amount: e.target.value }})}
                                            className="w-full bg-[#0a0a0a] border border-white/[0.1] rounded-md text-white text-[16px] font-bold pl-5 pr-12 py-4 outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all duration-300 placeholder:text-zinc-700 shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                    </div>
                                    <div className="w-full sm:w-[180px] h-[56px] sm:h-auto">
                                        <CurrencyPicker 
                                            value={newVariant.price.currency}
                                            onChange={(code) => setNewVariant({...newVariant, price: { ...newVariant.price, currency: code }})}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Dynamic Attributes */}
                            <div className="space-y-4 lg:col-span-3 border-t border-white/[0.05] pt-6 mt-2">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.15em]">Variant Attributes <span className="text-red-400/80 ml-1">*Required</span></label>
                                    <button 
                                        type="button" 
                                        onClick={() => setNewVariant({...newVariant, attributes: [...newVariant.attributes, { key: "", value: "" }]})}
                                        className="text-[10px] text-white hover:text-zinc-300 font-bold uppercase tracking-[0.2em] cursor-pointer border border-white/20 px-4 py-2 hover:bg-white/10 transition-colors"
                                    >
                                        + Add Attribute
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {newVariant.attributes.map((attr, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input 
                                                type="text" 
                                                placeholder="Key (e.g. Size)"
                                                value={attr.key}
                                                required
                                                onChange={(e) => {
                                                    const newAttrs = [...newVariant.attributes];
                                                    newAttrs[idx].key = e.target.value;
                                                    setNewVariant({...newVariant, attributes: newAttrs});
                                                }}
                                                className="w-1/3 bg-[#0f0f0f] border border-white/[0.1] text-white text-[13px] px-4 py-3.5 outline-none focus:border-white/50 transition-colors placeholder:text-zinc-700 font-medium"
                                            />
                                            <div className="relative flex-1">
                                                <input 
                                                    type="text" 
                                                    placeholder="Value (e.g. XL)"
                                                    value={attr.value}
                                                    required
                                                    onChange={(e) => {
                                                        const newAttrs = [...newVariant.attributes];
                                                        newAttrs[idx].value = e.target.value;
                                                        setNewVariant({...newVariant, attributes: newAttrs});
                                                    }}
                                                    className="w-full bg-[#0f0f0f] border border-white/[0.1] text-white text-[13px] pl-4 pr-12 py-3.5 outline-none focus:border-white/50 transition-colors placeholder:text-zinc-700"
                                                />
                                                {newVariant.attributes.length > 1 && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => {
                                                            const newAttrs = newVariant.attributes.filter((_, i) => i !== idx);
                                                            setNewVariant({...newVariant, attributes: newAttrs});
                                                        }}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:col-span-3 flex justify-stretch sm:justify-end pt-6 border-t border-white/[0.05]">
                                <button type="submit" className="w-full sm:w-auto bg-white text-black text-[12px] font-black tracking-[0.2em] uppercase px-10 py-4 hover:bg-zinc-200 transition-colors cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98]">
                                    Save New Variant
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Variants List */}
                    {variants.length === 0 ? (
                        <div className="border border-dashed border-white/[0.1] py-24 flex flex-col items-center justify-center gap-6 bg-[#0a0a0a] hover:bg-white/[0.02] transition-colors duration-500">
                            <div className="w-16 h-16 border border-white/[0.1] flex items-center justify-center rounded-full bg-black">
                                <Box className="w-6 h-6 text-zinc-600" />
                            </div>
                            <p className="text-[13px] text-zinc-400 tracking-[0.3em] uppercase font-bold">No variants configured</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {variants.map((variant, idx) => (
                                <div key={variant._id || idx} className="flex flex-col md:flex-row gap-6 p-5 sm:p-6 bg-[#0a0a0a] border border-white/[0.05] hover:border-white/[0.2] transition-all duration-500 group shadow-lg">
                                    
                                    {/* Image & Attributes */}
                                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start flex-1 min-w-0">
                                        {/* Variant Images */}
                                        <div className="shrink-0 w-full sm:w-auto sm:max-w-[300px] min-w-0">
                                            <VariantImagesScroller images={variant.images} />
                                        </div>

                                        {/* Variant Attributes */}
                                        <div className="flex flex-col gap-3 flex-1 w-full min-w-0 mt-2 sm:mt-0">
                                            <div className="flex flex-wrap gap-2.5">
                                                {variant.attributes && Object.entries(variant.attributes).length > 0 ? (
                                                    Object.entries(variant.attributes).map(([key, val]) => (
                                                        <div key={key} className="flex items-center bg-[#141414] border border-white/[0.08] text-[11px] font-bold uppercase tracking-widest rounded-sm overflow-hidden">
                                                            <span className="px-3 py-1.5 text-zinc-500 bg-black/40">{key}</span>
                                                            <span className="px-3 py-1.5 text-white">{val}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-[11px] text-zinc-500 italic">No attributes defined</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats & Actions */}
                                    <div className="flex flex-col sm:flex-row md:flex-row gap-4 sm:gap-6 md:gap-8 pt-4 md:pt-0 border-t md:border-t-0 border-white/[0.05] md:items-center">
                                        
                                        {/* Price */}
                                        <div className="flex flex-row md:flex-col justify-between md:justify-start items-center md:items-start gap-1 md:pl-6 md:border-l border-white/[0.05] min-w-[120px]">
                                            <span className="text-[10px] text-zinc-600 font-bold tracking-[0.2em] uppercase">Price</span>
                                            <span className="text-[18px] font-black text-white">
                                                {formatPrice(variant.price?.amount, variant.price?.currency)}
                                            </span>
                                        </div>

                                        {/* Stock Management */}
                                        <div className="flex flex-row md:flex-col justify-between md:justify-start items-center md:items-start gap-2 md:pl-6 md:border-l border-white/[0.05] min-w-[150px]">
                                            <span className="text-[10px] text-zinc-600 font-bold tracking-[0.2em] uppercase">Stock</span>
                                            {editingStockIdx === idx ? (
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="number" 
                                                        min="0"
                                                        value={editStockValue}
                                                        onChange={(e) => setEditStockValue(e.target.value)}
                                                        className="w-20 sm:w-24 bg-[#0f0f0f] border border-white/[0.2] text-white text-[14px] font-bold px-3 py-2 outline-none focus:border-white/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        autoFocus
                                                    />
                                                    <button onClick={() => handleSaveStock(idx)} className="p-2 sm:p-2.5 bg-white text-black hover:bg-zinc-200 cursor-pointer shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                                                        <Save className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setEditingStockIdx(null)} className="p-2 sm:p-2.5 border border-white/20 text-white hover:bg-white/10 cursor-pointer">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-4">
                                                    <span className={`text-[20px] font-black tracking-tight ${variant.stock > 0 ? "text-green-400" : "text-red-400"}`}>
                                                        {variant.stock} <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] ml-1.5 hidden sm:inline-block">units</span>
                                                    </span>
                                                    <button 
                                                        onClick={() => { setEditingStockIdx(idx); setEditStockValue(variant.stock); }}
                                                        className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer md:opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions Removed */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default SellerProductDetail;

/* ═══════════════════════════════════════════════════════
   Variant Images Scroller
═══════════════════════════════════════════════════════ */
const VariantImagesScroller = ({ images }) => {
    const scrollContainerRef = useRef(null);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 110; // approximate width of one image + gap
            scrollContainerRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    const hasMultipleImages = images && images.length > 1;

    return (
        <div className="relative flex shrink-0 group/scroller w-full min-w-0">
            {/* Left Button */}
            {hasMultipleImages && (
                <button 
                    onClick={() => scroll('left')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center bg-black/80 backdrop-blur-sm border border-white/20 rounded-full text-white opacity-0 group-hover/scroller:opacity-100 transition-all hover:bg-white hover:text-black hover:scale-110 shadow-lg cursor-pointer hidden md:flex"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
            )}

            {/* Scroll Container */}
            <div 
                ref={scrollContainerRef}
                className="flex gap-2 overflow-x-auto shrink-0 max-w-full pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory"
            >
                {images && images.length > 0 ? (
                    images.map((img, imgIdx) => (
                        <div key={imgIdx} className="w-20 sm:w-24 md:w-[100px] shrink-0 aspect-[4/5] bg-[#0f0f0f] border border-white/10 flex items-center justify-center overflow-hidden relative group/img snap-start">
                            <img src={img.url || img.previewUrl} alt={`Variant ${imgIdx + 1}`} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700" />
                        </div>
                    ))
                ) : (
                    <div className="w-20 sm:w-24 md:w-[100px] shrink-0 aspect-[4/5] bg-[#0f0f0f] border border-white/10 flex items-center justify-center overflow-hidden snap-start">
                        <ImageIcon className="w-6 h-6 text-zinc-700" />
                    </div>
                )}
            </div>

            {/* Right Button */}
            {hasMultipleImages && (
                <button 
                    onClick={() => scroll('right')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center bg-black/80 backdrop-blur-sm border border-white/20 rounded-full text-white opacity-0 group-hover/scroller:opacity-100 transition-all hover:bg-white hover:text-black hover:scale-110 shadow-lg cursor-pointer hidden md:flex"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════
   Custom Currency Picker
═══════════════════════════════════════════════════════ */
const CurrencyPicker = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);
  const selected        = CURRENCY_OPTIONS.find((c) => c.code === value);

  // close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative h-full">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full h-full flex items-center justify-between bg-[#0a0a0a] border border-white/[0.1] rounded-md px-4 py-4 hover:border-white/[0.4] focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all duration-300 outline-none group cursor-pointer shadow-inner"
      >
        <div className="flex items-center gap-2">
          <span className="text-[16px]">{selected?.flag}</span>
          <div className="text-left leading-none">
            <span className="text-[14px] font-black text-white tracking-[0.1em] uppercase block">
              {selected?.code}
            </span>
          </div>
        </div>
        <svg
          className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-full right-0 mt-1 w-[200px] bg-[#111111] border border-white/[0.1] rounded-md z-50 overflow-hidden shadow-2xl shadow-black/80">
          {CURRENCY_OPTIONS.map((c) => {
            const isActive = c.code === value;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => { onChange(c.code); setOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-white/[0.06] text-white"
                    : "text-zinc-400 hover:bg-white/[0.03] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[16px]">{c.flag}</span>
                  <div className="text-left">
                    <span className="text-[13px] font-bold block tracking-[0.05em]">
                      {c.code}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-semibold block tracking-[0.05em]">
                      {c.name}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-black text-zinc-500">{c.symbol}</span>
                  {isActive && <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};