import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";

export function CartSidebar({ isOpen, onClose }) {
    const { cart, removeFromCart } = useCart();

    // Total price calculate karne ke liye simple logic
    const totalPrice = cart.reduce((total, item) => {
        const priceNumber = parseInt(item.price.replace(/[^0-9]/g, ''));
        return total + (isNaN(priceNumber) ? 0 : priceNumber);
    }, 0);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Background Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Sidebar Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-neutral-950 border-l border-white/10 z-50 p-6 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                            <h2 className="text-xl font-bold text-white">Your Cart ({cart.length})</h2>
                            <button onClick={onClose} className="p-2 text-neutral-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Cart Items List */}
                        <div className="flex-1 overflow-y-auto pr-2">
                            {cart.length === 0 ? (
                                <p className="text-neutral-500 text-center mt-10">Your cart is empty.</p>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {cart.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center bg-neutral-900 p-4 rounded-lg border border-white/5">
                                            <div>
                                                <h3 className="text-white font-medium">{item.name}</h3>
                                                <p className="text-neutral-400 text-sm">{item.price}</p>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(index)}
                                                className="text-neutral-500 hover:text-red-400 transition-colors p-2"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer / Checkout */}
                        {cart.length > 0 && (
                            <div className="border-t border-white/10 pt-4 mt-4">
                                <div className="flex justify-between items-center mb-4 text-lg">
                                    <span className="text-neutral-300">Total</span>
                                    <span className="text-white font-bold">₹{totalPrice.toLocaleString('en-IN')}</span>
                                </div>
                                <button className="w-full bg-white text-black py-3 rounded-lg font-medium hover:bg-neutral-200 transition-colors">
                                    Proceed to Checkout
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}