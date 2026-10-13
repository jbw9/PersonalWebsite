import { useEffect, useState } from "react";
import { animate, useMotionValue, useMotionValueEvent } from "framer-motion";
import { scenes, curvePath } from "./timeline";

export type Pt = { x: number; y: number };

// The hero's vibe line becoming the film's: every node glides (and the line stretches) from where it
// sits in the hero to where Story will draw it, then hands off to the real thing underneath.
const Bridge = ({ from, to, fadeIn, onDone }: { from: Pt[]; to: Pt[]; fadeIn: boolean; onDone: () => void }) => {
  const p = useMotionValue(0);
  const [k, setK] = useState(0);
  useMotionValueEvent(p, "change", setK);
  useEffect(() => {
    const c = animate(p, 1, { duration: 1.25, ease: [0.65, 0, 0.3, 1], onComplete: onDone });
    return () => c.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // nodes leave in a slight wave, left to right, so the line visibly unrolls
  const pts = from.map((a, i) => {
    const t = Math.min(1, Math.max(0, (k - i * 0.025) / (1 - (from.length - 1) * 0.025)));
    const e = t * t * (3 - 2 * t);
    return { x: a.x + (to[i].x - a.x) * e, y: a.y + (to[i].y - a.y) * e };
  });
  const c = curvePath(pts);
  const last = pts[pts.length - 1];
  const d = `M ${pts[0].x - 2000} ${pts[0].y} L ${pts[0].x} ${pts[0].y} ${c.slice(c.indexOf("C"))} L ${last.x + 2000} ${last.y}`;
  const opacity = (fadeIn ? Math.min(1, k / 0.2) : 1) * (k > 0.85 ? (1 - k) / 0.15 : 1);

  return (
    <div className="fixed inset-0 z-[45] pointer-events-none" style={{ opacity }} aria-hidden>
      <svg className="absolute inset-0 w-full h-full overflow-visible">
        <defs>
          <linearGradient id="rx-bridge-line" x1="0" x2="1">
            <stop offset="0" stopColor="#8692a8" />
            <stop offset="1" stopColor="#5b9cff" />
          </linearGradient>
        </defs>
        <path d={d} fill="none" stroke="url(#rx-bridge-line)" strokeWidth={2} style={{ filter: "drop-shadow(0 0 6px rgba(91,156,255,0.5))" }} />
      </svg>
      {pts.map((q, i) => (
        <span
          key={scenes[i].date + scenes[i].short}
          className="absolute w-10 h-10 -ml-5 -mt-5 rounded-full bg-[#070b14] border border-[#e6ecf5]/25 flex items-center justify-center text-xl"
          style={{ left: q.x, top: q.y }}
        >
          {scenes[i].emoji}
        </span>
      ))}
    </div>
  );
};

export default Bridge;
