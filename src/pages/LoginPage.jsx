import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, Globe, Sparkles } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // --- REAL BACKEND API CALLS ---
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // ✅ FIX 1: URL ke end mein 'send-otp' kar diya hai
            const response = await fetch('https://global-handlooms.onrender.com/api/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                setStep(2);
            } else {
                alert("Failed to send OTP. Backend server check karo.");
            }
        } catch (error) {
            console.error("Error connecting to backend:", error);
            alert("Server down hai ya connect nahi ho raha.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // ✅ FIX 2: Localhost ko hatakar Render ka Live URL daal diya hai
            const response = await fetch('https://global-handlooms.onrender.com/api/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });

            if (response.ok) {
                onLoginSuccess();
            } else {
                alert("Invalid OTP! Sahi code dalo.");
            }
        } catch (error) {
            console.error("Error verifying OTP:", error);
            alert("Server down hai ya connect nahi ho raha.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // MAIN CONTAINER
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#09090e] font-sans">

            {/* VIBRANT ANIMATED MESH GRADIENT BACKGROUND */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                {/* Top Left - Cyan */}
                <motion.div
                    animate={{ x: [0, 80, 0], y: [0, 50, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[20%] -left-[10%] w-[70vw] max-w-[800px] h-[70vw] max-h-[800px] rounded-full bg-cyan-500/40 blur-[120px]"
                />

                {/* Top Right - Fuchsia */}
                <motion.div
                    animate={{ x: [0, -80, 0], y: [0, 80, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[10%] -right-[10%] w-[60vw] max-w-[700px] h-[60vw] max-h-[700px] rounded-full bg-fuchsia-500/40 blur-[130px]"
                />

                {/* Bottom Left - Royal Blue */}
                <motion.div
                    animate={{ x: [0, 50, 0], y: [0, -60, 0] }}
                    transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-[20%] -left-[10%] w-[80vw] max-w-[900px] h-[80vw] max-h-[900px] rounded-full bg-blue-600/50 blur-[150px]"
                />

                {/* Bottom Right - Vibrant Orange/Pink */}
                <motion.div
                    animate={{ x: [0, -60, 0], y: [0, -80, 0] }}
                    transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-[20%] -right-[10%] w-[70vw] max-w-[800px] h-[70vw] max-h-[800px] rounded-full bg-orange-500/30 blur-[140px]"
                />

                {/* Center subtle glow to tie it together */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] max-w-[600px] h-[50vw] max-h-[600px] rounded-full bg-purple-500/20 blur-[100px]"
                />
            </div>

            {/* Subtle Grid Overlay for texture */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: `linear-gradient(to right, #ffffff10 1px, transparent 1px), linear-gradient(to bottom, #ffffff10 1px, transparent 1px)`, backgroundSize: '4rem 4rem' }}></div>

            {/* GLASS CARD CONTAINER */}
            <div className="relative z-10 w-full max-w-[440px] p-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="backdrop-blur-3xl bg-black/20 border border-white/20 shadow-[0_8px_40px_rgba(0,0,0,0.4)] rounded-[2rem] p-8 overflow-hidden relative"
                >
                    {/* Top metallic rim reflection */}
                    <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>

                    {/* --- HEADER SECTION --- */}
                    <div className="relative flex flex-col items-center justify-center mb-10 text-center">
                        <div className="w-14 h-14 mb-5 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-lg backdrop-blur-md">
                            <Globe className="w-7 h-7 text-white" />
                        </div>

                        <div className="relative">
                            <div className="absolute -inset-x-4 -inset-y-2 bg-gradient-to-r from-blue-400 via-fuchsia-400 to-orange-400 rounded-full blur-2xl opacity-40 animate-pulse-slow pointer-events-none"></div>
                            <h1 className="relative z-10 text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
                                Global Handlooms
                            </h1>
                        </div>
                        <p className="text-white/80 mt-3 text-sm font-semibold tracking-wider uppercase">
                            Artisan Access Portal
                        </p>
                    </div>

                    {/* --- FORM SECTION --- */}
                    <div className="relative min-h-[200px]">
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.form
                                    key="email-step"
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: 20, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    onSubmit={handleSendOTP}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2 group">
                                        <label className="text-xs text-white/80 font-bold uppercase tracking-wider ml-1 group-focus-within:text-white transition-colors">Email Address</label>
                                        <input
                                            type="email"
                                            value={email}
                                            required
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="name@example.com"
                                            className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-400/20 transition-all shadow-inner"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading || !email}
                                        className="w-full h-14 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white rounded-xl font-bold text-[15px] tracking-wide shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] relative overflow-hidden group"
                                    >
                                        <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                                        <span className="relative flex items-center gap-2">
                                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue <ArrowRight className="w-5 h-5" /></>}
                                        </span>
                                    </button>
                                </motion.form>
                            ) : (
                                <motion.form
                                    key="otp-step"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    onSubmit={handleVerifyOTP}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs text-white/80 font-bold uppercase tracking-wider ml-1">Verification Code</label>
                                            <button type="button" onClick={() => setStep(1)} className="text-xs text-cyan-300 hover:text-cyan-200 font-semibold transition-colors">
                                                Change Email
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            placeholder="••••••"
                                            className="w-full bg-black/30 border border-white/20 rounded-xl py-4 text-center text-2xl font-bold tracking-[0.5em] text-white focus:outline-none focus:border-purple-400/80 focus:ring-2 focus:ring-purple-400/20 transition-all placeholder:text-white/20 placeholder:tracking-normal font-mono shadow-inner"
                                        />
                                        <p className="text-center text-white/60 text-xs mt-3 font-medium">Sent to {email}</p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading || otp.length !== 6}
                                        className="w-full h-14 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-xl font-bold text-[15px] tracking-wide shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] relative overflow-hidden group"
                                    >
                                        <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                                        <span className="relative flex items-center gap-2">
                                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify & Login <Sparkles className="w-4 h-4 fill-white/30" /></>}
                                        </span>
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Bottom footer links */}
                <div className="mt-8 text-center text-sm font-medium text-white/50 flex justify-center gap-6 relative z-10">
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                </div>
            </div>
        </div>
    );
}