import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import TrackingStepper from '../components/TrackingStepper';
import { ShoppingCart, Package, ClipboardList, Search, SlidersHorizontal, X, Zap, Star } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const BuyerView = () => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [cart, setCart] = useState([]);
    const [activeTab, setActiveTab] = useState('market');
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('default');
    const [simulatedStatuses, setSimulatedStatuses] = useState({});
    const [lastRefreshed, setLastRefreshed] = useState(null);
    const [isPolling, setIsPolling] = useState(false);
    const navigate = useNavigate();

    const simulateTracking = (orderId) => {
        const sequence = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
        let currentIdx = 0;
        setSimulatedStatuses(prev => ({ ...prev, [orderId]: sequence[currentIdx] }));
        const interval = setInterval(() => {
            currentIdx += 1;
            if (currentIdx < sequence.length) {
                setSimulatedStatuses(prev => ({ ...prev, [orderId]: sequence[currentIdx] }));
            } else {
                clearInterval(interval);
            }
        }, 1500);
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${API}/products`);
            if (response.ok) {
                const data = await response.json();
                setProducts(data.data || data);
            }
        } catch { toast.error("Data synchronization failure"); }
    };

    const fetchOrders = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const response = await fetch(`${API}/orders`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (response.ok) {
                const data = await response.json();
                setOrders(data.data || data);
                setLastRefreshed(new Date());
            }
        } catch { toast.error("Failed to sync ledger"); }
    };

    useEffect(() => {
        fetchProducts();
        fetchOrders();
        const pollInterval = setInterval(() => {
            setIsPolling(true);
            fetchOrders().finally(() => setTimeout(() => setIsPolling(false), 600));
        }, 15000);
        return () => clearInterval(pollInterval);
    }, []);

    const addToCart = (product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item._id === product._id);
            if (existingItem) {
                if (existingItem.cartQty >= product.inventory) return prevCart;
                return prevCart.map(item => item._id === product._id ? { ...item, cartQty: item.cartQty + 1 } : item);
            }
            return [...prevCart, { ...product, cartQty: 1 }];
        });
        toast.success(`Added to cart`, { icon: '🛒', style: { background: 'rgba(8,8,24,0.95)', border: '1px solid rgba(0,245,255,0.3)', color: '#fff' } });
    };

    const removeFromCart = (productId) => setCart(prevCart => prevCart.filter(item => item._id !== productId));
    const updateCartQty = (productId, delta, maxStock) => setCart(prevCart => prevCart.map(item =>
        item._id === productId && item.cartQty + delta > 0 && item.cartQty + delta <= maxStock
            ? { ...item, cartQty: item.cartQty + delta } : item
    ));
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.cartQty), 0);

    const handleGoToCheckout = () => {
        if (cart.length === 0) { toast.error('Cart is empty'); return; }
        localStorage.setItem('checkoutCart', JSON.stringify(cart));
        navigate('/checkout', { state: { cart } });
    };

    const handleCancelOrder = async (orderId) => {
        const token = localStorage.getItem('token');
        const toastId = toast.loading('Voiding transaction...');
        try {
            const response = await fetch(`${API}/orders/${orderId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (response.ok) {
                fetchProducts(); fetchOrders();
                toast.success('Transaction voided successfully.', { id: toastId });
            } else {
                toast.error('Failed to void transaction.', { id: toastId });
            }
        } catch { toast.error('Network Error.', { id: toastId }); }
    };

    const allMaterials = ['All', ...new Set(products.flatMap(p => p.materialsUsed || []))];

    let filteredProducts = activeFilter === 'All' ? products : products.filter(p => (p.materialsUsed || []).includes(activeFilter));
    if (searchQuery) filteredProducts = filteredProducts.filter(p => p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || p.originRegion?.toLowerCase().includes(searchQuery.toLowerCase()));
    if (sortBy === 'price_asc') filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
    if (sortBy === 'price_desc') filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
    if (sortBy === 'stock') filteredProducts = [...filteredProducts].sort((a, b) => b.inventory - a.inventory);

    const statusConfig = {
        'Pending':    { color: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/30',   dot: 'bg-amber-400',   step: 0 },
        'Processing': { color: 'text-blue-400',    bg: 'bg-blue-400/10',    border: 'border-blue-400/30',    dot: 'bg-blue-400',    step: 1 },
        'Shipped':    { color: 'text-cyan-400',    bg: 'bg-cyan-400/10',    border: 'border-cyan-400/30',    dot: 'bg-cyan-400',    step: 2 },
        'Out for Delivery': { color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30', dot: 'bg-purple-400', step: 3 },
        'Delivered':  { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30', dot: 'bg-emerald-400', step: 4 },
        'Cancelled':  { color: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/30',     dot: 'bg-red-400',     step: -1 },
    };

    const tabs = [
        { id: 'market', label: 'Market', icon: ShoppingCart, badge: 0 },
        { id: 'cart',   label: 'Cart',   icon: Package, badge: cart.length },
        { id: 'ledger', label: 'Orders', icon: ClipboardList, badge: 0 },
    ];

    return (
        <div className="min-h-screen text-gray-200 relative overflow-hidden" style={{ background: '#000010' }}>
            {/* Ambient orbs */}
            <div className="fixed top-0 right-0 w-[700px] h-[700px] rounded-full pointer-events-none animate-float"
                style={{ background: 'radial-gradient(circle, rgba(0,245,255,0.06) 0%, transparent 70%)', filter: 'blur(80px)' }} />
            <div className="fixed bottom-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none animate-float-delayed"
                style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)', filter: 'blur(80px)' }} />

            <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">

                {/* ── HEADER ── */}
                <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-white/[0.05]">
                        <div>
                            <div className="flex items-center gap-2.5 mb-3">
                                <span className="status-dot-live" />
                                <span className="text-[10px] font-mono text-[#00f5ff] uppercase tracking-[0.3em]">Buyer Terminal Active</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-[-0.04em] text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                                Decentralized <span className="text-shimmer">Market</span>
                            </h1>
                            <p className="text-gray-600 text-sm mt-1 font-mono">
                                {products.length} assets · {filteredProducts.length} shown
                            </p>
                        </div>

                        {/* Tab switcher */}
                        <div className="flex bg-black/60 backdrop-blur-md p-1 rounded-2xl border border-white/[0.06] gap-1">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                        className={`relative flex items-center gap-2 px-5 py-2.5 text-[11px] font-mono uppercase tracking-widest rounded-xl transition-all duration-250
                                            ${activeTab === tab.id
                                                ? 'bg-[#00f5ff]/10 text-[#00f5ff] border border-[#00f5ff]/30 shadow-[0_0_20px_rgba(0,245,255,0.12)]'
                                                : 'text-gray-500 hover:text-white'}`}>
                                        <Icon size={13} />
                                        {tab.label}
                                        {tab.badge > 0 && activeTab !== tab.id && (
                                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#00f5ff] text-black text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                                                {tab.badge}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </motion.header>

                {/* ══ MARKET TAB ══ */}
                {activeTab === 'market' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                        {/* Search + Sort + Filter row */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-6">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                                <input
                                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search products, regions..."
                                    className="w-full pl-9 pr-4 py-2.5 bg-black/50 border border-white/[0.08] rounded-xl text-sm text-white placeholder-gray-700 focus:outline-none focus:border-[#00f5ff]/40 transition-all font-mono text-xs"
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white">
                                        <X size={12} />
                                    </button>
                                )}
                            </div>

                            {/* Sort */}
                            <div className="relative">
                                <SlidersHorizontal size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                                    className="pl-8 pr-4 py-2.5 bg-black/50 border border-white/[0.08] rounded-xl text-xs font-mono text-gray-400 focus:outline-none focus:border-[#00f5ff]/40 transition-all appearance-none">
                                    <option value="default">Sort: Default</option>
                                    <option value="price_asc">Price: Low → High</option>
                                    <option value="price_desc">Price: High → Low</option>
                                    <option value="stock">Most in Stock</option>
                                </select>
                            </div>
                        </div>

                        {/* Material filter chips */}
                        <div className="flex gap-2 mb-8 overflow-x-auto hide-scrollbar pb-2">
                            {allMaterials.map(mat => (
                                <button key={mat} onClick={() => setActiveFilter(mat)}
                                    className={`shrink-0 text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-xl border transition-all duration-200
                                        ${activeFilter === mat
                                            ? 'bg-[#00f5ff]/15 text-[#00f5ff] border-[#00f5ff]/40 shadow-[0_0_15px_rgba(0,245,255,0.2)]'
                                            : 'bg-black/40 text-gray-600 border-white/[0.07] hover:text-gray-300 hover:border-white/15'}`}>
                                    {mat}
                                </button>
                            ))}
                        </div>

                        {/* Product Grid */}
                        {filteredProducts.length === 0 ? (
                            <div className="glass-card p-16 text-center">
                                <p className="text-gray-600 font-mono text-xs uppercase tracking-widest">No products match your search.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {filteredProducts.map((product, i) => (
                                    <motion.div
                                        key={product._id}
                                        initial={{ opacity: 0, y: 24 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.04, duration: 0.45 }}
                                        className="glow-card flex flex-col group">

                                        <div className="card-shine" />

                                        {/* Image */}
                                        <div className="product-img-wrap h-60 bg-black/60 relative">
                                            {product.image ? (
                                                <img src={product.image} alt={product.title} className="w-full h-full object-contain p-3" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">🧵</div>
                                            )}
                                            {/* Overlay gradient */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                                            {/* Region tag */}
                                            {product.originRegion && (
                                                <span className="absolute bottom-3 left-3 text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-lg"
                                                    style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.3)', color: '#00f5ff' }}>
                                                    📍 {product.originRegion}
                                                </span>
                                            )}

                                            {/* Discount badge */}
                                            {product.discountBadge && (
                                                <span className="absolute top-3 right-3 text-[9px] font-mono font-black uppercase tracking-widest px-2 py-1 rounded-lg animate-pulse"
                                                    style={{ background: 'rgba(255,0,60,0.15)', border: '1px solid rgba(255,0,60,0.4)', color: '#ff003c' }}>
                                                    {product.discountBadge}
                                                </span>
                                            )}

                                            {/* Out of stock */}
                                            {product.inventory === 0 && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                    <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 border border-white/10 px-3 py-1.5 rounded-lg">Sold Out</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="p-4 flex flex-col flex-grow">
                                            {/* Materials */}
                                            <div className="flex gap-1.5 flex-wrap mb-2.5">
                                                {(product.materialsUsed || []).slice(0, 2).map((mat, idx) => (
                                                    <span key={idx} className="text-[8px] font-mono uppercase tracking-wider px-2 py-0.5 rounded"
                                                        style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', color: '#c084fc' }}>
                                                        {mat}
                                                    </span>
                                                ))}
                                            </div>

                                            <h3 className="text-sm font-bold text-white mb-1 leading-snug line-clamp-2 group-hover:text-[#00f5ff] transition-colors duration-300">
                                                {product.title}
                                            </h3>

                                            <p className="text-[10px] font-mono text-gray-600 mb-3">{product.inventory} units in stock</p>

                                            {/* Price + CTA */}
                                            <div className="mt-auto pt-3 border-t border-white/[0.05] flex items-center justify-between gap-2">
                                                <div>
                                                    {product.discountBadge && (
                                                        <p className="text-[9px] font-mono text-gray-700 line-through">₹{product.originalPrice}</p>
                                                    )}
                                                    <p className="text-lg font-black font-mono" style={{ color: '#4ade80', textShadow: '0 0 15px rgba(74,222,128,0.35)' }}>
                                                        ₹{Math.round(product.price).toLocaleString('en-IN')}
                                                    </p>
                                                </div>
                                                <motion.button
                                                    whileTap={{ scale: 0.93 }}
                                                    onClick={() => addToCart(product)}
                                                    disabled={product.inventory === 0}
                                                    className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-200 disabled:opacity-30"
                                                    style={product.inventory > 0 ? {
                                                        background: 'rgba(0,245,255,0.1)',
                                                        border: '1px solid rgba(0,245,255,0.35)',
                                                        color: '#00f5ff',
                                                        boxShadow: '0 0 15px rgba(0,245,255,0.1)',
                                                    } : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#555' }}
                                                    onMouseEnter={e => { if (product.inventory > 0) { e.currentTarget.style.background = 'rgba(0,245,255,0.18)'; e.currentTarget.style.boxShadow = '0 0 25px rgba(0,245,255,0.25)'; } }}
                                                    onMouseLeave={e => { if (product.inventory > 0) { e.currentTarget.style.background = 'rgba(0,245,255,0.1)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(0,245,255,0.1)'; } }}>
                                                    <Zap size={10} />
                                                    + Cart
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ══ CART TAB ══ */}
                {activeTab === 'cart' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-3xl mx-auto">
                        {cart.length === 0 ? (
                            <div className="glass-card p-20 text-center">
                                <ShoppingCart size={40} className="mx-auto text-gray-700 mb-4" />
                                <p className="text-gray-600 font-mono text-xs uppercase tracking-widest">Your cart is empty</p>
                                <button onClick={() => setActiveTab('market')} className="mt-4 text-[#00f5ff] text-xs font-mono uppercase tracking-widest hover:underline">Browse Market →</button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cart.map(item => (
                                    <motion.div key={item._id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                        className="glass-card p-4 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            {item.image && <img src={item.image} alt="thumb" className="w-14 h-14 rounded-xl object-contain bg-black/50 border border-white/10 p-1" />}
                                            <div>
                                                <h3 className="font-bold text-white text-sm leading-snug">{item.title}</h3>
                                                <p className="text-[10px] font-mono text-[#00f5ff] uppercase tracking-wider mt-0.5">₹{item.price.toLocaleString('en-IN')} per unit</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 flex-shrink-0">
                                            <div className="flex items-center bg-black/50 border border-white/[0.08] rounded-xl overflow-hidden">
                                                <button onClick={() => updateCartQty(item._id, -1, item.inventory)} className="w-8 h-8 text-gray-400 hover:text-white hover:bg-white/05 transition-all">−</button>
                                                <span className="w-8 text-center text-sm font-mono text-white">{item.cartQty}</span>
                                                <button onClick={() => updateCartQty(item._id, 1, item.inventory)} className="w-8 h-8 text-gray-400 hover:text-white hover:bg-white/05 transition-all">+</button>
                                            </div>
                                            <span className="text-sm font-mono font-black text-emerald-400 w-20 text-right">₹{(item.price * item.cartQty).toLocaleString('en-IN')}</span>
                                            <button onClick={() => removeFromCart(item._id)} className="text-red-400/50 hover:text-red-400 transition-colors">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Cart total */}
                                <motion.div layout className="glass-card p-6 flex justify-between items-center mt-6"
                                    style={{ borderColor: 'rgba(0,245,255,0.15)', boxShadow: '0 0 40px rgba(0,245,255,0.05)' }}>
                                    <div>
                                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Order Total</p>
                                        <p className="text-3xl font-black font-mono" style={{ color: '#4ade80', textShadow: '0 0 20px rgba(74,222,128,0.3)' }}>
                                            ₹{cartTotal.toLocaleString('en-IN')}
                                        </p>
                                        <p className="text-[10px] font-mono text-emerald-400/80 mt-1">
                                            {cartTotal > 999 ? '✓ Free delivery' : '+ ₹49 delivery'}
                                        </p>
                                    </div>
                                    <motion.button onClick={handleGoToCheckout} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                        className="px-8 py-4 font-black uppercase tracking-[0.15em] text-sm rounded-2xl text-black transition-all"
                                        style={{ background: '#00f5ff', boxShadow: '0 0 30px rgba(0,245,255,0.45), 0 8px 20px rgba(0,0,0,0.3)' }}>
                                        Checkout →
                                    </motion.button>
                                </motion.div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ══ LEDGER (ORDERS) TAB ══ */}
                {activeTab === 'ledger' && (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto">

                        {/* Live sync bar */}
                        <div className="flex items-center justify-between mb-5 px-1">
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${isPolling ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                                <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
                                    {isPolling ? 'Syncing...' : 'Live — auto-syncs every 15s'}
                                </span>
                            </div>
                            {lastRefreshed && <span className="text-[10px] font-mono text-gray-700">Last: {lastRefreshed.toLocaleTimeString('en-IN')}</span>}
                        </div>

                        {orders.length === 0 ? (
                            <div className="glass-card py-20 text-center">
                                <ClipboardList size={36} className="mx-auto text-gray-700 mb-4" />
                                <p className="text-gray-600 font-mono text-xs uppercase tracking-widest">No transactions on ledger yet.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {orders.slice().reverse().map(order => {
                                    const displayStatus = simulatedStatuses[order._id] || order.status;
                                    const sc = statusConfig[displayStatus] || statusConfig['Pending'];
                                    return (
                                        <div key={order._id} className="glass-card overflow-hidden group">
                                            {/* Status accent line */}
                                            <div className={`h-0.5 w-full ${sc.dot}`} style={{ background: displayStatus === 'Delivered' ? '#4ade80' : displayStatus === 'Shipped' ? '#00f5ff' : displayStatus === 'Processing' ? '#60a5fa' : displayStatus === 'Cancelled' ? '#ff003c' : '#fbbf24' }} />

                                            {/* Header */}
                                            <div className="flex flex-wrap justify-between items-center gap-3 p-5 border-b border-white/[0.04]">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${sc.dot} animate-pulse`} />
                                                    <span className="text-xs font-mono text-gray-600 uppercase tracking-widest">TXN: {order._id.slice(-12).toUpperCase()}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-xl border ${sc.color} ${sc.bg} ${sc.border}`}>
                                                        {displayStatus}
                                                    </span>
                                                    <span className="text-sm font-mono font-black text-emerald-400 border border-emerald-500/25 bg-emerald-900/15 px-3 py-1.5 rounded-xl">
                                                        ₹{order.totalAmount?.toLocaleString('en-IN')}
                                                    </span>
                                                    {['Pending', 'Processing'].includes(displayStatus) && (
                                                        <button onClick={() => handleCancelOrder(order._id)}
                                                            className="bg-red-400/5 text-red-400 border border-red-400/25 px-3 py-1.5 text-[10px] font-mono uppercase rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-400 hover:text-white">
                                                            Cancel Order
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div>
                                                    <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-3">Items Ordered</p>
                                                    <div className="space-y-2">
                                                        {order.products.map((item, i) => (
                                                            <div key={i} className="flex justify-between items-center bg-black/40 border border-white/[0.04] rounded-xl px-3 py-2">
                                                                <span className="text-sm font-semibold text-white truncate">{item.productId ? item.productId.title : 'Asset Removed'}</span>
                                                                <span className="text-[#00f5ff] font-mono text-xs font-bold flex-shrink-0 ml-2">×{item.quantity}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                                        {order.trackingNumber && (
                                                            <div className="bg-black/40 border border-white/[0.04] rounded-xl p-3">
                                                                <p className="text-[9px] font-mono text-gray-600 uppercase mb-1">Tracking</p>
                                                                <p className="text-[#00f5ff] font-mono text-xs font-bold">{order.trackingNumber}</p>
                                                            </div>
                                                        )}
                                                        {order.paymentMode && (
                                                            <div className="bg-black/40 border border-white/[0.04] rounded-xl p-3">
                                                                <p className="text-[9px] font-mono text-gray-600 uppercase mb-1">Payment</p>
                                                                <p className="text-white font-mono text-xs font-bold">{order.paymentMode}</p>
                                                            </div>
                                                        )}
                                                        <div className="bg-black/40 border border-white/[0.04] rounded-xl p-3 col-span-2">
                                                            <p className="text-[9px] font-mono text-gray-600 uppercase mb-1">Placed On</p>
                                                            <p className="text-white font-mono text-xs">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    {order.shippingAddress && (
                                                        <div className="mb-4">
                                                            <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-2">Shipping To</p>
                                                            <div className="bg-black/40 border border-white/[0.04] rounded-xl p-3 text-sm">
                                                                <p className="font-bold text-white">{order.shippingAddress.fullName}</p>
                                                                <p className="text-gray-500 text-xs mt-1">{order.shippingAddress.addressLine1}</p>
                                                                <p className="text-gray-500 text-xs">{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</p>
                                                                <p className="text-[#00f5ff] font-mono text-xs mt-1">{order.shippingAddress.phone}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {displayStatus !== 'Cancelled' && (
                                                        <div>
                                                            <div className="flex justify-between items-center mb-3">
                                                                <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Delivery Status</p>
                                                                {displayStatus !== 'Delivered' && !simulatedStatuses[order._id] && (
                                                                    <button onClick={() => simulateTracking(order._id)}
                                                                        className="text-[9px] font-mono uppercase bg-[#00f5ff]/08 text-[#00f5ff] border border-[#00f5ff]/25 px-3 py-1 rounded-lg hover:bg-[#00f5ff] hover:text-black transition-all">
                                                                        Simulate →
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <TrackingStepper currentStatus={displayStatus} city={order.shippingAddress?.city || 'Your City'} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default BuyerView;