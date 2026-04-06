import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { User, Package, MapPin, Plus, Trash2, Edit2, Check, X, ChevronRight, Clock, Shield, Zap } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem('token');
const authH = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` });

const STATUS_COLORS = {
    Pending: { text: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
    Processing: { text: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
    Shipped: { text: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/30' },
    'Out for Delivery': { text: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
    Delivered: { text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30' },
    Cancelled: { text: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
};

const STEPS = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

const ROLE_CONFIG = {
    Buyer: { color: '#00f5ff', glow: 'rgba(0,245,255,0.5)', label: 'Buyer Node' },
    Artisan: { color: '#a855f7', glow: 'rgba(168,85,247,0.5)', label: 'Creator Node' },
    Admin: { color: '#ff003c', glow: 'rgba(255,0,60,0.5)', label: 'Overseer Node' },
    'Marketing Specialist': { color: '#f0abfc', glow: 'rgba(240,171,252,0.5)', label: 'Campaign Node' },
};

const EMPTY_ADDR = { label: 'Home', fullName: '', phone: '', addressLine1: '', city: '', state: '', pincode: '' };

export default function ProfilePage() {
    const navigate = useNavigate();
    const [tab, setTab] = useState('info');
    const [profile, setProfile] = useState(null);
    const [orders, setOrders] = useState([]);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', phone: '' });
    const [addrModal, setAddrModal] = useState(false);
    const [addrForm, setAddrForm] = useState(EMPTY_ADDR);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let user = {};
        try { const s = localStorage.getItem('user'); if (s) user = JSON.parse(s); } catch {}
        if (!user || !getToken()) navigate('/login');
    }, [navigate]);

    const fetchProfile = useCallback(async () => {
        try {
            const r = await fetch(`${API}/user/me`, { headers: authH() });
            const d = await r.json();
            if (d.success) { setProfile(d.data); setEditForm({ name: d.data.name || '', phone: d.data.phone || '' }); }
        } catch { toast.error('Failed to load profile'); }
    }, []);

    const fetchOrders = useCallback(async () => {
        try {
            const r = await fetch(`${API}/user/orders`, { headers: authH() });
            const d = await r.json();
            if (d.success) setOrders(d.data);
        } catch { toast.error('Failed to load orders'); }
    }, []);

    useEffect(() => { fetchProfile(); fetchOrders(); }, [fetchProfile, fetchOrders]);

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const r = await fetch(`${API}/user/me`, { method: 'PUT', headers: authH(), body: JSON.stringify(editForm) });
            const d = await r.json();
            if (d.success) {
                setProfile(d.data);
                const stored = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({ ...stored, name: d.data.name }));
                setEditing(false);
                toast.success('Profile updated!');
            } else toast.error(d.message || 'Update failed');
        } catch { toast.error('Network error'); }
        setSaving(false);
    };

    const handleAddAddress = async () => {
        if (!addrForm.addressLine1 || !addrForm.city || !addrForm.pincode) return toast.error('Address, city and pincode are required');
        setSaving(true);
        try {
            const r = await fetch(`${API}/user/address`, { method: 'POST', headers: authH(), body: JSON.stringify(addrForm) });
            const d = await r.json();
            if (d.success) { setProfile(prev => ({ ...prev, savedAddresses: d.data })); setAddrModal(false); setAddrForm(EMPTY_ADDR); toast.success('Address saved!'); }
        } catch { toast.error('Network error'); }
        setSaving(false);
    };

    const handleDeleteAddress = async (addrId) => {
        try {
            const r = await fetch(`${API}/user/address/${addrId}`, { method: 'DELETE', headers: authH() });
            const d = await r.json();
            if (d.success) { setProfile(prev => ({ ...prev, savedAddresses: d.data })); toast.success('Address removed'); }
        } catch { toast.error('Error'); }
    };

    if (!profile) return (
        <div className="flex items-center justify-center min-h-screen" style={{ background: '#000010' }}>
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-[#00f5ff]/30 border-t-[#00f5ff] rounded-full animate-spin" />
                <p className="text-[10px] font-mono text-gray-700 uppercase tracking-widest">Loading profile...</p>
            </div>
        </div>
    );

    const rc = ROLE_CONFIG[profile.role] || ROLE_CONFIG['Buyer'];
    const TABS = [
        { id: 'info',      label: 'Account',  icon: User },
        { id: 'orders',    label: `Orders (${orders.length})`, icon: Package },
        ...(profile.role === 'Buyer' ? [{ id: 'addresses', label: 'Addresses', icon: MapPin }] : []),
    ];

    return (
        <div className="min-h-screen text-gray-200 relative overflow-hidden" style={{ background: '#000010' }}>
            {/* Ambient orbs */}
            <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${rc.color}12 0%, transparent 70%)`, filter: 'blur(100px)', animation: 'float 14s ease-in-out infinite' }} />
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)', filter: 'blur(80px)', animation: 'float 10s 2s ease-in-out infinite' }} />

            <div className="max-w-5xl mx-auto px-4 py-8 relative z-10">

                {/* ── PROFILE HERO ── */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="glass-card p-6 md:p-8 relative overflow-hidden">
                        {/* Rainbow top line */}
                        <div className="absolute top-0 left-0 right-0 h-[2px]"
                            style={{ background: `linear-gradient(90deg, transparent, ${rc.color}80, ${rc.color}, transparent)`, animation: 'borderFlow 3s linear infinite' }} />

                        {/* BG glow */}
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full pointer-events-none"
                            style={{ background: `radial-gradient(circle, ${rc.color}10, transparent 70%)`, filter: 'blur(60px)' }} />

                        <div className="flex flex-wrap items-center justify-between gap-6 relative">
                            <div className="flex items-center gap-5">
                                {/* Avatar */}
                                <motion.div whileHover={{ scale: 1.06 }}
                                    className="avatar-glow w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-black flex-shrink-0"
                                    style={{ background: `linear-gradient(135deg, ${rc.color}, #a855f7)`, boxShadow: `0 0 0 3px ${rc.color}20, 0 0 30px ${rc.glow}, 0 0 60px ${rc.color}15` }}>
                                    {profile.name?.charAt(0).toUpperCase()}
                                </motion.div>

                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: rc.color, boxShadow: `0 0 6px ${rc.color}` }} />
                                        <span className="text-[9px] font-mono uppercase tracking-[0.3em]" style={{ color: rc.color }}>{rc.label}</span>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-black tracking-[-0.03em] text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                                        {profile.name}
                                    </h1>
                                    <p className="text-gray-500 text-sm font-mono mt-1">{profile.email}</p>
                                </div>
                            </div>

                            {/* Stats strip */}
                            <div className="flex gap-3 flex-wrap">
                                {[
                                    { label: 'Orders', value: orders.length, color: rc.color },
                                    { label: 'Addresses', value: (profile.savedAddresses || []).length, color: '#a855f7' },
                                    { label: 'Member Since', value: new Date(profile.createdAt).getFullYear(), color: '#fbbf24' },
                                ].map(stat => (
                                    <div key={stat.label} className="glass-card px-4 py-3 text-center min-w-[80px]" style={{ borderRadius: '16px' }}>
                                        <p className="font-black text-xl font-mono" style={{ color: stat.color }}>{stat.value}</p>
                                        <p className="text-[9px] font-mono text-gray-600 uppercase tracking-wider mt-0.5">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tab row */}
                        <div className="flex gap-1.5 mt-8 pt-6 border-t border-white/[0.05] overflow-x-auto hide-scrollbar">
                            {TABS.map(t => {
                                const Icon = t.icon;
                                return (
                                    <button key={t.id} onClick={() => setTab(t.id)}
                                        className={`flex items-center gap-2 px-4 py-2.5 text-[11px] font-mono uppercase tracking-widest rounded-xl transition-all whitespace-nowrap border
                                            ${tab === t.id
                                                ? 'border-[rgba(0,245,255,0.3)] text-[#00f5ff] bg-[rgba(0,245,255,0.08)] shadow-[0_0_15px_rgba(0,245,255,0.1)]'
                                                : 'border-transparent text-gray-500 hover:text-white'}`}>
                                        <Icon size={13} />
                                        {t.label}
                                    </button>
                                );
                            })}

                            {profile.role === 'Buyer' && (
                                <Link to="/buyer" className="ml-auto flex items-center gap-2 px-4 py-2.5 text-[11px] font-mono uppercase tracking-widest rounded-xl border border-white/[0.08] text-gray-500 hover:text-white hover:border-white/20 transition-all whitespace-nowrap">
                                    Market <ChevronRight size={11} />
                                </Link>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* ── ACCOUNT INFO TAB ── */}
                <AnimatePresence mode="wait">
                    {tab === 'info' && (
                        <motion.div key="info" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* Profile details card */}
                                <div className="glass-card p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest">Profile Details</h2>
                                        {!editing ? (
                                            <button onClick={() => setEditing(true)}
                                                className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-xl border border-[#00f5ff]/30 text-[#00f5ff] bg-[#00f5ff]/05 hover:bg-[#00f5ff]/10 transition-colors">
                                                <Edit2 size={10} /> Edit
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button onClick={handleSaveProfile} disabled={saving}
                                                    className="flex items-center gap-1.5 text-[10px] font-mono uppercase px-3 py-1.5 rounded-xl border border-emerald-400/40 text-emerald-400 hover:bg-emerald-400/10 transition-colors disabled:opacity-50">
                                                    <Check size={10} /> {saving ? '…' : 'Save'}
                                                </button>
                                                <button onClick={() => setEditing(false)}
                                                    className="flex items-center gap-1.5 text-[10px] font-mono uppercase px-3 py-1.5 rounded-xl border border-white/10 text-gray-500 hover:text-white transition-colors">
                                                    <X size={10} /> Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-5">
                                        {[
                                            { label: 'Full Name', key: 'name', editable: true },
                                            { label: 'Email Address', value: profile.email, editable: false },
                                            { label: 'Phone Number', key: 'phone', editable: true, placeholder: '+91 XXXXX XXXXX' },
                                            { label: 'Role', value: profile.role, editable: false },
                                        ].map(field => (
                                            <div key={field.label}>
                                                <label className="block text-[9px] font-mono text-gray-600 uppercase tracking-[0.2em] mb-1.5">{field.label}</label>
                                                {editing && field.editable ? (
                                                    <input value={editForm[field.key] || ''}
                                                        onChange={e => setEditForm({ ...editForm, [field.key]: e.target.value })}
                                                        placeholder={field.placeholder || ''}
                                                        className="w-full bg-black/50 border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f5ff]/40 transition-colors font-mono" />
                                                ) : (
                                                    <p className="text-white font-semibold text-sm">{field.value || editForm[field.key] || <span className="text-gray-700 italic text-xs font-normal">Not set</span>}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Account status card */}
                                <div className="glass-card p-6">
                                    <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-6">Node Status</h2>
                                    <div className="space-y-4">
                                        {[
                                            { icon: Shield, label: 'Account Security', value: 'OTP Verified', color: '#4ade80' },
                                            { icon: Zap, label: 'Network Access', value: profile.role, color: rc.color },
                                            { icon: User, label: 'Member Since', value: new Date(profile.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), color: '#fbbf24' },
                                            { icon: Package, label: 'Total Orders', value: `${orders.length} transactions`, color: '#a855f7' },
                                        ].map(item => {
                                            const Icon = item.icon;
                                            return (
                                                <div key={item.label} className="flex items-center gap-4 p-3 bg-black/30 border border-white/[0.04] rounded-xl">
                                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                                        style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}>
                                                        <Icon size={14} style={{ color: item.color }} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-mono text-gray-600 uppercase tracking-wider">{item.label}</p>
                                                        <p className="text-sm font-bold text-white mt-0.5">{item.value}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── ORDER HISTORY TAB ── */}
                    {tab === 'orders' && (
                        <motion.div key="orders" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                            {orders.length === 0 ? (
                                <div className="glass-card p-16 text-center">
                                    <Package size={40} className="mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.1)' }} />
                                    <p className="text-gray-600 font-mono text-xs uppercase tracking-widest">No orders yet.</p>
                                    <Link to="/buyer" className="inline-block mt-4 text-[#00f5ff] text-xs font-mono uppercase tracking-widest hover:underline">Browse Market →</Link>
                                </div>
                            ) : orders.map(order => {
                                const stepIndex = STEPS.indexOf(order.status);
                                const sc = STATUS_COLORS[order.status] || STATUS_COLORS['Pending'];
                                return (
                                    <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        className="glass-card p-5 relative overflow-hidden">
                                        {/* Status color line */}
                                        <div className={`absolute top-0 left-0 right-0 h-[2px] ${sc.bg.replace('/10', '')}`}
                                            style={{ opacity: 0.7 }} />

                                        <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                                            <div>
                                                <p className="font-mono text-[9px] text-gray-700 mb-1">TXN / {order._id.slice(-8).toUpperCase()}</p>
                                                <p className="text-white font-bold text-sm leading-snug">
                                                    {order.products.map(p => p.productId?.title || 'Item').join(', ')}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-xl border ${sc.text} ${sc.bg} ${sc.border}`}>
                                                    {order.status}
                                                </span>
                                                <span className="text-emerald-400 font-black font-mono">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>

                                        {/* Tracking dots */}
                                        <div className="flex items-center gap-0">
                                            {STEPS.map((step, i) => {
                                                const done = i <= stepIndex;
                                                const current = i === stepIndex;
                                                return (
                                                    <React.Fragment key={step}>
                                                        <div className="flex flex-col items-center flex-shrink-0">
                                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border transition-all
                                                                ${done ? 'border-[#00f5ff] bg-[#00f5ff] text-black shadow-[0_0_10px_rgba(0,245,255,0.5)]' : 'bg-black/60 border-white/15 text-gray-700'}
                                                                ${current ? 'scale-110' : ''}`}>
                                                                {done ? '✓' : i + 1}
                                                            </div>
                                                            <p className={`text-[8px] font-mono mt-1 text-center w-14 leading-tight ${done ? 'text-[#00f5ff]' : 'text-gray-700'}`}>{step}</p>
                                                        </div>
                                                        {i < STEPS.length - 1 && (
                                                            <div className={`flex-1 h-px mx-1 ${i < stepIndex ? 'bg-[#00f5ff] shadow-[0_0_4px_rgba(0,245,255,0.4)]' : 'bg-white/[0.06]'}`} />
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </div>

                                        {order.trackingHistory?.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center gap-2 text-[10px] font-mono text-gray-600">
                                                <Clock size={10} style={{ color: '#00f5ff' }} />
                                                <span style={{ color: '#00f5ff' }}>{order.trackingHistory[order.trackingHistory.length - 1].location}</span>
                                                <span>·</span>
                                                <span>{new Date(order.trackingHistory[order.trackingHistory.length - 1].timestamp).toLocaleString('en-IN')}</span>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}

                    {/* ── ADDRESS BOOK TAB ── */}
                    {tab === 'addresses' && (
                        <motion.div key="addresses" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest">Address Book</h2>
                                <button onClick={() => setAddrModal(true)}
                                    className="flex items-center gap-2 text-[10px] font-mono text-[#00f5ff] border border-[#00f5ff]/30 bg-[#00f5ff]/05 px-4 py-2 rounded-xl hover:bg-[#00f5ff]/15 transition-all uppercase tracking-wider">
                                    <Plus size={11} /> Add Address
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {(profile.savedAddresses || []).length === 0 ? (
                                    <div className="glass-card p-10 text-center col-span-2">
                                        <MapPin size={32} className="mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.1)' }} />
                                        <p className="text-gray-600 font-mono text-xs uppercase tracking-widest">No saved addresses</p>
                                    </div>
                                ) : (profile.savedAddresses || []).map(addr => (
                                    <motion.div key={addr._id} whileHover={{ y: -3 }}
                                        className="glass-card p-5 relative group">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg"
                                                style={{ color: '#00f5ff', background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.25)' }}>
                                                📍 {addr.label}
                                            </span>
                                            <button onClick={() => handleDeleteAddress(addr._id)}
                                                className="text-red-400/40 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                        <p className="text-white font-bold text-sm">{addr.fullName}</p>
                                        <p className="text-gray-500 text-xs font-mono mt-1">{addr.phone}</p>
                                        <p className="text-gray-400 text-xs mt-2 leading-relaxed">{addr.addressLine1}, {addr.city}, {addr.state} — {addr.pincode}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── ADD ADDRESS MODAL ── */}
            <AnimatePresence>
                {addrModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,16,0.8)', backdropFilter: 'blur(16px)' }}>
                        <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
                            className="glass-card w-full max-w-md p-6 relative"
                            style={{ boxShadow: '0 0 60px rgba(0,245,255,0.08), 0 0 120px rgba(168,85,247,0.06)' }}>
                            {/* Prism top line */}
                            <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-3xl"
                                style={{ background: 'linear-gradient(90deg, #00f5ff, #a855f7, #ec4899)', animation: 'borderFlow 3s linear infinite' }} />

                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-lg font-black text-white uppercase tracking-wide">New Address</h2>
                                <button onClick={() => setAddrModal(false)} className="text-gray-600 hover:text-white transition-colors"><X size={18} /></button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Label', key: 'label', placeholder: 'Home / Work', span: false },
                                    { label: 'Full Name', key: 'fullName', placeholder: 'Recipient', span: true },
                                    { label: 'Phone', key: 'phone', placeholder: '+91 XXXXX XXXXX', span: false },
                                    { label: 'Address Line', key: 'addressLine1', placeholder: 'Street, Area, Landmark', span: true },
                                    { label: 'City', key: 'city', placeholder: 'City', span: false },
                                    { label: 'State', key: 'state', placeholder: 'State', span: false },
                                    { label: 'Pincode', key: 'pincode', placeholder: '500001', span: false },
                                ].map(f => (
                                    <div key={f.key} className={f.span ? 'col-span-2' : ''}>
                                        <label className="block text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-1.5">{f.label}</label>
                                        <input value={addrForm[f.key]} onChange={e => setAddrForm({ ...addrForm, [f.key]: e.target.value })}
                                            placeholder={f.placeholder}
                                            className="w-full bg-black/50 border border-white/[0.07] rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-700 focus:outline-none focus:border-[#00f5ff]/40 transition-colors font-mono text-xs" />
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3 mt-5">
                                <button onClick={() => setAddrModal(false)}
                                    className="flex-1 py-3 border border-white/[0.08] text-gray-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:text-white transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleAddAddress} disabled={saving}
                                    className="flex-1 py-3 text-black font-black uppercase tracking-widest text-xs rounded-xl disabled:opacity-50 transition-all"
                                    style={{ background: '#00f5ff', boxShadow: '0 0 25px rgba(0,245,255,0.35)' }}>
                                    {saving ? 'Saving…' : 'Save Address'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
