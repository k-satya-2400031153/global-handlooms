import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, PartyPopper } from "lucide-react";
import { cn } from "../utils";

const prizes = [
    { id: 1, text: "10% OFF", color: "from-indigo-500 to-indigo-700" },
    { id: 2, text: "Try Again", color: "from-neutral-600 to-neutral-800" },
    { id: 3, text: "Free Shipping", color: "from-cyan-500 to-cyan-700" },
    { id: 4, text: "20% OFF", color: "from-purple-500 to-purple-700" },
    { id: 5, text: "Better Luck Next Time", color: "from-neutral-600 to-neutral-800" },
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

        // Random index select karo
        const winningIndex = Math.floor(Math.random() * prizes.length);

        // Calculate rotation: Kam se kam 5 full spins (360*5) + winning segment tak pahunchne ka angle
        // Thoda random offset add kiya taaki needle segment ke beech mein ruke
        const extraSpins = 360 * (5 + Math.floor(Math.random() * 3));
        const winningAngle = winningIndex * segmentAngle + (segmentAngle / 2);
        const totalRotation = rotation + extraSpins + (360 - winningAngle);

        setRotation(totalRotation);

        // Spin khatam hone ke baad result dikhao
        setTimeout(() => {
            setIsSpinning(false);
            setResult(prizes[winningIndex]);
            setHasSpun(true);
        }, 5000); // Animation duration se match karna chahiye
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-neutral-950 border border-white/10 rounded-2xl p-6 w-full max-w-md relative overflow-hidden"
                        >
                            <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-white">
                                <X size={24} />
                            </button>

                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                                    <Gift className="text-indigo-400" /> Spin & Win!
                                </h2>
                                <p className="text-neutral-400 text-sm">Spin the wheel to get an exclusive discount.</p>
                            </div>

                            {/* Wheel Container */}
                            <div className="relative w-64 h-64 mx-auto mb-8">
                                {/* Pointer */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-white drop-shadow-lg"></div>

                                {/* The Rotating Wheel */}
                                <motion.div
                                    className="w-full h-full rounded-full overflow-hidden border-4 border-white/20 relative"
                                    animate={{ rotate: rotation }}
                                    transition={{ duration: 5, ease: [0.15, 0.85, 0.35, 1] }} // Cubic-bezier for realistic slowdown
                                    style={{
                                        background: `conic-gradient(
                      from 0deg,
                      rgba(99, 102, 241, 0.8) 0deg 60deg,   /* Indigo */
                      rgba(82, 82, 82, 0.8) 60deg 120deg,  /* Neutral */
                      rgba(6, 182, 212, 0.8) 120deg 180deg, /* Cyan */
                      rgba(168, 85, 247, 0.8) 180deg 240deg, /* Purple */
                      rgba(82, 82, 82, 0.8) 240deg 300deg,  /* Neutral */
                      rgba(234, 179, 8, 0.8) 300deg 360deg  /* Yellow */
                    )`
                                    }}
                                >
                                    {prizes.map((prize, i) => (
                                        <div
                                            key={prize.id}
                                            className="absolute w-full h-full top-0 left-0 flex items-center justify-center"
                                            style={{ transform: `rotate(${i * segmentAngle + segmentAngle/2}deg)` }}
                                        >
                       <span className="absolute top-4 text-white font-bold text-sm drop-shadow-md" style={{ transform: 'rotate(-90deg)' }}>
                         {prize.text}
                       </span>
                                        </div>
                                    ))}
                                </motion.div>
                            </div>

                            {/* Controls & Result */}
                            <div className="text-center h-20 flex items-center justify-center">
                                {!result && !hasSpun && (
                                    <button
                                        onClick={handleSpin}
                                        disabled={isSpinning}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSpinning ? "Spinning..." : "SPIN NOW!"}
                                    </button>
                                )}

                                {result && (
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="flex flex-col items-center"
                                    >
                                        {result.text.includes("Better") || result.text.includes("Try") ? (
                                            <p className="text-xl font-bold text-neutral-300">{result.text}</p>
                                        ) : (
                                            <>
                                                <p className="text-neutral-400 text-sm mb-1">Congratulations! You won:</p>
                                                <p className={`text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r ${result.color} flex items-center gap-2`}>
                                                    <PartyPopper /> {result.text}
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