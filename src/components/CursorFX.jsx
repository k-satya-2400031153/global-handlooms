import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

/* ── Context Detection ─────────────────────────────────────────── */
function detectContext(target) {
    if (!target) return 'default';
    const attr = target.closest('[data-cursor]');
    if (attr) return attr.getAttribute('data-cursor');

    const isDanger = target.closest('[data-danger]')
        || ['delete','cancel','void','remove','disconnect','archive','burn','clear','close']
            .some(k => (target.textContent || '').toLowerCase().includes(k));
    if (isDanger) return 'danger';

    if (target.closest('button') || target.closest('[role="button"]') || target.closest('label')) return 'button';
    if (target.closest('a')) return 'link';
    if (target.closest('input') || target.closest('textarea') || target.closest('select')) return 'input';
    return 'default';
}

const CTX = {
    default: { size: 32, color: '#00f0ff', shadow: '0 0 20px rgba(0,240,255,0.8)', mix: 'normal',  label: null,  dotSize: 6,  dotColor: '#ffffff' },
    button:  { size: 64, color: '#00f0ff', shadow: '0 0 30px rgba(0,240,255,0.9)', mix: 'normal',  label: '↗',   dotSize: 5,  dotColor: '#00f0ff' },
    link:    { size: 48, color: '#c4b5fd', shadow: '0 0 25px rgba(196,181,253,0.9)', mix: 'normal', label: '→',   dotSize: 5,  dotColor: '#c4b5fd' },
    danger:  { size: 56, color: '#ff003c', shadow: '0 0 30px rgba(255,0,60,0.9)',  mix: 'normal',  label: '✕',   dotSize: 5,  dotColor: '#ff4d6d' },
    input:   { size: 24, color: 'rgba(255,255,255,0.6)', shadow: 'none', mix: 'normal',             label: null,  dotSize: 16, dotColor: 'rgba(255,255,255,0.95)' },
};

