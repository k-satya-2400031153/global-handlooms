import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL;

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
    });
}

function formatINR(n) {
    return '₹' + Number(n).toLocaleString('en-IN');
}

// ── Status pill ───────────────────────────────────────────────────────────────
function StatusPill({ status }) {
    const colors = {
        Pending:          { bg: '#fbbf2415', border: '#fbbf2440', text: '#fbbf24' },
        Processing:       { bg: '#38bdf815', border: '#38bdf840', text: '#38bdf8' },
        Shipped:          { bg: '#a855f715', border: '#a855f740', text: '#a855f7' },
        'Out for Delivery':{ bg: '#f9731615', border: '#f9731640', text: '#f97316' },
        Delivered:        { bg: '#22c55e15', border: '#22c55e40', text: '#22c55e' },
        Cancelled:        { bg: '#ef444415', border: '#ef444440', text: '#ef4444' },
    };
    const c = colors[status] || colors.Pending;
    return (
        <span style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text,
            padding: '3px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>
            {status}
        </span>
    );
}

// ── PhonePe-style success tick ────────────────────────────────────────────────
function SuccessTick() {
    return (
        <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.1 }}
            style={{
                width: 72, height: 72, borderRadius: '50%', background: '#22c55e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', boxShadow: '0 0 0 12px rgba(34,197,94,0.12), 0 0 40px rgba(34,197,94,0.3)',
            }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"
                strokeLinecap="round" strokeLinejoin="round">
                <motion.path
                    d="M5 12l5 5L19 7"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }} />
            </svg>
        </motion.div>
    );
}

