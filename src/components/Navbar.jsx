import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ROLE_COLORS = {
    Artisan:               { color: '#a855f7', glow: 'rgba(168,85,247,0.5)' },
    Buyer:                 { color: '#00f5ff', glow: 'rgba(0,245,255,0.5)'  },
    Admin:                 { color: '#ff003c', glow: 'rgba(255,0,60,0.5)'   },
    'Marketing Specialist':{ color: '#f0abfc', glow: 'rgba(240,171,252,0.5)'},
};

const ROLE_DASH = {
    Artisan: '/artisan', Buyer: '/buyer',
    Admin: '/admin', 'Marketing Specialist': '/marketing',
};
const ROLE_LABEL = {
    Artisan: 'Creator', Buyer: 'Market',
    Admin: 'Overseer', 'Marketing Specialist': 'Campaigns',
};

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Forces Navbar to re-render on all navigations (including back swipe)
    const token = localStorage.getItem('token');

    let user = null;
    try {
        const s = localStorage.getItem('user');
        if (s) user = JSON.parse(s);
    } catch { localStorage.removeItem('user'); }

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Disconnected from network.');
        navigate('/login');
    };

    const rc = user ? (ROLE_COLORS[user.role] || { color: '#00f5ff', glow: 'rgba(0,245,255,0.5)' }) : null;

    return (
        <nav style={{
            background: 'rgba(0,0,10,0.75)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            position: 'sticky', top: 0, zIndex: 50,
            boxShadow: '0 4px 30px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.04)',
        }}>
            {/* Prism underline */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.3), rgba(168,85,247,0.3), rgba(236,72,153,0.2), transparent)',
                pointerEvents: 'none',
            }} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <motion.span
                            className="text-2xl"
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                            🌐
                        </motion.span>
                        <span className="text-xl font-black tracking-[-0.03em]"
                            style={{
                                background: 'linear-gradient(90deg, #00f5ff 0%, #a855f7 40%, #f0abfc 70%, #00f5ff 100%)',
                                backgroundSize: '200% auto',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                animation: 'rainbowShift 5s linear infinite',
                            }}>
                            GLOBAL HANDLOOMS
                        </span>
                    </Link>

                    {/* Nav items */}
                    <div className="flex items-center gap-5">
                        {token && user ? (
                            <>
                                {/* User info */}
                                <span className="hidden md:inline-flex items-center gap-2 text-[11px] font-mono tracking-wider uppercase">
                                    <span className="status-dot-live" />
                                    <span style={{ color: rc?.color, textShadow: `0 0 10px ${rc?.glow}` }} className="font-bold">
                                        {user.name}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md text-[10px]"
                                        style={{
                                            color: rc?.color,
                                            background: `${rc?.color}14`,
                                            border: `1px solid ${rc?.color}28`,
                                        }}>
                                        {user.role}
                                    </span>
                                </span>

                                {/* Dashboard link */}
                                {user.role && ROLE_DASH[user.role] && (
                                    <Link to={ROLE_DASH[user.role]}
                                        className="text-[11px] font-black uppercase tracking-widest transition-all duration-200"
                                        style={{ color: rc?.color }}
                                        onMouseEnter={e => { e.target.style.textShadow = `0 0 12px ${rc?.glow}`; }}
                                        onMouseLeave={e => { e.target.style.textShadow = 'none'; }}>
                                        {ROLE_LABEL[user.role]}
                                    </Link>
                                )}

                                {/* Avatar */}
                                <Link to="/profile">
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                                        className="flex items-center justify-center w-9 h-9 rounded-full font-black text-sm text-black"
                                        style={{
                                            background: `linear-gradient(135deg, ${rc?.color || '#00f5ff'}, #a855f7)`,
                                            boxShadow: `0 0 20px ${rc?.glow || 'rgba(0,245,255,0.5)'}`,
                                        }}>
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </motion.div>
                                </Link>

                                {/* Logout */}
                                <motion.button onClick={handleLogout}
                                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                    className="text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all duration-300"
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid rgba(255,0,60,0.4)',
                                        color: '#ff003c',
                                        boxShadow: '0 0 12px rgba(255,0,60,0.08)',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = 'rgba(255,0,60,0.1)';
                                        e.currentTarget.style.boxShadow = '0 0 25px rgba(255,0,60,0.3)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.boxShadow = '0 0 12px rgba(255,0,60,0.08)';
                                    }}>
                                    Disconnect
                                </motion.button>
                            </>
                        ) : null}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;