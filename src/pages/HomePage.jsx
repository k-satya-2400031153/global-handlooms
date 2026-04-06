import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const API = import.meta.env.VITE_API_URL;

/* ── Animated counter ── */
function Counter({ target, suffix = '', duration = 2000 }) {
    const [val, setVal] = useState(0);
    const ref = React.useRef(null);
    const started = React.useRef(false);

    React.useEffect(() => {
        const observer = new IntersectionObserver(([e]) => {
            if (e.isIntersecting && !started.current) {
                started.current = true;
                const steps = 60;
                const step  = target / steps;
                let cur = 0;
                const tick = () => {
                    cur += step;
                    if (cur < target) { setVal(Math.floor(cur)); requestAnimationFrame(tick); }
                    else setVal(target);
                };
                tick();
            }
        }, { threshold: 0.4 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target]);

    return <span ref={ref}>{val.toLocaleString('en-IN')}{suffix}</span>;
}

/* ── Chromatic orb background component ── */
function ChromaOrb({ color, size, x, y, delay = 0, duration = 12, blur = 80 }) {
    return (
        <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
                width: size, height: size,
                left: `${x}%`, top: `${y}%`,
                background: `radial-gradient(circle at 35% 35%, ${color}70, ${color}30 45%, ${color}10 70%, transparent 85%)`,
                filter: `blur(${blur}px)`,
                transform: 'translate(-50%, -50%)',
            }}
            animate={{ x: [0, 40, -30, 0], y: [0, -35, 25, 0], scale: [1, 1.18, 0.9, 1] }}
            transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' }}
        />
    );
}

/* ── Feature cards data ── */
const BENTO_CARDS = [
    {
        tag: 'Smart Logistics', title: '24-hour\ndelivery tracking',
        desc: 'From artisan hub to your door, every stage in real time.',
        icon: '🚚', color: '#a855f7', glow: 'rgba(168,85,247,0.25)',
        bg: 'rgba(168,85,247,0.07)', border: 'rgba(168,85,247,0.2)',
    },
    {
        tag: 'Live Promotions', title: 'Flash sales\nbroadcast instantly',
        desc: 'Discounts activate globally in seconds — buyers see them live.',
        icon: '⚡', color: '#fbbf24', glow: 'rgba(251,191,36,0.25)',
        bg: 'rgba(251,191,36,0.07)', border: 'rgba(251,191,36,0.2)',
    },
    {
        tag: 'Marketing Engine', title: 'Data-driven\ncampaigns',
        desc: 'Know which buyers buy what. Target with precision.',
        icon: '📊', color: '#6366f1', glow: 'rgba(99,102,241,0.25)',
        bg: 'rgba(99,102,241,0.07)', border: 'rgba(99,102,241,0.2)',
    },
    {
        tag: 'JWT Security', title: 'Role-based\naccess control',
        desc: 'Admin, Artisan, Buyer, Marketing — every role strictly enforced.',
        icon: '🔐', color: '#4ade80', glow: 'rgba(74,222,128,0.25)',
        bg: 'rgba(74,222,128,0.07)', border: 'rgba(74,222,128,0.2)',
    },
];

/* ── Stats data ── */
const STATS = [
    { label: 'Master Artisans',  value: 500,   suffix: '+', color: '#00f5ff', glow: 'rgba(0,245,255,0.4)'   },
    { label: 'Handlooms Listed', value: 12000, suffix: '+', color: '#a855f7', glow: 'rgba(168,85,247,0.4)'  },
    { label: 'Orders Fulfilled', value: 3500,  suffix: '+', color: '#f0abfc', glow: 'rgba(240,171,252,0.4)' },
    { label: 'Intermediaries',   value: 0,     suffix: '',  color: '#4ade80', glow: 'rgba(74,222,128,0.4)'  },
];

/* ── Feature pills ── */
const PILLS = [
    { label: 'Artisan Market', color: '#00f5ff' },
    { label: 'Live Discounts', color: '#a855f7' },
    { label: 'Order Tracking', color: '#fbbf24' },
    { label: 'Analytics',      color: '#4ade80' },
];

