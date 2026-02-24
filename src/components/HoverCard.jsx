import { useState } from "react";
import { motion } from "framer-motion";

export function HoverCard({ children, title, description }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative w-full max-w-sm rounded-xl border border-white/10 bg-neutral-950 p-6 overflow-hidden transition-colors hover:bg-neutral-900"
        >
            {/* Glow Effect */}
            {isHovered && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent blur-xl"
                />
            )}

            {/* Card Content */}
            <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-neutral-400 text-sm">{description}</p>
                <div className="mt-4">
                    {children}
                </div>
            </div>
        </div>
    );
}