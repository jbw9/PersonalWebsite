import { useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { useOutsideClick } from "../../../hooks/use-outside-click";
import { JOURNEY_START, milestones } from "../../../data/journey";

const W = 1000;
const H = 440;
const PL = 56;
const PR = 36;
const PT = 40;
const PB = 56;
const DRAW_SECONDS = 2.4;

const NAVY = "#2C3B4D";
const BLUE = "#6B93C4";
const MUTED = "#9E9485";
const AMBER = "#FFB162";

const weekOf = (iso: string) =>
  Math.round((Date.parse(iso) - Date.parse(JOURNEY_START)) / (7 * 86400000));

const points = milestones.map((m) => ({ ...m, week: weekOf(m.date) }));
const END = points[points.length - 1].week;

const x = (w: number) => PL + (w / END) * (W - PL - PR);
const y = (v: number) => PT + (1 - v / 100) * (H - PT - PB);

// Ease between milestones, plus week-to-week noise that fades to zero at each
// milestone so the dots sit exactly on the line.
const vibeAt = (w: number) => {
  const next = points.findIndex((p) => p.week > w);
  if (next === -1) return points[points.length - 1].vibe;
  const a = points[next - 1];
  const b = points[next];
  const t = (w - a.week) / (b.week - a.week);
  const base = a.vibe + (b.vibe - a.vibe) * (1 - Math.cos(Math.PI * t)) / 2;
  const fade = Math.min(1, Math.min(w - a.week, b.week - w) / 3);
  const noise = Math.sin(w * 2.1) * 2.2 + Math.sin(w * 0.77 + 2) * 1.6;
  return Math.min(98, Math.max(2, base + noise * fade));
};

const pathFrom = (ws: number[], v: (w: number) => number) =>
  ws.map((w, i) => `${i ? "L" : "M"}${x(w).toFixed(1)},${y(v(w)).toFixed(1)}`).join("");

const weeks = Array.from({ length: END + 1 }, (_, i) => i);
const vibePath = pathFrom(weeks, vibeAt);
const skillPath = pathFrom(weeks, (w) => 6 + 80 * Math.pow(w / END, 0.85));
const GHOST_END = 24;
const ghostV = (w: number) => 18 - 12 * Math.pow(w / GHOST_END, 1.5);
const ghostPath = pathFrom(
  weeks.slice(0, GHOST_END + 1),
  ghostV
);

const monthYear = (w: number) =>
  new Date(Date.parse(JOURNEY_START) + w * 7 * 86400000).toLocaleDateString(
    "en-US",
    { month: "short", year: "2-digit", timeZone: "UTC" }
  );

const ticks = weeks.filter((w) => w % 26 === 0);

const JourneyGraph = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const [active, setActive] = useState<number | null>(null);
  useOutsideClick(ref, () => setActive(null));

  const last = points[points.length - 1];
  const current = active === null ? null : points[active];

  const anchor = (px: number) =>
    px < PL + 90 ? "start" : px > W - PR - 90 ? "end" : "middle";

  return (
    <div ref={ref}>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 mb-2 text-sm text-warm-navy">
        <span className="flex items-center gap-2">
          <svg width="28" height="10"><path d="M1,7 L7,3 L13,6 L19,2 L27,4" stroke={NAVY} strokeWidth="3" fill="none" strokeLinecap="round" /></svg>
          Confidence
        </span>
        <span className="flex items-center gap-2">
          <svg width="28" height="10"><path d="M1,5 L27,5" stroke={BLUE} strokeWidth="2.5" strokeDasharray="6 5" fill="none" /></svg>
          Actual skill
        </span>
        <span className="flex items-center gap-2 text-warm-muted">
          <svg width="28" height="10"><path d="M1,5 L27,5" stroke={MUTED} strokeWidth="2.5" strokeDasharray="1 6" strokeLinecap="round" fill="none" /></svg>
          Had I stayed in finance
        </span>
      </div>

      {/* Scrolls sideways on phones; on desktop overflow stays visible so notes can spill past the chart */}
      <div className="overflow-x-auto md:overflow-visible -mx-6 px-6 -my-8 py-8 md:m-0 md:p-0">
        <div className="relative min-w-[720px]">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full overflow-visible"
            role="img"
            aria-label="Chart of Jonathan's confidence and actual skill, week by week, from finance major to software engineer"
          >
            <defs>
              {/* Displaces strokes slightly so they look hand-drawn */}
              <filter id="sketch">
                <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4" />
                <feDisplacementMap in="SourceGraphic" scale="3" />
              </filter>
            </defs>

            {/* Axes */}
            <g filter="url(#sketch)" stroke={NAVY} strokeWidth="2" fill="none" strokeLinecap="round">
              <path d={`M${PL},${PT - 16} L${PL},${H - PB} L${W - PR + 12},${H - PB}`} />
              <path d={`M${PL - 6},${PT - 8} L${PL},${PT - 18} L${PL + 6},${PT - 8}`} />
              <path d={`M${W - PR + 4},${H - PB - 6} L${W - PR + 14},${H - PB} L${W - PR + 4},${H - PB + 6}`} />
            </g>
            <text
              transform={`translate(${PL - 22}, ${(PT + H - PB) / 2}) rotate(-90)`}
              textAnchor="middle"
              className="font-sans"
              fontSize="13"
              fill={MUTED}
            >
              Self-assessed level
            </text>
            {ticks.map((w) => (
              <g key={w} className="font-mono" fontSize="11" fill={MUTED} textAnchor="middle">
                <line x1={x(w)} x2={x(w)} y1={H - PB} y2={H - PB + 5} stroke={NAVY} strokeWidth="1.5" />
                <text x={x(w)} y={H - PB + 20}>wk {w}</text>
                <text x={x(w)} y={H - PB + 34}>{monthYear(w)}</text>
              </g>
            ))}

            {/* Road not taken */}
            <motion.path
              d={ghostPath}
              stroke={MUTED}
              strokeWidth="2.5"
              strokeDasharray="1 6"
              strokeLinecap="round"
              fill="none"
              initial={{ opacity: 0 }}
              animate={{ opacity: inView ? 1 : 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            />
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: inView ? 1 : 0 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <text
                x={x(GHOST_END) + 8}
                y={y(ghostV(GHOST_END)) + 5}
                className="font-sans"
                fontSize="13"
                fill={MUTED}
              >
                ← Alternate path: finance
              </text>
            </motion.g>

            {/* Actual skill */}
            <motion.path
              d={skillPath}
              stroke={BLUE}
              strokeWidth="2.5"
              strokeDasharray="7 6"
              fill="none"
              filter="url(#sketch)"
              initial={{ opacity: 0 }}
              animate={{ opacity: inView ? 1 : 0 }}
              transition={{ delay: DRAW_SECONDS * 0.5, duration: 1 }}
            />

            {/* Vibes */}
            <motion.path
              d={vibePath}
              stroke={NAVY}
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="none"
              filter="url(#sketch)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: inView ? 1 : 0 }}
              transition={{ duration: DRAW_SECONDS, ease: "easeInOut" }}
            />

            {/* Milestone dots */}
            {points.map((p, i) => {
              const px = x(p.week);
              const py = y(p.vibe);
              const isActive = i === active;
              const isLast = i === points.length - 1;
              return (
                <motion.g
                  key={p.date}
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                  initial={{ scale: 0 }}
                  animate={{ scale: inView ? 1 : 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                    delay: inView ? (p.week / END) * DRAW_SECONDS : 0,
                  }}
                >
                  {/* Hit area stays a fixed size; only the visible dot scales, so hover can't flicker at the edge */}
                  <g
                    role="button"
                    tabIndex={0}
                    aria-label={p.title}
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    onClick={() => setActive(i)}
                    className="cursor-pointer outline-none"
                  >
                    <circle cx={px} cy={py} r="18" fill="transparent" />
                    {isLast && (
                      <motion.circle
                        cx={px}
                        cy={py}
                        fill="none"
                        stroke={AMBER}
                        strokeWidth="2"
                        className="pointer-events-none"
                        initial={{ r: 14, opacity: 0.8 }}
                        animate={{ r: [14, 26], opacity: [0.8, 0] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                      />
                    )}
                    <motion.g
                      style={{ transformBox: "fill-box", transformOrigin: "center" }}
                      animate={{ scale: isActive ? 1.2 : 1 }}
                      transition={{ duration: 0.15 }}
                    >
                      <circle
                        cx={px}
                        cy={py}
                        r="13"
                        fill={isActive ? AMBER : "white"}
                        stroke={NAVY}
                        strokeWidth="2"
                      />
                      <text x={px} y={py + 1} fontSize="13" textAnchor="middle" dominantBaseline="central">
                        {p.emoji}
                      </text>
                    </motion.g>
                  </g>
                </motion.g>
              );
            })}

            {/* Resting label so the chart says something before anyone hovers */}
            <AnimatePresence>
              {inView && active === null && (
                <motion.g
                  className="pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: DRAW_SECONDS }}
                >
                  <text
                    x={x(last.week)}
                    y={y(last.vibe) - 26}
                    textAnchor={anchor(x(last.week))}
                    className="font-sans"
                    fontSize="16"
                    fontWeight="600"
                    fill={NAVY}
                  >
                    {last.short}
                  </text>
                </motion.g>
              )}
            </AnimatePresence>
          </svg>

          {/* Sticky note for the hovered milestone */}
          <AnimatePresence>
            {current && (() => {
              const fx = x(current.week) / W;
              const fy = y(current.vibe) / H;
              const below = fy < 0.45;
              const shift = fx < 0.18 ? "-12%" : fx > 0.82 ? "-88%" : "-50%";
              return (
                <motion.div
                  key={active}
                  className="absolute z-20 w-64 pointer-events-none"
                  style={{
                    left: `${fx * 100}%`,
                    ...(below
                      ? { top: `${fy * 100}%`, marginTop: 22 }
                      : { bottom: `${(1 - fy) * 100}%`, marginBottom: 22 }),
                    transformOrigin: below ? "top center" : "bottom center",
                  }}
                  initial={{ opacity: 0, scale: 0.9, x: shift, rotate: 0 }}
                  animate={{ opacity: 1, scale: 1, x: shift, rotate: active! % 2 ? 1 : -1 }}
                  exit={{ opacity: 0, scale: 0.95, x: shift }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="relative bg-[#FFFDF8] border border-warm-border rounded-xl px-4 pt-4 pb-3.5 shadow-soft-lg">
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-5 bg-warm-amber/50 -rotate-2 rounded-sm" />
                    <p className="font-mono text-[11px] text-warm-muted mb-1">
                      week {current.week} · {monthYear(current.week)}
                    </p>
                    <p className="font-display font-bold text-warm-navy leading-snug mb-1">
                      {current.emoji} {current.title}
                    </p>
                    <p className="text-sm text-warm-muted leading-relaxed">{current.body}</p>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default JourneyGraph;
