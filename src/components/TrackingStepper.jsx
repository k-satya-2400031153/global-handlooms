import React from 'react';
import { Check, Package, Truck, Home } from 'lucide-react';

const STEPS = [
    { id: 'Pending', label: 'Order Placed', icon: Check, description: 'Verifying Transaction' },
    { id: 'Processing', label: 'Packed', icon: Package, description: 'Artisan Hub, Varanasi' },
    { id: 'Shipped', label: 'Shipped', icon: Truck, description: 'In Transit' },
    { id: 'Out for Delivery', label: 'Out for Delivery', icon: Home, description: 'Arriving Today' },
    { id: 'Delivered', label: 'Delivered', icon: Check, description: 'Completed' }
];

export default function TrackingStepper({ currentStatus, city = 'Your City' }) {
    // Dynamic description for Out for Delivery
    const dynamicSteps = STEPS.map(step => {
        if (step.id === 'Out for Delivery' && city) {
            return { ...step, description: `Out for delivery in ${city}` };
        }
        return step;
    });

    const currentIndex = dynamicSteps.findIndex(s => s.id === currentStatus);

    return (
        <div className="w-full py-8 mt-2 overflow-x-auto custom-scrollbar">
            <div className="flex items-center justify-between relative min-w-[500px]">
                {/* Background Line */}
                <div className="absolute left-[10%] right-[10%] top-4 -translate-y-1/2 h-[2px] bg-white/10 z-0" />
                
                {/* Progress Line */}
                <div 
                    className="absolute left-[10%] top-4 -translate-y-1/2 h-[2px] bg-cyberCyan z-0 transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                    style={{ width: `${currentIndex === -1 ? 0 : (currentIndex / (dynamicSteps.length - 1)) * 80}%` }}
                />

                {dynamicSteps.map((step, index) => {
                    const isCompleted = currentIndex >= index;
                    const isCurrent = currentIndex === index;
                    const Icon = step.icon;

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center flex-1 group">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-700 z-10 ${
                                isCompleted 
                                ? 'bg-black border-2 border-cyberCyan text-cyberCyan shadow-[0_0_15px_rgba(0,255,255,0.4)]' 
                                : 'bg-black border-2 border-surfaceBorder text-gray-600'
                            } ${isCurrent ? 'scale-[1.3] shadow-[0_0_20px_rgba(0,255,255,0.8)] bg-black' : ''}`}>
                                <Icon size={14} strokeWidth={isCompleted ? 3 : 2} className={isCurrent ? 'animate-pulse' : ''} />
                            </div>
                            
                            <div className="mt-4 text-center absolute top-8 w-28 -ml-14 left-1/2">
                                <p className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${isCurrent ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]' : isCompleted ? 'text-cyberCyan' : 'text-gray-500'}`}>
                                    {step.label}
                                </p>
                                <p className={`text-[9px] font-mono mt-1 transition-colors duration-500 ${isCurrent ? 'text-cyberCyan animate-pulse' : isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