export default function HomePage() {
    const [promo, setPromo] = useState(null);
    const [promoVisible, setPromoVisible] = useState(true);

    const scrollToJoin = () => {
        document.getElementById('join-network-cta')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    useEffect(() => {
        fetch(`${API}/marketing/discounts/active`)
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d?.data?.isActive) setPromo(d.data); })
            .catch(() => {});
    }, []);

    return (
        <div className="min-h-screen text-white overflow-x-hidden" style={{ background: '#000010' }}>

            {/* ── Promo widget (floating bottom-right) ── */}
            <AnimatePresence>
                {promo && promoVisible && (
                    <motion.div
                        initial={{ x: 120, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 120, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 70, delay: 2 }}
                        className="fixed bottom-24 right-6 z-50 w-[228px]"
                    >
                        <div className="relative rounded-2xl overflow-hidden"
                            style={{
                                background: 'rgba(8,8,28,0.95)',
                                border: '1px solid rgba(168,85,247,0.35)',
                                boxShadow: '0 0 50px rgba(168,85,247,0.25), 0 0 100px rgba(0,245,255,0.08)',
                            }}>
                            {/* Rainbow top line */}
                            <div className="absolute top-0 left-0 right-0 h-[2px]"
                                style={{ background: 'linear-gradient(90deg, #00f5ff, #a855f7, #ec4899, #fbbf24)', backgroundSize: '200%', animation: 'borderFlow 3s linear infinite' }} />
                            <div className="p-5">
                                <button onClick={() => setPromoVisible(false)}
                                    className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white/5 hover:bg-red-500/30 text-gray-600 hover:text-white flex items-center justify-center text-[10px] transition-all">×</button>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping shadow-[0_0_8px_#f87171]" />
                                    <span className="text-[9px] font-mono text-violet-300 uppercase tracking-[0.25em]">Live Promo</span>
                                </div>
                                <p className="text-[56px] font-black leading-none text-shimmer">{promo.percentage}%</p>
                                <p className="text-white font-black text-xl -mt-1 mb-1">OFF</p>
                                <p className="text-gray-400 text-xs mb-4">{promo.title}</p>
                                <Link to="/login?mode=register"
                                    className="block text-center py-2.5 rounded-xl font-black text-black text-[11px] uppercase tracking-widest relative overflow-hidden"
                                    style={{ background: 'linear-gradient(135deg, #00f5ff, #a855f7)', boxShadow: '0 0 25px rgba(0,245,255,0.4)' }}>
                                    Shop Now →
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ════════════ HERO SECTION ════════════ */}
            <section className="relative min-h-screen flex items-center overflow-hidden">

                {/* Aurora background orbs */}
                <ChromaOrb color="#7c3aed" size={900} x={80}  y={40}  delay={0}   duration={14} blur={120} />
                <ChromaOrb color="#0891b2" size={700} x={90}  y={80}  delay={2}   duration={11} blur={100} />
                <ChromaOrb color="#4ade80" size={500} x={70}  y={10}  delay={4}   duration={13} blur={80}  />
                <ChromaOrb color="#ec4899" size={400} x={85}  y={60}  delay={1}   duration={10} blur={80}  />

                {/* Holographic grid */}
                <div className="absolute inset-0 holo-grid opacity-40 pointer-events-none" />

                {/* Dot grid fade */}
                <div className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle, rgba(0,245,255,0.06) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                        maskImage: 'linear-gradient(to right, black 35%, transparent 75%)',
                    }} />

                {/* Content */}
                <div className="relative z-10 w-full max-w-7xl mx-auto px-8 lg:px-16">
                    <div className="max-w-[55%]">

                        {/* Promo pill */}
                        <AnimatePresence>
                            {promo && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                                    className="mb-8 inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-[11px] font-mono uppercase tracking-[0.2em]"
                                    style={{
                                        background: 'rgba(168,85,247,0.1)',
                                        border: '1px solid rgba(168,85,247,0.3)',
                                        color: '#c084fc',
                                        boxShadow: '0 0 20px rgba(168,85,247,0.15)',
                                    }}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                                    🔥 {promo.title} — {promo.percentage}% OFF
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Badge */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                            className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-[0.25em]"
                            style={{
                                background: 'rgba(0,245,255,0.06)',
                                border: '1px solid rgba(0,245,255,0.2)',
                                color: '#00f5ff',
                                boxShadow: '0 0 15px rgba(0,245,255,0.1)',
                            }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00f5ff] animate-pulse shadow-[0_0_6px_#00f5ff]" />
                            Web3 Handloom Network
                        </motion.div>

                        {/* Main title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                            className="font-black tracking-[-0.04em] leading-[0.9] mb-6"
                            style={{ fontSize: 'clamp(3rem, 6.5vw, 6rem)', fontFamily: 'Outfit, sans-serif' }}
                        >
                            <span className="block text-white">Global</span>
                            <span className="block text-shimmer">Handlooms</span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35, duration: 0.8 }}
                            className="text-[#8899aa] text-lg leading-relaxed mb-10 max-w-[480px] font-light"
                        >
                            A decentralized marketplace connecting India's master artisans
                            directly with global buyers. <span style={{ color: '#00f5ff' }}>Zero intermediaries.</span> Pure authenticity.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
                            className="flex flex-col sm:flex-row items-start gap-4">

                            <motion.button onClick={scrollToJoin} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.96 }}
                                className="relative group inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm tracking-[0.12em] uppercase text-white overflow-hidden"
                                style={{
                                    background: 'linear-gradient(135deg, #7c3aed 0%, #0891b2 50%, #4ade80 100%)',
                                    backgroundSize: '200% 200%',
                                    animation: 'auroraShift 4s ease infinite',
                                    boxShadow: '0 0 40px rgba(124,58,237,0.45), 0 0 80px rgba(0,245,255,0.15), 0 8px 30px rgba(0,0,0,0.4)',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}>
                                <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                                    animate={{ x: ['-100%', '200%'] }}
                                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }} />
                                <span className="relative z-10">Enter the Network</span>
                                <span className="relative z-10 group-hover:translate-x-1 transition-transform inline-block">→</span>
                            </motion.button>

                            <motion.button onClick={scrollToJoin} whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                                className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl font-bold text-sm tracking-[0.1em] uppercase transition-all duration-300"
                                style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#6b7280',
                                    cursor: 'pointer',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.borderColor = 'rgba(0,245,255,0.25)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0,245,255,0.1)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}>
                                Sign In
                            </motion.button>
                        </motion.div>

                        {/* Feature pills */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
                            className="mt-12 flex flex-wrap gap-2">
                            {PILLS.map((p, i) => (
                                <motion.span key={p.label}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.9 + i * 0.08 }}
                                    className="px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wider"
                                    style={{
                                        color: p.color,
                                        background: `${p.color}10`,
                                        border: `1px solid ${p.color}28`,
                                        boxShadow: `0 0 10px ${p.color}12`,
                                    }}>
                                    {p.label}
                                </motion.span>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ════════════ BENTO FEATURE GRID ════════════ */}
            <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">

                {/* Section header */}
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="text-center mb-12">
                    <p className="text-[11px] font-mono uppercase tracking-[0.3em] mb-3" style={{ color: '#00f5ff' }}>Platform Features</p>
                    <h2 className="text-4xl font-black tracking-[-0.03em] text-white">
                        Built for the <span className="text-shimmer">Web3 economy</span>
                    </h2>
                    <div className="mt-4 h-px max-w-xs mx-auto" style={{ background: 'linear-gradient(90deg, transparent, #00f5ff, #a855f7, transparent)' }} />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.8 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    {/* Large hero card */}
                    <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300 }}
                        className="lg:col-span-2 rounded-3xl p-8 relative overflow-hidden border border-white/[0.07] group"
                        style={{ background: 'rgba(5,5,22,0.8)', backdropFilter: 'blur(24px)' }}>
                        {/* Animated prism top line */}
                        <div className="absolute top-0 left-0 right-0 h-[2px]"
                            style={{ background: 'linear-gradient(90deg, #00f5ff, #a855f7, #ec4899, #00f5ff)', backgroundSize: '200%', animation: 'borderFlow 3s linear infinite' }} />
                        {/* Corner glow */}
                        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-15 blur-[100px] group-hover:opacity-30 transition-opacity duration-500"
                            style={{ background: 'radial-gradient(circle, #00f5ff, transparent)' }} />
                        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full opacity-10 blur-[80px] group-hover:opacity-20 transition-opacity duration-500"
                            style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />

                        <span className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] mb-5 px-3 py-1.5 rounded-full"
                            style={{ color: '#00f5ff', background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.22)', boxShadow: '0 0 15px rgba(0,245,255,0.1)' }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00f5ff] shadow-[0_0_6px_#00f5ff] animate-pulse" />
                            Artisan Network
                        </span>
                        <p className="text-4xl font-black tracking-tight leading-[1.1] mb-4 text-white">
                            Handcrafted by masters.<br />
                            <span style={{ background: 'linear-gradient(90deg, #00f5ff, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Verified.</span>
                        </p>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-md">
                            Every product is linked to a verified artisan identity from India's finest weaving clusters — Varanasi, Bhuj, Jaipur, and more.
                        </p>
                        <div className="mt-8 text-6xl">🧵</div>
                    </motion.div>

                    {/* Feature cards */}
                    {BENTO_CARDS.map((card, idx) => (
                        <motion.div key={card.tag} whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300 }}
                            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transitionDelay={idx * 0.1}
                            className="rounded-3xl p-7 relative overflow-hidden border border-white/[0.06] group"
                            style={{ background: 'rgba(5,5,22,0.75)' }}>
                            {/* Animated top line */}
                            <div className="absolute top-0 left-0 right-0 h-[2px]"
                                style={{ background: `linear-gradient(to right, transparent, ${card.color}80, transparent)`, animation: 'borderFlow 4s linear infinite' }} />
                            {/* Corner glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 blur-[60px] transition-opacity duration-500"
                                style={{ background: `radial-gradient(circle, ${card.color}, transparent)` }} />
                            <span className="text-[10px] font-mono uppercase tracking-[0.22em] mb-4 block px-2.5 py-1.5 rounded-full w-fit"
                                style={{ color: card.color, background: card.bg, border: `1px solid ${card.border}`, boxShadow: `0 0 12px ${card.color}15` }}>
                                {card.tag}
                            </span>
                            <p className="text-2xl font-black text-white leading-tight mb-3 whitespace-pre-line">{card.title}</p>
                            <p className="text-gray-600 text-sm">{card.desc}</p>
                            <motion.div className="mt-6 text-4xl"
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 3, delay: idx * 0.5, repeat: Infinity, ease: 'easeInOut' }}>
                                {card.icon}
                            </motion.div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* ════════════ STATS BAR ════════════ */}
            <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="rounded-3xl border p-10 grid grid-cols-2 md:grid-cols-4 gap-8 relative overflow-hidden"
                    style={{ background: 'rgba(5,5,22,0.75)', backdropFilter: 'blur(24px)', borderColor: 'rgba(255,255,255,0.05)' }}>
                    {/* Prism top accent */}
                    <div className="absolute top-0 left-0 right-0 h-[2px]"
                        style={{ background: 'linear-gradient(90deg, #00f5ff 0%, #a855f7 25%, #ec4899 50%, #fbbf24 75%, #4ade80 100%)', animation: 'borderFlow 5s linear infinite', backgroundSize: '200%' }} />
                    {/* Background glow */}
                    <div className="absolute inset-0 pointer-events-none"
                        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(124,58,237,0.05) 0%, transparent 70%)' }} />

                    {STATS.map(s => (
                        <motion.div key={s.label} className="text-center"
                            whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 400 }}>
                            <p className="text-5xl font-black mb-2"
                                style={{ color: s.color, textShadow: `0 0 30px ${s.glow}, 0 0 60px ${s.color}30` }}>
                                <Counter target={s.value} suffix={s.suffix} />
                            </p>
                            <p className="text-[11px] text-gray-600 font-mono uppercase tracking-[0.2em]">{s.label}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* ════════════ BOTTOM CTA ════════════ */}
            <section id="join-network-cta" className="relative z-10 max-w-6xl mx-auto px-6 pb-32 text-center">
                {/* Aurora background for CTA section */}
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(124,58,237,0.06) 0%, transparent 70%)' }} />

                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="relative">
                    <p className="text-[11px] text-gray-600 font-mono uppercase tracking-[0.3em] mb-5">
                        Ready to connect?
                    </p>
                    <h2 className="font-black tracking-[-0.03em] mb-8 text-white" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 4rem)', fontFamily: 'Outfit, sans-serif' }}>
                        The future of handlooms<br />
                        <span className="text-shimmer">starts here.</span>
                    </h2>

                    <div className="h-px max-w-sm mx-auto mb-10 opacity-40"
                        style={{ background: 'linear-gradient(90deg, transparent, #a855f7, #00f5ff, transparent)' }} />

                    <Link to="/login?mode=register">
                        <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}
                            className="inline-flex items-center gap-3 px-12 py-5 rounded-2xl font-black text-sm tracking-[0.15em] uppercase text-white relative overflow-hidden"
                            style={{
                                background: 'linear-gradient(135deg, #7c3aed 0%, #0891b2 40%, #4ade80 100%)',
                                backgroundSize: '200% 200%',
                                animation: 'auroraShift 4s ease infinite',
                                boxShadow: '0 0 60px rgba(124,58,237,0.5), 0 0 120px rgba(0,245,255,0.2), 0 12px 40px rgba(0,0,0,0.5)',
                            }}>
                            <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                                animate={{ x: ['-100%', '200%'] }}
                                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1, ease: 'easeInOut' }} />
                            <span className="relative z-10">Join the Network</span>
                            <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                            </svg>
                        </motion.div>
                    </Link>

                    {/* Trust tags below CTA */}
                    <div className="mt-8 flex items-center justify-center gap-6 flex-wrap">
                        {[
                            { t: '🔒 Encrypted', c: '#00f5ff' },
                            { t: '⚡ Instant OTP', c: '#fbbf24' },
                            { t: '🌐 Web3 Verified', c: '#a855f7' },
                            { t: '🧵 Artisan-Direct', c: '#4ade80' },
                        ].map(({ t, c }) => (
                            <span key={t} className="text-[11px] font-mono uppercase tracking-wider"
                                style={{ color: c, textShadow: `0 0 12px ${c}60` }}>
                                {t}
                            </span>
                        ))}
                    </div>
                </motion.div>
            </section>
        </div>
    );
}