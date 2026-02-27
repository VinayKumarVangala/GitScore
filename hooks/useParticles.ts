import { useEffect, useRef, useCallback, RefObject } from "react";

export interface ParticleConfig {
    count?: number;
    maxSpeed?: number;
    minRadius?: number;
    maxRadius?: number;
    connectionDistance?: number;
    mouseRadius?: number;
    mouseRepel?: boolean;
    colors?: string[];      // ["rgba(0,255,255,…)", …]
    connectionOpacity?: number;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    alpha: number;
    alphaV: number;        // alpha velocity (pulsing)
    colorIdx: number;
    baseVx: number;
    baseVy: number;
}

interface UseParticlesOptions extends ParticleConfig {
    canvasRef: RefObject<HTMLCanvasElement | null>;
    enabled?: boolean;
}

const DEFAULT_COLORS = [
    "rgba(0,255,255,",    // cyan
    "rgba(0,200,210,",    // teal-cyan
    "rgba(255,255,255,",  // white
];

export function useParticles({
    canvasRef,
    enabled = true,
    count = 90,
    maxSpeed = 0.45,
    minRadius = 0.8,
    maxRadius = 2.2,
    connectionDistance = 130,
    mouseRadius = 100,
    mouseRepel = true,
    colors = DEFAULT_COLORS,
    connectionOpacity = 0.18,
}: UseParticlesOptions) {
    const particlesRef = useRef<Particle[]>([]);
    const rafRef = useRef<number>(0);
    const mouseRef = useRef({ x: -9999, y: -9999 });
    const lastTimeRef = useRef<number>(0);
    const TARGET_FPS = 60;
    const FRAME_BUDGET = 1000 / TARGET_FPS;

    /* ── Build particle list to fill current canvas ──────────────── */
    const buildParticles = useCallback(
        (w: number, h: number) => {
            particlesRef.current = Array.from({ length: count }, () => {
                const speed = (Math.random() * 2 - 1) * maxSpeed;
                const angle = Math.random() * Math.PI * 2;
                const vx = Math.cos(angle) * speed;
                const vy = Math.sin(angle) * speed;
                return {
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx,
                    vy,
                    baseVx: vx,
                    baseVy: vy,
                    radius: minRadius + Math.random() * (maxRadius - minRadius),
                    alpha: 0.2 + Math.random() * 0.8,
                    alphaV: (Math.random() > 0.5 ? 1 : -1) * 0.004,
                    colorIdx: Math.floor(Math.random() * colors.length),
                };
            });
        },
        [count, maxSpeed, minRadius, maxRadius, colors.length]
    );

    /* ── Main animation loop ─────────────────────────────────────── */
    const draw = useCallback(
        (timestamp: number) => {
            if (!enabled) return;

            const delta = timestamp - lastTimeRef.current;
            if (delta < FRAME_BUDGET - 2) {            // skip if too early
                rafRef.current = requestAnimationFrame(draw);
                return;
            }
            lastTimeRef.current = timestamp;

            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            const { width: W, height: H } = canvas;

            ctx.clearRect(0, 0, W, H);

            const ps = particlesRef.current;
            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;

            /* update */
            for (const p of ps) {
                // Mouse interaction
                if (mouseRepel) {
                    const dx = p.x - mx;
                    const dy = p.y - my;
                    const dist2 = dx * dx + dy * dy;
                    const mr2 = mouseRadius * mouseRadius;
                    if (dist2 < mr2 && dist2 > 0) {
                        const dist = Math.sqrt(dist2);
                        const force = (mouseRadius - dist) / mouseRadius;
                        p.vx += (dx / dist) * force * 0.8;
                        p.vy += (dy / dist) * force * 0.8;
                    }
                }

                // Gently restore base velocity
                p.vx += (p.baseVx - p.vx) * 0.02;
                p.vy += (p.baseVy - p.vy) * 0.02;

                p.x += p.vx;
                p.y += p.vy;

                // Wrap edges
                if (p.x < 0) p.x = W;
                if (p.x > W) p.x = 0;
                if (p.y < 0) p.y = H;
                if (p.y > H) p.y = 0;

                // Pulse alpha
                p.alpha += p.alphaV;
                if (p.alpha > 0.95) { p.alpha = 0.95; p.alphaV *= -1; }
                if (p.alpha < 0.15) { p.alpha = 0.15; p.alphaV *= -1; }
            }

            /* draw connections first (under particles) */
            for (let i = 0; i < ps.length; i++) {
                for (let j = i + 1; j < ps.length; j++) {
                    const dx = ps[i].x - ps[j].x;
                    const dy = ps[i].y - ps[j].y;
                    const dist2 = dx * dx + dy * dy;
                    const cd2 = connectionDistance * connectionDistance;
                    if (dist2 < cd2) {
                        const t = 1 - Math.sqrt(dist2) / connectionDistance;
                        ctx.beginPath();
                        ctx.moveTo(ps[i].x, ps[i].y);
                        ctx.lineTo(ps[j].x, ps[j].y);
                        ctx.strokeStyle = `rgba(0,255,255,${t * connectionOpacity})`;
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                }
            }

            /* draw particles */
            for (const p of ps) {
                const colorBase = colors[p.colorIdx];
                // Outer soft glow
                const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 5);
                grd.addColorStop(0, `${colorBase}${(p.alpha * 0.5).toFixed(2)})`);
                grd.addColorStop(1, `${colorBase}0)`);
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius * 5, 0, Math.PI * 2);
                ctx.fillStyle = grd;
                ctx.fill();

                // Core dot
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `${colorBase}${p.alpha.toFixed(2)})`;
                ctx.fill();
            }

            rafRef.current = requestAnimationFrame(draw);
        },
        [enabled, canvasRef, mouseRepel, mouseRadius, colors, connectionDistance, connectionOpacity, FRAME_BUDGET]
    );

    /* ── Resize handler ─────────────────────────────────────────── */
    const handleResize = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        buildParticles(canvas.width, canvas.height);
    }, [canvasRef, buildParticles]);

    /* ── Mouse tracking ─────────────────────────────────────────── */
    const handleMouseMove = useCallback((e: MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        mouseRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }, [canvasRef]);

    const handleMouseLeave = useCallback(() => {
        mouseRef.current = { x: -9999, y: -9999 };
    }, []);

    /* ── Bootstrap ──────────────────────────────────────────────── */
    useEffect(() => {
        if (!enabled) return;

        handleResize();                                    // initial size
        const ro = new ResizeObserver(handleResize);
        const canvas = canvasRef.current;
        if (canvas) {
            ro.observe(canvas);
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseleave", handleMouseLeave);
        }

        rafRef.current = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(rafRef.current);
            ro.disconnect();
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [enabled, handleResize, handleMouseMove, handleMouseLeave, draw]);

    return { particleCount: count };
}
