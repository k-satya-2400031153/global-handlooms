import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";

export function CartSidebar({ isOpen, onClose }) {
    const { cart, removeFromCart } = useCart();

    const totalPrice = cart.reduce((total, item) => {
        const priceNumber = parseInt(String(item.price).replace(/[^0-9]/g, ''));
        return total + (isNaN(priceNumber) ? 0 : priceNumber);
    }, 0);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
                    />

                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-surface border-l border-surfaceBorder z-50 p-6 flex flex-col shadow-[0_0_50px_rgba(34,211,238,0.1)]"
                    >
                        <div className="flex justify-between items-center border-b border-surfaceBorder pb-4 mb-4">
                            <h2 className="text-xl font-bold text-white uppercase tracking-widest font-mono">Staging Cart <span className="text-cyberCyan">({cart.length})</span></h2>
                            <button onClick={onClose} className="p-2 text-gray-500 hover:text-cyberCyan transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {cart.length === 0 ? (
                                <p className="text-gray-500 text-center mt-10 font-mono text-xs uppercase tracking-widest">Staging area empty.</p>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {cart.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center glass-panel p-4 rounded-xl group hover:border-cyberCyan/50 transition-colors">
                                            <div>
                                                <h3 className="text-white font-medium group-hover:text-cyberCyan transition-colors">{item.name}</h3>
                                                <p className="text-emerald-400 font-mono text-sm">${item.price}</p>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(index)}
                                                className="text-gray-500 hover:text-alertRed transition-colors p-2"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="border-t border-surfaceBorder pt-4 mt-4">
                                <div className="flex justify-between items-center mb-6 text-lg">
                                    <span className="text-gray-400 font-mono text-xs uppercase tracking-widest">Total Liquidity</span>
                                    <span className="text-emerald-400 font-black text-2xl">${totalPrice.toLocaleString('en-US')}</span>
                                </div>
                                <button className="w-full bg-cyberCyan/10 border border-cyberCyan/50 text-cyberCyan py-4 rounded-lg font-black uppercase tracking-[0.2em] text-xs hover:bg-cyberCyan hover:text-black transition-all shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                                    Execute Contract
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}