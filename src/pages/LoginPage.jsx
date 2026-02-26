import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Globe, KeyRound } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // --- DEMO LOGIN LOGIC (No Backend Required) ---
    const handleLogin = (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Thoda fake delay dalte hain taaki asli loading jaisa feel aaye
        setTimeout(() => {
            if (password === '123456') {
                onLoginSuccess(); // Password sahi hai toh main website khol do
            } else {
                alert("Invalid Password! Please use 123456 for this demo.");
                setIsLoading(false);
            }
        }, 1500);
    };

    return (
        // MAIN CONTAINER
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#09090e] font-sans">

            {/* VIBRANT ANIMATED MESH GRADIENT BACKGROUND */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <motion.div
                    animate={{ x: [0, 80, 0], y: [0, 50, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[20%] -left-[10%] w-[70vw] max-w-[800px] h-[70vw] max-h-[800px] rounded-full bg-cyan-500/40 blur-[120px]"
                />
                <motion.div
                    animate={{ x: [0, -80, 0], y: [0, 80, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[10%] -right-[10%] w-[60vw] max-w-[700px] h-[60vw] max-h-[700px] rounded-full bg-fuchsia-500/40 blur-[130px]"
                />
                <motion.div
                    animate={{ x: [0, 50, 0], y: [0, -60, 0] }}
                    transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-[20%] -left-[10%] w-[80vw] max-w-[900px] h-[80vw] max-h-[900px] rounded-full bg-blue-600/50 blur-[150px]"
                />
                <motion.div
                    animate={{ x: [0, -60, 0], y: [0, -80, 0] }}
                    transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-[20%] -right-[10%] w-[70vw] max-w-[800px] h-[70vw] max-h-[800px] rounded-full bg-orange-500/30 blur-[140px]"
                />
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] max-w-[600px] h-[50vw] max-h-[600px] rounded-full bg-purple-500/20 blur-[100px]"
                />
            </div>

            {/* Subtle Grid Overlay */}
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
                    <div className="relative flex flex-col items-center justify-center mb-8 text-center">
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
                            Project Demo Version
                        </p>
                    </div>

                    {/* --- DEMO INFO BOX --- */}
                    <div className="mb-6 p-3 rounded-xl border border-cyan-400/30 bg-cyan-400/10 flex items-start gap-3">
                        <KeyRound className="w-5 h-5 text-cyan-300 mt-0.5 shrink-0" />
                        <p className="text-sm text-cyan-100/90 leading-relaxed">
                            <strong>Demo Mode Active:</strong> Please use any email address and the password <strong className="text-white bg-white/20 px-1.5 py-0.5 rounded tracking-widest ml-1">123456</strong> to enter the portal.
                        </p>
                    </div>

                    {/* --- FORM SECTION --- */}
                    <div className="relative">
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2 group">
                                <label className="text-xs text-white/80 font-bold uppercase tracking-wider ml-1 group-focus-within:text-white transition-colors">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    required
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="mam@example.com"
                                    className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-400/20 transition-all shadow-inner"
                                />
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-xs text-white/80 font-bold uppercase tracking-wider ml-1 group-focus-within:text-white transition-colors">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    required
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter 123456"
                                    className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-400/20 transition-all shadow-inner"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !email || !password}
                                className="w-full h-14 mt-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white rounded-xl font-bold text-[15px] tracking-wide shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] relative overflow-hidden group"
                            >
                                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                                <span className="relative flex items-center gap-2">
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Access Portal <ArrowRight className="w-5 h-5" /></>}
                                </span>
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}