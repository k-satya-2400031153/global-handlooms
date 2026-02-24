import { motion } from "framer-motion";

export function TextReveal({ text, className }) {
    const words = text.split(" ");

    return (
        <div className={`flex flex-wrap gap-x-2 ${className}`}>
            {words.map((word, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.5,
                        delay: i * 0.1, // Har word thode delay ke baad aayega
                        ease: "easeOut"
                    }}
                >
                    {word}
                </motion.span>
            ))}
        </div>
    );
}