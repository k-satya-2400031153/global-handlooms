import { motion, AnimatePresence } from "framer-motion";
import { X, Sprout, Scissors, ShieldCheck, Truck, Award } from "lucide-react";

export function TraceabilityModal({ isOpen, onClose, product }) {
    // Dummy Blockchain/Traceability Data for SIH Presentation
    const timelineData = [
        { id: 1, title: "Cotton Sourced", desc: "Organic cotton procured directly from farmers.", location: "Kutch, Gujarat", date: "12 Oct", icon: <Sprout size={20} />, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
        { id: 2, title: "Spinning & Weaving", desc: "Hand-spun on traditional charkhas and handlooms.", location: "Bhujodi Village", date: "18 Oct", icon: <Scissors size={20} />, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
        { id: 3, title: "Natural Dyeing", desc: "Dyed using organic indigo and madder root extracts.", location: "Ajrakhpur", date: "22 Oct", icon: <Award size={20} />, color: "text-neonIndigo", bg: "bg-neonIndigo/10", border: "border-neonIndigo/20" },
        { id: 4, title: "Quality Certification", desc: "Passed Handloom Mark & Silk Mark quality checks.", location: "Textile Ministry Node", date: "25 Oct", icon: <ShieldCheck size={20} />, color: "text-cyberCyan", bg: "bg-cyberCyan/10", border: "border-cyberCyan/20" },
        { id: 5, title: "Ready for Dispatch", desc: "Packaged sustainably and ready for global shipping.", location: "Global Handlooms Hub", date: "28 Oct", icon: <Truck size={20} />, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/80 backdrop-blur-xl"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative z-10 glass-panel shadow-[0_0_50px_rgba(34,211,238,0.15)] rounded-2xl w-full max-w-lg flex flex-col max-h-[85vh] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-surfaceBorder flex justify-between items-start bg-black/40">
                            <div>
                                <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-widest">
                                    <ShieldCheck className="text-cyberCyan" /> Ledger Trace
                                </h2>
                                <p className="text-cyberCyan font-mono text-xs mt-2 uppercase">
                                    {product?.name || "Authentic Handloom Product"}
                                </p>
                            </div>
                            <button onClick={onClose} className="p-2 bg-surface hover:bg-white/10 rounded border border-surfaceBorder text-gray-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Timeline Area (Scrollable) */}
                        <div className="p-6 overflow-y-auto relative flex-1 custom-scrollbar">
                            {/* Vertical Line */}
                            <div className="absolute left-[3.25rem] top-10 bottom-10 w-[2px] bg-gradient-to-b from-neonIndigo via-cyberCyan to-transparent z-0"></div>

                            <div className="space-y-8 relative z-10">
                                {timelineData.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.15, duration: 0.4 }}
                                        className="flex gap-4 group"
                                    >
                                        {/* Icon Node */}
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${item.bg} ${item.border} ${item.color} shadow-lg shadow-black/50 backdrop-blur-sm z-10 relative group-hover:scale-110 transition-transform`}>
                                            <span className={`absolute inset-0 rounded-full animate-ping opacity-30 ${item.bg}`}></span>
                                            {item.icon}
                                        </div>

                                        {/* Content Card */}
                                        <div className="bg-black/60 border border-surfaceBorder p-4 rounded-xl flex-1 group-hover:border-cyberCyan/30 transition-colors backdrop-blur-md">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-white font-bold text-[15px]">{item.title}</h3>
                                                <span className="text-xs font-mono text-cyberCyan">{item.date}</span>
                                            </div>
                                            <p className="text-gray-400 text-sm mb-3">{item.desc}</p>
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface border border-white/5 text-[10px] text-gray-300 font-mono uppercase tracking-widest shadow-inner">
                                                {item.location}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-surfaceBorder bg-black/40 text-center">
                            <p className="text-xs font-mono text-emerald-400 flex items-center justify-center gap-2 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Authenticity Verified on-chain
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}