import { useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from "framer-motion";
import { scenes, curveY, curvePath, fmtMonth, pad } from "./timeline";

const n = scenes.length;
const FADE = "linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)";

// Cinema's vibe line, laid along the bottom of the hero: no frame, it fades into the page at both
// edges and draws itself in once the titles are done. On phones it is wider than the screen and swipes.
const HeroCurve = ({ vw, done, reduce, onPick }: { vw: number; done: boolean; reduce: boolean; onPick: (i: number) => void }) => {
  const wide = vw >= 768;
  const W = wide ? vw : 96 + (n - 1) * 66;
  // desktop keeps headroom above the peaks for the hover caption
  const H = wide ? 300 : 170;
  const L = wide ? vw * 0.1 : 48;
  const R = W - L;
  const top = wide ? 126 : 56;
  const bot = H - (wide ? 40 : 34);

  const { pts, d } = useMemo(() => {
    const pts = scenes.map((s, i) => ({ x: L + (i * (R - L)) / (n - 1), y: bot - (s.vibe / 100) * (bot - top) }));
    const last = pts[n - 1];
    return { pts, d: `M 0 ${pts[0].y} L ${pts[0].x} ${pts[0].y} ${curvePath(pts).slice(curvePath(pts).indexOf("C"))} L ${W} ${last.y}` };
  }, [L, R, W, top, bot]);
  const last = pts[n - 1];

  // the pen: x of the drawing tip, from the left edge to "now"
  const pen = useMotionValue(reduce ? last.x : 0);
  const [reached, setReached] = useState(reduce ? n : 0);
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!done || reduce) return;
    pen.set(0);
    const c = animate(pen, last.x, { duration: 2.6, delay: 0.4, ease: [0.4, 0, 0.3, 1] });
    return () => c.stop();
  }, [done, reduce, last.x, pen]);
  useMotionValueEvent(pen, "change", (x) => {
    const k = pts.filter((p) => p.x <= x + 4).length;
    setReached((r) => (r === k ? r : k));
    if (!wide && scroller.current) scroller.current.scrollLeft = x - scroller.current.clientWidth * 0.65;
  });
  const P = useRef(pts);
  P.current = pts;
  const penY = useTransform(pen, (x) => curveY(P.current, x));
  const penO = useTransform(pen, (x) => (x > 2 && x < last.x - 6 ? 1 : 0));

  const [hover, setHover] = useState<number | null>(null);
  const hs = hover === null ? null : scenes[hover];
  const capX = hover === null ? 0 : wide ? Math.min(W - 150, Math.max(150, pts[hover].x)) : pts[hover].x;

  const art = (
    <div className="relative" style={{ width: W, height: H }}>
      <svg width={W} height={H} className="absolute inset-0 overflow-visible pointer-events-none">
        <defs>
          <clipPath id="rx-hero-drawn">
            <motion.rect x={0} y={-40} height={H + 80} width={pen} />
          </clipPath>
          <linearGradient id="rx-hero-line" x1="0" x2="1">
            <stop offset="0" stopColor="#8692a8" />
            <stop offset="1" stopColor="#5b9cff" />
          </linearGradient>
        </defs>
        <line x1={0} x2={W} y1={bot + 22} y2={bot + 22} stroke="#e6ecf5" strokeOpacity={0.07} />
        <path d={d} fill="none" stroke="#e6ecf5" strokeOpacity={0.12} strokeWidth={1} strokeDasharray="2 6" />
        <path d={d} fill="none" stroke="url(#rx-hero-line)" strokeWidth={2} clipPath="url(#rx-hero-drawn)" />
        <motion.circle cx={pen} cy={penY} r={5} fill="#bcd7ff" style={{ opacity: penO, filter: "drop-shadow(0 0 8px rgba(91,156,255,0.9))" }} />
      </svg>

      {scenes.map((s, i) => (
        <motion.button
          key={s.date + s.short}
          data-card
          initial={false}
          animate={i < reached ? { scale: hover === i ? 1.18 : 1, opacity: 1 } : { scale: 0.2, opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 18 }}
          onPointerEnter={(e) => {
            if (e.pointerType !== "mouse") return;
            setHover(i);
          }}
          onPointerLeave={() => setHover(null)}
          onFocus={() => setHover(i)}
          onBlur={() => setHover(null)}
          onClick={() => onPick(i)}
          aria-label={`${s.title}, ${fmtMonth(s.date)}: watch this scene`}
          className={`absolute rounded-full bg-[#070b14] border flex items-center justify-center transition-colors ${
            wide ? "w-10 h-10 -ml-5 -mt-5 text-xl" : "w-8 h-8 -ml-4 -mt-4 text-base"
          } ${hover === i ? "border-[#5b9cff] shadow-[0_0_24px_rgba(91,156,255,0.45)]" : "border-[#e6ecf5]/25"}`}
          style={{ left: pts[i].x, top: pts[i].y }}
        >
          {s.emoji}
        </motion.button>
      ))}

      {hs && (
        <div className="absolute pointer-events-none -translate-x-1/2 -translate-y-full text-center w-[280px] pb-1" style={{ left: capX, top: pts[hover as number].y - 30 }}>
          <div className="rx-mono text-[9px] text-[#8692a8]">
            scene {pad(hs.n)} · {fmtMonth(hs.date)} · vibe {hs.vibe}
          </div>
          <div className="mt-1 text-[1.2rem] italic leading-tight" style={{ textShadow: "0 0 12px #070b14, 0 0 24px #070b14" }}>
            {hs.title}
          </div>
          <div className="rx-mono text-[9px] text-[#5b9cff] mt-1.5">▸ watch this scene</div>
        </div>
      )}
    </div>
  );

  return wide ? (
    <div className="relative" style={{ WebkitMaskImage: FADE, maskImage: FADE }}>
      {art}
    </div>
  ) : (
    <div ref={scroller} className="overflow-x-auto overflow-y-hidden" style={{ WebkitMaskImage: FADE, maskImage: FADE, scrollbarWidth: "none" }}>
      {art}
    </div>
  );
};

export default HeroCurve;
