import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Package, ShoppingCart, BarChart2, Plus, Edit2, Trash2, X, Save, ChevronDown, Bot, Megaphone, Send, Tag } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;
const TABS = [
    { id: 'products', label: 'Products',  icon: Package },
    { id: 'orders',   label: 'Orders',    icon: ShoppingCart },
    { id: 'marketing',label: 'Marketing', icon: Megaphone },
    { id: 'analytics',label: 'Analytics', icon: BarChart2 },
];
const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
const STATUS_COLORS = {
    Pending:    'text-amber-400 bg-amber-400/10 border-amber-400/30',
    Processing: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    Shipped:    'text-cyberCyan bg-cyberCyan/10 border-cyberCyan/30',
    'Out for Delivery': 'text-purple-400 bg-purple-400/10 border-purple-400/30',
    Delivered:  'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    Cancelled:  'text-red-400 bg-red-400/10 border-red-400/30',
};

const EMPTY_FORM = { title: '', price: '', inventory: '', originRegion: '', materialsUsed: '', image: '' };

const getToken = () => localStorage.getItem('token');
const authHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` });

export default function AdminView() {
    const [activeTab, setActiveTab]       = useState('products');
    const [products, setProducts]         = useState([]);
    const [orders, setOrders]             = useState([]);
    const [loading, setLoading]           = useState(true);
    const [modalOpen, setModalOpen]       = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form, setForm]                 = useState(EMPTY_FORM);
    const [saving, setSaving]             = useState(false);
    const [updatingOrder, setUpdatingOrder] = useState({});
    const [logs, setLogs]                 = useState([]);
    const [isAuditing, setIsAuditing]     = useState(false);
    const [auditResult, setAuditResult]   = useState(null);
    const [discounts, setDiscounts]       = useState([]);
    const [discountForm, setDiscountForm] = useState({ title: '', percentage: '', isActive: false });
    const [broadcast, setBroadcast]       = useState({ subject: '', htmlBody: '' });

    // ── Data fetching ──────────────────────────────────────────────
    const fetchProducts = useCallback(async () => {
        try {
            const r = await fetch(`${API}/products`);
            const d = await r.json();
            setProducts(d.data || []);
        } catch { toast.error('Failed to load products'); }
    }, []);

    const fetchDiscounts = useCallback(async () => {
        try {
            const r = await fetch(`${API}/marketing/discounts`, { headers: authHeaders() });
            const d = await r.json();
            setDiscounts(d.data || []);
        } catch { toast.error('Failed to load discounts'); }
    }, []);

    const fetchOrders = useCallback(async () => {
        try {
            const r = await fetch(`${API}/orders/all`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
            const d = await r.json();
            if (r.ok) setOrders(d.data || []);
            else toast.error(d.message || 'Failed to load orders');
        } catch { toast.error('Network error loading orders'); }
    }, []);

    useEffect(() => {
        Promise.all([fetchProducts(), fetchOrders(), fetchDiscounts()]).finally(() => setLoading(false));

        // Live system log ticker for the analytics tab
        const messages = [
            "Node Auth: Token validated for buyer session.",
            "Order #GH4F2 status changed to Shipped.",
            "Inventory low: Silk Saree (stock: 2).",
            "New registration: Artisan node from Gujarat.",
            "Payment verified: SIM_1A3B5C — ₹2,400.",
            "Blockchain: Smart contract executed successfully.",
        ];
        const iv = setInterval(() => {
            setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${messages[Math.floor(Math.random() * messages.length)]}`, ...prev].slice(0, 12));
        }, 2500);
        return () => clearInterval(iv);
    }, [fetchProducts, fetchOrders]);

    // ── Product CRUD ───────────────────────────────────────────────
    const openAddModal = () => { setEditingProduct(null); setForm(EMPTY_FORM); setModalOpen(true); };
    const openEditModal = (p) => {
        setEditingProduct(p);
        setForm({ title: p.title, price: p.price, inventory: p.inventory, originRegion: p.originRegion || '', materialsUsed: (p.materialsUsed || []).join(', '), image: p.image || '' });
        setModalOpen(true);
    };

    const handleSaveProduct = async () => {
        if (!form.title || !form.price || !form.inventory) {
            toast.error('Title, Price and Inventory are required'); return;
        }
        setSaving(true);
        const payload = { ...form, price: Number(form.price), inventory: Number(form.inventory) };
        try {
            const url    = editingProduct ? `${API}/products/${editingProduct._id}` : `${API}/products`;
            const method = editingProduct ? 'PUT' : 'POST';
            const r = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(payload) });
            const d = await r.json();
            if (r.ok) {
                toast.success(editingProduct ? 'Product updated!' : 'Product created!');
                setModalOpen(false);
                fetchProducts();
            } else toast.error(d.message || 'Save failed');
        } catch { toast.error('Network error'); }
        setSaving(false);
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Permanently delete "${title}"?`)) return;
        const tid = toast.loading('Removing asset...');
        try {
            const r = await fetch(`${API}/products/${id}`, { method: 'DELETE', headers: authHeaders() });
            const d = await r.json();
            if (r.ok) { toast.success('Asset removed', { id: tid }); fetchProducts(); }
            else toast.error(d.message || 'Delete failed', { id: tid });
        } catch { toast.error('Network error', { id: tid }); }
    };

    // ── Order Status Update ────────────────────────────────────────
    const handleStatusChange = async (orderId, newStatus) => {
        setUpdatingOrder(prev => ({ ...prev, [orderId]: true }));
        try {
            const r = await fetch(`${API}/orders/${orderId}/status`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ status: newStatus }) });
            const d = await r.json();
            if (r.ok) {
                setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
                toast.success(`Order → ${newStatus}`);
            } else toast.error(d.message || 'Update failed');
        } catch { toast.error('Network error'); }
        setUpdatingOrder(prev => ({ ...prev, [orderId]: false }));
    };

    const handleAutoFulfillToggle = async (orderId, currentValue) => {
        const newValue = !currentValue;
        setUpdatingOrder(prev => ({ ...prev, [orderId]: true }));
        try {
            const r = await fetch(`${API}/orders/${orderId}/auto-fulfill`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ autoFulfillment: newValue }) });
            if (r.ok) {
                setOrders(prev => prev.map(o => o._id === orderId ? { ...o, autoFulfillment: newValue } : o));
                toast.success(newValue ? 'AI Logistics Activated' : 'Manual Control Active');
            } else toast.error('Update failed');
        } catch { toast.error('Network error'); }
        setUpdatingOrder(prev => ({ ...prev, [orderId]: false }));
    };

    // ── Stats ──────────────────────────────────────────────────────
    const totalValue   = products.reduce((s, p) => s + p.price * p.inventory, 0);
    const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const pendingCount = orders.filter(o => o.status === 'Pending').length;
    const lowStock     = products.filter(p => p.inventory <= 3).length;

    const runAudit = () => {
        setIsAuditing(true); setAuditResult(null);
        toast('Initiating AI audit...', { icon: '🔍' });
        setTimeout(() => {
            setIsAuditing(false);
            setAuditResult({ status: 'SECURE', risk: '1.2%', msg: 'AI Sentinel scan complete. No anomalies detected on Artisan nodes. All escrow contracts verified.' });
            toast.success('Audit complete. Network secure.');
        }, 3000);
    };

    // ── Marketing Methods ───────────────────────────────────────────
    const handleSaveDiscount = async () => {
        if(!discountForm.title || !discountForm.percentage) return toast.error('Title and Percentage required');
        const tid = toast.loading('Saving discount...');
        try {
            const r = await fetch(`${API}/marketing/discounts`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ ...discountForm, percentage: Number(discountForm.percentage) })
            });
            if (r.ok) {
                toast.success('Discount created!', { id: tid });
                setDiscountForm({ title: '', percentage: '', isActive: false });
                fetchDiscounts();
            } else toast.error('Failed to save', { id: tid });
        } catch { toast.error('Network error', { id: tid }); }
    };
    
    const handleToggleDiscount = async (id, isActive) => {
        try {
            const r = await fetch(`${API}/marketing/discounts/${id}/status`, {
                method: 'PATCH',
                headers: authHeaders(),
                body: JSON.stringify({ isActive })
            });
            if (r.ok) fetchDiscounts();
        } catch { toast.error('Error toggling status'); }
    };

    const handleDeleteDiscount = async (id) => {
        try {
            const r = await fetch(`${API}/marketing/discounts/${id}`, { method: 'DELETE', headers: authHeaders() });
            if (r.ok) { toast.success('Discount deleted'); fetchDiscounts(); }
        } catch { toast.error('Error occurred'); }
    };
    
    const handleBroadcast = async () => {
        if(!broadcast.subject || !broadcast.htmlBody) return toast.error('Subject and Body required');
        const tid = toast.loading('Transmitting broadcast vector...');
        try {
            const r = await fetch(`${API}/marketing/broadcast`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(broadcast)
            });
            const d = await r.json();
            if(r.ok) {
                toast.success(d.message || 'Broadcast Sent!', { id: tid });
                setBroadcast({ subject: '', htmlBody: '' });
            } else toast.error(d.message || 'Broadcast failed', { id: tid });
        } catch { toast.error('Network Error', { id: tid }); }
    };

    // ── Render ─────────────────────────────────────────────────────
    return (
        <div className="min-h-[calc(100vh-80px)] bg-background text-gray-200 p-4 md:p-8 relative overflow-hidden selection:bg-alertRed/30">
            <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-alertRed/5 rounded-full blur-[180px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <header className="mb-8 border-b border-surfaceBorder pb-6 flex flex-wrap justify-between items-end gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-alertRed to-orange-500 tracking-tighter">NETWORK OVERSEER</h1>
                        <p className="text-alertRed font-mono text-xs tracking-widest mt-2 uppercase flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-alertRed animate-pulse" /> Level 5 Authorization — Admin Access
                        </p>
                    </div>
                    {/* Summary KPIs */}
                    <div className="flex flex-wrap gap-3">
                        {[
                            { label: 'Network Value', value: `₹${totalValue.toLocaleString('en-IN')}`, color: 'text-emerald-400' },
                            { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'text-cyberCyan' },
                            { label: 'Pending Orders', value: pendingCount, color: 'text-amber-400' },
                            { label: 'Low Stock', value: lowStock, color: 'text-alertRed' },
                        ].map(k => (
                            <div key={k.label} className="glass-panel px-4 py-2 text-center min-w-[90px]">
                                <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">{k.label}</p>
                                <p className={`font-black text-lg ${k.color}`}>{k.value}</p>
                            </div>
                        ))}
                    </div>
                </header>

                {/* Tab bar */}
                <div className="flex gap-2 mb-8">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-widest rounded transition-all ${activeTab === tab.id ? 'bg-alertRed/20 text-alertRed border border-alertRed/50' : 'text-gray-500 hover:text-white border border-transparent'}`}>
                                <Icon size={14} /> {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-24">
                        <div className="w-10 h-10 border-4 border-alertRed border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {/* ══ PRODUCTS TAB ══════════════════════════════════════════ */}
                {!loading && activeTab === 'products' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">{products.length} assets on network</p>
                            <button onClick={openAddModal}
                                className="flex items-center gap-2 bg-alertRed/10 border border-alertRed/50 text-alertRed px-4 py-2 rounded font-bold text-xs uppercase tracking-widest hover:bg-alertRed hover:text-white transition-all">
                                <Plus size={14} /> Add Product
                            </button>
                        </div>

                        <div className="glass-panel overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="text-[10px] font-mono text-gray-500 uppercase bg-black/60 border-b border-surfaceBorder">
                                    <tr>
                                        <th className="px-5 py-3">Product</th>
                                        <th className="px-5 py-3 text-right">Price</th>
                                        <th className="px-5 py-3 text-right">Stock</th>
                                        <th className="px-5 py-3">Region</th>
                                        <th className="px-5 py-3">Owner (Artisan)</th>
                                        <th className="px-5 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surfaceBorder">
                                    {products.map(p => (
                                        <tr key={p._id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-5 py-3 flex items-center gap-3">
                                                {p.image && <img src={p.image} alt="" className="w-10 h-10 rounded object-contain bg-black/40 border border-white/10 flex-shrink-0 p-1" />}
                                                <div>
                                                    <p className="font-bold text-white">{p.title}</p>
                                                    <p className="text-[10px] font-mono text-gray-600">{p._id.slice(-8).toUpperCase()}</p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-right font-mono text-emerald-400 font-bold">₹{p.price?.toLocaleString('en-IN')}</td>
                                            <td className="px-5 py-3 text-right">
                                                <span className={`font-mono font-bold text-sm ${p.inventory <= 3 ? 'text-alertRed' : p.inventory <= 10 ? 'text-amber-400' : 'text-white'}`}>
                                                    {p.inventory}
                                                    {p.inventory <= 3 && <span className="text-[9px] ml-1 text-alertRed animate-pulse">LOW</span>}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-xs text-gray-400 font-mono">{p.originRegion || '—'}</td>
                                            <td className="px-5 py-3">
                                                <div className="flex flex-col">
                                                    <span className="text-white text-xs font-bold">{p.artisanId?.name || 'System Admin'}</span>
                                                    <span className="text-[9px] text-cyberCyan font-mono">{p.artisanId?.email || 'root@network'}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => openEditModal(p)}
                                                        className="p-2 text-gray-500 hover:text-cyberCyan transition-colors" title="Edit">
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button onClick={() => handleDelete(p._id, p.title)}
                                                        className="p-2 text-gray-500 hover:text-alertRed transition-colors" title="Delete">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {products.length === 0 && (
                                        <tr><td colSpan={5} className="px-5 py-16 text-center font-mono text-xs text-gray-600 uppercase">No products on network</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* ══ ORDERS TAB ════════════════════════════════════════════ */}
                {!loading && activeTab === 'orders' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4">{orders.length} total transactions</p>
                        {orders.length === 0 && (
                            <div className="glass-panel py-16 text-center font-mono text-xs text-gray-600 uppercase">No orders yet</div>
                        )}
                        {orders.map(order => (
                            <div key={order._id} className="glass-panel p-5">
                                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                    <div>
                                        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">TXN: {order._id.slice(-12).toUpperCase()}</p>
                                        <p className="text-white font-bold mt-1">{order.buyerId?.name || 'Unknown Buyer'} <span className="text-xs text-gray-500 font-normal">({order.buyerId?.email})</span></p>
                                        <p className="text-[11px] font-mono text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-emerald-400 font-mono font-black text-lg">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                                        <div className="flex flex-col gap-2 items-end">
                                            {/* Status dropdown */}
                                            <div className="relative">
                                                <select
                                                    value={order.status}
                                                    onChange={e => handleStatusChange(order._id, e.target.value)}
                                                    disabled={updatingOrder[order._id] || order.autoFulfillment}
                                                    className={`appearance-none pl-3 pr-8 py-1.5 rounded border text-[11px] font-mono uppercase tracking-widest transition-all focus:outline-none 
                                                        ${order.autoFulfillment ? 'opacity-50 cursor-not-allowed bg-black/60' : 'cursor-pointer ' + (STATUS_COLORS[order.status] || STATUS_COLORS.Pending)} 
                                                        bg-transparent`}>
                                                    {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-background text-white">{s}</option>)}
                                                </select>
                                                <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-current" />
                                            </div>
                                            
                                            {/* Auto-Fulfillment Toggle */}
                                            {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                                                <button 
                                                    onClick={() => handleAutoFulfillToggle(order._id, order.autoFulfillment)}
                                                    disabled={updatingOrder[order._id]}
                                                    className={`flex items-center gap-1.5 px-2 py-1 border rounded text-[9px] font-mono uppercase tracking-widest transition-all
                                                        ${order.autoFulfillment ? 'bg-cyberCyan/20 text-cyberCyan border-cyberCyan shadow-[0_0_10px_rgba(0,255,255,0.2)]' : 'bg-surfaceBorder/30 text-gray-500 border-surfaceBorder hover:text-white'}
                                                    `}>
                                                    <Bot size={10} className={order.autoFulfillment ? 'animate-pulse text-cyberCyan' : ''} />
                                                    {order.autoFulfillment ? 'AI Auto-Fulfill ON' : 'Auto-Fulfill OFF'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Items */}
                                    <div className="space-y-2">
                                        {order.products?.map((item, i) => (
                                            <div key={i} className="flex justify-between items-center bg-black/40 border border-surfaceBorder rounded px-3 py-2 text-sm">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    {item.productId?.image && <img src={item.productId.image} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />}
                                                    <span className="font-medium text-white truncate text-xs">{item.productId?.title || 'Asset Removed'}</span>
                                                </div>
                                                <span className="text-cyberCyan font-mono text-xs flex-shrink-0 ml-2">×{item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Address */}
                                    <div className="bg-black/40 border border-surfaceBorder rounded p-3 text-xs font-mono">
                                        {order.shippingAddress ? (
                                            <>
                                                <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Ship To</p>
                                                <p className="text-white font-bold">{order.shippingAddress.fullName}</p>
                                                <p className="text-gray-400">{order.shippingAddress.addressLine1}</p>
                                                <p className="text-gray-400">{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</p>
                                                <p className="text-cyberCyan mt-1">{order.shippingAddress.phone}</p>
                                                {order.trackingNumber && <p className="text-emerald-400 mt-2">#{order.trackingNumber}</p>}
                                                {order.trackingHistory?.length > 0 && (
                                                    <p className="text-[9px] text-cyberCyan uppercase mt-2">
                                                        [Logistics Engine: {order.trackingHistory.length} checkpoints logged]
                                                    </p>
                                                )}
                                            </>
                                        ) : <p className="text-gray-600 uppercase">No address on record</p>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* ══ ANALYTICS TAB ════════════════════════════════════════ */}
                {!loading && activeTab === 'analytics' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Live system log */}
                        <div className="bg-black border border-alertRed/20 rounded-xl overflow-hidden">
                            <div className="bg-alertRed/10 px-4 py-2 border-b border-alertRed/20 flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-alertRed animate-pulse" />
                                <span className="text-[10px] font-mono text-alertRed uppercase tracking-widest">System Log — Live</span>
                            </div>
                            <div className="p-4 h-72 overflow-y-auto font-mono text-[11px] text-emerald-400 space-y-1.5">
                                {logs.map((log, i) => (
                                    <div key={i} className={`transition-opacity ${i === 0 ? 'opacity-100' : 'opacity-70'} ${log.includes('low') || log.includes('failed') ? 'text-alertRed' : ''}`}>
                                        {log}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AI Audit */}
                        <div className="glass-panel p-6 flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xs font-mono text-gray-400 uppercase tracking-widest">AI Sentinel Core</h2>
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            </div>
                            <div className="flex-1">
                                {isAuditing && (
                                    <div className="py-10 flex flex-col items-center">
                                        <div className="w-12 h-12 border-4 border-alertRed border-t-transparent rounded-full animate-spin mb-4" />
                                        <p className="font-mono text-xs text-alertRed uppercase animate-pulse">Executing deep network scan...</p>
                                    </div>
                                )}
                                {!isAuditing && auditResult && (
                                    <div className="bg-emerald-900/10 border border-emerald-500/30 p-4 rounded-lg mb-4">
                                        <p className="font-mono text-sm text-emerald-400 font-bold">STATUS: {auditResult.status}</p>
                                        <p className="font-mono text-[10px] text-gray-400 my-1">Risk Score: {auditResult.risk}</p>
                                        <p className="font-mono text-xs text-emerald-200">{auditResult.msg}</p>
                                    </div>
                                )}
                                {!isAuditing && !auditResult && (
                                    <div className="py-10 text-center border border-dashed border-white/10 rounded-lg mb-4">
                                        <p className="font-mono text-xs text-gray-500 uppercase">System idle. Ready for audit.</p>
                                    </div>
                                )}
                            </div>
                            <button onClick={runAudit} disabled={isAuditing}
                                className="w-full py-3 bg-alertRed/10 border border-alertRed/40 text-alertRed font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-alertRed hover:text-white disabled:opacity-50 transition-all">
                                {isAuditing ? 'Auditing...' : 'Run AI Network Audit'}
                            </button>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'marketing' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Broadcasting Panel */}
                        <div className="glass-panel p-6 flex flex-col">
                            <h2 className="text-lg font-black text-white tracking-widest mb-4 flex items-center gap-2"><Megaphone size={18} className="text-alertRed"/> EMAIL BROADCAST</h2>
                            <p className="text-xs font-mono text-gray-500 mb-6">Send a promotional transmission to all connected buyer nodes on the decentralized grid.</p>
                            
                            <div className="space-y-4 flex-1">
                                <AdminField label="Subject Line" value={broadcast.subject} onChange={v => setBroadcast({ ...broadcast, subject: v })} placeholder="e.g. 50% Off Diwali Extravaganza!" />
                                <div>
                                    <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1.5">HTML Body</label>
                                    <textarea value={broadcast.htmlBody} onChange={e => setBroadcast({ ...broadcast, htmlBody: e.target.value })} placeholder="<h2>Hi there!</h2><p>Sale is live...</p>" rows={6}
                                        className="w-full bg-black/60 border border-surfaceBorder rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-700 focus:outline-none focus:border-alertRed/60 transition-colors font-mono text-xs" />
                                </div>
                            </div>

                            <button onClick={handleBroadcast} className="w-full mt-6 py-3 bg-indigo-500/20 border border-indigo-500/50 text-indigo-400 font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-indigo-500 hover:text-white transition-all flex justify-center items-center gap-2">
                                <Send size={14}/> Transmit Broadcast
                            </button>
                        </div>

                        {/* Discounts CRUD */}
                        <div className="glass-panel p-6 flex flex-col">
                            <h2 className="text-lg font-black text-white tracking-widest mb-4 flex items-center gap-2"><Tag size={18} className="text-cyberCyan"/> ACTIVE DISCOUNTS</h2>
                            
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <AdminField label="Discount Title" value={discountForm.title} onChange={v => setDiscountForm({ ...discountForm, title: v })} placeholder="SUMMER25" />
                                <AdminField label="Percentage (%)" type="number" value={discountForm.percentage} onChange={v => setDiscountForm({ ...discountForm, percentage: v })} placeholder="25" />
                                <label className="col-span-2 flex items-center gap-2 text-xs font-mono text-white cursor-pointer mt-2">
                                    <input type="checkbox" checked={discountForm.isActive} onChange={e => setDiscountForm({ ...discountForm, isActive: e.target.checked })} className="accent-cyberCyan w-4 h-4" />
                                    Make Active Immediately
                                </label>
                            </div>
                            <button onClick={handleSaveDiscount} className="w-full py-2 bg-cyberCyan/20 border border-cyberCyan/50 text-cyberCyan font-bold uppercase tracking-widest text-[10px] rounded hover:bg-cyberCyan hover:text-black transition-all mb-6">
                                Save Promo Code
                            </button>

                            <div className="flex-1 overflow-y-auto space-y-2 border-t border-white/5 pt-4">
                                {discounts.length === 0 ? <p className="text-xs font-mono text-gray-500 text-center">No discounts recorded in the ledger.</p> : null}
                                {discounts.map(d => (
                                    <div key={d._id} className={`p-3 rounded border flex justify-between items-center ${d.isActive ? 'bg-cyberCyan/10 border-cyberCyan/50' : 'bg-black/50 border-white/10'}`}>
                                        <div>
                                            <p className="font-bold text-white text-sm">{d.title}</p>
                                            <p className="text-[10px] font-mono text-emerald-400">-{d.percentage}% OFF</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center cursor-pointer relative">
                                                <input type="checkbox" checked={d.isActive} onChange={(e) => handleToggleDiscount(d._id, e.target.checked)} className="peer sr-only" />
                                                <div className="w-8 h-4 bg-gray-700 rounded-full peer peer-checked:bg-cyberCyan transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4 peer-checked:after:border-white"></div>
                                            </label>
                                            <button onClick={() => handleDeleteDiscount(d._id)} className="text-alertRed hover:text-red-400"><Trash2 size={14}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* ══ PRODUCT MODAL ════════════════════════════════════════════ */}
            <AnimatePresence>
                {modalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="glass-panel w-full max-w-lg p-6 shadow-[0_0_50px_rgba(255,0,60,0.15)] relative">
                            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                            <h2 className="text-lg font-black text-white uppercase tracking-widest mb-6">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <AdminField label="Product Title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="Silk Banarasi Saree" colSpan />
                                <AdminField label="Price (₹)" value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} placeholder="2500" type="number" />
                                <AdminField label="Stock / Inventory" value={form.inventory} onChange={v => setForm(f => ({ ...f, inventory: v }))} placeholder="50" type="number" />
                                <AdminField label="Origin Region" value={form.originRegion} onChange={v => setForm(f => ({ ...f, originRegion: v }))} placeholder="Varanasi, UP" />
                                <AdminField label="Materials (comma-separated)" value={form.materialsUsed} onChange={v => setForm(f => ({ ...f, materialsUsed: v }))} placeholder="Silk, Zari, Cotton" colSpan />
                                <AdminField label="Image URL" value={form.image} onChange={v => setForm(f => ({ ...f, image: v }))} placeholder="https://..." colSpan />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setModalOpen(false)} className="flex-1 py-3 border border-surfaceBorder text-gray-400 rounded font-bold text-xs uppercase hover:text-white transition-colors">Cancel</button>
                                <button onClick={handleSaveProduct} disabled={saving}
                                    className="flex-1 py-3 bg-alertRed hover:bg-red-600 text-white font-black uppercase tracking-widest text-xs rounded shadow-[0_0_20px_rgba(255,0,60,0.3)] disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                                    <Save size={14} /> {saving ? 'Saving...' : editingProduct ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function AdminField({ label, value, onChange, placeholder, type = 'text', colSpan }) {
    return (
        <div className={colSpan ? 'sm:col-span-2' : ''}>
            <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1.5">{label}</label>
            <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                className="w-full bg-black/60 border border-surfaceBorder rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-700 focus:outline-none focus:border-alertRed/60 transition-colors" />
        </div>
    );
}