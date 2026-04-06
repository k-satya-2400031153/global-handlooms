import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import CursorFX from './components/CursorFX';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ArtisanView from './pages/ArtisanView';
import BuyerView from './pages/BuyerView';
import AdminView from './pages/AdminView';
import MarketingView from './pages/MarketingView';
import CheckoutPage from './pages/CheckoutPage';
import ProfilePage from './pages/ProfilePage';

const API = import.meta.env.VITE_API_URL;

function App() {
    const [activePromo, setActivePromo] = useState(null);

    // Fetch active discount on App load
    useEffect(() => {
        const fetchPromo = async () => {
            try {
                const r = await fetch(`${API}/marketing/discounts/active`);
                if(r.ok) {
                    const d = await r.json();
                    if(d.data && d.data.isActive) setActivePromo(d.data);
                }
            } catch(e) {}
        };
        fetchPromo();
        // Optional: Poll every minute to stay live
        const iv = setInterval(fetchPromo, 60000);
        return () => clearInterval(iv);
    }, []);

    // --- SECRET BACKDOOR 1: ADMIN (Bottom Right) ---
    const handleSecretAdmin = async () => {
        const code = window.prompt('ENTER LEVEL 5 OVERRIDE (ADMIN):');
        if (!code) return;
        try {
            const r = await fetch(`${API}/auth/override-token`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, role: 'Admin' })
            });
            const d = await r.json();
            if (d.success) {
                localStorage.setItem('user', JSON.stringify(d.user));
                localStorage.setItem('token', d.token);
                window.location.href = '/admin';
            } else alert('❌ Access Denied.');
        } catch { alert('❌ Server unreachable.'); }
    };

    // --- SECRET BACKDOOR 2: MARKETING (Bottom Left) ---
    const handleSecretMarketing = async () => {
        const code = window.prompt('ENTER CAMPAIGN OVERRIDE (MARKETING):');
        if (!code) return;
        try {
            const r = await fetch(`${API}/auth/override-token`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, role: 'Marketing Specialist' })
            });
            const d = await r.json();
            if (d.success) {
                localStorage.setItem('user', JSON.stringify(d.user));
                localStorage.setItem('token', d.token);
                window.location.href = '/marketing';
            } else alert('❌ Server unreachable.'); }
        catch { alert('❌ Server unreachable.'); }
    };

    return (
        <BrowserRouter>
            <div className="bg-background min-h-screen text-white selection:bg-cyberCyan/30 relative">
                {/* Ambient scan line */}
                <div className="scan-bar" />
                <Toaster
                    position="bottom-right"
                    toastOptions={{
                        style: {
                            background: 'rgba(6,6,22,0.95)',
                            color: '#e2e8f0',
                            border: '1px solid rgba(0,245,255,0.2)',
                            backdropFilter: 'blur(24px)',
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: '13px',
                            boxShadow: '0 0 30px rgba(0,245,255,0.1), 0 8px 30px rgba(0,0,0,0.5)',
                        },
                        success: {
                            iconTheme: { primary: '#00f5ff', secondary: '#000' },
                            style: {
                                background: 'rgba(6,6,22,0.95)',
                                border: '1px solid rgba(0,245,255,0.3)',
                                boxShadow: '0 0 30px rgba(0,245,255,0.15)',
                            },
                        },
                        error: {
                            iconTheme: { primary: '#ff003c', secondary: '#fff' },
                            style: {
                                background: 'rgba(6,6,22,0.95)',
                                border: '1px solid rgba(255,0,60,0.3)',
                                boxShadow: '0 0 30px rgba(255,0,60,0.15)',
                            },
                        },
                    }}
                />
                <CursorFX />

                {/* LIVE GLOBAL PROMO BANNER */}
                {activePromo && (
                    <div className="w-full relative flex justify-center items-center py-2.5 px-4 z-[9999] overflow-hidden"
                        style={{
                            background: 'linear-gradient(90deg, #7c3aed 0%, #0891b2 25%, #ec4899 50%, #f59e0b 75%, #4ade80 100%)',
                            backgroundSize: '200% 100%',
                            animation: 'borderFlow 3s linear infinite',
                            boxShadow: '0 0 30px rgba(0,245,255,0.4), 0 4px 20px rgba(124,58,237,0.3)',
                        }}>
                        <span className="text-black font-black text-[11px] uppercase tracking-[0.25em]">
                            🚀 {activePromo.title} — ENJOY {activePromo.percentage}% OFF YOUR PURCHASE!
                        </span>
                        <button onClick={() => setActivePromo(null)}
                            className="absolute right-4 w-5 h-5 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-black text-xs font-black transition-all">
                            ×
                        </button>
                    </div>
                )}

                <Navbar />

                <main>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/artisan" element={<ProtectedRoute requiredRole="Artisan"><ArtisanView /></ProtectedRoute>} />
                        <Route path="/buyer" element={<ProtectedRoute requiredRole="Buyer"><BuyerView /></ProtectedRoute>} />
                        <Route path="/checkout" element={<ProtectedRoute requiredRole="Buyer"><CheckoutPage /></ProtectedRoute>} />
                        <Route path="/admin" element={<ProtectedRoute requiredRole="Admin"><AdminView /></ProtectedRoute>} />
                        <Route path="/marketing" element={<ProtectedRoute requiredRole="Marketing Specialist"><MarketingView /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </main>

                <button onClick={handleSecretAdmin} className="fixed bottom-2 right-2 w-6 h-6 flex items-center justify-center font-mono text-[10px] text-white/10 hover:text-red-500 hover:bg-red-900/20 rounded-full transition-all duration-300 z-[9999] focus:outline-none">a</button>
                <button onClick={handleSecretMarketing} className="fixed bottom-2 left-2 w-6 h-6 flex items-center justify-center font-mono text-[10px] text-white/10 hover:text-pink-500 hover:bg-pink-900/20 rounded-full transition-all duration-300 z-[9999] focus:outline-none">m</button>
            </div>
        </BrowserRouter>
    );
}

export default App;