import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL;

/* ═══════════════════════════════════════════════════════════
   PARTICLE / BOKEH LAYER
   ═══════════════════════════════════════════════════════════ */
const PARTICLES = [
    { left: '8%',  top: '15%', w: 6,   h: 6,   color: '#00f5ff', dur: '7s',  delay: '0s'   },
    { left: '15%', top: '70%', w: 4,   h: 4,   color: '#a855f7', dur: '9s',  delay: '1s'   },
    { left: '25%', top: '40%', w: 8,   h: 8,   color: '#f0abfc', dur: '6s',  delay: '2s'   },
    { left: '35%', top: '85%', w: 3,   h: 3,   color: '#00f5ff', dur: '11s', delay: '0.5s' },
    { left: '50%', top: '10%', w: 5,   h: 5,   color: '#fbbf24', dur: '8s',  delay: '3s'   },
    { left: '60%', top: '60%', w: 7,   h: 7,   color: '#4ade80', dur: '10s', delay: '1.5s' },
    { left: '72%', top: '25%', w: 4,   h: 4,   color: '#a855f7', dur: '7s',  delay: '2.5s' },
    { left: '80%', top: '75%', w: 6,   h: 6,   color: '#00f5ff', dur: '9s',  delay: '0.7s' },
    { left: '90%', top: '45%', w: 3,   h: 3,   color: '#f0abfc', dur: '6s',  delay: '4s'   },
    { left: '88%', top: '15%', w: 5,   h: 5,   color: '#fbbf24', dur: '12s', delay: '1.2s' },
    { left: '42%', top: '55%', w: 9,   h: 9,   color: '#a855f7', dur: '8s',  delay: '3.5s' },
    { left: '55%', top: '90%', w: 4,   h: 4,   color: '#00f5ff', dur: '7s',  delay: '2.2s' },
];

function ParticleField() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {PARTICLES.map((p, i) => (
                <div key={i}
                    className="bokeh-particle"
                    style={{
                        left: p.left, top: p.top,
                        width: p.w, height: p.h,
                        background: p.color,
                        boxShadow: `0 0 ${p.w * 4}px ${p.color}, 0 0 ${p.w * 8}px ${p.color}60`,
                        '--dur': p.dur,
                        '--delay': p.delay,
                    }}
                />
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   VOLUMETRIC ORB SYSTEM
   ═══════════════════════════════════════════════════════════ */
function Orb({ color, size, x, y, delay = 0, duration = 10, blur = 80 }) {
    return (
        <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
                width: size, height: size,
                left: `${x}%`, top: `${y}%`,
                background: `radial-gradient(circle at 35% 35%, ${color}90, ${color}40 40%, ${color}15 70%, transparent 85%)`,
                filter: `blur(${blur}px)`,
                transform: 'translate(-50%, -50%)',
            }}
            animate={{ x: [0, 35, -25, 0], y: [0, -30, 20, 0], scale: [1, 1.2, 0.88, 1] }}
            transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' }}
        />
    );
}

/* ═══════════════════════════════════════════════════════════
   HOLOGRAPHIC MESH BACKGROUND
   ═══════════════════════════════════════════════════════════ */
function HoloMesh() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Deep cosmos base */}
            <div className="absolute inset-0" style={{
                background: `
                  radial-gradient(ellipse 90% 70% at 15% 85%, #4c1d9530 0%, transparent 55%),
                  radial-gradient(ellipse 70% 90% at 88% 8%,  #0e7490 22 0%, transparent 55%),
                  radial-gradient(ellipse 55% 55% at 50% 50%, #1e1b4b18 0%, transparent 70%),
                  radial-gradient(ellipse 45% 45% at 80% 85%, #be185d1a 0%, transparent 60%),
                  radial-gradient(ellipse 60% 40% at 20% 20%, #0891b215 0%, transparent 60%),
                  #000010
                `
            }} />
            {/* Animated holographic grid */}
            <div className="absolute inset-0 holo-grid opacity-70" />
            {/* Diagonal fade overlay */}
            <div className="absolute inset-0" style={{
                background: 'linear-gradient(135deg, rgba(0,0,16,0.5) 0%, transparent 40%, rgba(0,0,16,0.4) 100%)'
            }} />
            {/* Edge vignette */}
            <div className="absolute inset-0" style={{
                background: 'radial-gradient(ellipse 85% 80% at 50% 50%, transparent 50%, rgba(0,0,10,0.7) 100%)'
            }} />
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   PRISM SPECTRUM BAR (top of card)
   ═══════════════════════════════════════════════════════════ */
