import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminView from './pages/AdminView'
import ArtisanView from './pages/ArtisanView'
import BuyerView from './pages/BuyerView'
import MarketingView from './pages/MarketingView'

export default function App() {
    const [activeRole, setActiveRole] = useState('Buyer')
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    // Mouse track karne ka logic
    useEffect(() => {
        const updateMousePosition = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY })
        }
        window.addEventListener("mousemove", updateMousePosition)
        return () => window.removeEventListener("mousemove", updateMousePosition)
    }, [])

    const renderView = () => {
        switch(activeRole) {
            case 'Admin': return <AdminView />
            case 'Artisan': return <ArtisanView />
            case 'Marketing': return <MarketingView />
            default: return <BuyerView />
        }
    }

    return (
        <div className="relative min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 pb-12 overflow-hidden cursor-default">

            {/* Custom Glowing Web3 Cursor */}
            <motion.div
                className="fixed top-0 left-0 w-8 h-8 rounded-full border border-cyan-400 pointer-events-none z-[100] mix-blend-screen shadow-[0_0_15px_rgba(6,182,212,0.8)] backdrop-blur-sm bg-cyan-400/10 hidden md:block"
                animate={{ x: mousePosition.x - 16, y: mousePosition.y - 16 }}
                transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.5 }}
            />

            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-[spin_10s_linear_infinite]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[40rem] h-[40rem] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-[spin_15s_linear_infinite_reverse]" />
            </div>

            <div className="relative z-10">
                <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/50 border-b border-white/10 px-6 py-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                        Global Handlooms
                    </h1>

                    <nav className="flex flex-wrap justify-center gap-2 p-1 bg-slate-900/50 rounded-xl border border-white/5">
                        {['Buyer', 'Artisan', 'Marketing', 'Admin'].map(role => (
                            <button
                                key={role}
                                onClick={() => setActiveRole(role)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                    activeRole === role
                                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.2)]'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                }`}
                            >
                                {role} View
                            </button>
                        ))}
                    </nav>
                </header>

                <main className="max-w-7xl mx-auto px-6">
                    {renderView()}
                </main>
            </div>
        </div>
    )
}