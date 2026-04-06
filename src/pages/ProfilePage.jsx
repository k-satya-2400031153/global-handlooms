import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { User, Package, MapPin, Plus, Trash2, Edit2, Check, X, ChevronRight, Clock } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem('token');
const authH = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` });

const STATUS_COLORS = {
    Pending: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    Processing: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    Shipped: 'text-cyberCyan bg-cyberCyan/10 border-cyberCyan/30',
    'Out for Delivery': 'text-purple-400 bg-purple-400/10 border-purple-400/30',
    Delivered: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    Cancelled: 'text-red-400 bg-red-400/10 border-red-400/30',
};

const STEPS = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

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
            if (d.success) {
                setProfile(d.data);
                setEditForm({ name: d.data.name || '', phone: d.data.phone || '' });
            }
        } catch { toast.error('Failed to load profile'); }
    }, []);

    const fetchOrders = useCallback(async () => {
        try {
            const r = await fetch(`${API}/user/orders`, { headers: authH() });
            const d = await r.json();
            if (d.success) setOrders(d.data);
        } catch { toast.error('Failed to load orders'); }
    }, []);

    useEffect(() => {
        fetchProfile();
        fetchOrders();
    }, [fetchProfile, fetchOrders]);

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const r = await fetch(`${API}/user/me`, { method: 'PUT', headers: authH(), body: JSON.stringify(editForm) });
            const d = await r.json();
            if (d.success) {
                setProfile(d.data);
                // Update localStorage too
                const stored = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({ ...stored, name: d.data.name }));
                setEditing(false);
                toast.success('Profile updated!');
            } else toast.error(d.message || 'Update failed');
        } catch { toast.error('Network error'); }
        setSaving(false);
    };

    const handleAddAddress = async () => {
        if (!addrForm.addressLine1 || !addrForm.city || !addrForm.pincode) {
            return toast.error('Address, city and pincode are required');
        }
        setSaving(true);
        try {
            const r = await fetch(`${API}/user/address`, { method: 'POST', headers: authH(), body: JSON.stringify(addrForm) });
            const d = await r.json();
            if (d.success) {
                setProfile(prev => ({ ...prev, savedAddresses: d.data }));
                setAddrModal(false);
                setAddrForm(EMPTY_ADDR);
                toast.success('Address saved!');
            }
        } catch { toast.error('Network error'); }
        setSaving(false);
    };

    const handleDeleteAddress = async (addrId) => {
        try {
            const r = await fetch(`${API}/user/address/${addrId}`, { method: 'DELETE', headers: authH() });
            const d = await r.json();
            if (d.success) {
                setProfile(prev => ({ ...prev, savedAddresses: d.data }));
                toast.success('Address removed');
            }
        } catch { toast.error('Error'); }
    };

    const roleColor = {
        Buyer: 'text-cyberCyan bg-cyberCyan/10 border-cyberCyan/30',
        Artisan: 'text-neonIndigo bg-neonIndigo/10 border-neonIndigo/30',
        Admin: 'text-alertRed bg-alertRed/10 border-alertRed/30',
    };

    if (!profile) return (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-background">
            <div className="w-12 h-12 border-4 border-cyberCyan border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-[calc(100vh-80px)] bg-background text-gray-200 p-4 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neonIndigo/10 rounded-full blur-[150px] pointer-events-none animate-pulse-slow" />
            <div className="max-w-5xl mx-auto relative z-10">

                {/* Header */}
                <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-surfaceBorder pb-6">
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neonIndigo to-cyberCyan flex items-center justify-center text-2xl font-black text-black shadow-[0_0_25px_rgba(99,102,241,0.4)]">
                            {profile.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">{profile.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${roleColor[profile.role] || 'text-gray-400 bg-white/5 border-white/10'}`}>
                                    {profile.role}
                                </span>
                                <span className="text-xs font-mono text-gray-500">{profile.email}</span>
                            </div>
                        </div>
                    </div>
                    {profile.role === 'Buyer' && (
                        <Link to="/buyer" className="text-xs font-bold text-cyberCyan border border-cyberCyan/30 bg-cyberCyan/10 px-4 py-2 rounded-lg hover:bg-cyberCyan hover:text-black transition-all uppercase tracking-widest flex items-center gap-2">
                            Market <ChevronRight size={12} />
                        </Link>
                    )}
                </header>

                {/* Tabs */}
                <div className="flex gap-2 mb-8">
                    {[
                        { id: 'info', label: 'Account Info', icon: User },
                        { id: 'orders', label: `Order History (${orders.length})`, icon: Package },
                        ...(profile.role === 'Buyer' ? [{ id: 'addresses', label: 'Address Book', icon: MapPin }] : []),
                    ].map(t => {
                        const Icon = t.icon;
                        return (
                            <button key={t.id} onClick={() => setTab(t.id)}
                                className={`flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-widest rounded transition-all ${tab === t.id ? 'bg-neonIndigo/20 text-neonIndigo border border-neonIndigo/50' : 'text-gray-500 hover:text-white border border-transparent'}`}>
                                <Icon size={13} /> {t.label}
                            </button>
                        );
                    })}
                </div>

                {/* ── ACCOUNT INFO ───────────────────────────────────── */}
                {tab === 'info' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 max-w-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-sm font-black text-white uppercase tracking-widest">Profile Details</h2>
                            {!editing ? (
                                <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-[10px] font-mono text-cyberCyan border border-cyberCyan/40 px-3 py-1.5 rounded hover:bg-cyberCyan/10 transition-colors">
                                    <Edit2 size={11} /> Edit
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button onClick={handleSaveProfile} disabled={saving} className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 border border-emerald-400/40 px-3 py-1.5 rounded hover:bg-emerald-400/10 transition-colors disabled:opacity-50">
                                        <Check size={11} /> {saving ? 'Saving…' : 'Save'}
                                    </button>
                                    <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-[10px] font-mono text-gray-500 border border-white/10 px-3 py-1.5 rounded hover:bg-white/5 transition-colors">
                                        <X size={11} /> Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            {[
                                { label: 'Full Name', key: 'name', editable: true },
                                { label: 'Email', value: profile.email, editable: false },
                                { label: 'Phone', key: 'phone', editable: true, placeholder: '+91 XXXXX XXXXX' },
                                { label: 'Role', value: profile.role, editable: false },
                                { label: 'Member Since', value: new Date(profile.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), editable: false },
                            ].map(field => (
                                <div key={field.label}>
                                    <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">{field.label}</label>
                                    {editing && field.editable ? (
                                        <input
                                            value={editForm[field.key] || ''}
                                            onChange={e => setEditForm({ ...editForm, [field.key]: e.target.value })}
                                            placeholder={field.placeholder || ''}
                                            className="w-full bg-black/60 border border-surfaceBorder rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neonIndigo/60 transition-colors"
                                        />
                                    ) : (
                                        <p className="text-white font-medium text-sm">{field.value || editForm[field.key] || <span className="text-gray-600 italic">Not set</span>}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── ORDER HISTORY ───────────────────────────────────── */}
                {tab === 'orders' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        {orders.length === 0 ? (
                            <div className="glass-panel p-12 text-center">
                                <Package size={40} className="text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">No orders yet.</p>
                                <Link to="/buyer" className="inline-block mt-4 text-cyberCyan text-xs font-bold underline hover:text-white transition-colors">Browse the Market →</Link>
                            </div>
                        ) : orders.map(order => {
                            const stepIndex = STEPS.indexOf(order.status);
                            return (
                                <div key={order._id} className="glass-panel p-5 hover:border-neonIndigo/40 transition-colors">
                                    <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                                        <div>
                                            <p className="font-mono text-[10px] text-gray-600">Order ID: {order._id.slice(-8).toUpperCase()}</p>
                                            <p className="text-white font-bold text-sm mt-0.5">
                                                {order.products.map(p => p.productId?.title || 'Item').join(', ')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border font-mono ${STATUS_COLORS[order.status] || 'text-gray-400 bg-white/5 border-white/10'}`}>
                                                {order.status}
                                            </span>
                                            <p className="text-emerald-400 font-black mt-1">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>

                                    {/* Tracking Stepper */}
                                    <div className="flex items-center gap-0 mt-2 overflow-x-auto pb-1">
                                        {STEPS.map((step, i) => {
                                            const done = i <= stepIndex;
                                            const current = i === stepIndex;
                                            return (
                                                <React.Fragment key={step}>
                                                    <div className="flex flex-col items-center flex-shrink-0">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-all ${done ? 'bg-cyberCyan border-cyberCyan text-black shadow-[0_0_10px_rgba(0,240,255,0.6)]' : 'bg-black/60 border-white/20 text-gray-600'} ${current ? 'animate-pulse' : ''}`}>
                                                            {done ? '✓' : i + 1}
                                                        </div>
                                                        <p className={`text-[8px] font-mono mt-1 text-center w-14 leading-tight ${done ? 'text-cyberCyan' : 'text-gray-600'}`}>{step}</p>
                                                    </div>
                                                    {i < STEPS.length - 1 && (
                                                        <div className={`flex-1 h-px mx-1 ${i < stepIndex ? 'bg-cyberCyan shadow-[0_0_4px_rgba(0,240,255,0.5)]' : 'bg-white/10'}`} />
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>

                                    {/* Recent tracking checkpoint */}
                                    {order.trackingHistory && order.trackingHistory.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 text-[10px] font-mono text-gray-500">
                                            <Clock size={10} className="text-cyberCyan flex-shrink-0" />
                                            <span className="text-cyberCyan">{order.trackingHistory[order.trackingHistory.length - 1].location}</span>
                                            <span>·</span>
                                            <span>{new Date(order.trackingHistory[order.trackingHistory.length - 1].timestamp).toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </motion.div>
                )}

                {/* ── ADDRESS BOOK ────────────────────────────────────── */}
                {tab === 'addresses' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-sm font-black text-white uppercase tracking-widest">Saved Addresses</h2>
                            <button onClick={() => setAddrModal(true)}
                                className="flex items-center gap-2 text-[10px] font-mono text-cyberCyan border border-cyberCyan/40 bg-cyberCyan/5 px-3 py-2 rounded-lg hover:bg-cyberCyan hover:text-black transition-all">
                                <Plus size={11} /> Add New Address
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {(profile.savedAddresses || []).length === 0 && (
                                <div className="glass-panel p-8 text-center col-span-2">
                                    <MapPin size={32} className="text-gray-600 mx-auto mb-2" />
                                    <p className="text-gray-500 font-mono text-xs">No saved addresses yet.</p>
                                </div>
                            )}
                            {(profile.savedAddresses || []).map(addr => (
                                <div key={addr._id} className="glass-panel p-5 relative group hover:border-cyberCyan/40 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-cyberCyan bg-cyberCyan/10 border border-cyberCyan/30 px-2 py-0.5 rounded">{addr.label}</span>
                                        <button onClick={() => handleDeleteAddress(addr._id)} className="text-alertRed hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                    <p className="text-white font-bold text-sm">{addr.fullName}</p>
                                    <p className="text-gray-400 text-xs font-mono mt-1">{addr.phone}</p>
                                    <p className="text-gray-300 text-xs mt-2 leading-relaxed">{addr.addressLine1}, {addr.city}, {addr.state} – {addr.pincode}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* ── ADD ADDRESS MODAL ───────────────────────────────── */}
            <AnimatePresence>
                {addrModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="glass-panel w-full max-w-md p-6 shadow-[0_0_50px_rgba(0,240,255,0.1)] relative">
                            <button onClick={() => setAddrModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                                <X size={18} />
                            </button>
                            <h2 className="text-lg font-black text-white uppercase tracking-widest mb-5">New Address</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Label', key: 'label', placeholder: 'Home / Office', span: false },
                                    { label: 'Full Name', key: 'fullName', placeholder: 'Recipient name', span: true },
                                    { label: 'Phone', key: 'phone', placeholder: '+91 XXXXX XXXXX', span: false },
                                    { label: 'Address Line', key: 'addressLine1', placeholder: 'Street, Area', span: true },
                                    { label: 'City', key: 'city', placeholder: 'City', span: false },
                                    { label: 'State', key: 'state', placeholder: 'State', span: false },
                                    { label: 'Pincode', key: 'pincode', placeholder: '500001', span: false },
                                ].map(f => (
                                    <div key={f.key} className={f.span ? 'col-span-2' : ''}>
                                        <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">{f.label}</label>
                                        <input
                                            value={addrForm[f.key]}
                                            onChange={e => setAddrForm({ ...addrForm, [f.key]: e.target.value })}
                                            placeholder={f.placeholder}
                                            className="w-full bg-black/60 border border-surfaceBorder rounded-lg px-3 py-2 text-white text-sm placeholder-gray-700 focus:outline-none focus:border-cyberCyan/60 transition-colors"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-3 mt-5">
                                <button onClick={() => setAddrModal(false)} className="flex-1 py-2.5 border border-surfaceBorder text-gray-400 rounded font-bold text-xs uppercase hover:text-white transition-colors">Cancel</button>
                                <button onClick={handleAddAddress} disabled={saving}
                                    className="flex-1 py-2.5 bg-cyberCyan text-black font-black uppercase tracking-widest text-xs rounded hover:bg-[#5affff] disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)]">
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
