import { MutableRefObject, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { motion, MotionValue, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { scenes, Scene, Extra, ROMAN, firstYear, pad, fmtMonth, lerpAt } from "./timeline";

export type StoryApi = { seek: (f: number) => void };

const instant = "instant" as ScrollBehavior;
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
// -1 is the title card, 0…n-1 the scenes, n the end card
const FS = range(-1, scenes.length);

// ── Scene pieces (from cinema) ──

const ExtraCard = ({ e, onOpen }: { e: Extra; onOpen: (id: string) => void }) => {
  const isProject = e.kind === "project";
  const label = { work: "cast", school: "location", club: "supporting", project: "production" }[e.kind];
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
      onClick={isProject && e.id ? () => onOpen(e.id as string) : undefined}
      className={`w-full md:w-[230px] shrink-0 border border-[#efe6d2]/15 bg-black/40 backdrop-blur-sm ${
        isProject ? "cursor-pointer rx-poster hover:border-[#f2b35b]/70 transition-colors" : ""
      }`}
    >
      {isProject && e.img && (
        <div className="rx-still aspect-[16/8] bg-black">
          <img src={e.img} alt={e.title} className="w-full h-full object-cover object-top" />
        </div>
      )}
      <div className="p-3">
        <div className="rx-mono text-[9px] text-[#f2b35b] mb-1.5 flex justify-between gap-2">
          <span>{label}</span>
          <span className="text-[#8f8676] truncate">{isProject ? "view →" : e.period}</span>
        </div>
        <div className="flex items-start gap-2.5">
          {!isProject && e.img && <img src={e.img} alt="" className="w-7 h-7 rounded-sm object-contain bg-white/90 p-0.5 shrink-0 mt-0.5" />}
          <div className="min-w-0">
            <div className="text-[17px] leading-tight italic">{e.title}</div>
            <div className={`text-[13px] text-[#8f8676] leading-snug mt-0.5 ${isProject ? "line-clamp-2" : ""}`}>{e.sub}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SceneText = ({ s, onOpen, wide }: { s: Scene; onOpen: (id: string) => void; wide: boolean }) => {
  const newAct = s.n === 1 || scenes[s.n - 2].year !== s.year;
  return (
    <div>
      {newAct && (
        <div className="rx-mono text-[11px] text-[#f2b35b] mb-3">
          Act {ROMAN[s.year - firstYear]} — {s.year}
        </div>
      )}
      <div className="rx-mono text-[11px] text-[#8f8676] mb-4">
        Scene {pad(s.n)} · wk {s.week} · {fmtMonth(s.date)}
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
      <p className={`mt-4 text-[#cfc5b0] leading-snug ${wide ? "text-[1.2rem] max-w-[440px]" : "text-[1.15rem]"}`}>{s.body}</p>
      {s.extras.length > 0 && (
        <div className={`mt-6 flex gap-3 ${wide ? "" : "flex-col"}`}>
          {s.extras.map((e) => (
            <ExtraCard key={e.kind + e.title + e.sub} e={e} onOpen={onOpen} />
          ))}
        </div>
      )}
    </div>
  );
};

const TitleCard = ({ wide }: { wide: boolean }) => (
  <div className="w-full flex flex-col items-center text-center px-5">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }} className="rx-mono text-[10px] md:text-[11px] text-[#8f8676] mb-5 md:mb-7">
      the director's cut · a story in {scenes.length} scenes
    </motion.div>
    <motion.h2
      initial={{ clipPath: "inset(0 100% 0 0)", letterSpacing: wide ? "0.5em" : "0.32em", opacity: 0.4 }}
      animate={{ clipPath: "inset(0 0% 0 0)", letterSpacing: wide ? "0.3em" : "0.2em", opacity: 1 }}
      transition={{ delay: 0.35, duration: 1.4, ease: [0.25, 0.6, 0.2, 1] }}
      className={`font-light leading-none ${wide ? "pl-[0.3em] text-[clamp(3rem,9vw,8.5rem)]" : "pl-[0.2em] text-[clamp(2rem,11.5vw,4rem)]"}`}
      style={{ textShadow: "0 0 40px rgba(242,179,91,0.15)" }}
    >
      JONATHAN
    </motion.h2>
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 1 }} className="mt-5 md:mt-7 text-lg md:text-2xl italic text-[#cfc5b0]">
      From a finance major who'd never coded, to AWS.
    </motion.div>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 1 }} className="rx-mono text-[10px] text-[#f2b35b]/80 rx-blink mt-10 md:mt-14">
      {wide ? "scroll to roll film →" : "scroll to roll film ↓"}
    </motion.div>
  </div>
);

const EndCard = ({ onBack, onAsk }: { onBack: () => void; onAsk: () => void }) => (
  <div className="flex flex-col items-center justify-center text-center px-5">
    <div className="rx-mono text-[11px] text-[#f2b35b] mb-4">— end of reel one —</div>
    <div className="text-[clamp(2.4rem,4.6vw,4.2rem)] italic font-light leading-none">To be continued.</div>
    <div className="mt-10 flex flex-wrap justify-center gap-3">
      <button onClick={onBack} className="rx-mono text-[11px] px-5 py-3 border border-[#efe6d2]/25 hover:border-[#f2b35b] hover:text-[#f2b35b] transition-colors">
        ← back to sections
      </button>
      <button onClick={onAsk} className="rx-mono text-[11px] px-5 py-3 border border-[#f2b35b]/50 text-[#f2b35b] hover:bg-[#f2b35b] hover:text-[#0a0907] transition-colors">
        ✻ ask claude about it
      </button>
    </div>
  </div>
);

type Props = {
  vw: number;
  vh: number;
  navH: number;
  stripH: number;
  progress: MotionValue<number>;
  api: MutableRefObject<StoryApi | null>;
  startAt: number;
  onOpen: (id: string) => void;
  onBack: () => void;
  onAsk: () => void;
};

// ── Desktop: vertical scroll scrubs sideways through the scenes ──

const HorizontalRun = ({ vw, vh, navH, stripH, progress, api, startAt, onOpen, onBack, onAsk }: Props) => {
  const runRef = useRef<HTMLDivElement>(null);
  const layout = useMemo(() => {
    let x = vw;
    const base = Math.min(Math.max(vw * 0.5, 540), 720);
    const panels = scenes.map((s) => {
      const w = Math.max(base, 120 + s.extras.length * 242);
      const p = { x, w };
      x += w;
      return p;
    });
    // scroll offset that frames each scene (index -1 is the title card)
    const W = x + vw * 0.7;
    const anchors = [0, ...panels.map((p) => p.x + 40 - vw * 0.25), W - vw];
    return { panels, W, anchors };
  }, [vw]);

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
          <div className="absolute left-0 flex items-center" style={{ width: vw, top: navH, bottom: stripH }}>
            <TitleCard wide />
          </div>
          {scenes.map((sc, i) => (
            <div key={sc.date + sc.short} className="absolute" style={{ left: layout.panels[i].x + 40, top: navH + vh * 0.1, width: layout.panels[i].w - 60 }}>
              <SceneText s={sc} onOpen={onOpen} wide />
            </div>
          ))}
          <div className="absolute flex items-center justify-center" style={{ left: layout.W - vw * 0.7, width: vw * 0.7, top: navH, bottom: stripH }}>
            <EndCard onBack={onBack} onAsk={onAsk} />
          </div>
        </motion.div>

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
                background: "radial-gradient(circle, rgba(242,179,91,0.14), transparent 70%)",
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

const MobileRun = ({ vh, navH, stripH, progress, api, startAt, onOpen, onBack, onAsk }: Props) => {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const anchors = () => [
    0,
    ...refs.current.map((el) => (el ? el.offsetTop - navH - 16 : 0)),
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
    <div style={{ paddingTop: navH, paddingBottom: stripH }}>
      <div className="flex items-center" style={{ minHeight: vh - navH - stripH }}>
        <TitleCard wide={false} />
      </div>
      <div className="relative px-5 pb-10">
        <div className="absolute left-[38px] top-0 bottom-0 w-px bg-gradient-to-b from-[#8f8676]/40 via-[#f2b35b]/60 to-[#f2b35b]/0" />
        {scenes.map((sc, i) => (
          <div key={sc.date + sc.short} ref={(el) => (refs.current[i] = el)} className="relative pl-14 py-10">
            <div className="absolute left-0 top-10 w-9 h-9 rounded-full bg-[#0a0907] border border-[#efe6d2]/25 flex items-center justify-center text-lg">{sc.emoji}</div>
            <div className="text-[5.5rem] leading-none rx-outline absolute right-0 top-4 select-none" aria-hidden>
              {pad(sc.n)}
            </div>
            <SceneText s={sc} onOpen={onOpen} wide={false} />
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
