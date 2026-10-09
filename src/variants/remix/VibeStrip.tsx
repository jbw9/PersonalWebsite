import { useMemo, useRef, useState } from "react";
import { motion, MotionValue, useTransform } from "framer-motion";
import { scenes, knotTimes, lerpAt, curveY, curvePath, fmtMonth } from "./timeline";

export type Band = { from: number; to: number; label: string };

const n = scenes.length;

// The pinned soundtrack strip: Jonathan's vibe line, week by week. A map in Sections mode, a scrubber in Story mode.
const VibeStrip = ({
  W,
  H,
  story,
  progress,
  band,
  onPick,
  onScrub,
  onVibe,
}: {
  W: number;
  H: number;
  story: boolean;
  progress: MotionValue<number>; // fractional scene index, -1 = title card
  band: Band | null;
  onPick: (i: number) => void;
  onScrub: (f: number) => void;
  onVibe: () => void;
}) => {
  const wide = W >= 768;
  const L = wide ? 32 : 18;
  const R = W - L;
  const step = (R - (R - L) * 0.05 - L) / (n - 1);
  const top = H * 0.2;
  const bot = H * 0.66;

  const geo = useMemo(() => {
    const knotX = [...scenes.map((_, i) => L + i * step), R];
    const pts = scenes.map((s, i) => ({ x: knotX[i], y: bot - (s.vibe / 100) * (bot - top) }));
    const years = [2024, 2025, 2026, 2027].map((y) => ({ y, x: lerpAt(knotTimes, knotX, new Date(y, 0, 1).getTime()) }));
    return { knotX, pts, years, d: curvePath(pts) };
  }, [L, R, step, top, bot]);
  const last = geo.pts[n - 1];

  const g = useRef(geo);
  g.current = geo;
  const headX = useTransform(progress, (f) => g.current.pts[0].x + Math.max(0, f) * step);
  const headY = useTransform(headX, (x) => curveY(g.current.pts, x));
  const headO = useTransform(progress, (f) => Math.min(1, Math.max(0, f + 1)));
  const clipW = useTransform(headX, (x) => x);

  const [hover, setHover] = useState<number | null>(null);
  const dragging = useRef(false);
  const fAt = (x: number) => Math.min(n - 1, Math.max(-1, (x - geo.pts[0].x) / step));
  const nearestAt = (x: number) => Math.min(n - 1, Math.max(0, Math.round((x - geo.pts[0].x) / step)));
  const localX = (e: React.PointerEvent) => e.clientX - e.currentTarget.getBoundingClientRect().left;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const x = localX(e);
    if (dragging.current) onScrub(fAt(x));
    if (e.pointerType === "mouse") {
      setHover(nearestAt(x));
      onVibe();
    }
  };
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    onVibe();
    if (!story) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    onScrub(fAt(localX(e)));
  };
  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragging.current) {
      dragging.current = false;
      return;
    }
    if (!story) onPick(nearestAt(localX(e)));
  };

  const hs = hover === null ? null : scenes[hover];
  const bx0 = band ? lerpAt(knotTimes, geo.knotX, band.from) : 0;
  const bx1 = band ? Math.max(bx0 + 6, lerpAt(knotTimes, geo.knotX, band.to)) : 0;
  const tipX = (x: number) => Math.min(W - 150, Math.max(150, x));

  return (
    <>
      <div
        className={`absolute inset-x-0 bottom-0 select-none touch-none ${story ? "cursor-ew-resize" : "cursor-pointer"}`}
        style={{ height: H }}
        onPointerMove={onMove}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerLeave={() => setHover(null)}
        role="slider"
        aria-label="Vibe graph: Jonathan's journey, week by week"
        aria-valuemin={1}
        aria-valuemax={n}
        aria-valuenow={hover === null ? 1 : hover + 1}
      >
        <svg width={W} height={H} className="absolute inset-0 overflow-visible">
          <defs>
            <linearGradient id="rx-line" x1="0" x2="1">
              <stop offset="0" stopColor="#8f8676" />
              <stop offset="1" stopColor="#f2b35b" />
            </linearGradient>
            <linearGradient id="rx-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#f2b35b" stopOpacity={0.16} />
              <stop offset="1" stopColor="#f2b35b" stopOpacity={0} />
            </linearGradient>
            <clipPath id="rx-drawn">
              <motion.rect x={0} y={-20} height={H + 40} width={clipW} />
            </clipPath>
          </defs>

          {geo.years.map((t) => (
            <g key={t.y}>
              <line x1={t.x} x2={t.x} y1={top - 6} y2={H - 14} stroke="#efe6d2" strokeOpacity={0.07} />
              <text x={t.x + 5} y={H - 6} fill="#6f675a" fontSize={wide ? 9 : 8} className="rx-plain" letterSpacing="0.1em">
                {t.y}
              </text>
            </g>
          ))}

          {band && (
            <g>
              <rect x={bx0} y={top - 8} width={bx1 - bx0} height={bot - top + 16} fill="#f2b35b" fillOpacity={0.14} rx={2} />
              <line x1={bx0} x2={bx0} y1={top - 8} y2={bot + 8} stroke="#f2b35b" strokeOpacity={0.6} />
              <line x1={bx1} x2={bx1} y1={top - 8} y2={bot + 8} stroke="#f2b35b" strokeOpacity={0.6} />
            </g>
          )}

          {/* the future, dashed: "now" is not the end of the line */}
          <line x1={last.x} x2={R} y1={last.y} y2={last.y} stroke="#f2b35b" strokeOpacity={0.45} strokeDasharray="2 4" />

          {story ? (
            <>
              <path d={geo.d} fill="none" stroke="#efe6d2" strokeOpacity={0.16} strokeWidth={1} strokeDasharray="2 5" />
              <g clipPath="url(#rx-drawn)">
                <path d={`${geo.d} L ${last.x} ${bot + 8} L ${geo.pts[0].x} ${bot + 8} Z`} fill="url(#rx-fill)" />
                <path d={geo.d} fill="none" stroke="url(#rx-line)" strokeWidth={1.75} />
              </g>
            </>
          ) : (
            <>
              <path d={`${geo.d} L ${last.x} ${bot + 8} L ${geo.pts[0].x} ${bot + 8} Z`} fill="url(#rx-fill)" opacity={0.7} />
              <path d={geo.d} fill="none" stroke="url(#rx-line)" strokeWidth={1.5} strokeOpacity={0.85} />
            </>
          )}

          {geo.pts.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hover === i ? 4.5 : wide ? 2.5 : 2}
              fill={hover === i ? "#f2b35b" : "#0a0907"}
              stroke={hover === i ? "#f2b35b" : "#efe6d2"}
              strokeOpacity={hover === i ? 1 : 0.55}
              strokeWidth={1.25}
              style={{ transition: "r 0.2s ease" }}
            />
          ))}
          <circle cx={last.x} cy={last.y} r={wide ? 7 : 6} fill="none" stroke="#7bd88f" strokeOpacity={0.5} className="rx-blink" />

          {story && (
            <>
              <motion.line x1={headX} x2={headX} y1={2} y2={H - 14} stroke="#f2b35b" strokeOpacity={0.35} style={{ opacity: headO }} />
              <motion.circle cx={headX} cy={headY} r={5} fill="#f2b35b" style={{ opacity: headO, filter: "drop-shadow(0 0 6px rgba(242,179,91,0.8))" }} />
            </>
          )}
        </svg>
        <span className="absolute left-3 md:left-8 top-1 rx-mono text-[8px] md:text-[9px] text-[#6f675a] pointer-events-none">
          {story ? "drag to scrub" : wide ? "the vibe · how it felt, week by week" : "the vibe"}
        </span>
      </div>

      {hs && (
        <div
          className="fixed z-[65] pointer-events-none -translate-x-1/2 rx-card !bg-[#0e0c09]/95 px-4 py-3 w-[260px] shadow-[0_16px_50px_rgba(0,0,0,0.6)]"
          style={{ left: tipX(geo.pts[hover as number].x), bottom: H + 10 }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl leading-none">{hs.emoji}</span>
            <div className="min-w-0">
              <div className="rx-mono text-[9px] text-[#8f8676]">
                scene {String(hs.n).padStart(2, "0")} · {fmtMonth(hs.date)} · vibe {hs.vibe}
              </div>
              <div className="text-[17px] italic leading-tight mt-0.5">{hs.title}</div>
            </div>
          </div>
          {!story && <div className="rx-mono text-[9px] text-[#f2b35b] mt-2">click to watch this scene →</div>}
        </div>
      )}
      {band && !hs && (
        <div className="fixed z-[65] pointer-events-none -translate-x-1/2 rx-mono text-[9px] text-[#f2b35b] whitespace-nowrap" style={{ left: tipX((bx0 + bx1) / 2), bottom: H + 6 }}>
          {band.label}
        </div>
      )}
    </>
  );
};

export default VibeStrip;
