import { motion } from "framer-motion";

export function ScrollReveal({ children, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }} // Element thoda screen mein aane ke baad trigger hoga
            transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1], // Apple/Huly style ease-out curve
                delay: delay
            }}
        >
            {children}
        </motion.div>
    );
}