// ── Main Invoice Page ─────────────────────────────────────────────────────────
export default function InvoicePage() {
    const { orderId } = useParams();
    const navigate    = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        fetch(`${API}/orders/${orderId}/invoice`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(d => {
                if (d.success) setOrder(d.data);
                else toast.error(d.message || 'Could not load invoice.');
            })
            .catch(() => toast.error('Failed to load invoice.'))
            .finally(() => setLoading(false));
    }, [orderId, navigate]);

    const handlePrint = () => window.print();

    if (loading) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #22c55e', borderTopColor: 'transparent' }} />
            </div>
        );
    }

    if (!order) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <p style={{ color: '#ef4444', fontFamily: 'monospace', fontSize: 16 }}>⚠ Invoice not found.</p>
                <button onClick={() => navigate('/buyer')}
                    style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontWeight: 700 }}>
                    ← Back to Store
                </button>
            </div>
        );
    }

    const items = order.products || [];
    const addr  = order.shippingAddress;

    return (
        <div style={{ minHeight: '100vh', background: '#f4f6fa', padding: '40px 16px 80px', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif' }}>
            {/* Back button */}
            <div style={{ maxWidth: 480, margin: '0 auto 16px' }}>
                <button onClick={() => navigate('/buyer')}
                    style={{ background: 'none', border: 'none', color: '#5f259f', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    ← Back to Store
                </button>
            </div>

            {/* ── INVOICE CARD ── */}
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ maxWidth: 480, margin: '0 auto', background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>

                {/* Purple stripe */}
                <div style={{ height: 6, background: 'linear-gradient(90deg,#5f259f,#9333ea,#7b3fe4)' }} />

                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg,#5f259f 0%,#7b3fe4 100%)', padding: '32px 28px 28px', textAlign: 'center' }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>🪡</div>
                    <h1 style={{ color: '#fff', margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: -0.3 }}>Global Handlooms</h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)', margin: '4px 0 0', fontSize: 12 }}>Order Invoice & Receipt</p>
                </div>

                {/* ── SUCCESS SECTION ── */}
                <div style={{ padding: '28px 28px 16px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
                    <SuccessTick />
                    <p style={{ color: '#16a34a', fontWeight: 700, fontSize: 15, margin: '0 0 4px' }}>Payment Successful</p>
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4, type: 'spring' }}
                        style={{ fontSize: 36, fontWeight: 900, color: '#1a1a1a', letterSpacing: -1 }}>
                        {formatINR(order.totalAmount)}
                    </motion.div>
                    <p style={{ color: '#999', fontSize: 12, margin: '6px 0 12px' }}>{formatDate(order.createdAt)}</p>
                    <StatusPill status={order.status} />
                </div>

                {/* ── ORDER META ── */}
                <div style={{ padding: '20px 28px' }}>
                    <div style={{ background: '#fafafa', borderRadius: 12, padding: '16px 20px' }}>
                        {[
                            { label: 'Order ID',     value: '#' + order._id.toString().slice(-8).toUpperCase(), mono: true, color: '#5f259f' },
                            { label: 'Tracking No.', value: order.trackingNumber, mono: true                                                 },
                            { label: 'Payment Mode', value: order.paymentMode                                                                },
                            { label: 'Payment ID',   value: order.paymentId?.slice(0, 24) + (order.paymentId?.length > 24 ? '…' : ''), mono: true },
                        ].map(({ label, value, mono, color }) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 8 }}>
                                <span style={{ color: '#aaa', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>{label}</span>
                                <span style={{ color: color || '#1a1a1a', fontSize: 12, fontWeight: 700, fontFamily: mono ? 'monospace' : 'inherit', textAlign: 'right' }}>{value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── ITEMS ── */}
                <div style={{ padding: '0 28px 20px' }}>
                    <p style={{ color: '#aaa', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 10px' }}>Items Ordered</p>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {['Product', 'Qty', 'Amount'].map((h, i) => (
                                    <th key={h} style={{ color: '#bbb', fontSize: 11, fontWeight: 500, padding: '8px 0', borderBottom: '2px solid #f0f0f0',
                                        textAlign: i === 0 ? 'left' : i === 1 ? 'center' : 'right' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, i) => {
                                const p   = item.productId;
                                const ttl = p ? p.price * item.quantity : 0;
                                return (
                                    <motion.tr key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + i * 0.07 }}>
                                        <td style={{ padding: '12px 0 12px 0', borderBottom: '1px solid #f5f5f5', fontSize: 13, color: '#1a1a1a', fontWeight: 500 }}>
                                            {p?.title || 'Product'}
                                        </td>
                                        <td style={{ padding: '12px 0', borderBottom: '1px solid #f5f5f5', fontSize: 13, color: '#666', textAlign: 'center' }}>
                                            ×{item.quantity}
                                        </td>
                                        <td style={{ padding: '12px 0', borderBottom: '1px solid #f5f5f5', fontSize: 13, color: '#1a1a1a', fontWeight: 700, textAlign: 'right' }}>
                                            {formatINR(ttl)}
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Total row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0 0', borderTop: '2px solid #5f259f', marginTop: 8 }}>
                        <span style={{ color: '#1a1a1a', fontSize: 15, fontWeight: 700 }}>Total Paid</span>
                        <motion.span
                            initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                            transition={{ delay: 0.6, type: 'spring' }}
                            style={{ color: '#5f259f', fontSize: 20, fontWeight: 900 }}>
                            {formatINR(order.totalAmount)}
                        </motion.span>
                    </div>
                </div>

                {/* ── SHIPPING ADDRESS ── */}
                {addr && (
                    <div style={{ padding: '0 28px 20px' }}>
                        <div style={{ background: '#fafafa', borderRadius: 12, padding: '16px 20px' }}>
                            <p style={{ color: '#aaa', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 10px' }}>Shipping To</p>
                            <p style={{ color: '#1a1a1a', fontWeight: 700, fontSize: 14, margin: '0 0 4px' }}>{addr.fullName}</p>
                            <p style={{ color: '#555', fontSize: 13, margin: 0 }}>
                                {addr.addressLine1}{addr.addressLine2 ? ', ' + addr.addressLine2 : ''}
                            </p>
                            <p style={{ color: '#555', fontSize: 13, margin: 0 }}>
                                {addr.city}, {addr.state} — {addr.pincode}
                            </p>
                            <p style={{ color: '#888', fontSize: 13, margin: '4px 0 0' }}>📞 {addr.phone}</p>
                        </div>
                    </div>
                )}

                {/* ── TRACKING HISTORY ── */}
                {order.trackingHistory && order.trackingHistory.length > 0 && (
                    <div style={{ padding: '0 28px 20px' }}>
                        <p style={{ color: '#aaa', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px' }}>Tracking History</p>
                        <div style={{ position: 'relative', paddingLeft: 20 }}>
                            <div style={{ position: 'absolute', left: 6, top: 0, bottom: 0, width: 2, background: '#ede9fe' }} />
                            {order.trackingHistory.map((h, i) => (
                                <motion.div key={i}
                                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + i * 0.08 }}
                                    style={{ position: 'relative', marginBottom: 16, paddingLeft: 16 }}>
                                    <div style={{ position: 'absolute', left: -14, top: 4, width: 10, height: 10, borderRadius: '50%',
                                        background: i === order.trackingHistory.length - 1 ? '#5f259f' : '#ddd6fe', border: '2px solid #fff' }} />
                                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#1a1a1a' }}>{h.status}</p>
                                    <p style={{ margin: '2px 0 0', fontSize: 11, color: '#888' }}>{h.location}</p>
                                    <p style={{ margin: '1px 0 0', fontSize: 10, color: '#bbb', fontFamily: 'monospace' }}>
                                        {new Date(h.timestamp).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit', hour12:true })}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── ACTION BUTTONS ── */}
                <div style={{ padding: '0 28px 24px', display: 'flex', gap: 12 }}>
                    <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={handlePrint}
                        style={{ flex: 1, padding: '14px 0', background: 'linear-gradient(135deg,#5f259f,#7b3fe4)', color: '#fff',
                            border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer',
                            boxShadow: '0 4px 20px rgba(95,37,159,0.35)' }}>
                        🖨 Print / Download
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={() => navigate('/buyer')}
                        style={{ flex: 1, padding: '14px 0', background: '#f4f6fa', color: '#5f259f',
                            border: '2px solid #ede9fe', borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                        🛍 Continue Shopping
                    </motion.button>
                </div>

                {/* Footer */}
                <div style={{ background: '#fafafa', padding: '16px 28px', borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
                    <p style={{ color: '#bbb', fontSize: 11, margin: 0 }}>
                        Thank you for shopping with <strong style={{ color: '#5f259f' }}>Global Handlooms</strong>! 🪡
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
