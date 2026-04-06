import React from 'react';
import { Check, Package, Truck, Home, Clock } from 'lucide-react';

const STEPS = [
    { id: 'Pending',          label: 'Order Placed',    icon: Check,   defaultDesc: 'Verifying Transaction' },
    { id: 'Processing',       label: 'Packed',          icon: Package, defaultDesc: 'Artisan Hub' },
    { id: 'Shipped',          label: 'Shipped',         icon: Truck,   defaultDesc: 'In Transit' },
    { id: 'Out for Delivery', label: 'Out for Delivery',icon: Home,    defaultDesc: 'Arriving Today' },
    { id: 'Delivered',        label: 'Delivered',       icon: Check,   defaultDesc: 'Completed' },
];

export default function TrackingStepper({ currentStatus, city = 'Your City', trackingHistory = [] }) {
    const currentIndex = STEPS.findIndex(s => s.id === currentStatus);

    // Build a map of status → most recent real tracking location from history
    const locationMap = {};
    for (const entry of trackingHistory) {
        locationMap[entry.status] = entry.location;
    }

    const getDesc = (step) => {
        if (locationMap[step.id]) return locationMap[step.id];
        if (step.id === 'Out for Delivery' && city) return `Out for delivery in ${city}`;
        return step.defaultDesc;
    };

    return (
        <div className="w-full py-8 mt-2 overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
            <div className="flex items-center justify-between relative min-w-[500px]">
                {/* Background Line */}
                <div className="absolute left-[10%] right-[10%] top-4 -translate-y-1/2 h-[2px] z-0"
                    style={{ background: 'rgba(255,255,255,0.07)' }} />

                {/* Progress Line */}
                <div
                    className="absolute left-[10%] top-4 -translate-y-1/2 h-[2px] z-0 transition-all duration-700 ease-in-out"
                    style={{
                        width: `${currentIndex < 0 ? 0 : (currentIndex / (STEPS.length - 1)) * 80}%`,
                        background: '#00f5ff',
                        boxShadow: '0 0 10px rgba(0,245,255,0.6)',
                    }}
                />

                {STEPS.map((step, index) => {
                    const isCompleted = currentIndex >= index;
                    const isCurrent = currentIndex === index;
                    const Icon = step.icon;

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center flex-1 group">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-700 z-10"
                                style={{
                                    background: isCompleted ? '#000' : '#050510',
                                    border: `2px solid ${isCompleted ? '#00f5ff' : 'rgba(255,255,255,0.12)'}`,
                                    color: isCompleted ? '#00f5ff' : '#4b5563',
                                    boxShadow: isCurrent
                                        ? '0 0 20px rgba(0,245,255,0.8), 0 0 40px rgba(0,245,255,0.3)'
                                        : isCompleted
                                            ? '0 0 12px rgba(0,245,255,0.3)'
                                            : 'none',
                                    transform: isCurrent ? 'scale(1.3)' : 'scale(1)',
                                }}>
                                <Icon size={14} strokeWidth={isCompleted ? 2.5 : 2}
                                    className={isCurrent ? 'animate-pulse' : ''} />
                            </div>

                            <div className="mt-4 text-center absolute top-8 w-28 -ml-14 left-1/2">
                                <p className="text-[10px] font-black uppercase tracking-widest transition-colors duration-500"
                                    style={{
                                        color: isCurrent ? '#fff' : isCompleted ? '#00f5ff' : '#4b5563',
                                        textShadow: isCurrent ? '0 0 8px rgba(255,255,255,0.6)' : 'none',
                                    }}>
                                    {step.label}
                                </p>
                                <p className={`text-[9px] font-mono mt-0.5 leading-tight transition-colors duration-500
                                    ${isCurrent ? 'text-[#00f5ff] animate-pulse' : isCompleted ? 'text-gray-500' : 'text-gray-700'}`}>
                                    {getDesc(step)}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
