import { useState } from "react";
import { ShoppingBag, Star, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Float, Sparkles, Stars } from '@react-three/drei';
import { useCart } from "../context/CartContext";

import { HoverCard } from "../components/HoverCard";
import { ScrollReveal } from "../components/ScrollReveal";
import { TextReveal } from "../components/TextReveal";
import { SpinWheelModal } from "../components/SpinWheelModal";

const mockProducts = [
    { id: 1, name: "Authentic Ikat Saree", origin: "Telangana, India", price: "₹4,500", rating: 4.8, image: "/saree.jpg" },
    { id: 2, name: "Pashmina Wool Shawl", origin: "Kashmir, India", price: "₹8,200", rating: 4.9, image: "/shawl.jpg" },
    { id: 3, name: "Khadi Cotton Kurta", origin: "Gujarat, India", price: "₹1,200", rating: 4.5, image: "/kurta.jpg" },
];

export default function BuyerView() {
    const { addToCart } = useCart();
    const [isWheelOpen, setIsWheelOpen] = useState(false);

    return (
        <div className="w-full space-y-16 pb-12 overflow-visible relative">

            {/* Spin to Win Floating Button - Bottom Right */}
            <button
                onClick={() => setIsWheelOpen(true)}
                className="fixed bottom-8 right-8 z-30 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-full shadow-lg shadow-indigo-500/30 hover:scale-110 transition-transform animate-bounce"
            >
                <Gift size={28} />
            </button>

            {/* HERO - Ultra Premium 3D Vibe (Silk Balloons Preserved) */}
            <div className="relative h-[60vh] w-full rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(79,70,229,0.25)] bg-slate-950">
                <div className="absolute inset-0 z-0">
                    <Canvas camera={{ position: [0, 0, 5] }}>
                        <ambientLight intensity={3} />
                        <directionalLight position={[2, 5, 2]} intensity={5} />
                        <spotLight position={[-2, 5, 5]} intensity={4} color="#ffffff" />
                        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1.5} />
                        <Sparkles count={150} scale={10} size={3} speed={0.4} opacity={0.5} color="#4f46e5" />
                        <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
                            <Sphere args={[1, 100, 200]} scale={2.2} position={[2, 0, -1]}>
                                <MeshDistortMaterial color="#4f46e5" emissive="#4f46e5" emissiveIntensity={0.8} distort={0.6} speed={2} roughness={0.1} metalness={0.4} />
                            </Sphere>
                        </Float>
                        <Float speed={1.5} rotationIntensity={2} floatIntensity={1.5}>
                            <Sphere args={[1, 100, 200]} scale={1.8} position={[-2, 1, -2]}>
                                <MeshDistortMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.8} distort={0.4} speed={1.5} roughness={0.1} metalness={0.4} />
                            </Sphere>
                        </Float>
                    </Canvas>
                </div>

                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-6 pointer-events-none bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/80">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl tracking-tight"
                    >
                        The Future of{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 animate-gradient">
                            Handlooms
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="text-lg md:text-xl text-slate-300 max-w-2xl drop-shadow-lg"
                    >
                        Experience authentic Indian craftsmanship enhanced with luminous GPU-rendered liquid silk visuals.
                    </motion.p>
                </div>
            </div>

            {/* PRODUCTS */}
            <div>
                <div className="flex flex-col mb-10">
                    <TextReveal
                        text="Featured Collections"
                        className="text-3xl md:text-4xl font-semibold text-white mb-2"
                    />
                    <p className="text-slate-400 mt-2">
                        Hover over the artifacts to see them tilt in 3D space.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {mockProducts.map((product, index) => (
                        <ScrollReveal key={product.id} delay={index * 0.15}>
                            <HoverCard
                                title={product.name}
                                description={product.origin}
                                className="p-0 overflow-hidden h-full flex flex-col"
                            >
                                <div className="aspect-[4/3] overflow-hidden">
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                                </div>

                                <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl font-bold text-white">{product.price}</span>
                                        <div className="flex items-center gap-1 text-amber-400 text-sm">
                                            <Star className="w-4 h-4 fill-amber-400" />
                                            {product.rating}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => addToCart(product)}
                                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors active:scale-95"
                                    >
                                        <ShoppingBag className="w-4 h-4" />
                                        Buy Now
                                    </button>
                                </div>
                            </HoverCard>
                        </ScrollReveal>
                    ))}
                </div>
            </div>

            {/* Spin Wheel Modal Component */}
            <SpinWheelModal isOpen={isWheelOpen} onClose={() => setIsWheelOpen(false)} />
        </div>
    );
}