// src/App.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";

import { CartSidebar } from "./components/CartSidebar";
import { useCart } from "./context/CartContext";

// 👉 PAGE IMPORTS: Yahan humne saare alag-alag views (pages) import kiye hain taaki unhe zaroorat padne par dikha sakein.
import LoginPage from "./pages/LoginPage";
import BuyerView from "./pages/BuyerView";
import ArtisanView from "./pages/ArtisanView";
import AdminView from "./pages/AdminView";
import MarketingView from "./pages/MarketingView";

export default function App() {
    // 👉 AUTHENTICATION STATE: Yeh sabse main state hai. Yeh check karti hai ki user ne login kiya hai ya nahi. Shuru mein yeh 'false' hoti hai.
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // 👉 ROUTING STATE: Yeh yaad rakhti hai ki abhi kaunsa tab (Role) open hai.
    const [activeRole, s~etActiveRole] = useState("Buyer");

    // 👉 UI STATES: Yeh cursor ki position aur cart sidebar ko open/close karne ke liye hain.
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isCartOpen, setIsCartOpen] = useState(false);

    const { cart } = useCart();
    const roles = ["Buyer", "Artisan", "Marketing", "Admin"];

    // 👉 CUSTOM CURSOR LOGIC: Yeh function mouse ki (x, y) position ko track karta hai taaki custom glowing cursor mouse ke peeche chal sake.
    useEffect(() => {
        const updateMousePosition = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", updateMousePosition);
        return () => window.removeEventListener("mousemove", updateMousePosition);
    }, []);

    // 👉 DYNAMIC RENDERING LOGIC: Yeh function check karta hai ki abhi kaunsa tab select kiya hua hai aur uske hisaab se sahi page component return karta hai.
    const renderView = () => {
        switch (activeRole) {
            case "Buyer": return <BuyerView />;
            case "Artisan": return <ArtisanView />;
            case "Marketing": return <MarketingView />;
            case "Admin": return <AdminView />;
            default: return <BuyerView />;
        }
    };

    // 🛑 SECURITY/GATEKEEPER: AGAR LOGIN NAHI HAI
    // Agar 'isAuthenticated' false hai, toh aage ka app load hi nahi hoga. Sirf LoginPage return hoga.
    // 'onLoginSuccess' ek prop hai jo humne LoginPage ko diya hai. Jab OTP verify ho jayega, toh wahan se yeh function call hoga aur state 'true' ho jayegi.
    if (!isAuthenticated) {
        return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
    }

    // ✅ MAIN DASHBOARD: AGAR LOGIN HAI
    // Jab state 'true' ho jayegi, toh LoginPage gayab ho jayega aur yeh main app structure smooth fade-in animation ke sath render hoga.
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }} // Explosion ke baad smooth fade in deta hai
            className="relative min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 pb-12 overflow-hidden cursor-default"
        >
            {/* 👉 CUSTOM CURSOR */}
            <motion.div
                className="fixed top-0 left-0 w-8 h-8 rounded-full border border-cyan-400 pointer-events-none z-[100] mix-blend-screen shadow-[0_0_15px_rgba(6,182,212,0.8)] backdrop-blur-sm bg-cyan-400/10 hidden md:block"
                animate={{ x: mousePosition.x - 16, y: mousePosition.y - 16 }}
                transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.5 }}
            />

            {/* 👉 BACKGROUND ANIMATED GLOWS */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-[spin_10s_linear_infinite]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[40rem] h-[40rem] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-[spin_15s_linear_infinite_reverse]" />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* 👉 TOP NAVIGATION BAR */}
                <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl shadow-lg">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="text-2xl md:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 animate-gradient drop-shadow-[0_0_20px_rgba(79,70,229,0.35)]"
                        >
                            Global Handlooms
                        </motion.h1>

                        <div className="flex items-center">
                            {/* 👉 ROLE SWITCHER BUTTONS (TABS) */}
                            <div className="flex gap-1 p-1 bg-slate-900/50 rounded-xl border border-white/5">
                                {roles.map((role) => (
                                    <button
                                        key={role}
                                        onClick={() => setActiveRole(role)} // Click karne par activeRole state update hoti hai
                                        className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            activeRole === role ? "text-indigo-200" : "text-slate-400 hover:text-slate-200"
                                        }`}
                                    >
                                        {/* Active tab ke peeche glowing box ka animation */}
                                        {activeRole === role && (
                                            <motion.div
                                                layoutId="active-nav-tab"
                                                className="absolute inset-0 bg-indigo-500/20 border border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.2)] rounded-lg z-0"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                        <span className="relative z-10">{role} View</span>
                                    </button>
                                ))}
                            </div>

                            {/* 👉 CART ICON: Ispe click karne se isCartOpen ki state 'true' ho jati hai */}
                            <div className="flex items-center ml-4 pl-4 border-l border-white/20">
                                <div
                                    onClick={() => setIsCartOpen(true)}
                                    className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                                >
                                    <ShoppingCart size={20} className="text-white" />
                                    {/* Agar cart mein items hain, toh chhota sa red badge dikhao */}
                                    {cart.length > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(79,70,229,0.8)]">
                                            {cart.length}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* 👉 MAIN PAGE CONTENT (DYNAMIC) */}
                <main className="max-w-7xl mx-auto px-6 flex-grow w-full pt-32 md:pt-28">
                    {/* AnimatePresence ensures ki purana page smoothly fade out ho aur naya fade in ho */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeRole} // Key change hone par animation trigger hoti hai
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="w-full h-full"
                        >
                            {/* Yahan par actual page render ho raha hai switch statement ke according */}
                            {renderView()}
                        </motion.div>
                    </AnimatePresence>
                </main>

                {/* 👉 CART SIDEBAR: Yeh component hamesha mounted rehta hai, but dikhta tabhi hai jab isCartOpen 'true' ho */}
                <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            </div>
        </motion.div>
    );
}