import { ShoppingBag, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Float, Sparkles, Stars } from '@react-three/drei';

const mockProducts = [
    { id: 1, name: "Authentic Ikat Saree", origin: "Telangana, India", price: "₹4,500", rating: 4.8, image: "/saree.jpg" },
    { id: 2, name: "Pashmina Wool Shawl", origin: "Kashmir, India", price: "₹8,200", rating: 4.9, image: "/shawl.jpg" },
    { id: 3, name: "Khadi Cotton Kurta", origin: "Gujarat, India", price: "₹1,200", rating: 4.5, image: "/kurta.jpg" },
];

export default function BuyerView() {
    return (
        <div className="w-full space-y-16 pb-12 overflow-visible">

            {/* 3D WebGL Hero Section */}
            <div className="relative h-[60vh] w-full rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(79,70,229,0.25)] bg-slate-950">

                {/* CANVAS */}
                <div className="absolute inset-0 z-0">
                    <Canvas camera={{ position: [0, 0, 5] }}>

                        {/* Lighting */}
                        <ambientLight intensity={3} />
                        <directionalLight position={[2, 5, 2]} intensity={5} />
                        <spotLight position={[-2, 5, 5]} intensity={4} color="#ffffff" />

                        {/* ⭐ Galaxy Stars Background */}
                        <Stars
                            radius={100}
                            depth={50}
                            count={3000}
                            factor={4}
                            saturation={0}
                            fade
                            speed={1.5}
                        />

                        {/* ✨ Magical Floating Dust */}
                        <Sparkles
                            count={150}
                            scale={10}
                            size={3}
                            speed={0.4}
                            opacity={0.5}
                            color="#4f46e5"
                        />

                        {/* Indigo Sphere */}
                        <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
                            <Sphere args={[1, 100, 200]} scale={2.2} position={[2, 0, -1]}>
                                <MeshDistortMaterial
                                    color="#4f46e5"
                                    emissive="#4f46e5"
                                    emissiveIntensity={0.8}
                                    distort={0.6}
                                    speed={2}
                                    roughness={0.1}
                                    metalness={0.4}
                                />
                            </Sphere>
                        </Float>

                        {/* Cyan Sphere */}
                        <Float speed={1.5} rotationIntensity={2} floatIntensity={1.5}>
                            <Sphere args={[1, 100, 200]} scale={1.8} position={[-2, 1, -2]}>
                                <MeshDistortMaterial
                                    color="#06b6d4"
                                    emissive="#06b6d4"
                                    emissiveIntensity={0.8}
                                    distort={0.4}
                                    speed={1.5}
                                    roughness={0.1}
                                    metalness={0.4}
                                />
                            </Sphere>
                        </Float>

                    </Canvas>
                </div>

                {/* Hero Text */}
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-6 pointer-events-none bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/80">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl tracking-tight"
                    >
                        The Future of{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Handlooms
            </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="text-lg md:text-xl text-slate-300 max-w-2xl drop-shadow-lg"
                    >
                        Experience authentic Indian craftsmanship enhanced with luminous
                        GPU-rendered liquid silk visuals.
                    </motion.p>
                </div>
            </div>

            {/* Product Grid */}
            <div>
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-semibold text-white mb-2">
                            Featured Collections
                        </h2>
                        <p className="text-slate-400">
                            Hover over the artifacts to see them tilt in 3D space.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {mockProducts.map((product) => (
                        <div key={product.id} style={{ perspective: 1000 }}>
                            <motion.div
                                initial={{ opacity: 0, y: 60 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                whileHover={{ rotateX: 10, rotateY: -10, z: 30, scale: 1.05 }}
                                transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
                                style={{ transformStyle: "preserve-3d" }}
                                className="group relative bg-slate-900/40 border border-white/10 rounded-3xl overflow-hidden shadow-lg hover:shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:border-indigo-500/50"
                            >
                                <div className="aspect-[4/3] overflow-hidden" style={{ transform: "translateZ(20px)" }}>
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                </div>

                                <div className="p-6 flex flex-col gap-4" style={{ transform: "translateZ(40px)" }}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-medium text-slate-100">{product.name}</h3>
                                            <p className="text-sm text-indigo-400 font-medium">{product.origin}</p>
                                        </div>

                                        <div className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-400 border border-white/5 shadow-inner">
                                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                                            {product.rating}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mt-2 pt-5 border-t border-white/5">
                                        <span className="text-2xl font-bold text-white">{product.price}</span>

                                        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-indigo-500/25">
                                            <ShoppingBag className="w-4 h-4" />
                                            Buy Now
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}