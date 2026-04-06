import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Upload, Package, Edit3, Trash2, PlusCircle, X, TrendingUp, Layers } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;
const EMPTY = { title: '', price: '', inventory: '', originRegion: '', materialsUsed: '', image: '' };

const ArtisanView = () => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [formData, setFormData] = useState(EMPTY);
    const [editingId, setEditingId] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        let user = {};
        try { const s = localStorage.getItem('user'); if (s) user = JSON.parse(s); } catch {}
        if (user.role !== 'Artisan') navigate('/');
        else fetchMyProducts();
    }, [navigate]);

    const fetchMyProducts = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        try {
            const r = await fetch(`${API}/products/artisan`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!r.ok) { const d = await r.json(); setLoadError(d.message || 'Failed to load'); setIsLoading(false); return; }
            setLoadError('');
            const data = await r.json();
            setProducts(data.data || data);
        } catch { setLoadError('Network error.'); }
        setIsLoading(false);
    };

    const handleImageUpload = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setFormData(prev => ({ ...prev, image: reader.result }));
        reader.readAsDataURL(file);
    };

    const handleDrop = (e) => {
        e.preventDefault(); setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) handleImageUpload(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const payload = { ...formData, materialsUsed: formData.materialsUsed.split(',').map(m => m.trim()) };
        const tid = toast.loading(editingId ? 'Updating asset...' : 'Deploying to network...');
        try {
            const r = await fetch(editingId ? `${API}/products/${editingId}` : `${API}/products`, {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            const result = await r.json();
            if (r.ok) {
                fetchMyProducts();
                setFormData(EMPTY); setEditingId(null);
                toast.success(editingId ? 'Asset updated!' : 'Asset live on network!', { id: tid });
            } else toast.error(result.message || 'Error', { id: tid });
        } catch { toast.error('Network failure', { id: tid }); }
    };

    const handleEdit = (p) => {
        setEditingId(p._id);
        setFormData({ title: p.title, price: p.price, inventory: p.inventory, originRegion: p.originRegion || '', materialsUsed: (p.materialsUsed || []).join(', '), image: p.image || '' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBurn = async (id) => {
        const token = localStorage.getItem('token');
        const tid = toast.loading('Archiving...');
        try {
            const r = await fetch(`${API}/products/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (r.ok) { fetchMyProducts(); toast.success('Asset archived.', { id: tid }); }
            else toast.error('Failed', { id: tid });
        } catch { toast.error('Error', { id: tid }); }
    };

    const totalValue = products.reduce((s, p) => s + p.price * p.inventory, 0);

    return (
        <div className="min-h-screen text-gray-200 relative overflow-hidden" style={{ background: '#000010' }}>
            {/* BG Orbs */}
            <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full blur-[180px] pointer-events-none animate-float" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)' }} />
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[180px] pointer-events-none animate-float-delayed" style={{ background: 'radial-gradient(circle, rgba(0,245,255,0.07) 0%, transparent 70%)' }} />

            <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
                {/* Header */}
                <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 pb-6 border-b border-white/[0.06]">
                    <div className="flex flex-wrap justify-between items-end gap-6">
                        <div>
                            <p className="text-[10px] font-mono text-neonIndigo uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                                <span className="status-dot-live" style={{ background: '#6366f1', boxShadow: '0 0 0 0 rgba(99,102,241,0.5)', animation: 'statusPing 2s ease-out infinite' }} />
                                Artisan Creator Hub
                            </p>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neonIndigo via-white to-cyberCyan">
                                ASSET FORGE
                            </h1>
                        </div>
                        {/* KPI strip */}
                        <div className="flex gap-3 flex-wrap">
                            {[
                                { icon: Package, label: 'Active Assets', value: products.length, color: 'text-neonIndigo' },
                                { icon: TrendingUp, label: 'Portfolio Value', value: `₹${totalValue.toLocaleString('en-IN')}`, color: 'text-emerald-400' },
                                { icon: Layers, label: 'Total Units', value: products.reduce((s, p) => s + p.inventory, 0), color: 'text-cyberCyan' },
                            ].map(k => {
                                const Icon = k.icon;
                                return (
                                    <div key={k.label} className="kpi-card min-w-[120px]">
                                        <Icon size={13} className={`${k.color} mx-auto mb-1`} />
                                        <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">{k.label}</p>
                                        <p className={`font-black text-lg ${k.color}`}>{k.value}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.header>

                <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
                    {/* ── FORM PANEL ── */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                        <div className={`glass-card p-6 relative overflow-hidden ${editingId ? 'border-neonIndigo/40' : ''}`}>
                            {editingId && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-neonIndigo to-transparent" />}

                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    {editingId ? <Edit3 size={14} className="text-neonIndigo" /> : <PlusCircle size={14} className="text-cyberCyan" />}
                                    {editingId ? 'Update Asset' : 'Deploy New Asset'}
                                </h2>
                                {editingId && (
                                    <button onClick={() => { setEditingId(null); setFormData(EMPTY); }} data-danger
                                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-alertRed/20 hover:text-alertRed text-gray-500 flex items-center justify-center transition-all">
                                        <X size={13} />
                                    </button>
                                )}
                            </div>

                            {/* Image Drop Zone */}
                            <div
                                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current.click()}
                                className={`relative w-full h-44 rounded-xl mb-5 overflow-hidden flex flex-col items-center justify-center transition-all duration-300 group
                                    ${isDragging ? 'border-2 border-cyberCyan bg-cyberCyan/10' : 'border border-dashed border-white/15 bg-black/40 hover:border-neonIndigo/50 hover:bg-neonIndigo/5'}`}
                            >
                                {formData.image ? (
                                    <>
                                        <img src={formData.image} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-3" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity gap-2">
                                            <Upload size={20} className="text-white" />
                                            <span className="text-xs font-mono text-white">Replace Image</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 pointer-events-none select-none">
                                        <Upload size={24} className={isDragging ? 'text-cyberCyan' : 'text-gray-600'} />
                                        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">
                                            {isDragging ? 'Drop to upload' : 'Click or drag image'}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <input type="file" accept="image/*" ref={fileInputRef} onChange={e => handleImageUpload(e.target.files[0])} className="hidden" />

                            <form onSubmit={handleSubmit} className="space-y-3">
                                {[
                                    { placeholder: 'Product Title', key: 'title', type: 'text' },
                                ].map(f => (
                                    <div key={f.key}>
                                        <input type={f.type} placeholder={f.placeholder} value={formData[f.key]}
                                            onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                                            className="input-field" required />
                                    </div>
                                ))}
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="number" placeholder="Price (₹)" value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        className="input-field text-emerald-400" required />
                                    <input type="number" placeholder="Units in Stock" value={formData.inventory}
                                        onChange={e => setFormData({ ...formData, inventory: e.target.value })}
                                        className="input-field" required />
                                </div>
                                <input type="text" placeholder="Origin Region (e.g. Varanasi, India)" value={formData.originRegion}
                                    onChange={e => setFormData({ ...formData, originRegion: e.target.value })}
                                    className="input-field" required />
                                <input type="text" placeholder="Materials (comma separated)" value={formData.materialsUsed}
                                    onChange={e => setFormData({ ...formData, materialsUsed: e.target.value })}
                                    className="input-field" />

                                <button type="submit"
                                    className={`w-full py-4 mt-2 font-black text-xs uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg flex items-center justify-center gap-2
                                        ${editingId
                                            ? 'bg-gradient-to-r from-neonIndigo to-indigo-600 text-white shadow-neon-indigo hover:shadow-[0_0_30px_rgba(99,102,241,0.6)]'
                                            : 'btn-solid-cyber'}`}>
                                    {editingId ? <><Edit3 size={13} /> Update Asset</> : <><PlusCircle size={13} /> Deploy to Network</>}
                                </button>
                            </form>
                        </div>

                        {/* Trust meter */}
                        <div className="mt-4 glass-card p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Node Trust Score</span>
                                <span className="text-xs font-black text-emerald-400">98.4%</span>
                            </div>
                            <div className="w-full bg-black/60 h-1.5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: '98.4%' }} transition={{ duration: 2, delay: 0.5 }}
                                    className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #10b981, #00f5ff)', boxShadow: '0 0 10px rgba(0,245,255,0.5)' }} />
                            </div>
                        </div>
                    </motion.div>

                    {/* ── PRODUCTS GRID ── */}
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-sm font-black text-white uppercase tracking-widest">Active Nodes ({products.length})</h2>
                        </div>

                        {loadError && (
                            <div className="mb-4 p-4 bg-alertRed/10 border border-alertRed/30 rounded-xl text-alertRed text-xs font-mono">{loadError}</div>
                        )}

                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                {[1,2,3,4,5,6].map(i => (
                                    <div key={i} className="glass-card overflow-hidden">
                                        <div className="skeleton w-full h-48" />
                                        <div className="p-4 space-y-2">
                                            <div className="skeleton h-4 w-3/4" />
                                            <div className="skeleton h-3 w-1/3 mt-2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="glass-card p-16 text-center">
                                <Package size={40} className="mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.12)' }} />
                                <p className="text-gray-600 font-mono text-xs uppercase tracking-widest">No assets deployed yet.</p>
                                <p className="text-gray-700 text-xs mt-2">Use the form to deploy your first product to the network.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                {products.map((product, i) => (
                                    <motion.div
                                        key={product._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className={`glow-card group relative flex flex-col ${editingId === product._id ? 'border-[#6366f1]/50' : ''}`}
                                    >
                                        <div className="card-shine" />
                                        {/* Top accent */}
                                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neonIndigo/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                        {/* Image */}
                                        <div className="relative w-full h-52 overflow-hidden bg-black/60">
                                            {product.image ? (
                                                <img src={product.image} alt={product.title}
                                                    className="w-full h-full object-contain p-3 opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-4xl">🧵</div>
                                            )}
                                            {/* Price badge */}
                                            <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md border border-emerald-500/30 rounded-lg px-2.5 py-1">
                                                <span className="text-emerald-400 font-black text-sm font-mono">₹{product.price}</span>
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="p-4 flex-1 flex flex-col">
                                            <h3 className="font-bold text-white text-sm leading-snug mb-2 group-hover:text-neonIndigo transition-colors line-clamp-2">{product.title}</h3>
                                            <div className="flex gap-2 flex-wrap mb-3">
                                                {(product.materialsUsed || []).slice(0, 2).map(m => (
                                                    <span key={m} className="tag-indigo">{m}</span>
                                                ))}
                                            </div>
                                            <div className="mt-auto pt-3 border-t border-white/[0.06] flex justify-between items-center">
                                                <span className="text-[10px] font-mono text-gray-500">{product.inventory} units</span>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEdit(product)}
                                                        className="flex items-center gap-1 text-[10px] font-mono text-neonIndigo border border-neonIndigo/30 bg-neonIndigo/5 px-2.5 py-1.5 rounded hover:bg-neonIndigo hover:text-white transition-all">
                                                        <Edit3 size={10} /> Edit
                                                    </button>
                                                    <button onClick={() => handleBurn(product._id)} data-danger
                                                        className="flex items-center gap-1 text-[10px] font-mono text-alertRed border border-alertRed/30 bg-alertRed/5 px-2.5 py-1.5 rounded hover:bg-alertRed hover:text-white transition-all">
                                                        <Trash2 size={10} /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtisanView;