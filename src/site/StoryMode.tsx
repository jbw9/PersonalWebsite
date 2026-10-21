import { MutableRefObject, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { motion, MotionValue, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { scenes, Scene, pad, fmtTerm, lerpAt, curveY, curvePath } from "./timeline";

export type StoryApi = { seek: (f: number) => void };

const instant = "instant" as ScrollBehavior;
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
// 0…n-1 the scenes, n the end card
const FS = range(0, scenes.length);

// ── Scene pieces (from cinema) ──

const SceneText = ({ s, wide }: { s: Scene; wide: boolean }) => {
  return (
    <div>
      <div className="rx-mono text-[11px] text-[#8692a8] mb-4">
        {fmtTerm(s.date)}
      </div>
      <motion.h3
        initial={{ opacity: 0, x: wide ? 40 : 0, y: wide ? 0 : 16 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1] }}
        className={`italic font-light leading-[1.02] ${wide ? "text-[clamp(2.2rem,3.6vw,3.4rem)] max-w-[560px]" : "text-[2.1rem]"}`}
      >
        {s.title}
      </motion.h3>
      <p className={`mt-4 text-[#c2cbdb] leading-snug ${wide ? "text-[1.2rem] max-w-[440px]" : "text-[1.15rem]"}`}>{s.body}</p>
    </div>
  );
};

const EndCard = ({ onBack, onAsk }: { onBack: () => void; onAsk: () => void }) => (
  <div className="flex flex-col items-center justify-center text-center px-5">
    <div className="rx-mono text-[11px] text-[#5b9cff] mb-4">— end of reel one —</div>
    <div className="text-[clamp(2.4rem,4.6vw,4.2rem)] italic font-light leading-none">To be continued.</div>
    <div className="mt-10 flex flex-wrap justify-center gap-3">
      <button onClick={onBack} className="rx-btn-ghost">
        ← back to sections
      </button>
      <button onClick={onAsk} className="rx-btn">
        ✻ ask alfred about it
      </button>
    </div>
  </div>
);

type Props = {
  vw: number;
  vh: number;
  navH: number;
  bar: number; // bottom letterbox bar
  progress: MotionValue<number>;
  api: MutableRefObject<StoryApi | null>;
  startAt: number;
  onBack: () => void;
  onAsk: () => void;
};

// ── Desktop: vertical scroll scrubs sideways through the scenes ──

const runLayout = (vw: number) => {
  // the first scene sits where every scene is framed, so the film opens on it
  let x = vw * 0.25 - 40;
  const base = Math.min(Math.max(vw * 0.5, 540), 720);
  const panels = scenes.map(() => {
    const p = { x, w: base };
    x += base;
    return p;
  });
  // scroll offset that frames each scene
  const W = x + vw * 0.7;
  const anchors = [...panels.map((p) => p.x + 40 - vw * 0.25), W - vw];
  return { panels, W, anchors };
};
// the vibe line, as in cinema: lower third, a node per scene
const runPoints = (layout: ReturnType<typeof runLayout>, vh: number, bar: number) => {
  const stripTop = vh * 0.7;
  const stripBottom = vh - bar - 34;
  return scenes.map((sc, i) => ({ x: layout.panels[i].x + 70, y: stripBottom - (sc.vibe / 100) * (stripBottom - stripTop) }));
};
// Where each vibe-line node sits on screen when the film opens at scene `at`, so the hero's line can
// morph straight into it
export const storyNodes = (vw: number, vh: number, bar: number, at: number) => {
  const layout = runLayout(vw);
  const off = lerpAt(FS, layout.anchors, at);
  return runPoints(layout, vh, bar).map((p) => ({ x: p.x - off, y: p.y }));
};

const HorizontalRun = ({ vw, vh, navH, bar, progress, api, startAt, onBack, onAsk }: Props) => {
  const runRef = useRef<HTMLDivElement>(null);
  const layout = useMemo(() => runLayout(vw), [vw]);
  // drawn up to the playhead
  const stripTop = vh * 0.7;
  const stripBottom = vh - bar - 34;
  const pts = useMemo(() => runPoints(layout, vh, bar), [layout, vh, bar]);
  const pathD = useMemo(() => {
    const d = curvePath(pts);
    return `M ${pts[0].x - 400} ${pts[0].y} L ${pts[0].x} ${pts[0].y} ${d.slice(d.indexOf("C"))} L ${layout.W} ${pts[pts.length - 1].y}`;
  }, [pts, layout.W]);

  const maxS = layout.W - vw;
  const raw = useMotionValue(0);
  const s = useSpring(raw, { stiffness: 140, damping: 32, mass: 0.7 });
  const { scrollY } = useScroll();
  const sync = () => {
    const top = runRef.current ? runRef.current.offsetTop : 0;
    raw.set(Math.min(Math.max(window.scrollY - top, 0), maxS));
  };
  useMotionValueEvent(scrollY, "change", sync);
  useEffect(sync); // re-sync after resize changes the run length

  const L = useRef(layout);
  L.current = layout;
  const geo = useRef({ pts, vw });
  geo.current = { pts, vw };
  useMotionValueEvent(s, "change", (v) => progress.set(lerpAt(L.current.anchors, FS, v)));

  useLayoutEffect(() => {
    const seek = (f: number) => window.scrollTo({ top: lerpAt(FS, L.current.anchors, f), behavior: instant });
    api.current = { seek };
    const target = lerpAt(FS, L.current.anchors, startAt);
    window.scrollTo({ top: target, behavior: instant });
    raw.jump(target);
    s.jump(target);
    progress.set(startAt);
    return () => {
      api.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trackX = useTransform(s, (v) => -v);
  const backX = useTransform(s, (v) => -v * 0.7);
  const frontX = useTransform(s, (v) => -v * 1.35);
  const clipW = useTransform(s, (v) => v + geo.current.vw / 2);
  const riderY = useTransform(s, (v) => curveY(geo.current.pts, v + geo.current.vw / 2));
  const riderOpacity = useTransform(s, (v) => Math.min(1, Math.max(0, (v + geo.current.vw / 2 - geo.current.pts[0].x + 400) / 300)));

  const bokeh = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        x: ((i * 7919) % 1000) / 1000,
        y: ((i * 104729) % 1000) / 1000,
        r: 30 + ((i * 31) % 90),
      })),
    []
  );

  // extra 0.4vh of scroll holds the final frame
  return (
    <section ref={runRef} style={{ height: maxS + vh * 1.4 }} className="relative">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* back layer: huge outlined scene numbers drift slower than the story */}
        <motion.div style={{ x: backX }} className="absolute inset-y-0 left-0" aria-hidden>
          {scenes.map((sc, i) => {
            const p = layout.panels[i];
            return (
              <div
                key={sc.date + sc.short}
                className="absolute rx-outline font-light leading-none select-none"
                style={{ left: 0.7 * (p.x + p.w / 2 - vw / 2) + vw * 0.6, top: navH + vh * 0.06, fontSize: vh * 0.5, transform: "translateX(-50%)" }}
              >
                {pad(sc.n)}
              </div>
            );
          })}
        </motion.div>

        <motion.div style={{ x: trackX, width: layout.W }} className="absolute inset-y-0 left-0">
          {scenes.map((sc, i) => (
            <div key={sc.date + sc.short} className="absolute" style={{ left: layout.panels[i].x + 40, top: navH + vh * 0.07, width: layout.panels[i].w - 60 }}>
              <SceneText s={sc} wide />
            </div>
          ))}
          <div className="absolute flex items-center justify-center" style={{ left: layout.W - vw * 0.7, width: vw * 0.7, top: navH, bottom: vh * 0.3 }}>
            <EndCard onBack={onBack} onAsk={onAsk} />
          </div>

          <svg className="absolute top-0 left-0 overflow-visible pointer-events-none" width={layout.W} height={vh}>
            <defs>
              <clipPath id="rx-run-drawn">
                <motion.rect x={0} y={0} height={vh} width={clipW} />
              </clipPath>
              <linearGradient id="rx-run-line" x1="0" x2="1">
                <stop offset="0" stopColor="#8692a8" />
                <stop offset="1" stopColor="#5b9cff" />
              </linearGradient>
            </defs>
            <line x1={0} x2={layout.W} y1={stripBottom + 14} y2={stripBottom + 14} stroke="#e6ecf5" strokeOpacity={0.08} />
            <path d={pathD} fill="none" stroke="#e6ecf5" strokeOpacity={0.12} strokeWidth={1} strokeDasharray="2 6" />
            <path d={pathD} fill="none" stroke="url(#rx-run-line)" strokeWidth={2} clipPath="url(#rx-run-drawn)" />
          </svg>
          {scenes.map((sc, i) => (
            <button
              key={"pt" + sc.date + sc.short}
              onClick={() => api.current?.seek(i)}
              aria-label={`Jump to scene ${sc.n}: ${sc.short}`}
              className="absolute flex flex-col items-center group"
              style={{ left: pts[i].x, top: pts[i].y, transform: "translate(-50%, -50%)" }}
            >
              <span className="absolute bottom-[calc(100%+6px)] rx-mono text-[10px] text-[#8692a8] group-hover:text-[#e6ecf5] whitespace-nowrap transition-colors">{sc.short}</span>
              <span className="w-10 h-10 rounded-full bg-[#070b14] border border-[#e6ecf5]/25 group-hover:border-[#5b9cff] flex items-center justify-center text-xl transition-colors">{sc.emoji}</span>
            </button>
          ))}
        </motion.div>

        {/* playhead rides the vibe line at screen centre */}
        <motion.div
          className="absolute left-1/2 w-3.5 h-3.5 -ml-[7px] -mt-[7px] rounded-full bg-[#bcd7ff] pointer-events-none"
          style={{ top: riderY, opacity: riderOpacity, boxShadow: "0 0 18px 4px rgba(91,156,255,0.6)" }}
        />
        <motion.div className="absolute left-1/2 w-px bg-[#5b9cff]/25 pointer-events-none" style={{ top: stripTop - 20, bottom: bar, opacity: riderOpacity }} />

        {/* front layer: out-of-focus light drifting faster than the story */}
        <motion.div style={{ x: frontX }} className="absolute inset-y-0 left-0 pointer-events-none" aria-hidden>
          {bokeh.map((b, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left: b.x * layout.W * 1.35,
                top: b.y * vh,
                width: b.r,
                height: b.r,
                background: "radial-gradient(circle, rgba(91,156,255,0.14), transparent 70%)",
                filter: "blur(6px)",
              }}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ── Mobile: the same story, top to bottom ──

const MobileRun = ({ vh, navH, progress, api, startAt, onBack, onAsk }: Props) => {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const anchors = () => [
    // page offsets: offsetTop would be relative to the positioned scene list
    ...refs.current.map((el) => (el ? el.getBoundingClientRect().top + window.scrollY - navH - 16 : 0)),
    document.documentElement.scrollHeight - window.innerHeight,
  ];
  useEffect(() => {
    const onScroll = () => progress.set(lerpAt(anchors(), FS, window.scrollY));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  });
  useLayoutEffect(() => {
    const seek = (f: number) => window.scrollTo({ top: lerpAt(FS, anchors(), f), behavior: instant });
    api.current = { seek };
    seek(startAt);
    progress.set(startAt);
    return () => {
      api.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div style={{ paddingTop: navH, paddingBottom: 72 }}>
      <div className="relative px-5 pb-10">
        <div className="absolute left-[38px] top-0 bottom-0 w-px bg-gradient-to-b from-[#8692a8]/40 via-[#5b9cff]/60 to-[#5b9cff]/0" />
        {scenes.map((sc, i) => (
          <div key={sc.date + sc.short} ref={(el) => (refs.current[i] = el)} className="relative pl-14 py-10">
            <div className="absolute left-0 top-10 w-9 h-9 rounded-full bg-[#070b14] border border-[#e6ecf5]/25 flex items-center justify-center text-lg">{sc.emoji}</div>
            <div className="text-[5.5rem] leading-none rx-outline absolute right-0 top-4 select-none" aria-hidden>
              {pad(sc.n)}
            </div>
            <SceneText s={sc} wide={false} />
          </div>
        ))}
      </div>
      <div className="py-24">
        <EndCard onBack={onBack} onAsk={onAsk} />
      </div>
    </div>
  );
};

const Story = (props: Props) => (props.vw >= 768 ? <HorizontalRun {...props} /> : <MobileRun {...props} />);

export default Story;
