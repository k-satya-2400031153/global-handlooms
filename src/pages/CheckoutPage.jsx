import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { MapPin, ShoppingBag, CreditCard, CheckCircle, ChevronRight, ArrowLeft, Truck, Shield, Zap } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const STEPS = [
    { id: 1, label: 'Address',  icon: MapPin },
    { id: 2, label: 'Review',   icon: ShoppingBag },
    { id: 3, label: 'Payment',  icon: CreditCard },
    { id: 4, label: 'Confirm',  icon: CheckCircle },
];

const INDIAN_STATES = [
    'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
    'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
    'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
    'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
    'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh'
];

const PAYMENT_MODES = [
    { id: 'upi',      label: 'UPI / GPay / PhonePe',    icon: '⚡', desc: 'Instant & secure' },
    { id: 'card',     label: 'Credit / Debit Card',      icon: '💳', desc: 'All major cards accepted' },
    { id: 'netbank',  label: 'Net Banking',               icon: '🏦', desc: '50+ banks supported' },
    { id: 'wallet',   label: 'Paytm / Mobikwik Wallet',  icon: '👛', desc: 'Pay from wallet balance' },
    { id: 'cod',      label: 'Cash on Delivery',          icon: '📦', desc: 'Pay when you receive' },
];

export default function CheckoutPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [step, setStep] = useState(1);
    const [cart, setCart] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [confirmedOrder, setConfirmedOrder] = useState(null);
    const [paymentStep, setPaymentStep] = useState(0); // for payment animation
    const [selectedPayment, setSelectedPayment] = useState('upi');
    const [upiId, setUpiId] = useState('');

    const [address, setAddress] = useState({
        fullName: '', phone: '', addressLine1: '', addressLine2: '',
        city: '', state: '', pincode: ''
    });

    // Load cart from navigation state or localStorage
    useEffect(() => {
        const cartData = location.state?.cart || JSON.parse(localStorage.getItem('checkoutCart') || '[]');
        if (!cartData || cartData.length === 0) {
            toast.error('Cart is empty. Add items first.');
            navigate('/buyer');
            return;
        }
        setCart(cartData);
    }, []);

    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.cartQty, 0);
    const deliveryFee = cartTotal > 999 ? 0 : 49;
    const finalTotal = cartTotal + deliveryFee;

    // ----- Address Validation -----
    const handleAddressChange = (e) => setAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const validateAddress = () => {
        const required = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
        for (const field of required) {
            if (!address[field].trim()) {
                toast.error(`Please fill in: ${field.replace(/([A-Z])/g, ' $1')}`);
                return false;
            }
        }
        if (!/^\d{10}$/.test(address.phone)) { toast.error('Enter a valid 10-digit phone number'); return false; }
        if (!/^\d{6}$/.test(address.pincode))  { toast.error('Enter a valid 6-digit pincode'); return false; }
        return true;
    };

    // ----- Simulated Payment Flow -----
    const handlePayNow = async () => {
        if (selectedPayment === 'upi' && !upiId.includes('@')) {
            toast.error('Please enter a valid UPI ID (e.g. name@upi)');
            return;
        }
        setIsProcessing(true);
        setPaymentStep(1);
        await delay(1200); setPaymentStep(2);
        await delay(1500); setPaymentStep(3);
        await delay(1200); setPaymentStep(4);
        await delay(800);

        // Place the real order in backend
        const token = localStorage.getItem('token');
        try {
            const orderPayload = {
                products: cart.map(item => ({ productId: item._id, quantity: item.cartQty })),
                shippingAddress: address,
                paymentId: 'SIM_' + Date.now().toString(36).toUpperCase(),
                paymentMode: selectedPayment.toUpperCase()
            };
            const response = await fetch(`${API}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(orderPayload)
            });
            const data = await response.json();
            if (response.ok) {
                setConfirmedOrder(data.data);
                localStorage.removeItem('checkoutCart');
                setIsProcessing(false);
                setStep(4);
            } else {
                toast.error(data.message || 'Order failed. Please try again.');
                setIsProcessing(false);
            }
        } catch (err) {
            toast.error('Network error. Please try again.');
            setIsProcessing(false);
        }
    };

    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    // ===== RENDER =====
    return (
        <div className="min-h-screen bg-background text-gray-200 relative overflow-x-hidden">
            {/* Ambient glows */}
            <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-neonIndigo/10 rounded-full blur-[180px] pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-cyberCyan/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="max-w-6xl mx-auto px-4 py-10 relative z-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/buyer')}
                        className="p-2 glass-panel hover:border-cyberCyan/50 transition-colors rounded-lg">
                        <ArrowLeft size={18} className="text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neonIndigo to-cyberCyan tracking-tight">SECURE CHECKOUT</h1>
                        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Global Handlooms &bull; Authentic &bull; Traceable</p>
                    </div>
                </div>

                {/* Step Indicator */}
                {step < 4 && (
                    <div className="flex items-center mb-10 gap-0">
                        {STEPS.slice(0, 3).map((s, idx) => {
                            const Icon = s.icon;
                            const done = step > s.id;
                            const active = step === s.id;
                            return (
                                <React.Fragment key={s.id}>
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono uppercase transition-all ${active ? 'bg-neonIndigo/20 text-neonIndigo border border-neonIndigo/40' : done ? 'text-emerald-400' : 'text-gray-600'}`}>
                                        <Icon size={14} />
                                        <span className="hidden sm:inline">{s.label}</span>
                                    </div>
                                    {idx < 2 && <ChevronRight size={14} className={`mx-1 flex-shrink-0 ${step > s.id ? 'text-emerald-400' : 'text-gray-700'}`} />}
                                </React.Fragment>
                            );
                        })}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* === MAIN CONTENT === */}
                    <div className="lg:col-span-2">
                        <AnimatePresence mode="wait">

                            {/* STEP 1: ADDRESS */}
                            {step === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <div className="glass-panel p-6">
                                        <h2 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <MapPin size={18} className="text-cyberCyan" /> Delivery Address
                                        </h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <Field label="Full Name" name="fullName" value={address.fullName} onChange={handleAddressChange} placeholder="Satya Kumar" />
                                            <Field label="Phone Number" name="phone" value={address.phone} onChange={handleAddressChange} placeholder="9876543210" type="tel" />
                                            <div className="sm:col-span-2">
                                                <Field label="Address Line 1" name="addressLine1" value={address.addressLine1} onChange={handleAddressChange} placeholder="House No., Street, Area" />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <Field label="Address Line 2 (Optional)" name="addressLine2" value={address.addressLine2} onChange={handleAddressChange} placeholder="Landmark, Locality" />
                                            </div>
                                            <Field label="City" name="city" value={address.city} onChange={handleAddressChange} placeholder="Hyderabad" />
                                            <div>
                                                <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">State</label>
                                                <select name="state" value={address.state} onChange={handleAddressChange}
                                                    className="w-full bg-black/60 border border-surfaceBorder rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-cyberCyan/60 transition-colors appearance-none cursor-pointer">
                                                    <option value="">Select State</option>
                                                    {INDIAN_STATES.map(s => <option key={s} value={s} className="bg-background">{s}</option>)}
                                                </select>
                                            </div>
                                            <Field label="Pincode" name="pincode" value={address.pincode} onChange={handleAddressChange} placeholder="500001" type="text" maxLength={6} />
                                        </div>
                                        <button onClick={() => validateAddress() && setStep(2)}
                                            className="mt-8 w-full py-4 bg-neonIndigo hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] text-sm rounded-lg shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all">
                                            Continue to Review →
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 2: ORDER REVIEW */}
                            {step === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <div className="glass-panel p-6 mb-4">
                                        <h2 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <Truck size={18} className="text-cyberCyan" /> Delivering To
                                        </h2>
                                        <div className="bg-black/40 border border-surfaceBorder rounded-xl p-4">
                                            <p className="font-bold text-white">{address.fullName} &bull; <span className="text-gray-400 font-normal">{address.phone}</span></p>
                                            <p className="text-sm text-gray-400 mt-1">{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}</p>
                                            <p className="text-sm text-gray-400">{address.city}, {address.state} — {address.pincode}</p>
                                        </div>
                                    </div>

                                    <div className="glass-panel p-6">
                                        <h2 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <ShoppingBag size={18} className="text-cyberCyan" /> Order Items
                                        </h2>
                                        <div className="space-y-3">
                                            {cart.map(item => (
                                                <div key={item._id} className="flex items-center gap-4 p-3 bg-black/40 border border-surfaceBorder rounded-xl">
                                                    {item.image && <img src={item.image} alt={item.title} className="w-16 h-16 rounded-lg object-cover border border-white/10 flex-shrink-0" />}
                                                    <div className="flex-grow min-w-0">
                                                        <p className="font-bold text-white truncate">{item.title}</p>
                                                        <p className="text-xs font-mono text-gray-500 uppercase">{item.originRegion}</p>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="text-emerald-400 font-mono font-bold">₹{item.price * item.cartQty}</p>
                                                        <p className="text-xs text-gray-500">Qty: {item.cartQty}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={() => setStep(3)}
                                            className="mt-8 w-full py-4 bg-neonIndigo hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] text-sm rounded-lg shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all">
                                            Proceed to Payment →
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 3: PAYMENT */}
                            {step === 3 && (
                                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <div className="glass-panel p-6">
                                        <h2 className="text-lg font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <CreditCard size={18} className="text-cyberCyan" /> Payment Method
                                        </h2>
                                        <p className="text-xs font-mono text-gray-500 mb-6 flex items-center gap-1"><Shield size={10} className="text-emerald-400" /> 256-bit SSL secured payment gateway</p>

                                        <div className="space-y-3 mb-6">
                                            {PAYMENT_MODES.map(mode => (
                                                <button key={mode.id} onClick={() => setSelectedPayment(mode.id)}
                                                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${selectedPayment === mode.id ? 'bg-neonIndigo/15 border-neonIndigo/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-black/30 border-surfaceBorder hover:border-white/20'}`}>
                                                    <span className="text-2xl w-10 text-center flex-shrink-0">{mode.icon}</span>
                                                    <div className="flex-grow">
                                                        <p className="font-bold text-white text-sm">{mode.label}</p>
                                                        <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">{mode.desc}</p>
                                                    </div>
                                                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${selectedPayment === mode.id ? 'border-neonIndigo bg-neonIndigo' : 'border-gray-600'}`} />
                                                </button>
                                            ))}
                                        </div>

                                        {selectedPayment === 'upi' && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6">
                                                <Field label="Enter UPI ID" name="upi" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi" />
                                            </motion.div>
                                        )}

                                        {selectedPayment === 'cod' && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 bg-amber-900/20 border border-amber-500/30 rounded-xl">
                                                <p className="text-amber-400 font-mono text-xs uppercase tracking-widest flex items-center gap-2">
                                                    <span className="text-lg">⚠️</span> Cash on delivery may attract an extra ₹30 handling fee.
                                                </p>
                                            </motion.div>
                                        )}

                                        <button onClick={handlePayNow}
                                            className="w-full py-5 bg-cyberCyan text-black font-black uppercase tracking-[0.25em] text-sm rounded-xl shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:bg-[#5affff] transition-all flex items-center justify-center gap-2">
                                            <Zap size={16} /> Pay ₹{finalTotal.toLocaleString('en-IN')} Now
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 4: CONFIRMATION */}
                            {step === 4 && confirmedOrder && (
                                <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-2">
                                    <div className="glass-panel p-8 text-center">
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                                            className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(16,185,129,0.6)]">
                                            <CheckCircle size={48} className="text-black" />
                                        </motion.div>
                                        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">ORDER CONFIRMED!</h2>
                                        <p className="text-emerald-400 font-mono text-sm mb-8">Your artisan has been notified. Funds locked in escrow.</p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mb-8">
                                            <InfoCard label="Order ID" value={confirmedOrder._id?.slice(-12).toUpperCase()} />
                                            <InfoCard label="Tracking Number" value={confirmedOrder.trackingNumber} accent />
                                            <InfoCard label="Payment Mode" value={confirmedOrder.paymentMode} />
                                            <InfoCard label="Amount Paid" value={`₹${confirmedOrder.totalAmount?.toLocaleString('en-IN')}`} />
                                            <div className="sm:col-span-2">
                                                <InfoCard label="Delivering To" value={`${confirmedOrder.shippingAddress?.fullName} — ${confirmedOrder.shippingAddress?.city}, ${confirmedOrder.shippingAddress?.state}`} />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-center gap-2 bg-black/40 border border-surfaceBorder rounded-xl p-4 mb-8">
                                            <Truck size={16} className="text-cyberCyan animate-bounce" />
                                            <p className="text-sm font-mono text-gray-300">Estimated delivery: <span className="text-cyberCyan font-bold">5–7 business days</span></p>
                                        </div>

                                        <button onClick={() => navigate('/buyer')}
                                            className="w-full py-4 bg-neonIndigo hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                                            Back to Market
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>

                    {/* === ORDER SUMMARY SIDEBAR === */}
                    {step < 4 && (
                        <div className="lg:col-span-1">
                            <div className="glass-panel p-5 sticky top-6">
                                <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4">Order Summary</h3>
                                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                                    {cart.map(item => (
                                        <div key={item._id} className="flex justify-between items-center gap-2 text-sm">
                                            <div className="flex items-center gap-2 min-w-0">
                                                {item.image && <img src={item.image} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0 border border-white/10" />}
                                                <div className="min-w-0">
                                                    <p className="text-white font-medium truncate text-xs">{item.title}</p>
                                                    <p className="text-gray-500 text-[10px] font-mono">×{item.cartQty}</p>
                                                </div>
                                            </div>
                                            <p className="text-emerald-400 font-mono font-bold text-xs flex-shrink-0">₹{item.price * item.cartQty}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-surfaceBorder pt-4 space-y-2 text-sm font-mono">
                                    <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>₹{cartTotal.toLocaleString('en-IN')}</span></div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>Delivery</span>
                                        <span className={deliveryFee === 0 ? 'text-emerald-400' : ''}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                                    </div>
                                    {deliveryFee === 0 && <p className="text-[10px] text-emerald-400 uppercase tracking-widest">✓ Free delivery on orders above ₹999</p>}
                                    <div className="flex justify-between text-white font-black text-base border-t border-surfaceBorder pt-2 mt-2">
                                        <span>Total</span>
                                        <span className="text-cyberCyan">₹{finalTotal.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                                <div className="mt-4 p-3 bg-emerald-900/10 border border-emerald-500/20 rounded-lg">
                                    <p className="text-[10px] font-mono text-emerald-400 flex items-center gap-1"><Shield size={10} /> 100% Secure &bull; Artisan Verified &bull; Escrowed</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ===== PAYMENT PROCESSING OVERLAY ===== */}
            <AnimatePresence>
                {isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/90 backdrop-blur-xl">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            className="bg-surface border border-cyberCyan/30 p-8 rounded-2xl max-w-sm w-full shadow-[0_0_60px_rgba(0,240,255,0.2)] relative overflow-hidden">
                            
                            {/* Scan line animation */}
                            <motion.div className="absolute left-0 w-full h-0.5 bg-cyberCyan shadow-[0_0_15px_#00f0ff]"
                                animate={{ top: ['0%', '100%'] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }} />

                            {/* Razorpay-style header */}
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-surfaceBorder">
                                <div>
                                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Powered by</p>
                                    <p className="text-lg font-black text-white tracking-tight">RAZORPAY<span className="text-cyberCyan">.</span></p>
                                </div>
                                <div className="bg-cyberCyan/10 border border-cyberCyan/30 px-3 py-1 rounded flex items-center gap-1">
                                    <Shield size={12} className="text-cyberCyan" />
                                    <span className="text-[10px] font-mono text-cyberCyan uppercase">Secured</span>
                                </div>
                            </div>

                            <div className="text-center mb-4">
                                <p className="text-2xl font-black text-emerald-400 mb-1">₹{finalTotal.toLocaleString('en-IN')}</p>
                                <p className="text-xs font-mono text-gray-500">Global Handlooms — {selectedPayment.toUpperCase()}</p>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { step: 1, label: 'Authenticating Payment Instrument...' },
                                    { step: 2, label: 'Encrypting Transaction Data...' },
                                    { step: 3, label: 'Securing Funds in Escrow...' },
                                    { step: 4, label: 'Confirming with Bank...' },
                                ].map(s => (
                                    <div key={s.step} className={`flex items-center gap-3 transition-all duration-500 ${paymentStep >= s.step ? 'opacity-100' : 'opacity-25'}`}>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs transition-all ${paymentStep > s.step ? 'bg-emerald-500 text-black' : paymentStep === s.step ? 'border border-cyberCyan text-cyberCyan animate-spin' : 'border border-gray-600'}`}>
                                            {paymentStep > s.step ? '✓' : paymentStep === s.step ? '⟳' : ''}
                                        </div>
                                        <span className="font-mono text-xs text-gray-300">{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ---- Reusable sub-components ----
function Field({ label, name, value, onChange, placeholder, type = 'text', maxLength }) {
    return (
        <div>
            <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">{label}</label>
            <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} maxLength={maxLength}
                className="w-full bg-black/60 border border-surfaceBorder rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyberCyan/60 transition-colors" />
        </div>
    );
}

function InfoCard({ label, value, accent }) {
    return (
        <div className="bg-black/40 border border-surfaceBorder rounded-xl p-4">
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">{label}</p>
            <p className={`font-bold text-sm ${accent ? 'text-cyberCyan font-mono tracking-widest' : 'text-white'}`}>{value || '—'}</p>
        </div>
    );
}
