import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import TrackingStepper from '../components/TrackingStepper';

const API = import.meta.env.VITE_API_URL;

const BuyerView = () => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [cart, setCart] = useState([]);
    const [activeTab, setActiveTab] = useState('market');
    const [activeFilter, setActiveFilter] = useState('All');
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
        } catch (error) { toast.error("Data synchronization failure"); }
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
        } catch (error) { toast.error("Failed to sync ledger"); }
    };

    // Initial load + live polling every 15 seconds
    useEffect(() => {
        fetchProducts();
        fetchOrders();

        const pollInterval = setInterval(() => {
            setIsPolling(true);
            fetchOrders().finally(() => setTimeout(() => setIsPolling(false), 600));
        }, 15000); // Every 15 seconds

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
        toast.success(`Allocated ${product.title} to Staging`);
    };

    const removeFromCart = (productId) => setCart(prevCart => prevCart.filter(item => item._id !== productId));
    const updateCartQty = (productId, delta, maxStock) => setCart(prevCart => prevCart.map(item => item._id === productId && item.cartQty + delta > 0 && item.cartQty + delta <= maxStock ? { ...item, cartQty: item.cartQty + delta } : item));
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
        } catch (error) { toast.error('Network Error.', { id: toastId }); }
    };

    const allMaterials = ['All', ...new Set(products.flatMap(p => p.materialsUsed || []))];
    const filteredProducts = activeFilter === 'All' ? products : products.filter(p => (p.materialsUsed || []).includes(activeFilter));

    return (
        <div className="min-h-[calc(100vh-80px)] bg-background text-gray-200 relative overflow-hidden">
            <div className="fixed top-0 right-0 w-[700px] h-[700px] bg-cyberCyan/8 rounded-full blur-[200px] pointer-events-none animate-float" />
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-neonIndigo/8 rounded-full blur-[200px] pointer-events-none animate-float-delayed" />
            <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
                <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 border-b border-white/[0.06] pb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <p className="text-[10px] font-mono text-cyberCyan uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                                <span className="status-dot-live" /> Buyer Terminal Active
                            </p>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyberCyan via-white to-neonIndigo">
                                DECENTRALIZED MARKET
                            </h1>
                        </div>
                        <div className="flex bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/[0.07] gap-1">
                            {[
                                { id: 'market', label: 'Market' },
                                { id: 'cart', label: `Cart${cart.length > 0 ? ` (${cart.length})` : ''}`, badge: cart.length },
                                { id: 'ledger', label: 'My Orders' },
                            ].map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={`relative px-5 py-2 text-[11px] font-mono uppercase tracking-widest rounded-lg transition-all duration-200
                                        ${activeTab === tab.id
                                            ? 'bg-cyberCyan/15 text-cyberCyan border border-cyberCyan/40 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                                            : 'text-gray-500 hover:text-white'}`}>
                                    {tab.label}
                                    {tab.badge > 0 && activeTab !== tab.id && (
                                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-cyberCyan text-black text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                                            {tab.badge}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.header>

                {activeTab === 'market' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-2">
                            {allMaterials.map(mat => (
                                <button key={mat} onClick={() => setActiveFilter(mat)}
                                    className={`shrink-0 text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all duration-200
                                        ${activeFilter === mat
                                            ? 'bg-cyberCyan/20 text-cyberCyan border border-cyberCyan/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                                            : 'bg-black/40 text-gray-500 border border-white/[0.07] hover:text-white hover:border-white/20'}`}>
                                    {mat}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map((product, i) => (
                                <motion.div
                                    key={product._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={{ y: -8 }}
                                    className="glass-panel card-hover-glow flex flex-col group overflow-hidden"
                                >
                                    <div className="relative w-full h-72 overflow-hidden bg-black/60">
                                        {product.image ? (
                                            <img src={product.image} alt={product.title}
                                                className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-700" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-5xl opacity-30">🧵</div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                        <span className="absolute bottom-3 left-3 tag-cyber">{product.originRegion}</span>
                                        {product.discountBadge && (
                                            <span className="absolute top-3 right-3 tag-red animate-pulse">{product.discountBadge}</span>
                                        )}
                                    </div>
                                    <div className="p-5 flex flex-col flex-grow">
                                        <h3 className="text-base font-bold text-white group-hover:text-cyberCyan transition-colors leading-snug mb-3 line-clamp-2">{product.title}</h3>
                                        <div className="flex gap-1.5 flex-wrap mb-4">
                                            {(product.materialsUsed || []).slice(0, 3).map((mat, i) => (
                                                <span key={i} className="tag-indigo">{mat}</span>
                                            ))}
                                        </div>
                                        <div className="mt-auto flex items-end justify-between">
                                            <div>
                                                {product.discountBadge && (
                                                    <p className="text-[10px] font-mono text-gray-600 line-through">₹{product.originalPrice}</p>
                                                )}
                                                <p className="text-xl font-black text-emerald-400 font-mono">₹{Math.round(product.price).toLocaleString('en-IN')}</p>
                                                <p className="text-[9px] font-mono text-gray-600">{product.inventory} in stock</p>
                                            </div>
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => addToCart(product)}
                                                disabled={product.inventory === 0}
                                                className={`px-4 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all
                                                    ${product.inventory === 0
                                                        ? 'opacity-30 bg-white/5 text-gray-600 border border-white/10'
                                                        : 'btn-solid-cyber hover:scale-105'}`}>
                                                {product.inventory === 0 ? 'Sold Out' : '+ Cart'}
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'cart' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-3xl mx-auto">
                        {cart.length === 0 ? <div className="text-center py-20 glass-panel"><p className="text-gray-500 font-mono text-xs uppercase">Staging cart is empty.</p></div> : (
                            <div className="space-y-4">
                                {cart.map((item) => (
                                    <div key={item._id} className="glass-panel p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">{item.image && <img src={item.image} alt="thumb" className="w-12 h-12 rounded object-cover border border-white/20" />}<div><h3 className="font-bold text-white">{item.title}</h3><p className="text-[10px] font-mono text-cyberCyan uppercase">${item.price} per unit</p></div></div>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center bg-black/50 border border-white/10 rounded p-1"><button onClick={() => updateCartQty(item._id, -1, item.inventory)} className="w-6 h-6 text-gray-400 hover:text-white">-</button><span className="w-8 text-center text-xs font-mono text-white">{item.cartQty}</span><button onClick={() => updateCartQty(item._id, 1, item.inventory)} className="w-6 h-6 text-gray-400 hover:text-white">+</button></div>
                                            <span className="text-sm font-mono text-emerald-400 w-16 text-right">${item.price * item.cartQty}</span>
                                            <button onClick={() => removeFromCart(item._id)} className="text-alertRed text-xs font-mono uppercase hover:underline">Remove</button>
                                        </div>
                                    </div>
                                ))}
                                <div className="mt-8 bg-cyberCyan/10 border border-cyberCyan/30 p-6 rounded-xl flex justify-between items-center backdrop-blur-md">
                                    <div>
                                        <p className="text-[10px] font-mono text-gray-400 uppercase">Total Liquidity Required</p>
                                        <p className="text-4xl font-black text-emerald-400">${cartTotal}</p>
                                        <p className="text-[10px] text-emerald-400 font-mono mt-1">{cartTotal > 999 ? '✓ Free Delivery' : '+ ₹49 delivery'}</p>
                                    </div>
                                    <button onClick={handleGoToCheckout} className="px-8 py-4 bg-cyberCyan text-black font-black uppercase tracking-[0.2em] text-xs rounded hover:bg-[#5affff] shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all">
                                        Checkout →
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'ledger' && (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto">

                        {/* Live sync status bar */}
                        <div className="flex items-center justify-between mb-4 px-1">
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${isPolling ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                                    {isPolling ? 'Syncing with network...' : 'Live — auto-syncs every 15s'}
                                </span>
                            </div>
                            {lastRefreshed && (
                                <span className="text-[10px] font-mono text-gray-600">
                                    Last sync: {lastRefreshed.toLocaleTimeString('en-IN')}
                                </span>
                            )}
                        </div>

                        {orders.length === 0 ? (
                            <div className="text-center py-20 glass-panel">
                                <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">No transactions on ledger yet.</p>
                            </div>
                        ) : (
                        <div className="flex flex-col gap-5">
                            {orders.slice().reverse().map((order) => {
                                const statusConfig = {
                                    'Pending':    { color: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/30',   dot: 'bg-amber-400',   step: 0 },
                                    'Processing': { color: 'text-blue-400',    bg: 'bg-blue-400/10',    border: 'border-blue-400/30',    dot: 'bg-blue-400',    step: 1 },
                                    'Shipped':    { color: 'text-cyberCyan',   bg: 'bg-cyberCyan/10',   border: 'border-cyberCyan/30',   dot: 'bg-cyberCyan',   step: 2 },
                                    'Out for Delivery': { color: 'text-purple-400',  bg: 'bg-purple-400/10',  border: 'border-purple-400/30',  dot: 'bg-purple-400',  step: 3 },
                                    'Delivered':  { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30', dot: 'bg-emerald-400', step: 4 },
                                    'Cancelled':  { color: 'text-alertRed',    bg: 'bg-alertRed/10',    border: 'border-alertRed/30',    dot: 'bg-alertRed',    step: -1 },
                                };
                                const displayStatus = simulatedStatuses[order._id] || order.status;
                                const sc = statusConfig[displayStatus] || statusConfig['Pending'];

                                return (
                                <div key={order._id} className="glass-panel overflow-hidden group">
                                    {/* Header row */}
                                    <div className="flex flex-wrap justify-between items-center gap-3 p-5 border-b border-surfaceBorder">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${sc.dot} animate-pulse`} />
                                            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
                                                TXN: {order._id.slice(-12).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded border ${sc.color} ${sc.bg} ${sc.border}`}>
                                                {displayStatus}
                                            </span>
                                            <span className="text-sm font-mono font-black text-emerald-400 border border-emerald-500/30 bg-emerald-900/20 px-3 py-1 rounded">
                                                ₹{order.totalAmount?.toLocaleString('en-IN') || order.totalAmount}
                                            </span>
                                            <button
                                                onClick={() => handleCancelOrder(order._id)}
                                                className="bg-alertRed/10 text-alertRed border border-alertRed/30 px-3 py-1 text-[10px] font-mono uppercase rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-alertRed hover:text-white">
                                                Void TX
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* LEFT: Items + tracking */}
                                        <div>
                                            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3">Items Ordered</p>
                                            <div className="space-y-2">
                                                {order.products.map((item, i) => (
                                                    <div key={i} className="flex justify-between items-center bg-black/40 border border-surfaceBorder rounded-lg px-3 py-2">
                                                        <span className="text-sm font-bold text-white truncate">{item.productId ? item.productId.title : 'Asset Removed'}</span>
                                                        <span className="text-cyberCyan font-mono text-xs flex-shrink-0 ml-3">×{item.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Tracking + Payment */}
                                            <div className="mt-4 grid grid-cols-2 gap-2">
                                                {order.trackingNumber && (
                                                    <div className="bg-black/40 border border-surfaceBorder rounded-lg p-3">
                                                        <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Tracking ID</p>
                                                        <p className="text-cyberCyan font-mono text-xs font-bold tracking-widest">{order.trackingNumber}</p>
                                                    </div>
                                                )}
                                                {order.paymentMode && (
                                                    <div className="bg-black/40 border border-surfaceBorder rounded-lg p-3">
                                                        <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Payment</p>
                                                        <p className="text-white font-mono text-xs font-bold">{order.paymentMode}</p>
                                                    </div>
                                                )}
                                                <div className="bg-black/40 border border-surfaceBorder rounded-lg p-3 col-span-2">
                                                    <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Placed On</p>
                                                    <p className="text-white font-mono text-xs">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* RIGHT: Address + Status pipeline */}
                                        <div>
                                            {order.shippingAddress ? (
                                                <div className="mb-4">
                                                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3">Shipping Address</p>
                                                    <div className="bg-black/40 border border-surfaceBorder rounded-lg p-3 text-sm">
                                                        <p className="font-bold text-white">{order.shippingAddress.fullName}</p>
                                                        <p className="text-gray-400 text-xs mt-1">{order.shippingAddress.addressLine1}</p>
                                                        {order.shippingAddress.addressLine2 && <p className="text-gray-400 text-xs">{order.shippingAddress.addressLine2}</p>}
                                                        <p className="text-gray-400 text-xs">{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</p>
                                                        <p className="text-cyberCyan font-mono text-xs mt-1">{order.shippingAddress.phone}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mb-4 bg-black/20 border border-dashed border-white/10 rounded-lg p-3 text-center">
                                                    <p className="text-[10px] font-mono text-gray-600 uppercase">No address on record</p>
                                                </div>
                                            )}

                                            {/* Status pipeline */}
                                            {displayStatus !== 'Cancelled' && (
                                                <div className="overflow-visible mt-2">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Delivery Status</p>
                                                        {displayStatus !== 'Delivered' && !simulatedStatuses[order._id] && (
                                                            <button 
                                                                onClick={() => simulateTracking(order._id)}
                                                                className="text-[9px] font-mono uppercase bg-cyberCyan/10 text-cyberCyan border border-cyberCyan/30 px-3 py-1 rounded hover:bg-cyberCyan hover:text-black transition-colors"
                                                            >
                                                                Simulate Tracking
                                                            </button>
                                                        )}
                                                    </div>
                                                    <TrackingStepper 
                                                        currentStatus={displayStatus} 
                                                        city={order.shippingAddress?.city || 'Your City'} 
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )})}
                        </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default BuyerView;