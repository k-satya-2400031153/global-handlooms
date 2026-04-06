import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Megaphone, Tag, BarChart2, Send, Trash2, Users, ShoppingBag, TrendingUp, Mail } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;
const TABS = [
    { id: 'analytics', label: 'Analytics',  icon: BarChart2 },
    { id: 'discounts', label: 'Discounts',  icon: Tag },
    { id: 'broadcast', label: 'Broadcast',  icon: Megaphone },
];

const STATUS_COLORS = {
    Pending:           'text-amber-400 bg-amber-400/10',
    Processing:        'text-blue-400 bg-blue-400/10',
    Shipped:           'text-cyan-400 bg-cyan-400/10',
    'Out for Delivery': 'text-purple-400 bg-purple-400/10',
    Delivered:         'text-emerald-400 bg-emerald-400/10',
    Cancelled:         'text-red-400 bg-red-400/10',
};

const getToken = () => localStorage.getItem('token');
const authH = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` });

export default function MarketingView() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('analytics');

    // Analytics state
    const [analytics, setAnalytics] = useState(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(true);

    // Discounts state
    const [discounts, setDiscounts] = useState([]);
    const [discForm, setDiscForm] = useState({ title: '', percentage: '', isActive: false });

    // Broadcast state
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

    useEffect(() => {
        fetchAnalytics();
        fetchDiscounts();
    }, [fetchAnalytics, fetchDiscounts]);

    // ── Discount actions ─────────────────────────────────────────
    const handleSaveDiscount = async () => {
        if (!discForm.title || !discForm.percentage) return toast.error('Title and Percentage required');
        const tid = toast.loading('Saving...');
        try {
            const r = await fetch(`${API}/marketing/discounts`, {
                method: 'POST', headers: authH(),
                body: JSON.stringify({ ...discForm, percentage: Number(discForm.percentage) })
            });
            if (r.ok) { toast.success('Discount saved!', { id: tid }); setDiscForm({ title: '', percentage: '', isActive: false }); fetchDiscounts(); }
            else toast.error('Failed', { id: tid });
        } catch { toast.error('Network error', { id: tid }); }
    };

    const handleToggle = async (id, isActive) => {
        try {
            await fetch(`${API}/marketing/discounts/${id}/status`, {
                method: 'PATCH', headers: authH(), body: JSON.stringify({ isActive })
            });
            fetchDiscounts();
            fetchAnalytics(); // prices may change
        } catch { toast.error('Toggle failed'); }
    };

    const handleDeleteDiscount = async (id) => {
        try {
            await fetch(`${API}/marketing/discounts/${id}`, { method: 'DELETE', headers: authH() });
            toast.success('Deleted'); fetchDiscounts();
        } catch { toast.error('Error'); }
    };

    // ── Broadcast ─────────────────────────────────────────────────
    const handleBroadcast = async () => {
        if (!broadcast.subject || !broadcast.htmlBody) return toast.error('Subject and Body required');
        setSending(true);
        const tid = toast.loading('Transmitting to buyer nodes...');
        try {
            const r = await fetch(`${API}/marketing/broadcast`, {
                method: 'POST', headers: authH(), body: JSON.stringify(broadcast)
            });
            const d = await r.json();
            if (r.ok) { toast.success(d.message || 'Broadcast sent!', { id: tid }); setBroadcast({ subject: '', htmlBody: '' }); }
            else toast.error(d.message || 'Failed', { id: tid });
        } catch { toast.error('Network error', { id: tid }); }
        setSending(false);
    };

    // ── Render ────────────────────────────────────────────────────
    return (
        <div className="min-h-[calc(100vh-80px)] bg-background text-gray-200 p-4 md:p-8 relative overflow-hidden selection:bg-pink-500/30">
            <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-pink-900/10 rounded-full blur-[180px] pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-fuchsia-900/10 rounded-full blur-[150px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <header className="mb-8 border-b border-surfaceBorder pb-6 flex flex-wrap justify-between items-end gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-fuchsia-500 tracking-tighter">CAMPAIGN COMMAND</h1>
                        <p className="text-pink-500 font-mono text-xs tracking-widest mt-2 uppercase flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                            Marketing Intelligence Active
                        </p>
                    </div>
                    {/* KPI row */}
                    {analytics && (
                        <div className="flex flex-wrap gap-3">
                            {[
                                { label: 'Registered Buyers', value: analytics.totalBuyers, color: 'text-pink-400', icon: Users },
                                { label: 'Total Orders', value: analytics.totalOrders, color: 'text-fuchsia-400', icon: ShoppingBag },
                                { label: 'Delivered Revenue', value: `₹${analytics.totalRevenue.toLocaleString('en-IN')}`, color: 'text-emerald-400', icon: TrendingUp },
                            ].map(k => {
                                const Icon = k.icon;
                                return (
                                    <div key={k.label} className="glass-panel px-4 py-2 text-center min-w-[110px] flex flex-col items-center">
                                        <Icon size={14} className={`${k.color} mb-1`} />
                                        <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">{k.label}</p>
                                        <p className={`font-black text-lg ${k.color}`}>{k.value}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </header>

                {/* Tab Bar */}
                <div className="flex gap-2 mb-8">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-widest rounded transition-all ${activeTab === tab.id ? 'bg-pink-500/20 text-pink-400 border border-pink-500/50' : 'text-gray-500 hover:text-white border border-transparent'}`}>
                                <Icon size={14} /> {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* ── ANALYTICS TAB ────────────────────────────────────── */}
                {activeTab === 'analytics' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        {loadingAnalytics ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="font-mono text-xs text-pink-400 uppercase animate-pulse">Aggregating buyer intelligence...</p>
                            </div>
                        ) : analytics ? (
                            <div className="space-y-8">
                                {/* Top Products by Revenue */}
                                <section>
                                    <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <TrendingUp size={14} className="text-pink-400" /> Top Products by Revenue
                                    </h2>
                                    {analytics.topProducts.length === 0 ? (
                                        <div className="glass-panel p-8 text-center text-gray-500 font-mono text-xs">No order data yet. Revenue analytics will populate here once buyers start purchasing.</div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {analytics.topProducts.map((p, i) => {
                                                const maxRev = analytics.topProducts[0]?.revenue || 1;
                                                const pct = Math.round((p.revenue / maxRev) * 100);
                                                return (
                                                    <div key={i} className="glass-panel p-5 hover:border-pink-500/40 transition-colors">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <p className="text-white font-bold text-sm leading-snug flex-1 pr-2">{p.title}</p>
                                                            <span className="text-[9px] font-mono bg-pink-900/30 text-pink-400 border border-pink-500/30 px-2 py-0.5 rounded flex-shrink-0">#{i + 1}</span>
                                                        </div>
                                                        <div className="w-full bg-black/60 h-1.5 rounded-full mb-3 overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${pct}%` }}
                                                                transition={{ duration: 1, delay: i * 0.1 }}
                                                                className="h-full bg-gradient-to-r from-pink-500 to-fuchsia-500 rounded-full shadow-[0_0_8px_rgba(236,72,153,0.6)]"
                                                            />
                                                        </div>
                                                        <div className="flex justify-between text-[10px] font-mono">
                                                            <span className="text-emerald-400 font-bold">₹{p.revenue.toLocaleString('en-IN')}</span>
                                                            <span className="text-gray-500">{p.unitsSold} units · {p.buyers} buyer{p.buyers !== 1 ? 's' : ''}</span>
                                                        </div>
                                                        <p className="text-[9px] font-mono text-gray-600 mt-1 uppercase tracking-wider">{p.region}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </section>

                                {/* Recent Buyer Activity */}
                                <section>
                                    <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Users size={14} className="text-fuchsia-400" /> Recent Buyer Activity
                                    </h2>
                                    {analytics.recentActivity.length === 0 ? (
                                        <div className="glass-panel p-8 text-center text-gray-500 font-mono text-xs">No orders placed yet.</div>
                                    ) : (
                                        <div className="glass-panel overflow-hidden">
                                            <table className="w-full text-left text-sm">
                                                <thead className="text-[10px] font-mono text-gray-500 uppercase bg-black/60 border-b border-surfaceBorder">
                                                    <tr>
                                                        <th className="px-5 py-3">Buyer</th>
                                                        <th className="px-5 py-3">Products Purchased</th>
                                                        <th className="px-5 py-3">Status</th>
                                                        <th className="px-5 py-3 text-right">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-surfaceBorder">
                                                    {analytics.recentActivity.map((order, i) => (
                                                        <tr key={i} className="hover:bg-white/5 transition-colors">
                                                            <td className="px-5 py-3">
                                                                <p className="font-bold text-white text-xs">{order.buyerName}</p>
                                                                <p className="text-[10px] font-mono text-pink-400">{order.buyerEmail}</p>
                                                            </td>
                                                            <td className="px-5 py-3 text-xs text-gray-400 font-mono max-w-[200px] truncate">{order.items}</td>
                                                            <td className="px-5 py-3">
                                                                <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded font-mono ${STATUS_COLORS[order.status] || 'text-gray-400 bg-gray-400/10'}`}>
                                                                    {order.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-3 text-right font-mono text-emerald-400 font-bold text-xs">₹{order.total?.toLocaleString('en-IN') || 0}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </section>
                            </div>
                        ) : null}
                    </motion.div>
                )}

                {/* ── DISCOUNTS TAB ───────────────────────────────────── */}
                {activeTab === 'discounts' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Create form */}
                        <div className="glass-panel p-6">
                            <h2 className="text-lg font-black text-white mb-5 flex items-center gap-2"><Tag size={16} className="text-cyberCyan" /> New Promo Code</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">Discount Title</label>
                                    <input value={discForm.title} onChange={e => setDiscForm({ ...discForm, title: e.target.value })} placeholder="e.g. Diwali Sale is LIVE!" className="w-full bg-black/60 border border-surfaceBorder rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-700 focus:outline-none focus:border-pink-500/60 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">Discount Percentage</label>
                                    <input type="number" value={discForm.percentage} onChange={e => setDiscForm({ ...discForm, percentage: e.target.value })} placeholder="e.g. 20" className="w-full bg-black/60 border border-surfaceBorder rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-700 focus:outline-none focus:border-pink-500/60 transition-colors" />
                                </div>
                                <label className="flex items-center gap-2 text-xs font-mono text-white cursor-pointer">
                                    <input type="checkbox" checked={discForm.isActive} onChange={e => setDiscForm({ ...discForm, isActive: e.target.checked })} className="accent-pink-500 w-4 h-4" />
                                    Activate immediately (deactivates others)
                                </label>
                                <button onClick={handleSaveDiscount} className="w-full py-3 bg-pink-500/20 border border-pink-500/50 text-pink-400 font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-pink-500 hover:text-white transition-all flex items-center justify-center gap-2">
                                    <Tag size={13} /> Save Promo Code
                                </button>
                            </div>
                        </div>

                        {/* Existing discounts list */}
                        <div className="glass-panel p-6">
                            <h2 className="text-lg font-black text-white mb-5">All Discounts</h2>
                            {discounts.length === 0 ? (
                                <p className="text-xs font-mono text-gray-500 text-center py-12">No discounts in the ledger.</p>
                            ) : (
                                <div className="space-y-3 overflow-y-auto max-h-80">
                                    {discounts.map(d => (
                                        <div key={d._id} className={`p-4 rounded-lg border flex justify-between items-center ${d.isActive ? 'bg-pink-500/10 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.1)]' : 'bg-black/50 border-white/10'}`}>
                                            <div>
                                                <p className="font-bold text-white">{d.title}</p>
                                                <p className="text-[10px] font-mono text-emerald-400">-{d.percentage}% OFF</p>
                                                {d.isActive && <span className="text-[9px] font-black text-pink-400 uppercase tracking-widest">● LIVE</span>}
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <label className="flex items-center cursor-pointer relative">
                                                    <input type="checkbox" checked={d.isActive} onChange={e => handleToggle(d._id, e.target.checked)} className="peer sr-only" />
                                                    <div className="w-9 h-5 bg-gray-700 rounded-full peer peer-checked:bg-pink-500 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                                                </label>
                                                <button onClick={() => handleDeleteDiscount(d._id)} className="text-alertRed hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ── BROADCAST TAB ───────────────────────────────────── */}
                {activeTab === 'broadcast' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
                        <div className="glass-panel p-6">
                            <h2 className="text-lg font-black text-white mb-2 flex items-center gap-2"><Megaphone size={16} className="text-pink-400" /> Email Broadcast</h2>
                            <p className="text-xs font-mono text-gray-500 mb-6">Send a styled promotional email to all registered Buyers on the decentralized network.</p>

                            <div className="flex items-center gap-3 mb-6 p-3 bg-fuchsia-900/20 border border-fuchsia-500/30 rounded-lg">
                                <Mail size={14} className="text-fuchsia-400 flex-shrink-0" />
                                <p className="text-xs font-mono text-fuchsia-300">
                                    Targeting: <strong>{analytics?.totalBuyers || '...'}</strong> registered buyer node{analytics?.totalBuyers !== 1 ? 's' : ''}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">Subject Line</label>
                                    <input value={broadcast.subject} onChange={e => setBroadcast({ ...broadcast, subject: e.target.value })} placeholder="e.g. 50% Off Diwali Extravaganza — Shop Now!" className="w-full bg-black/60 border border-surfaceBorder rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-700 focus:outline-none focus:border-pink-500/60 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">HTML Email Body</label>
                                    <textarea value={broadcast.htmlBody} onChange={e => setBroadcast({ ...broadcast, htmlBody: e.target.value })} placeholder={"<h2 style='color:#00f0ff'>🔥 Flash Sale!</h2>\n<p>Don't miss <b>huge discounts</b> on our premium handlooms.</p>"} rows={8}
                                        className="w-full bg-black/60 border border-surfaceBorder rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-700 focus:outline-none focus:border-pink-500/60 transition-colors font-mono text-xs" />
                                </div>

                                <button onClick={handleBroadcast} disabled={sending} className="w-full py-4 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white font-black uppercase tracking-widest text-xs rounded-lg hover:from-pink-400 hover:to-fuchsia-500 disabled:opacity-50 transition-all shadow-[0_0_25px_rgba(236,72,153,0.3)] flex justify-center items-center gap-2">
                                    <Send size={14} />
                                    {sending ? 'Transmitting to Network...' : `Broadcast to ${analytics?.totalBuyers || 0} Buyers`}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}