function PrismBar() {
    return (
        <div style={{ position: 'relative', height: 4, overflow: 'hidden' }}>
            <motion.div
                style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(90deg, #00f5ff 0%, #a855f7 20%, #ec4899 40%, #fbbf24 60%, #4ade80 80%, #00f5ff 100%)',
                    backgroundSize: '200% 100%',
                }}
                animate={{ backgroundPosition: ['0% 50%', '200% 50%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
            {/* Glow reflection below bar */}
            <div style={{
                position: 'absolute', top: 4, left: 0, right: 0, height: 20,
                background: 'linear-gradient(180deg, rgba(0,245,255,0.15) 0%, transparent 100%)',
                pointerEvents: 'none',
            }} />
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   TRUST INDICATORS
   ═══════════════════════════════════════════════════════════ */
const TRUST = [
    { icon: '🔒', label: 'End-to-End Encrypted', color: '#00f5ff' },
    { icon: '⚡', label: 'OTP in Seconds',        color: '#fbbf24' },
    { icon: '🌐', label: 'Decentralized Identity', color: '#a855f7' },
];

/* ═══════════════════════════════════════════════════════════
   STATS TICKER (left panel)
   ═══════════════════════════════════════════════════════════ */
const STATS = [
    { value: '500+',   label: 'Master Artisans',   color: '#00f5ff' },
    { value: '12K+',   label: 'Handlooms Listed',  color: '#a855f7' },
    { value: '3.5K+',  label: 'Orders Fulfilled',  color: '#f0abfc' },
    { value: 'ZERO',   label: 'Intermediaries',    color: '#4ade80' },
];

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
const LoginPage = () => {
    const [searchParams] = useSearchParams();
    const initialMode = searchParams.get('mode');
    const [isRegistering, setIsRegistering] = useState(initialMode === 'register');
    const [email, setEmail]   = useState('');
    const [name, setName]     = useState('');
    const [role, setRole]     = useState('Buyer');
    const [otp, setOtp]       = useState('');
    const [step, setStep]     = useState(1);
    const [loading, setLoading] = useState(false);
    const [isDoorOpen, setIsDoorOpen] = useState(false);
    const [activePromo, setActivePromo] = useState(null);
    const [focusedField, setFocusedField] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${API}/marketing/discounts/active`)
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d?.data?.isActive) setActivePromo(d.data); })
            .catch(() => {});
    }, []);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${API}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (response.ok) {
                toast.success('🔐 OTP dispatched to your inbox.');
                setStep(2);
            } else toast.error(data.message || 'Failed to send OTP');
        } catch (err) { toast.error('System Offline. Check connection.'); }
        finally { setLoading(false); }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${API}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, role: isRegistering ? role : undefined, name: isRegistering ? name : undefined }),
            });
            const data = await response.json();
            if (response.ok) {
                toast.success('✅ Identity confirmed. Welcome.');
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setIsDoorOpen(true);
                setTimeout(() => {
                    if (data.user.role === 'Artisan') navigate('/artisan');
                    else if (data.user.role === 'Admin') navigate('/admin');
                    else navigate('/buyer');
                }, 1400);
            } else {
                toast.error(data.message || 'Invalid OTP.');
                setLoading(false);
            }
        } catch (err) { toast.error('Neural link severed.'); setLoading(false); }
    };

    return (
        <div className="relative flex min-h-[calc(100vh-80px)] overflow-hidden">

            {/* ════ BACKGROUND SYSTEM ════ */}
            <HoloMesh />
            <ParticleField />

            {/* Volumetric orbs — chromatic aurora */}
            <Orb color="#7c3aed" size={800}  x={8}   y={75}  delay={0}   duration={11} blur={100} />
            <Orb color="#0891b2" size={650}  x={92}  y={12}  delay={1.5} duration={13} blur={90}  />
            <Orb color="#ec4899" size={450}  x={78}  y={80}  delay={3}   duration={9}  blur={70}  />
            <Orb color="#4ade80" size={350}  x={18}  y={18}  delay={4}   duration={10} blur={60}  />
            <Orb color="#f59e0b" size={300}  x={55}  y={55}  delay={2}   duration={15} blur={80}  />
            <Orb color="#a855f7" size={500}  x={45}  y={90}  delay={5}   duration={12} blur={90}  />

            {/* ════ LEFT PANEL ════ */}
            <div className="hidden lg:flex w-[46%] flex-col items-center justify-center px-14 py-12 relative z-10">

                {/* Brand logo */}
                <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}
                    className="mb-10 text-center">

                    <div className="relative inline-block mb-7">
                        {/* Outer glow ring */}
                        <motion.div
                            className="absolute inset-0 rounded-3xl"
                            style={{ boxShadow: '0 0 40px rgba(0,245,255,0.3), 0 0 80px rgba(168,85,247,0.2)' }}
                            animate={{ boxShadow: [
                                '0 0 40px rgba(0,245,255,0.3), 0 0 80px rgba(168,85,247,0.2)',
                                '0 0 60px rgba(168,85,247,0.4), 0 0 100px rgba(236,72,153,0.2)',
                                '0 0 40px rgba(0,245,255,0.3), 0 0 80px rgba(168,85,247,0.2)',
                            ]}}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <div className="w-22 h-20 rounded-2xl flex items-center justify-center relative overflow-hidden"
                            style={{
                                width: 88, height: 88,
                                background: 'linear-gradient(135deg, #7c3aed, #0891b2, #a855f7)',
                                boxShadow: '0 0 50px rgba(124,58,237,0.5), 0 0 100px rgba(8,145,178,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
                            }}>
                            <span className="text-5xl relative z-10">🧵</span>
                            {/* Sweep shine */}
                            <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
                                animate={{ x: ['-100%', '200%'] }}
                                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2.5, ease: 'easeInOut' }} />
                        </div>
                    </div>

                    <h1 className="text-5xl font-black tracking-[-0.04em] text-white mb-2 leading-none">
                        Global<br />
                        <span className="text-shimmer">Handlooms</span>
                    </h1>
                    <p className="text-gray-500 text-sm font-mono mt-4 max-w-xs leading-relaxed tracking-wide">
                        Decentralized marketplace. Master artisans. Global reach.
                    </p>
                </motion.div>

                {/* Promo badge */}
                <AnimatePresence>
                    {activePromo && (
                        <motion.div key="promo"
                            initial={{ opacity: 0, scale: 0.85, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.7, type: 'spring', delay: 0.3 }}
                            className="relative w-full max-w-xs mb-10 overflow-hidden rounded-3xl"
                            style={{
                                background: 'linear-gradient(135deg, rgba(124,58,237,0.18), rgba(8,145,178,0.12))',
                                border: '1px solid rgba(168,85,247,0.35)',
                                boxShadow: '0 0 60px rgba(124,58,237,0.2), 0 0 120px rgba(0,245,255,0.08)',
                            }}>
                            {/* Rainbow top line */}
                            <div className="absolute top-0 left-0 right-0 h-[2px]"
                                style={{ background: 'linear-gradient(90deg, #00f5ff, #a855f7, #ec4899, #fbbf24, #4ade80)', backgroundSize: '200%', animation: 'borderFlow 3s linear infinite' }} />
                            <div className="p-8 text-center">
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                                    <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-[0.3em]">Live Sale Active</span>
                                </div>
                                <div className="text-[88px] font-black leading-none mb-1 text-aurora">
                                    {activePromo.percentage}
                                    <span className="text-[44px]">%</span>
                                </div>
                                <p className="text-2xl font-black text-white uppercase tracking-widest mb-3">OFF</p>
                                <div className="h-px mb-4" style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.6), transparent)' }} />
                                <p className="text-white font-bold text-base mb-1">{activePromo.title}</p>
                                <p className="text-gray-500 text-[11px] font-mono uppercase tracking-widest">Auto-applied at checkout</p>
                                <div className="flex justify-center gap-3 mt-5">
                                    {['#00f5ff','#a855f7','#f0abfc','#fbbf24','#4ade80'].map((c,i) => (
                                        <motion.span key={i} className="w-2 h-2 rounded-full"
                                            style={{ background: c, boxShadow: `0 0 8px ${c}` }}
                                            animate={{ scale: [1, 1.6, 1], opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 1.4, delay: i * 0.25, repeat: Infinity }} />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stats when no promo */}
                {!activePromo && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                        className="w-full max-w-xs grid grid-cols-2 gap-3 mb-8">
                        {STATS.map((s, i) => (
                            <motion.div key={s.label}
                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0,  scale: 1 }}
                                transition={{ delay: 0.5 + i * 0.12 }}
                                className="rounded-2xl p-4 text-center"
                                style={{
                                    background: `rgba(5,5,20,0.7)`,
                                    border: `1px solid ${s.color}25`,
                                    boxShadow: `0 0 20px ${s.color}10`,
                                }}>
                                <p className="text-2xl font-black" style={{ color: s.color, textShadow: `0 0 20px ${s.color}80` }}>{s.value}</p>
                                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mt-0.5">{s.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Trust indicators */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
                    className="w-full max-w-xs">
                    <div className="rounded-2xl p-5 space-y-4"
                        style={{ background: 'rgba(5,5,20,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        {TRUST.map((t, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="text-xl">{t.icon}</span>
                                <span className="text-sm font-medium" style={{ color: t.color, textShadow: `0 0 15px ${t.color}60` }}>{t.label}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Network tag row */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
                    className="mt-6 flex gap-2 flex-wrap justify-center">
                    {[
                        { label: 'Web3', color: '#00f5ff' },
                        { label: 'OTP Auth', color: '#a855f7' },
                        { label: 'Zero-fee', color: '#4ade80' },
                        { label: 'Real-time', color: '#fbbf24' },
                    ].map((t) => (
                        <span key={t.label} className="text-[10px] font-mono uppercase tracking-[0.2em] px-3 py-1.5 rounded-full"
                            style={{
                                color: t.color,
                                background: `${t.color}12`,
                                border: `1px solid ${t.color}30`,
                                boxShadow: `0 0 10px ${t.color}15`,
                            }}>
                            {t.label}
                        </span>
                    ))}
                </motion.div>
            </div>

            {/* ════ DIVIDER ════ */}
            <div className="hidden lg:block absolute top-0 bottom-0 z-10" style={{ left: '46%' }}>
                <motion.div className="h-full w-px"
                    style={{ background: 'linear-gradient(180deg, transparent 0%, #00f5ff 15%, #a855f7 35%, #ec4899 55%, #fbbf24 75%, transparent 100%)' }}
                    animate={{ opacity: [0.15, 0.35, 0.15] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
                {/* Center diamond */}
                <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rotate-45"
                    style={{ background: '#a855f7', boxShadow: '0 0 15px #a855f7, 0 0 30px rgba(168,85,247,0.5)' }}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }} />
            </div>

            {/* ════ RIGHT PANEL — LOGIN FORM ════ */}
            <div className="flex flex-1 items-center justify-center px-6 py-12 relative z-10">
                <motion.div
                    animate={isDoorOpen ? { scale: 2.5, opacity: 0 } : { scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2, ease: 'easeInOut' }}
                    className="w-full max-w-md"
                >
                    {/* Mobile promo pill */}
                    <AnimatePresence>
                        {activePromo && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                className="lg:hidden mb-6 py-2.5 px-5 rounded-full text-center relative overflow-hidden"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(124,58,237,0.22), rgba(8,145,178,0.18))',
                                    border: '1px solid rgba(168,85,247,0.4)',
                                    boxShadow: '0 0 30px rgba(168,85,247,0.2)',
                                }}>
                                <span className="text-[11px] font-black text-white uppercase tracking-widest">
                                    🔥 {activePromo.title} — {activePromo.percentage}% OFF
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── FORM CARD ── */}
                    <div className="relative rounded-3xl overflow-hidden" style={{
                        background: 'rgba(6,6,22,0.82)',
                        backdropFilter: 'blur(48px)',
                        WebkitBackdropFilter: 'blur(48px)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        boxShadow: `
                          0 30px 80px rgba(0,0,0,0.6),
                          0 0 0 1px rgba(255,255,255,0.04),
                          inset 0 1px 0 rgba(255,255,255,0.07),
                          0 0 120px rgba(124,58,237,0.08)
                        `,
                    }}>
                        {/* Prism top bar */}
                        <PrismBar />

                        {/* Corner accent glows */}
                        <div className="absolute top-4 left-4 w-16 h-16 rounded-full pointer-events-none"
                            style={{ background: 'radial-gradient(circle, rgba(0,245,255,0.15) 0%, transparent 70%)', animation: 'cornerGlow 3s ease-in-out infinite' }} />
                        <div className="absolute bottom-4 right-4 w-24 h-24 rounded-full pointer-events-none"
                            style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)', animation: 'cornerGlow 3s ease-in-out infinite 1.5s' }} />

                        <div className="p-8 relative">
                            {/* Header */}
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                                <h2 className="text-2xl font-black tracking-[-0.025em] text-white mb-1">
                                    {step === 1 ? (isRegistering ? 'Create Account' : 'Welcome Back') : 'Verify Identity'}
                                </h2>
                                <p className="text-[11px] font-mono uppercase tracking-[0.25em]"
                                    style={{ color: '#6b7280' }}>
                                    {step === 1 ? 'Global Handlooms · Web3 Network' : 'OTP dispatched to inbox'}
                                </p>

                                {/* Step indicator */}
                                <div className="flex items-center justify-center gap-2 mt-4">
                                    {[1, 2].map(s => (
                                        <div key={s} className="relative">
                                            <div className="w-8 h-1 rounded-full transition-all duration-500"
                                                style={{
                                                    background: step >= s ? 'linear-gradient(90deg, #00f5ff, #a855f7)' : 'rgba(255,255,255,0.08)',
                                                    boxShadow: step >= s ? '0 0 8px rgba(0,245,255,0.5)' : 'none',
                                                }} />
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Tab switcher */}
                            {step === 1 && !isDoorOpen && (
                                <div className="flex mb-7 p-1 rounded-xl"
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    {[
                                        { label: 'Sign In',   isActive: !isRegistering, onClick: () => setIsRegistering(false) },
                                        { label: 'Register',  isActive: isRegistering,  onClick: () => setIsRegistering(true)  },
                                    ].map(tab => (
                                        <button key={tab.label} type="button" onClick={tab.onClick}
                                            className="relative flex-1 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] rounded-lg transition-all duration-300 overflow-hidden"
                                            style={tab.isActive ? {
                                                background: 'linear-gradient(135deg, rgba(0,245,255,0.18), rgba(168,85,247,0.18))',
                                                color: '#e2e8f0',
                                                boxShadow: '0 0 20px rgba(0,245,255,0.2)',
                                                border: '1px solid rgba(0,245,255,0.25)',
                                            } : { color: '#4b5563', border: '1px solid transparent' }}>
                                            {tab.isActive && (
                                                <motion.div className="absolute inset-0 opacity-30"
                                                    style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.1), transparent)' }}
                                                    animate={{ x: ['-100%', '200%'] }}
                                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }} />
                                            )}
                                            <span className="relative z-10">{tab.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* ═══ STEP 1: Email ═══ */}
                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.form key="step1" onSubmit={handleSendOtp}
                                        initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-5">

                                        <AnimatePresence>
                                            {isRegistering && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }} className="space-y-5 overflow-hidden">

                                                    {/* Name field */}
                                                    <div>
                                                        <label className="block mb-2 text-[11px] font-mono uppercase tracking-wider"
                                                            style={{ color: '#00f5ff', textShadow: '0 0 10px rgba(0,245,255,0.4)' }}>
                                                            Full Name
                                                        </label>
                                                        <div className="relative">
                                                            <input type="text" value={name}
                                                                onChange={e => setName(e.target.value)}
                                                                onFocus={() => setFocusedField('name')}
                                                                onBlur={() => setFocusedField(null)}
                                                                required={isRegistering}
                                                                className="w-full px-4 py-3.5 rounded-xl text-white text-sm font-mono placeholder-gray-700 outline-none transition-all duration-300"
                                                                placeholder="Enter your full name"
                                                                style={{
                                                                    background: focusedField === 'name' ? 'rgba(0,245,255,0.04)' : 'rgba(0,0,0,0.45)',
                                                                    border: focusedField === 'name' ? '1px solid rgba(0,245,255,0.55)' : '1px solid rgba(255,255,255,0.07)',
                                                                    boxShadow: focusedField === 'name' ? '0 0 0 3px rgba(0,245,255,0.1), 0 0 25px rgba(0,245,255,0.1)' : 'none',
                                                                }} />
                                                            {focusedField === 'name' && (
                                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                                                                    style={{ background: '#00f5ff', boxShadow: '0 0 8px #00f5ff', animation: 'pulseSlow 1.5s infinite' }} />
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Role field */}
                                                    <div>
                                                        <label className="block mb-2 text-[11px] font-mono uppercase tracking-wider"
                                                            style={{ color: '#a855f7', textShadow: '0 0 10px rgba(168,85,247,0.4)' }}>
                                                            Network Role
                                                        </label>
                                                        <select value={role} onChange={e => setRole(e.target.value)}
                                                            className="w-full px-4 py-3.5 rounded-xl text-white text-sm font-mono outline-none transition-all duration-300 appearance-none cursor-pointer"
                                                            style={{
                                                                background: 'rgba(0,0,0,0.45)',
                                                                border: '1px solid rgba(168,85,247,0.3)',
                                                                boxShadow: '0 0 15px rgba(168,85,247,0.08)',
                                                            }}>
                                                            <option value="Buyer"   className="bg-[#06061a]">🛍️ Buyer — Shop Products</option>
                                                            <option value="Artisan" className="bg-[#06061a]">🧵 Artisan — Sell Products</option>
                                                        </select>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Email field */}
                                        <div>
                                            <label className="block mb-2 text-[11px] font-mono uppercase tracking-wider"
                                                style={{ color: '#38bdf8', textShadow: '0 0 10px rgba(56,189,248,0.4)' }}>
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <input type="email" value={email}
                                                    onChange={e => setEmail(e.target.value)}
                                                    onFocus={() => setFocusedField('email')}
                                                    onBlur={() => setFocusedField(null)}
                                                    required
                                                    className="w-full px-4 py-3.5 rounded-xl text-white text-sm font-mono placeholder-gray-700 outline-none transition-all duration-300"
                                                    placeholder="you@example.com"
                                                    style={{
                                                        background: focusedField === 'email' ? 'rgba(56,189,248,0.04)' : 'rgba(0,0,0,0.45)',
                                                        border: focusedField === 'email' ? '1px solid rgba(56,189,248,0.55)' : '1px solid rgba(255,255,255,0.07)',
                                                        boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(56,189,248,0.1), 0 0 25px rgba(56,189,248,0.1)' : 'none',
                                                    }} />
                                                {focusedField === 'email' && (
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                                                        style={{ background: '#38bdf8', boxShadow: '0 0 8px #38bdf8', animation: 'pulseSlow 1.5s infinite' }} />
                                                )}
                                            </div>
                                        </div>

                                        {/* CTA Button */}
                                        <motion.button type="submit" disabled={loading}
                                            whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }}
                                            className="w-full py-4 mt-2 rounded-xl font-black text-sm tracking-widest uppercase text-white relative overflow-hidden transition-all duration-300 disabled:opacity-50"
                                            style={{
                                                background: 'linear-gradient(135deg, #7c3aed 0%, #0891b2 50%, #a855f7 100%)',
                                                backgroundSize: '200% 200%',
                                                animation: 'auroraShift 4s ease infinite',
                                                boxShadow: '0 0 40px rgba(124,58,237,0.4), 0 0 80px rgba(0,245,255,0.15), 0 6px 25px rgba(0,0,0,0.4)',
                                            }}>
                                            {/* Shine */}
                                            <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                                                animate={{ x: loading ? 0 : ['-100%', '200%'] }}
                                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }} />
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                {loading ? (
                                                    <>
                                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                                        </svg>
                                                        Transmitting...
                                                    </>
                                                ) : (
                                                    <>{isRegistering ? 'Create Account' : 'Get OTP'} <span className="ml-1">→</span></>
                                                )}
                                            </span>
                                        </motion.button>
                                    </motion.form>
                                )}

                                {/* ═══ STEP 2: OTP ═══ */}
                                {step === 2 && (
                                    <motion.form key="step2" onSubmit={handleVerifyOtp}
                                        initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-6">

                                        <div className="rounded-2xl p-4 text-center"
                                            style={{
                                                background: 'rgba(0,245,255,0.04)',
                                                border: '1px solid rgba(0,245,255,0.15)',
                                                boxShadow: '0 0 25px rgba(0,245,255,0.06)',
                                            }}>
                                            <p className="text-gray-500 text-xs font-mono uppercase tracking-widest mb-1">OTP sent to</p>
                                            <p className="text-white font-mono font-bold text-sm" style={{ color: '#00f5ff', textShadow: '0 0 15px rgba(0,245,255,0.5)' }}>{email}</p>
                                        </div>

                                        {/* OTP input */}
                                        <div>
                                            <label className="block mb-3 text-[11px] font-mono text-center uppercase tracking-[0.3em]"
                                                style={{ color: '#a855f7', textShadow: '0 0 10px rgba(168,85,247,0.5)' }}>
                                                Enter 6-digit code
                                            </label>
                                            <input type="text" value={otp}
                                                onChange={e => setOtp(e.target.value.replace(/\D/, '').slice(0, 6))}
                                                onFocus={() => setFocusedField('otp')}
                                                onBlur={() => setFocusedField(null)}
                                                required maxLength={6} disabled={isDoorOpen}
                                                className="w-full px-4 py-5 text-3xl font-black text-center tracking-[0.6em] rounded-xl outline-none transition-all duration-300"
                                                placeholder="······"
                                                style={{
                                                    background: focusedField === 'otp' ? 'rgba(168,85,247,0.06)' : 'rgba(0,0,0,0.55)',
                                                    border: focusedField === 'otp' ? '1px solid rgba(168,85,247,0.65)' : '1px solid rgba(255,255,255,0.1)',
                                                    boxShadow: focusedField === 'otp'
                                                        ? '0 0 0 3px rgba(168,85,247,0.15), 0 0 30px rgba(168,85,247,0.12), inset 0 0 20px rgba(168,85,247,0.05)'
                                                        : 'inset 0 0 20px rgba(0,0,0,0.3)',
                                                    color: '#e2e8f0',
                                                    letterSpacing: '0.6em',
                                                    fontFamily: '"JetBrains Mono", monospace',
                                                }} />
                                            {/* Progress bar */}
                                            <div className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
                                                <motion.div className="h-full rounded-full"
                                                    style={{ background: 'linear-gradient(90deg, #a855f7, #00f5ff)' }}
                                                    animate={{ width: `${(otp.length / 6) * 100}%` }}
                                                    transition={{ duration: 0.2 }} />
                                            </div>
                                        </div>

                                        <motion.button type="submit" disabled={loading || isDoorOpen || otp.length < 6}
                                            whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }}
                                            className="w-full py-4 rounded-xl font-black text-sm tracking-widest uppercase relative overflow-hidden transition-all duration-300 disabled:opacity-40"
                                            style={{
                                                background: 'linear-gradient(135deg, #4ade80, #00f5ff, #a855f7)',
                                                backgroundSize: '200% 200%',
                                                animation: 'auroraShift 4s ease infinite',
                                                color: '#000',
                                                boxShadow: '0 0 40px rgba(0,245,255,0.4), 0 0 80px rgba(74,222,128,0.2), 0 6px 25px rgba(0,0,0,0.4)',
                                            }}>
                                            <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
                                                animate={{ x: ['-100%', '200%'] }}
                                                transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 0.6, ease: 'easeInOut' }} />
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                {loading || isDoorOpen ? (
                                                    <>
                                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                                        </svg>
                                                        Verifying...
                                                    </>
                                                ) : '🔓 Verify & Enter'}
                                            </span>
                                        </motion.button>

                                        <button type="button" onClick={() => setStep(1)}
                                            className="w-full text-center text-[11px] font-mono transition-colors py-1 uppercase tracking-widest"
                                            style={{ color: '#374151' }}
                                            onMouseEnter={e => e.target.style.color = '#9ca3af'}
                                            onMouseLeave={e => e.target.style.color = '#374151'}>
                                            ← Change email
                                        </button>
                                    </motion.form>
                                )}
                            </AnimatePresence>

                            {/* Footer */}
                            <div className="mt-6 pt-5 border-t text-center" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                                <p className="text-[11px] text-gray-600 font-mono">
                                    By continuing you agree to our
                                    <span className="cursor-pointer hover:text-violet-300 transition-colors ml-1" style={{ color: '#a855f7' }}>Terms</span>
                                    <span className="text-gray-700 mx-1">&</span>
                                    <span className="cursor-pointer hover:text-cyan-300 transition-colors" style={{ color: '#00f5ff' }}>Privacy</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tag row below card */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}
                        className="mt-5 flex items-center justify-center gap-5">
                        {[
                            { icon: '🔒', label: 'Secure',    color: '#00f5ff' },
                            { icon: '⚡', label: 'Instant',   color: '#fbbf24' },
                            { icon: '🌐', label: 'Web3',      color: '#a855f7' },
                            { icon: '🧵', label: 'Authentic', color: '#4ade80' },
                        ].map((t, i) => (
                            <span key={i} className="text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5"
                                style={{ color: t.color, textShadow: `0 0 10px ${t.color}60` }}>
                                {t.icon} {t.label}
                            </span>
                        ))}
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;