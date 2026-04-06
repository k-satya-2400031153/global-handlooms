import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Megaphone, Tag, BarChart2, Send, Trash2, Users, ShoppingBag, TrendingUp, Mail, Zap, CheckCircle, XCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const TABS = [
    { id: 'analytics', label: 'Analytics',  icon: BarChart2  },
    { id: 'discounts', label: 'Discounts',  icon: Tag        },
    { id: 'broadcast', label: 'Broadcast',  icon: Megaphone  },
];

const STATUS_COLORS = {
    Pending:           { text: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.3)'  },
    Processing:        { text: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.3)'  },
    Shipped:           { text: '#00f5ff', bg: 'rgba(0,245,255,0.1)',   border: 'rgba(0,245,255,0.3)'   },
    'Out for Delivery':{ text: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.3)' },
    Delivered:         { text: '#4ade80', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.3)'  },
    Cancelled:         { text: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)' },
};

const getToken = () => localStorage.getItem('token');
const authH = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` });

export default function MarketingView() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('analytics');
    const [analytics, setAnalytics] = useState(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(true);
    const [discounts, setDiscounts] = useState([]);
    const [discForm, setDiscForm] = useState({ title: '', percentage: '', isActive: false });
    const [broadcast, setBroadcast] = useState({ subject: '', htmlBody: '' });
    const [sending, setSending] = useState(false);

    useEffect(() => {
        let user = {};
        try { const s = localStorage.getItem('user'); if (s) user = JSON.parse(s); } catch {}
        if (!['Marketing Specialist', 'Admin'].includes(user.role)) navigate('/');
    }, [navigate]);

    const fetchAnalytics = useCallback(async () => {
        setLoadingAnalytics(true);
        try {
            const r = await fetch(`${API}/marketing/analytics`, { headers: authH() });
            const d = await r.json();
            if (d.success) setAnalytics(d.data);
            else toast.error('Could not load analytics');
        } catch { toast.error('Network error'); }
        setLoadingAnalytics(false);
    }, []);

    const fetchDiscounts = useCallback(async () => {
        try {
            const r = await fetch(`${API}/marketing/discounts`, { headers: authH() });
            const d = await r.json();
            if (d.success) setDiscounts(d.data);
        } catch {}
    }, []);

    useEffect(() => { fetchAnalytics(); fetchDiscounts(); }, [fetchAnalytics, fetchDiscounts]);

    const handleSaveDiscount = async () => {
        if (!discForm.title || !discForm.percentage) return toast.error('Title and percentage are required');
        const tid = toast.loading('Deploying promo...');
        try {
            const r = await fetch(`${API}/marketing/discounts`, {
                method: 'POST', headers: authH(),
                body: JSON.stringify({ ...discForm, percentage: Number(discForm.percentage) })
            });
            if (r.ok) {
                toast.success('Promo deployed to network!', { id: tid });
                setDiscForm({ title: '', percentage: '', isActive: false });
                fetchDiscounts();
                fetchAnalytics();
            } else toast.error('Failed', { id: tid });
        } catch { toast.error('Network error', { id: tid }); }
    };

    const handleToggle = async (id, isActive) => {
        try {
            await fetch(`${API}/marketing/discounts/${id}/status`, {
                method: 'PATCH', headers: authH(), body: JSON.stringify({ isActive })
            });
            fetchDiscounts(); fetchAnalytics();
            toast.success(isActive ? 'Promo activated — prices updated live!' : 'Promo deactivated.');
        } catch { toast.error('Toggle failed'); }
    };

    const handleDeleteDiscount = async (id) => {
        const tid = toast.loading('Removing...');
        try {
            await fetch(`${API}/marketing/discounts/${id}`, { method: 'DELETE', headers: authH() });
            toast.success('Promo removed', { id: tid }); fetchDiscounts();
        } catch { toast.error('Error', { id: tid }); }
    };

    const handleBroadcast = async () => {
        if (!broadcast.subject || !broadcast.htmlBody) return toast.error('Subject and body are required');
        setSending(true);
        const tid = toast.loading('Transmitting to buyer nodes...');
        try {
            const r = await fetch(`${API}/marketing/broadcast`, {
                method: 'POST', headers: authH(), body: JSON.stringify(broadcast)
            });
            const d = await r.json();
            if (r.ok) { toast.success(d.message || 'Broadcast delivered!', { id: tid }); setBroadcast({ subject: '', htmlBody: '' }); }
            else toast.error(d.message || 'Failed', { id: tid });
        } catch { toast.error('Network error', { id: tid }); }
        setSending(false);
    };

    // ────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen text-gray-200 relative overflow-hidden" style={{ background: '#000010' }}>
            {/* Ambient orbs */}
            <div className="fixed top-[-10%] right-[-5%] w-[700px] h-[700px] rounded-full blur-[200px] pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)' }} />
            <div className="fixed bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full blur-[180px] pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)' }} />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[160px] pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(240,171,252,0.05) 0%, transparent 70%)' }} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">

                {/* ── HEADER ── */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <div className="flex flex-wrap justify-between items-start gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)', boxShadow: '0 0 30px rgba(236,72,153,0.4)' }}>
                                    <Megaphone size={20} className="text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
                                        <span className="text-[10px] font-mono text-pink-400 uppercase tracking-[0.3em]">Campaign HQ Active</span>
                                    </div>
                                    <h1 className="text-3xl font-black tracking-[-0.03em]"
                                        style={{ background: 'linear-gradient(90deg, #f0abfc, #ec4899, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                        Campaign Command
                                    </h1>
                                </div>
                            </div>
                            <p className="text-gray-600 font-mono text-[11px] uppercase tracking-widest ml-13">
                                Real-time marketing intelligence · Buyer engagement · Revenue ops
                            </p>
                        </div>

                        {/* KPI bento strip */}
                        {analytics && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                                className="flex flex-wrap gap-3">
                                {[
                                    { label: 'Buyers', value: analytics.totalBuyers, color: '#ec4899', icon: Users, glow: 'rgba(236,72,153,0.3)' },
                                    { label: 'Orders', value: analytics.totalOrders,  color: '#a855f7', icon: ShoppingBag, glow: 'rgba(168,85,247,0.3)' },
                                    { label: 'Revenue', value: `₹${analytics.totalRevenue.toLocaleString('en-IN')}`, color: '#4ade80', icon: TrendingUp, glow: 'rgba(74,222,128,0.3)' },
                                ].map((k, i) => {
                                    const Icon = k.icon;
                                    return (
                                        <motion.div key={k.label}
                                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 * i }}
                                            className="relative overflow-hidden px-5 py-3 text-center min-w-[110px] rounded-2xl"
                                            style={{ background: 'rgba(8,8,28,0.8)', border: `1px solid ${k.color}25`, boxShadow: `0 0 20px ${k.glow}20` }}>
                                            <div className="absolute top-0 left-0 right-0 h-[1px]"
                                                style={{ background: `linear-gradient(90deg, transparent, ${k.color}60, transparent)` }} />
                                            <Icon size={14} className="mx-auto mb-1" style={{ color: k.color }} />
                                            <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">{k.label}</p>
                                            <p className="font-black text-lg mt-0.5" style={{ color: k.color, textShadow: `0 0 15px ${k.glow}` }}>{k.value}</p>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="mt-8 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(236,72,153,0.3), rgba(168,85,247,0.3), transparent)' }} />
                </motion.div>

                {/* ── TAB BAR ── */}
                <div className="flex gap-2 mb-8">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <motion.button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                className="flex items-center gap-2 px-5 py-2.5 text-[11px] font-mono uppercase tracking-widest rounded-xl transition-all duration-300 relative overflow-hidden"
                                style={isActive ? {
                                    background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(168,85,247,0.15))',
                                    border: '1px solid rgba(236,72,153,0.4)',
                                    color: '#f0abfc',
                                    boxShadow: '0 0 20px rgba(236,72,153,0.15)',
                                } : {
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    color: '#6b7280',
                                }}>
                                {isActive && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/5 to-transparent" />}
                                <Icon size={13} /> <span className="relative">{tab.label}</span>
                            </motion.button>
                        );
                    })}
                </div>

                <AnimatePresence mode="wait">
                    {/* ══════════════════ ANALYTICS TAB ══════════════════ */}
                    {activeTab === 'analytics' && (
                        <motion.div key="analytics" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                            {loadingAnalytics ? (
                                <div className="flex flex-col items-center justify-center py-24 gap-4">
                                    <div className="relative w-16 h-16">
                                        <div className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
                                            style={{ borderTopColor: '#ec4899', borderRightColor: '#a855f7' }} />
                                        <div className="absolute inset-2 rounded-full border-2 border-transparent animate-spin" style={{ animationDirection: 'reverse', borderTopColor: '#f0abfc', animationDuration: '0.8s' }} />
                                    </div>
                                    <p className="font-mono text-xs text-pink-400 uppercase tracking-[0.3em] animate-pulse">Aggregating intelligence...</p>
                                </div>
                            ) : analytics ? (
                                <div className="space-y-8">
                                    {/* Top Products */}
                                    <section>
                                        <div className="flex items-center gap-2 mb-5">
                                            <TrendingUp size={16} style={{ color: '#ec4899' }} />
                                            <h2 className="text-sm font-black text-white uppercase tracking-widest">Top Products by Revenue</h2>
                                        </div>
                                        {analytics.topProducts.length === 0 ? (
                                            <div className="glass-card p-12 text-center">
                                                <BarChart2 size={36} className="mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.1)' }} />
                                                <p className="text-gray-600 font-mono text-xs uppercase tracking-widest">No revenue data yet.</p>
                                                <p className="text-gray-700 text-xs mt-1">Revenue analytics will populate once buyers start purchasing.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {analytics.topProducts.map((p, i) => {
                                                    const maxRev = analytics.topProducts[0]?.revenue || 1;
                                                    const pct = Math.round((p.revenue / maxRev) * 100);
                                                    const rankColors = ['#fbbf24', '#9ca3af', '#cd7c2e'];
                                                    const rankGlows = ['rgba(251,191,36,0.4)', 'rgba(156,163,175,0.4)', 'rgba(205,124,46,0.4)'];
                                                    return (
                                                        <motion.div key={i}
                                                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                                                            className="glow-card group relative">
                                                            <div className="card-shine" />
                                                            <div className="absolute top-0 left-0 right-0 h-px"
                                                                style={{ background: 'linear-gradient(90deg, transparent, rgba(236,72,153,0.5), transparent)', opacity: 0 }}
                                                                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                                                onMouseLeave={e => e.currentTarget.style.opacity = '0'} />
                                                            <div className="p-5">
                                                                <div className="flex justify-between items-start mb-3">
                                                                    <p className="text-white font-bold text-sm leading-snug flex-1 pr-2">{p.title}</p>
                                                                    <span className="text-[11px] font-black rounded-lg px-2 py-0.5 flex-shrink-0"
                                                                        style={{ color: rankColors[i] || '#6b7280', background: `${rankColors[i] || '#6b728020'}20`, border: `1px solid ${rankColors[i] || '#6b728040'}40`, boxShadow: i < 3 ? `0 0 10px ${rankGlows[i]}` : 'none' }}>
                                                                        #{i + 1}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[10px] font-mono text-gray-600 uppercase tracking-wider mb-3">{p.region}</p>
                                                                <div className="w-full h-1.5 rounded-full mb-3 overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                                                    <motion.div
                                                                        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.2, delay: i * 0.1 }}
                                                                        className="h-full rounded-full"
                                                                        style={{ background: 'linear-gradient(90deg, #ec4899, #a855f7)', boxShadow: '0 0 8px rgba(236,72,153,0.6)' }} />
                                                                </div>
                                                                <div className="flex justify-between text-[11px] font-mono">
                                                                    <span className="font-black" style={{ color: '#4ade80' }}>₹{Math.round(p.revenue).toLocaleString('en-IN')}</span>
                                                                    <span className="text-gray-600">{p.unitsSold} units · {p.buyers} buyer{p.buyers !== 1 ? 's' : ''}</span>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </section>

                                    {/* Recent Activity Table */}
                                    <section>
                                        <div className="flex items-center gap-2 mb-5">
                                            <Users size={16} style={{ color: '#a855f7' }} />
                                            <h2 className="text-sm font-black text-white uppercase tracking-widest">Recent Buyer Activity</h2>
                                        </div>
                                        {analytics.recentActivity.length === 0 ? (
                                            <div className="glass-card p-12 text-center">
                                                <Users size={36} className="mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.1)' }} />
                                                <p className="text-gray-600 font-mono text-xs uppercase tracking-widest">No orders placed yet.</p>
                                            </div>
                                        ) : (
                                            <div className="glass-card overflow-hidden">
                                                {/* Table header */}
                                                <div className="grid grid-cols-4 px-5 py-3 border-b text-[10px] font-mono text-gray-600 uppercase tracking-widest"
                                                    style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.3)' }}>
                                                    <span>Buyer</span>
                                                    <span className="col-span-2">Products</span>
                                                    <span className="text-right">Amount</span>
                                                </div>
                                                {/* Rows */}
                                                {analytics.recentActivity.map((order, i) => {
                                                    const sc = STATUS_COLORS[order.status] || { text: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.3)' };
                                                    return (
                                                        <motion.div key={i}
                                                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                                                            className="grid grid-cols-4 px-5 py-4 items-center transition-colors hover:bg-white/[0.02] border-b"
                                                            style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                                                            <div>
                                                                <p className="font-bold text-white text-xs">{order.buyerName}</p>
                                                                <p className="text-[10px] font-mono" style={{ color: '#ec4899' }}>{order.buyerEmail}</p>
                                                            </div>
                                                            <div className="col-span-2 flex items-center gap-2">
                                                                <span className="text-xs text-gray-400 font-mono truncate max-w-[180px]">{order.items}</span>
                                                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-lg flex-shrink-0 font-mono"
                                                                    style={{ color: sc.text, background: sc.bg, border: `1px solid ${sc.border}` }}>
                                                                    {order.status}
                                                                </span>
                                                            </div>
                                                            <div className="text-right font-black font-mono text-sm" style={{ color: '#4ade80' }}>
                                                                ₹{order.total?.toLocaleString('en-IN') || 0}
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </section>
                                </div>
                            ) : null}
                        </motion.div>
                    )}

                    {/* ══════════════════ DISCOUNTS TAB ══════════════════ */}
                    {activeTab === 'discounts' && (
                        <motion.div key="discounts" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Create form */}
                            <div className="glass-card p-6 relative overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-[2px]"
                                    style={{ background: 'linear-gradient(90deg, transparent, #ec4899, #a855f7, transparent)' }} />
                                <div className="flex items-center gap-2 mb-6">
                                    <Tag size={16} style={{ color: '#ec4899' }} />
                                    <h2 className="text-base font-black text-white">Deploy New Promo</h2>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em] mb-1.5">Promo Title</label>
                                        <input value={discForm.title} onChange={e => setDiscForm({ ...discForm, title: e.target.value })}
                                            placeholder="e.g. Diwali Mega Sale" className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-gray-700 outline-none transition-all"
                                            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
                                            onFocus={e => { e.target.style.border = '1px solid rgba(236,72,153,0.5)'; e.target.style.boxShadow = '0 0 20px rgba(236,72,153,0.1)'; }}
                                            onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em] mb-1.5">Discount % (1-99)</label>
                                        <input type="number" min="1" max="99" value={discForm.percentage} onChange={e => setDiscForm({ ...discForm, percentage: e.target.value })}
                                            placeholder="20"
                                            className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-gray-700 outline-none transition-all"
                                            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
                                            onFocus={e => { e.target.style.border = '1px solid rgba(236,72,153,0.5)'; e.target.style.boxShadow = '0 0 20px rgba(236,72,153,0.1)'; }}
                                            onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }} />
                                    </div>
                                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-white/[0.06] hover:border-pink-500/30 transition-colors">
                                        <input type="checkbox" checked={discForm.isActive} onChange={e => setDiscForm({ ...discForm, isActive: e.target.checked })}
                                            className="w-4 h-4 accent-pink-500" />
                                        <span className="text-xs font-mono text-gray-400">Activate immediately <span className="text-gray-600">(deactivates all others)</span></span>
                                    </label>
                                    <motion.button onClick={handleSaveDiscount}
                                        whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                                        className="w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest text-white relative overflow-hidden"
                                        style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)', boxShadow: '0 0 30px rgba(236,72,153,0.3)' }}>
                                        <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                                            animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }} />
                                        <span className="relative flex items-center justify-center gap-2"><Zap size={13} /> Deploy Promo</span>
                                    </motion.button>
                                </div>
                            </div>

                            {/* Discount list */}
                            <div className="glass-card p-6">
                                <h2 className="text-base font-black text-white mb-5 flex items-center gap-2">
                                    <Tag size={15} style={{ color: '#a855f7' }} /> Active Promos
                                </h2>
                                {discounts.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <Tag size={32} className="mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.08)' }} />
                                        <p className="text-gray-700 font-mono text-xs uppercase tracking-widest">No promos deployed.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 overflow-y-auto max-h-[340px]">
                                        {discounts.map((d, i) => (
                                            <motion.div key={d._id}
                                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                                                className="p-4 rounded-2xl flex justify-between items-center relative overflow-hidden"
                                                style={{
                                                    background: d.isActive ? 'rgba(236,72,153,0.08)' : 'rgba(0,0,0,0.4)',
                                                    border: d.isActive ? '1px solid rgba(236,72,153,0.4)' : '1px solid rgba(255,255,255,0.07)',
                                                    boxShadow: d.isActive ? '0 0 20px rgba(236,72,153,0.12)' : 'none',
                                                }}>
                                                {d.isActive && <div className="absolute top-0 left-0 right-0 h-[1px]"
                                                    style={{ background: 'linear-gradient(90deg, transparent, rgba(236,72,153,0.8), transparent)' }} />}
                                                <div className="flex-1 mr-3">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <p className="font-bold text-white text-sm">{d.title}</p>
                                                        {d.isActive && (
                                                            <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                                                                style={{ color: '#ec4899', background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.3)' }}>
                                                                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping" />LIVE
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] font-black font-mono" style={{ color: '#4ade80' }}>−{d.percentage}% OFF</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => handleToggle(d._id, !d.isActive)}
                                                        className="flex items-center justify-center w-8 h-8 rounded-full transition-all"
                                                        style={{ background: d.isActive ? 'rgba(236,72,153,0.15)' : 'rgba(255,255,255,0.05)' }}>
                                                        {d.isActive
                                                            ? <CheckCircle size={16} style={{ color: '#ec4899' }} />
                                                            : <XCircle size={16} style={{ color: '#4b5563' }} />}
                                                    </button>
                                                    <button onClick={() => handleDeleteDiscount(d._id)}
                                                        className="flex items-center justify-center w-8 h-8 rounded-full transition-all hover:bg-red-500/10"
                                                        style={{ color: '#6b7280' }}
                                                        onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                                                        onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* ══════════════════ BROADCAST TAB ══════════════════ */}
                    {activeTab === 'broadcast' && (
                        <motion.div key="broadcast" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                            className="max-w-2xl">
                            <div className="glass-card p-8 relative overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-[2px]"
                                    style={{ background: 'linear-gradient(90deg, transparent, #a855f7, #ec4899, transparent)' }} />

                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                        style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)', boxShadow: '0 0 20px rgba(236,72,153,0.4)' }}>
                                        <Megaphone size={18} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-white">Email Broadcast</h2>
                                        <p className="text-[11px] font-mono text-gray-600">Send styled campaign emails to all buyers</p>
                                    </div>
                                </div>

                                {/* Target count badge */}
                                <div className="flex items-center gap-3 my-6 p-4 rounded-2xl"
                                    style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)' }}>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{ background: 'rgba(168,85,247,0.2)' }}>
                                        <Mail size={14} style={{ color: '#a855f7' }} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Target Audience</p>
                                        <p className="text-sm font-black text-white">
                                            {analytics?.totalBuyers || 0} <span className="text-gray-500 font-normal text-xs">Registered Buyer{analytics?.totalBuyers !== 1 ? 's' : ''}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em] mb-1.5">Subject Line</label>
                                        <input value={broadcast.subject} onChange={e => setBroadcast({ ...broadcast, subject: e.target.value })}
                                            placeholder="e.g. 🔥 Diwali Flash Sale — 40% OFF Handlooms!"
                                            className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-gray-700 outline-none transition-all"
                                            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
                                            onFocus={e => { e.target.style.border = '1px solid rgba(168,85,247,0.5)'; e.target.style.boxShadow = '0 0 20px rgba(168,85,247,0.1)'; }}
                                            onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em] mb-1.5">HTML Email Body</label>
                                        <textarea value={broadcast.htmlBody} onChange={e => setBroadcast({ ...broadcast, htmlBody: e.target.value })}
                                            placeholder={"<h2 style='color:#ec4899'>🔥 Flash Sale!</h2>\n<p>Don't miss our <b>biggest sale</b> of the year on premium handlooms.</p>"}
                                            rows={8}
                                            className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-gray-700 outline-none transition-all font-mono text-xs leading-relaxed resize-none"
                                            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
                                            onFocus={e => { e.target.style.border = '1px solid rgba(168,85,247,0.4)'; e.target.style.boxShadow = '0 0 20px rgba(168,85,247,0.1)'; }}
                                            onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }} />
                                    </div>

                                    <motion.button onClick={handleBroadcast} disabled={sending}
                                        whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                                        className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest text-white relative overflow-hidden disabled:opacity-50"
                                        style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', boxShadow: '0 0 40px rgba(168,85,247,0.3), 0 0 80px rgba(236,72,153,0.15)' }}>
                                        <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12"
                                            animate={{ x: sending ? 0 : ['-100%', '200%'] }}
                                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }} />
                                        <span className="relative flex items-center justify-center gap-2">
                                            {sending ? (
                                                <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                                </svg> Transmitting...</>
                                            ) : (
                                                <><Send size={14} /> Broadcast to {analytics?.totalBuyers || 0} Buyers</>
                                            )}
                                        </span>
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}