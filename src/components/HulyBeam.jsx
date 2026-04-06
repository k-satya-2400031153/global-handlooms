import React, { useRef, useEffect } from 'react';

/**
 * HulyBeam v3 — Precise replication of huly.io's signature plasma beam.
 *
 * Key visual elements (from exact screenshot analysis):
 * 1. Deep dark blue/navy atmosphere fills the RIGHT half of the canvas
 * 2. A thin white-blue vertical line runs from top to bottom
 * 3. At the BASE the line CURVES OUTWARD in both directions (parametric curve, like a bell shape)
 * 4. Purple/indigo diffusion cloud scatters from the top of the line
 * 5. A bright white hot core where the curves meet the floor
 * 6. The entire effect uses screen blend mode on a black background
 */
export default function HulyBeam({ className = '' }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const resize = () => {
            canvas.width  = canvas.offsetWidth  || window.innerWidth;
            canvas.height = canvas.offsetHeight || window.innerHeight;
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        let t = 0;
        let frame;

        const draw = () => {
            t += 0.006;
            const W = canvas.width;
            const H = canvas.height;
            ctx.clearRect(0, 0, W, H);

            // Breathing
            const breathe     = 0.88 + 0.12 * Math.sin(t);
            const slowBreathe = 0.90 + 0.10 * Math.sin(t * 0.5);

            // Beam X is at ~57% from the left (matches huly.io ratio)
            const beamX = W * 0.57;
            // Tiny gentle sway
            const sway  = Math.sin(t * 0.3) * 4;
            const bx    = beamX + sway;

            // ─── 1. DEEP BLUE ATMOSPHERE (fills right half) ───────────────────
            // This is the big dark blue volumetric cloud that IS huly's background
            const atmos = ctx.createRadialGradient(bx + 30, H * 0.55, 0, bx + 30, H * 0.55, W * 0.52);
            atmos.addColorStop(0.0,  `rgba(15, 30, 120, ${0.85 * slowBreathe})`);
            atmos.addColorStop(0.25, `rgba(10, 20, 90,  ${0.6})`);
            atmos.addColorStop(0.55, `rgba(5,  10, 50,  ${0.4})`);
            atmos.addColorStop(1.0,  'transparent');
            ctx.fillStyle = atmos;
            ctx.fillRect(0, 0, W, H);

            // ─── 2. UPPER PURPLE/INDIGO DIFFUSION CLOUD ──────────────────────
            // At the top of the beam — scatters diagonally upward
            const topCloud = ctx.createRadialGradient(bx - 20, H * 0.08, 0, bx - 20, H * 0.08, W * 0.22);
            topCloud.addColorStop(0.0,  `rgba(90,  60, 200, ${0.55 * breathe})`);
            topCloud.addColorStop(0.3,  `rgba(50,  30, 150, ${0.3})`);
            topCloud.addColorStop(0.7,  `rgba(20,  10,  80, ${0.1})`);
            topCloud.addColorStop(1.0,  'transparent');
            ctx.fillStyle = topCloud;
            ctx.fillRect(0, 0, W, H * 0.5);

            // ─── 3. THE BEAM: outer glow ─────────────────────────────────────
            // Wide, soft blue-white outer glow
            const outerGlow = ctx.createLinearGradient(bx - 100, 0, bx + 100, 0);
            outerGlow.addColorStop(0.0,  'transparent');
            outerGlow.addColorStop(0.3,  `rgba(60, 100, 255, ${0.12 * breathe})`);
            outerGlow.addColorStop(0.45, `rgba(140, 180, 255, ${0.3 * breathe})`);
            outerGlow.addColorStop(0.5,  `rgba(220, 235, 255, ${0.5 * breathe})`);
            outerGlow.addColorStop(0.55, `rgba(140, 180, 255, ${0.3 * breathe})`);
            outerGlow.addColorStop(0.7,  `rgba(60, 100, 255, ${0.12 * breathe})`);
            outerGlow.addColorStop(1.0,  'transparent');

            // Fade-in from top, full brightness in middle, fade slightly at bottom
            const outerVert = ctx.createLinearGradient(0, 0, 0, H * 0.92);
            outerVert.addColorStop(0.0,  'rgba(0,0,0,0)');
            outerVert.addColorStop(0.05, 'rgba(255,255,255,1)');
            outerVert.addColorStop(0.85, 'rgba(255,255,255,1)');
            outerVert.addColorStop(1.0,  'rgba(255,255,255,0)');

            ctx.save();
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = outerGlow;
            ctx.fillRect(bx - 100, 0, 200, H * 0.92);
            ctx.restore();

            // ─── 4. THE BEAM: sharp white core LINE ──────────────────────────
            const coreGrad = ctx.createLinearGradient(0, 0, 0, H * 0.9);
            coreGrad.addColorStop(0.00, 'rgba(255,255,255,0)');
            coreGrad.addColorStop(0.03, 'rgba(255,255,255,0.85)');
            coreGrad.addColorStop(0.40, `rgba(255,255,255,${0.95 * breathe})`);
            coreGrad.addColorStop(0.80, `rgba(220,235,255,${0.9 * breathe})`);
            coreGrad.addColorStop(0.90, 'rgba(180,210,255,0.6)');
            coreGrad.addColorStop(1.00, 'rgba(255,255,255,0)');

            const coreW = 1.8 + 0.4 * breathe;
            ctx.fillStyle = coreGrad;
            ctx.fillRect(bx - coreW / 2, 0, coreW, H * 0.9);

            // ─── 5. CURVE WINGS at the base ──────────────────────────────────
            // This is the signature element: the beam CURVES outward at the bottom
            // like an hourglass / warp speed funnel. Draw with bezier path.
            const floorY = H * 0.88;
            const wingSpread = W * 0.38 * slowBreathe; // how far wings spread at base
            const wingH = H * 0.22;                    // height of the curved wing area

            // LEFT wing curve
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(bx, floorY - wingH);            // top of curve at beam
            ctx.bezierCurveTo(
                bx - 20, floorY - wingH * 0.5,         // control point 1
                bx - wingSpread * 0.5, floorY - 20,    // control point 2
                bx - wingSpread, floorY + 20            // end: far left at floor
            );
            ctx.lineWidth = 0;
            ctx.strokeStyle = 'transparent';

            // Left wing gradient
            const lwGrad = ctx.createLinearGradient(bx, floorY - wingH, bx - wingSpread, floorY);
            lwGrad.addColorStop(0.0, `rgba(255,255,255,${0.7 * breathe})`);
            lwGrad.addColorStop(0.3, `rgba(160,200,255,${0.4 * breathe})`);
            lwGrad.addColorStop(0.7, `rgba(80,130,255,${0.15 * breathe})`);
            lwGrad.addColorStop(1.0, 'transparent');

            ctx.strokeStyle = lwGrad;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();

            // RIGHT wing curve
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(bx, floorY - wingH);
            ctx.bezierCurveTo(
                bx + 20, floorY - wingH * 0.5,
                bx + wingSpread * 0.5, floorY - 20,
                bx + wingSpread, floorY + 20
            );
            const rwGrad = ctx.createLinearGradient(bx, floorY - wingH, bx + wingSpread, floorY);
            rwGrad.addColorStop(0.0, `rgba(255,255,255,${0.7 * breathe})`);
            rwGrad.addColorStop(0.3, `rgba(160,200,255,${0.4 * breathe})`);
            rwGrad.addColorStop(0.7, `rgba(80,130,255,${0.15 * breathe})`);
            rwGrad.addColorStop(1.0, 'transparent');
            ctx.strokeStyle = rwGrad;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();

            // ─── 6. FLOOR BLOOM (hot white core expanding outward) ───────────
            const floorBloom = ctx.createRadialGradient(bx, floorY, 0, bx, floorY, wingSpread * 1.1);
            floorBloom.addColorStop(0.00, `rgba(255,255,255,${0.95 * breathe})`);
            floorBloom.addColorStop(0.04, `rgba(200,225,255,${0.8  * breathe})`);
            floorBloom.addColorStop(0.10, `rgba(120,170,255,${0.55 * breathe})`);
            floorBloom.addColorStop(0.25, `rgba(50, 100,220,${0.3  * slowBreathe})`);
            floorBloom.addColorStop(0.5,  `rgba(20,  50,160,${0.12})`);
            floorBloom.addColorStop(1.00, 'transparent');
            ctx.fillStyle = floorBloom;
            ctx.fillRect(0, floorY - wingSpread * 0.5, W, wingSpread * 1.5);

            // ─── 7. FLOOR WING VOLUME (soft blue pool at the base) ───────────
            // The large horizontal soft blue glow that spreads at the bottom
            const poolGrad = ctx.createRadialGradient(bx, floorY + 30, 0, bx, floorY + 30, wingSpread * 0.85);
            poolGrad.addColorStop(0.0,  `rgba(100,160,255,${0.35 * slowBreathe})`);
            poolGrad.addColorStop(0.3,  `rgba(50, 100,200,${0.2})`);
            poolGrad.addColorStop(0.7,  `rgba(20,  50,150,${0.08})`);
            poolGrad.addColorStop(1.0,  'transparent');
            ctx.fillStyle = poolGrad;
            ctx.fillRect(0, floorY - 60, W, 200);

            frame = requestAnimationFrame(draw);
        };

        frame = requestAnimationFrame(draw);
        return () => { cancelAnimationFrame(frame); ro.disconnect(); };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
            style={{ mixBlendMode: 'screen' }}
        />
    );
}
