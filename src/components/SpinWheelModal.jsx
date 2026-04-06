import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, PartyPopper } from "lucide-react";

const prizes = [
    { id: 1, text: "10% OFF", color: "from-neonIndigo to-indigo-700" },
    { id: 2, text: "Try Again", color: "from-gray-600 to-gray-800" },
    { id: 3, text: "Free Shipping", color: "from-cyberCyan to-cyan-700" },
    { id: 4, text: "20% OFF", color: "from-purple-500 to-purple-700" },
    { id: 5, text: "Better Luck Next Time", color: "from-gray-600 to-gray-800" },
    { id: 6, text: "50% JACKPOT!", color: "from-yellow-500 to-orange-600" },
];

export function SpinWheelModal({ isOpen, onClose }) {
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [result, setResult] = useState(null);
    const [hasSpun, setHasSpun] = useState(false);

    const segmentAngle = 360 / prizes.length;

    const handleSpin = () => {
        if (isSpinning || hasSpun) return;

        setIsSpinning(true);
        setResult(null);

        const winningIndex = Math.floor(Math.random() * prizes.length);

        const extraSpins = 360 * (5 + Math.floor(Math.random() * 3));
        const winningAngle = winningIndex * segmentAngle + (segmentAngle / 2);
        const totalRotation = rotation + extraSpins + (360 - winningAngle);

        setRotation(totalRotation);

        setTimeout(() => {
            setIsSpinning(false);
            setResult(prizes[winningIndex]);
            setHasSpun(true);
        }, 5000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-surface glass-panel p-8 w-full max-w-md relative overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.15)]"
                        >
                            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-cyberCyan transition-colors">
                                <X size={24} />
                            </button>

                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-black flex items-center justify-center gap-2 text-white tracking-widest uppercase mb-1">
                                    <Gift className="text-cyberCyan" /> Reward Protocol
                                </h2>
                                <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">Execute spin to claim airdrop</p>
                            </div>

                            <div className="relative w-64 h-64 mx-auto mb-8">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-cyberCyan drop-shadow-[0_0_10px_#00f0ff]"></div>

                                <motion.div
                                    className="w-full h-full rounded-full overflow-hidden border-4 border-surfaceBorder relative shadow-[0_0_30px_rgba(0,240,255,0.2)]"
                                    animate={{ rotate: rotation }}
                                    transition={{ duration: 5, ease: [0.15, 0.85, 0.35, 1] }} 
                                    style={{
                                        background: `conic-gradient(
                      from 0deg,
                      rgba(99, 102, 241, 0.8) 0deg 60deg,
                      rgba(30, 30, 30, 0.8) 60deg 120deg,
                      rgba(0, 240, 255, 0.8) 120deg 180deg,
                      rgba(168, 85, 247, 0.8) 180deg 240deg,
                      rgba(30, 30, 30, 0.8) 240deg 300deg,
                      rgba(234, 179, 8, 0.8) 300deg 360deg
                    )`
                                    }}
                                >
                                    {prizes.map((prize, i) => (
                                        <div
                                            key={prize.id}
                                            className="absolute w-full h-full top-0 left-0 flex items-center justify-center"
                                            style={{ transform: `rotate(${i * segmentAngle + segmentAngle/2}deg)` }}
                                        >
                                            <span className="absolute top-4 text-white font-bold text-xs font-mono uppercase tracking-widest drop-shadow-md bg-black/50 px-2 py-1 rounded" style={{ transform: 'rotate(-90deg)' }}>
                                                {prize.text}
                                            </span>
                                        </div>
                                    ))}
                                </motion.div>
                            </div>

                            <div className="text-center h-20 flex items-center justify-center">
                                {!result && !hasSpun && (
                                    <button
                                        onClick={handleSpin}
                                        disabled={isSpinning}
                                        className="bg-cyberCyan hover:bg-[#5affff] text-black font-black uppercase tracking-[0.2em] text-xs py-4 px-10 rounded shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSpinning ? "Executing..." : "Execute Spin"}
                                    </button>
                                )}

                                {result && (
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="flex flex-col items-center"
                                    >
                                        {result.text.includes("Better") || result.text.includes("Try") ? (
                                            <p className="text-xl font-bold font-mono text-gray-400 uppercase tracking-widest">{result.text}</p>
                                        ) : (
                                            <>
                                                <p className="text-gray-400 font-mono text-xs uppercase tracking-widest mb-2">Airdrop Secured:</p>
                                                <p className={`text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r ${result.color} flex items-center gap-3 drop-shadow-lg`}>
                                                    <PartyPopper className="text-emerald-400 w-8 h-8" /> {result.text}
                                                </p>
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </div>

                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}