export default function CursorFX() {
    const canvasRef       = useRef(null);
    const ctxStateRef     = useRef('default');
    const [ctxState, setCtxState] = useState('default');
    const [isClick, setIsClick]   = useState(false);
    const [burst, setBurst]       = useState(null);
    const mouseRef = useRef({ x: -300, y: -300 });
    const prevMouse = useRef({ x: -300, y: -300 });

    /* ── Motion values ── */
    const mx = useMotionValue(-300), my = useMotionValue(-300);

    // Dot — instant
    const dx = useSpring(mx, { stiffness: 2000, damping: 60, mass: 0.05 });
    const dy = useSpring(my, { stiffness: 2000, damping: 60, mass: 0.05 });

    // Ring 1 — medium lag
    const r1x = useSpring(mx, { stiffness: 250, damping: 30, mass: 0.3 });
    const r1y = useSpring(my, { stiffness: 250, damping: 30, mass: 0.3 });

    // Ring 2 — heavy lag (outer aura)
    const r2x = useSpring(mx, { stiffness: 80, damping: 20, mass: 0.8 });
    const r2y = useSpring(my, { stiffness: 80, damping: 20, mass: 0.8 });

    /* ── Handlers ── */
    const onMove = useCallback((e) => {
        prevMouse.current = { ...mouseRef.current };
        mx.set(e.clientX);
        my.set(e.clientY);
        mouseRef.current = { x: e.clientX, y: e.clientY };
    }, [mx, my]);

    const onOver = useCallback((e) => {
        const c = detectContext(e.target);
        ctxStateRef.current = c;
        setCtxState(c);
    }, []);

    const onDown = useCallback((e) => {
        setIsClick(true);
        setBurst({ x: e.clientX, y: e.clientY, id: Date.now(), color: CTX[ctxStateRef.current]?.color || '#00f0ff' });
        setTimeout(() => setBurst(null), 700);
    }, []);

    const onUp = useCallback(() => setIsClick(false), []);

    /* ── Canvas: comet trail + velocity-based stretch ── */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const c = canvas.getContext('2d');

        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        resize();
        window.addEventListener('resize', resize);

        const trail = [];  // comet tail points

        class TrailPoint {
            constructor(x, y, vx, vy, color) {
                this.x = x; this.y = y;
                this.vx = vx * 0.4; this.vy = vy * 0.4;
                this.life = 1.0;
                this.size = Math.abs(vx) + Math.abs(vy) > 4 ? 2.5 : 1.5;
                this.color = color;
            }
            update() {
                this.x += this.vx; this.y += this.vy;
                this.vx *= 0.92; this.vy *= 0.92;
                this.life -= 0.05;
                this.size *= 0.95;
            }
            draw() {
                c.save();
                c.globalAlpha = Math.max(0, this.life * 0.6);
                c.shadowBlur = 12;
                c.shadowColor = this.color;
                c.fillStyle = this.color;
                c.beginPath();
                c.arc(this.x, this.y, Math.max(0.1, this.size), 0, Math.PI * 2);
                c.fill();
                c.restore();
            }
        }

        let frame;
        let last = 0;
        const COLORS = ['#00f0ff', '#6366f1', '#a78bfa', '#00f0ff'];
        let colorIdx = 0;

        const animate = (t) => {
            c.clearRect(0, 0, canvas.width, canvas.height);

            if (t - last > 25) {
                last = t;
                const mx = mouseRef.current.x, my = mouseRef.current.y;
                const vx = mx - prevMouse.current.x, vy = my - prevMouse.current.y;
                const speed = Math.sqrt(vx*vx + vy*vy);

                // number of points scales with speed
                const count = Math.min(Math.floor(speed * 0.5) + 1, 5);
                for (let i = 0; i < count; i++) {
                    const color = COLORS[colorIdx % COLORS.length];
                    colorIdx++;
                    trail.push(new TrailPoint(mx, my, vx, vy, color));
                }
                if (trail.length > 120) trail.splice(0, trail.length - 120);
            }

            for (let i = trail.length - 1; i >= 0; i--) {
                trail[i].update();
                trail[i].draw();
                if (trail[i].life <= 0) trail.splice(i, 1);
            }

            frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);

        return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); };
    }, []);

    /* ── Event binding ── */
    useEffect(() => {
        window.addEventListener('mousemove', onMove, { passive: true });
        window.addEventListener('mouseover', onOver);
        window.addEventListener('mousedown', onDown);
        window.addEventListener('mouseup', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseover', onOver);
            window.removeEventListener('mousedown', onDown);
            window.removeEventListener('mouseup', onUp);
        };
    }, [onMove, onOver, onDown, onUp]);

    const s = CTX[ctxState] || CTX.default;
    const isInput = ctxState === 'input';

    return (
        <>
            {/* Comet trail canvas */}
            <canvas ref={canvasRef}
                className="fixed inset-0 pointer-events-none z-[9990]"
                style={{ mixBlendMode: 'screen' }} />

            {/* ── OUTER AURA (slowest) ── */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[9991] rounded-full"
                style={{
                    x: r2x, y: r2y,
                    translateX: '-50%', translateY: '-50%',
                    /* slightly stronger aura so it's visible on dark bg */
                    background: `radial-gradient(circle, ${s.color}28 0%, transparent 70%)`,
                    mixBlendMode: 'normal',
                }}
                animate={{ width: isClick ? s.size * 2.5 : s.size * 2.2, height: isClick ? s.size * 2.5 : s.size * 2.2 }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            />

            {/* ── RING 1 (medium, rotating dashes) ── */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[9992] rounded-full flex items-center justify-center"
                style={{
                    x: r1x, y: r1y,
                    translateX: '-50%', translateY: '-50%',
                    border: `1.5px solid ${s.color}`,
                    boxShadow: s.shadow,
                    // dashed ring via stroke-dasharray trick via box-shadow outline
                    outline: ctxState === 'danger' ? `1px dashed ${s.color}88` : 'none',
                    outlineOffset: '4px',
                }}
                animate={{
                    width: isClick ? s.size * 0.7 : s.size,
                    height: isClick ? s.size * 0.7 : s.size,
                    rotate: ctxState === 'button' ? [0, 360] : ctxState === 'danger' ? 45 : 0,
                    opacity: isInput ? 0.3 : 1,
                    borderRadius: ctxState === 'danger' ? '6px' : '50%',
                    backgroundColor: ctxState === 'button' ? `${s.color}09` : 'transparent',
                }}
                transition={{
                    width: { type: 'spring', stiffness: 300, damping: 25 },
                    height: { type: 'spring', stiffness: 300, damping: 25 },
                    rotate: ctxState === 'button' ? { repeat: Infinity, duration: 3, ease: 'linear' } : { type: 'spring', stiffness: 200, damping: 20 },
                    borderRadius: { type: 'spring', stiffness: 200, damping: 20 },
                    backgroundColor: { duration: 0.2 },
                    opacity: { duration: 0.2 },
                }}
            >
                <AnimatePresence mode="wait">
                    {s.label && (
                        <motion.span key={ctxState}
                            className="text-[11px] font-black select-none font-mono"
                            style={{ color: s.color, textShadow: `0 0 10px ${s.color}` }}
                            initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.5, rotate: 20 }}
                            transition={{ duration: 0.15 }}
                        >
                            {s.label}
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* ── DOT (fastest — near instant) ── */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
                style={{
                    x: dx, y: dy,
                    translateX: '-50%', translateY: '-50%',
                    backgroundColor: s.dotColor,
                    boxShadow: `0 0 10px 2px ${s.dotColor}, 0 0 24px ${s.dotColor}90`,
                    /* normal blend so dot is ALWAYS visible on dark backgrounds */
                    mixBlendMode: 'normal',
                }}
                animate={{
                    width:  isInput ? 2  : isClick ? s.dotSize * 1.8 : s.dotSize,
                    height: isInput ? 18 : isClick ? s.dotSize * 1.8 : s.dotSize,
                    borderRadius: isInput ? '2px' : '50%',
                    opacity: isInput ? 0.9 : 1,
                }}
                transition={{ type: 'spring', stiffness: 1500, damping: 50, mass: 0.04 }}
            />

            {/* ── CLICK BURST: 3 concentric ripple rings ── */}
            <AnimatePresence>
                {burst && [0, 1, 2].map(i => (
                    <motion.div
                        key={`${burst.id}-${i}`}
                        className="fixed top-0 left-0 pointer-events-none rounded-full border"
                        style={{
                            left: burst.x, top: burst.y,
                            translateX: '-50%', translateY: '-50%',
                            borderColor: burst.color,
                            zIndex: 9998 - i,
                        }}
                        initial={{ width: 8, height: 8, opacity: 0.9 - i * 0.2 }}
                        animate={{ width: 90 + i * 30, height: 90 + i * 30, opacity: 0 }}
                        exit={{}}
                        transition={{ duration: 0.5 + i * 0.15, delay: i * 0.06, ease: 'easeOut' }}
                    />
                ))}
            </AnimatePresence>
        </>
    );
}