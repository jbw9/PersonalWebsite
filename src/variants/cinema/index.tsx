import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  MotionValue,
} from "framer-motion";
import { experiences, education, involvements } from "../../data";
import { projects } from "../../data/projects";
import { guides } from "../../data/guides";
import { milestones, JOURNEY_START } from "../../data/journey";
import "./cinema.css";

// ── Story data: every experience / school / club / project is attached to the scene it happened in ──

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const DAY = 864e5;
const startOf = (period: string) => {
  const m = period.match(/([A-Za-z]{3})[a-z]*\.?\s+(\d{4})/);
  return m ? new Date(+m[2], MONTHS.indexOf(m[1].toLowerCase()), 1).getTime() : 0;
};
const fmtMonth = (iso: string) => {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

type Extra = { kind: "work" | "school" | "club" | "project"; title: string; sub: string; period: string; img?: string; id?: string };
const t0 = new Date(JOURNEY_START).getTime();
const scenes = milestones.map((m, i) => ({
  ...m,
  n: i + 1,
  time: new Date(m.date).getTime(),
  week: Math.round((new Date(m.date).getTime() - t0) / (7 * DAY)),
  year: new Date(m.date).getFullYear(),
  extras: [] as Extra[],
}));
const nearest = (t: number) =>
  scenes.reduce((best, s) => (Math.abs(s.time - t) < Math.abs(best.time - t) ? s : best), scenes[0]);
education.forEach((e) =>
  nearest(startOf(e.period)).extras.push({ kind: "school", title: e.degree, sub: e.gpa ? `${e.school} · GPA ${e.gpa}` : e.school, period: e.period, img: e.image })
);
experiences.forEach((e) =>
  nearest(startOf(e.period)).extras.push({ kind: "work", title: e.title, sub: e.company, period: e.period, img: e.companyIcon.replace(/^\/?/, "/") })
);
involvements.forEach((v) =>
  nearest(startOf(v.period)).extras.push({ kind: "club", title: v.role, sub: v.organization, period: v.period, img: v.image })
);
projects.forEach((p) => {
  const hit = scenes.find((s) => `${s.title} ${s.short}`.toLowerCase().includes(p.title.toLowerCase()));
  if (hit) hit.extras.push({ kind: "project", title: p.title, sub: p.description, period: "", img: p.image || p.screenshots?.[0], id: p.id });
});
const ROMAN = ["I", "II", "III", "IV", "V", "VI"];
const firstYear = scenes[0].year;

const CONTACT = [
  { label: "Email", href: "mailto:jbw7@illinois.edu" },
  { label: "GitHub", href: "https://github.com/jbw9" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/jwidjajakusuma/" },
];

const pad = (n: number) => String(n).padStart(2, "0");

// Film grain: one noise tile generated once, jittered with a stepped CSS animation
const useGrain = () =>
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 160;
    const ctx = c.getContext("2d");
    if (!ctx) return "";
    const img = ctx.createImageData(160, 160);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    return c.toDataURL();
  }, []);

const useViewport = () => {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return size;
};

// ── Intro: film leader 3-2-1 → title wipes in behind an anamorphic flare → bars open ──

type Stage = 0 | 1 | 2 | 3;

const Leader = ({ stage }: { stage: Stage }) => {
  const [n, setN] = useState(3);
  useEffect(() => {
    const a = setTimeout(() => setN(2), 360);
    const b = setTimeout(() => setN(1), 720);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, []);
  if (stage > 0) return null;
  return (
    <div className="fixed inset-0 z-[45] flex items-center justify-center bg-[#16140f] cin-flicker">
      <div className="absolute inset-x-0 top-1/2 h-px bg-[#efe6d2]/30" />
      <div className="absolute inset-y-0 left-1/2 w-px bg-[#efe6d2]/30" />
      <div className="relative w-56 h-56 rounded-full border border-[#efe6d2]/40">
        <div className="cin-leader-sweep" key={n} />
        <div className="absolute inset-4 rounded-full border border-[#efe6d2]/25" />
        <span className="absolute inset-0 flex items-center justify-center text-[9rem] leading-none text-[#efe6d2]/85">{n}</span>
      </div>
    </div>
  );
};

// ── Scene panel (desktop) ──

type Layout = { panels: { x: number; w: number }[]; W: number; heroW: number };

const ExtraCard = ({ e, onOpen }: { e: Extra; onOpen: (id: string) => void }) => {
  const isProject = e.kind === "project";
  const label = { work: "cast", school: "location", club: "supporting", project: "production" }[e.kind];
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
      onClick={isProject && e.id ? () => onOpen(e.id as string) : undefined}
      className={`w-[230px] shrink-0 border border-[#efe6d2]/15 bg-black/40 backdrop-blur-sm ${
        isProject ? "cursor-pointer cin-poster hover:border-[#f2b35b]/70 transition-colors" : ""
      }`}
    >
      {isProject && e.img && (
        <div className="cin-still aspect-[16/8] bg-black">
          <img src={e.img} alt={e.title} className="w-full h-full object-cover object-top" />
        </div>
      )}
      <div className="p-3">
        <div className="cin-mono text-[9px] text-[#f2b35b] mb-1.5 flex justify-between gap-2">
          <span>{label}</span>
          <span className="text-[#8f8676] truncate">{isProject ? "view →" : e.period}</span>
        </div>
        <div className="flex items-start gap-2.5">
          {!isProject && e.img && (
            <img src={e.img} alt="" className="w-7 h-7 rounded-sm object-contain bg-white/90 p-0.5 shrink-0 mt-0.5" />
          )}
          <div className="min-w-0">
            <div className="text-[17px] leading-tight italic">{e.title}</div>
            <div className={`text-[13px] text-[#8f8676] leading-snug mt-0.5 ${isProject ? "line-clamp-2" : ""}`}>{e.sub}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SceneText = ({ s, onOpen, wide }: { s: (typeof scenes)[number]; onOpen: (id: string) => void; wide: boolean }) => {
  const newAct = s.n === 1 || scenes[s.n - 2].year !== s.year;
  return (
    <div>
      {newAct && (
        <div className="cin-mono text-[11px] text-[#f2b35b] mb-3">
          Act {ROMAN[s.year - firstYear]} — {s.year}
        </div>
      )}
      <div className="cin-mono text-[11px] text-[#8f8676] mb-4">
        Scene {pad(s.n)} · wk {s.week} · {fmtMonth(s.date)}
      </div>
      <motion.h3
        initial={{ opacity: 0, x: 40 }}
        whileInView={{ opacity: 1, x: 0 }}
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

// Smooth curve through the vibe points with horizontal tangents, so y at any x is solvable
const curveY = (pts: { x: number; y: number }[], x: number) => {
  if (x <= pts[0].x) return pts[0].y;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    if (x <= b.x) {
      const u = (x - a.x) / (b.x - a.x);
      let t = u;
      for (let k = 0; k < 6; k++) {
        const f = 1.5 * t - 1.5 * t * t + t * t * t - u;
        t -= f / (1.5 - 3 * t + 3 * t * t);
      }
      return a.y + (b.y - a.y) * (3 * t * t - 2 * t * t * t);
    }
  }
  return pts[pts.length - 1].y;
};

const HorizontalRun = ({
  vw,
  vh,
  bar,
  onScene,
  onOpen,
  started,
  done,
}: {
  vw: number;
  vh: number;
  bar: number;
  onScene: (n: number, s: number) => void;
  onOpen: (id: string) => void;
  started: boolean;
  done: boolean;
}) => {
  const runRef = useRef<HTMLDivElement>(null);
  const layout: Layout = useMemo(() => {
    const heroW = vw;
    let x = heroW;
    const base = Math.min(Math.max(vw * 0.5, 540), 720);
    const panels = scenes.map((s) => {
      const w = Math.max(base, 120 + s.extras.length * 242);
      const p = { x, w };
      x += w;
      return p;
    });
    return { panels, W: x + vw * 0.7, heroW };
  }, [vw]);

  const stripTop = vh * 0.7;
  const stripBottom = vh - bar - 34;
  const pts = useMemo(
    () => scenes.map((s, i) => ({ x: layout.panels[i].x + 70, y: stripBottom - (s.vibe / 100) * (stripBottom - stripTop) })),
    [layout, stripTop, stripBottom]
  );
  const pathD = useMemo(() => {
    let d = `M ${pts[0].x - 400} ${pts[0].y} L ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      const mx = (a.x + b.x) / 2;
      d += ` C ${mx} ${a.y} ${mx} ${b.y} ${b.x} ${b.y}`;
    }
    return d + ` L ${layout.W} ${pts[pts.length - 1].y}`;
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

  const ref = useRef({ pts, vw, layout });
  ref.current = { pts, vw, layout };
  const trackX = useTransform(s, (v) => -v);
  const backX = useTransform(s, (v) => -v * 0.7);
  const frontX = useTransform(s, (v) => -v * 1.35);
  const clipW = useTransform(s, (v) => v + ref.current.vw / 2);
  const riderY = useTransform(s, (v) => curveY(ref.current.pts, v + ref.current.vw / 2));
  const riderOpacity = useTransform(s, (v) => Math.min(1, Math.max(0, (v + ref.current.vw / 2 - ref.current.pts[0].x + 400) / 300)));

  useMotionValueEvent(s, "change", (v) => {
    const c = v + ref.current.vw / 2;
    const idx = ref.current.layout.panels.reduce((acc, p, i) => (p.x - 140 <= c ? i + 1 : acc), 0);
    onScene(idx, v);
  });

  const bokeh = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        x: ((i * 7919) % 1000) / 1000,
        y: ((i * 104729) % 1000) / 1000,
        r: 30 + ((i * 31) % 90),
      })),
    []
  );

  // extra 0.4vh of scroll holds the final frame before the page releases
  return (
    <section ref={runRef} style={{ height: maxS + vh * 1.4 }} className="relative">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* back layer: huge outlined scene numbers drift slower than the story */}
        <motion.div style={{ x: backX }} className="absolute inset-y-0 left-0" aria-hidden>
          {scenes.map((sc, i) => {
            const p = layout.panels[i];
            const left = 0.7 * (p.x + p.w / 2 - vw / 2) + vw * 0.6;
            return (
              <div
                key={sc.date + sc.short}
                className="absolute cin-outline font-light leading-none select-none"
                style={{ left, top: bar + vh * 0.06, fontSize: vh * 0.5, transform: "translateX(-50%)" }}
              >
                {pad(sc.n)}
              </div>
            );
          })}
        </motion.div>

        <motion.div style={{ x: trackX, width: layout.W }} className="absolute inset-y-0 left-0">
          {/* opening title card */}
          <div className="absolute inset-y-0 left-0 flex items-center" style={{ width: layout.heroW }}>
            <HeroTitle key={started ? "s" : "i"} started={started} wide done={done} onOpen={onOpen} />
          </div>

          {scenes.map((sc, i) => (
            <div
              key={sc.date + sc.short}
              className="absolute"
              style={{ left: layout.panels[i].x + 40, top: bar + vh * 0.08, width: layout.panels[i].w - 60 }}
            >
              <SceneText s={sc} onOpen={onOpen} wide />
            </div>
          ))}

          <div
            className="absolute flex flex-col items-center justify-center text-center"
            style={{ left: layout.W - vw * 0.7, width: vw * 0.7, top: bar, bottom: vh * 0.34 }}
          >
            <div className="cin-mono text-[11px] text-[#f2b35b] mb-4">— intermission —</div>
            <div className="text-[clamp(2.4rem,4.6vw,4.2rem)] italic font-light leading-none">To be continued.</div>
            <div className="cin-mono text-[11px] text-[#8f8676] mt-5 cin-blink">keep scrolling ↓ feature presentation</div>
          </div>

          {/* the vibe line: a soundtrack strip under the film, drawn up to the playhead */}
          <svg className="absolute top-0 left-0 overflow-visible pointer-events-none" width={layout.W} height={vh}>
            <defs>
              <clipPath id="cin-drawn">
                <motion.rect x={0} y={0} height={vh} width={clipW} />
              </clipPath>
              <linearGradient id="cin-line" x1="0" x2="1">
                <stop offset="0" stopColor="#8f8676" />
                <stop offset="1" stopColor="#f2b35b" />
              </linearGradient>
            </defs>
            <line x1={0} x2={layout.W} y1={stripBottom + 14} y2={stripBottom + 14} stroke="#efe6d2" strokeOpacity={0.08} />
            <path d={pathD} fill="none" stroke="#efe6d2" strokeOpacity={0.12} strokeWidth={1} strokeDasharray="2 6" />
            <path d={pathD} fill="none" stroke="url(#cin-line)" strokeWidth={2} clipPath="url(#cin-drawn)" />
          </svg>
          {scenes.map((sc, i) => (
            <div
              key={"pt" + sc.date + sc.short}
              className="absolute flex flex-col items-center pointer-events-none"
              style={{ left: pts[i].x, top: pts[i].y, transform: "translate(-50%, -50%)" }}
            >
              <span className="absolute bottom-[calc(100%+6px)] cin-mono text-[10px] text-[#8f8676] whitespace-nowrap">{sc.short}</span>
              <span className="w-10 h-10 rounded-full bg-[#0a0907] border border-[#efe6d2]/25 flex items-center justify-center text-xl">
                {sc.emoji}
              </span>
            </div>
          ))}
        </motion.div>

        {/* playhead rides the vibe line at screen centre */}
        <motion.div
          className="absolute left-1/2 w-3.5 h-3.5 -ml-[7px] -mt-[7px] rounded-full bg-[#f2b35b] pointer-events-none"
          style={{ top: riderY, opacity: riderOpacity, boxShadow: "0 0 18px 4px rgba(242,179,91,0.55)" }}
        />
        <motion.div className="absolute left-1/2 w-px bg-[#f2b35b]/25 pointer-events-none" style={{ top: stripTop - 20, bottom: bar, opacity: riderOpacity }} />

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
                background: "radial-gradient(circle, rgba(242,179,91,0.16), transparent 70%)",
                filter: "blur(6px)",
              }}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ── Title card (shared by the intro and the first frame of the run) ──

const HeroTitle = ({ started, wide, done, onOpen }: { started: boolean; wide: boolean; done: boolean; onOpen: (id: string) => void }) => (
  <div className="relative w-full flex flex-col items-center text-center px-5">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: started ? 0 : 1.9, duration: 1 }}
      className="cin-mono text-[10px] md:text-[11px] text-[#8f8676] mb-5 md:mb-7"
    >
      a story in {scenes.length} scenes
    </motion.div>
    <div className="relative">
      <motion.h1
        initial={{ clipPath: "inset(0 100% 0 0)", letterSpacing: wide ? "0.6em" : "0.4em", opacity: 0.4 }}
        animate={{ clipPath: "inset(0 0% 0 0)", letterSpacing: wide ? "0.3em" : "0.2em", opacity: 1 }}
        transition={{ delay: started ? 0 : 1.15, duration: started ? 0.6 : 2.3, ease: [0.25, 0.6, 0.2, 1] }}
        className={`font-light leading-none ${wide ? "pl-[0.3em] text-[clamp(3rem,10vw,9.5rem)]" : "pl-[0.2em] text-[clamp(2rem,11.5vw,4rem)]"}`}
        style={{ textShadow: "0 0 40px rgba(242,179,91,0.15)" }}
      >
        JONATHAN
      </motion.h1>
      {/* anamorphic flare riding the wipe edge */}
      {!started && (
        <motion.div
          initial={{ left: "0%", opacity: 0 }}
          animate={{ left: "100%", opacity: [0, 1, 1, 0] }}
          transition={{ delay: 1.15, duration: 2.3, ease: [0.25, 0.6, 0.2, 1] }}
          className="absolute top-1/2 -translate-x-1/2 pointer-events-none"
        >
          <div className="w-[70vw] h-[2px] -translate-y-1/2" style={{ background: "linear-gradient(90deg, transparent, rgba(120,180,255,0.9), transparent)", filter: "blur(0.5px)" }} />
          <div className="absolute left-1/2 top-1/2 w-24 h-24 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,240,210,0.9), transparent 60%)" }} />
        </motion.div>
      )}
    </div>
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: started ? 0.1 : 2.4, duration: 1 }}
      className="mt-5 md:mt-7 text-lg md:text-2xl italic text-[#cfc5b0]"
    >
      CS &amp; Econs @ UIUC — building software that solves real problems
    </motion.div>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: done ? 1 : 0 }}
      transition={{ duration: 0.8, delay: started ? 0.2 : 0.7 }}
      className="absolute top-full inset-x-0 px-4 mt-10 md:mt-14 flex flex-col items-center gap-6"
    >
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 cin-mono text-[11px] md:text-[12px]">
        <span>
          <span className="text-[#f2b35b]">☁</span> incoming sde @ aws
        </span>
        <button onClick={() => onOpen("taxbuddy")} className="hover:text-[#f2b35b] transition-colors">
          <span className="text-[#7bd88f]">●</span> now building taxbuddy ↗
        </button>
      </div>
      <div className="flex gap-6 cin-mono text-[11px] text-[#a99f8c]">
        {CONTACT.map((c) => (
          <a key={c.label} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="hover:text-[#f2b35b] transition-colors">
            {c.label}
          </a>
        ))}
      </div>
      <div className="cin-mono text-[10px] text-[#f2b35b]/80 cin-blink mt-4">{wide ? "scroll to roll film →" : "scroll to roll film ↓"}</div>
    </motion.div>
  </div>
);

// ── Page ──

const Cinema = () => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const grain = useGrain();
  const { w: vw, h: vh } = useViewport();
  const wide = vw >= 768;
  const [stage, setStage] = useState<Stage>(reduce ? 3 : 0);
  const skipped = useRef(!!reduce);
  const [scene, setScene] = useState(0);
  const tcRef = useRef<HTMLSpanElement>(null);
  const done = stage === 3;

  useEffect(() => {
    if (done) return;
    const timers = [setTimeout(() => setStage(1), 1080), setTimeout(() => setStage(3), 3500)];
    const skip = () => {
      skipped.current = true;
      setStage(3);
    };
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchstart", skip, { passive: true });
    return () => {
      timers.forEach(clearTimeout);
      html.style.overflow = prevOverflow;
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchstart", skip);
    };
  }, [done]);

  const onScene = (n: number, s: number) => {
    setScene((prev) => (prev === n ? prev : n));
    if (tcRef.current) {
      const f = Math.round(s / 3);
      tcRef.current.textContent = `00:${pad(Math.floor(f / 1440) % 60)}:${pad(Math.floor(f / 24) % 60)}:${pad(f % 24)}`;
    }
  };
  const open = (id: string) => navigate(`/project/${id}`);

  const barIntro = Math.max(28, (vh - vw / (wide ? 2.39 : 1.85)) / 2);
  const bar = wide ? 44 : 30;
  const current = scenes[scene - 1];
  const started = skipped.current;

  return (
    <div className="v-cinema min-h-screen relative">
      {/* letterbox: 2.39:1 during the titles, then opens to thin bars that carry the HUD */}
      <motion.div
        className="fixed top-0 inset-x-0 z-50 bg-black flex items-end"
        initial={{ height: reduce ? bar : barIntro }}
        animate={{ height: done ? bar : barIntro }}
        transition={{ duration: skipped.current ? 0.5 : 1.1, ease: [0.7, 0, 0.2, 1] }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: done ? 1 : 0 }}
          transition={{ delay: done && !skipped.current ? 0.8 : 0 }}
          className="w-full flex justify-between items-center px-4 md:px-6 h-[30px] md:h-[44px] cin-mono text-[9px] md:text-[10px] text-[#8f8676] gap-4"
        >
          <span className="truncate">
            <span className="text-[#c4372b] mr-2">●</span>
            reel 1 ·{" "}
            {current ? (
              <>
                scene {pad(current.n)}/{scenes.length} <span className="hidden sm:inline">· {current.short}</span>
              </>
            ) : (
              "title card"
            )}
          </span>
          <span ref={tcRef} className="tabular-nums shrink-0">
            00:00:00:00
          </span>
        </motion.div>
      </motion.div>
      <motion.div
        className="fixed bottom-0 inset-x-0 z-50 bg-black"
        initial={{ height: reduce ? bar : barIntro }}
        animate={{ height: done ? bar : barIntro }}
        transition={{ duration: skipped.current ? 0.5 : 1.1, ease: [0.7, 0, 0.2, 1] }}
      />

      <Leader stage={stage} />

      {wide ? (
        <HorizontalRun vw={vw} vh={vh} bar={bar} onScene={onScene} onOpen={open} started={started} done={done} />
      ) : (
        <MobileRun bar={bar} onOpen={open} started={started} onScene={onScene} done={done} />
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: done ? 1 : 0 }} transition={{ duration: 0.8 }}>
        <Contact />
        <Features onOpen={open} onGuide={(id) => navigate(`/guide/${id}`)} />
        <Credits />
      </motion.div>

      <div className="cin-grain z-[60]" style={{ backgroundImage: `url(${grain})` }} />
      <div className="cin-vignette z-[55]" />
    </div>
  );
};

// ── Mobile: the same story, top to bottom ──

const MobileRun = ({
  bar,
  onOpen,
  started,
  onScene,
  done,
}: {
  bar: number;
  onOpen: (id: string) => void;
  started: boolean;
  done: boolean;
  onScene: (n: number, s: number) => void;
}) => {
  const { scrollY } = useScroll();
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  useMotionValueEvent(scrollY, "change", (y) => {
    const mid = y + window.innerHeight / 2;
    const idx = refs.current.reduce((acc, el, i) => (el && el.offsetTop <= mid ? i + 1 : acc), 0);
    onScene(idx, y);
  });
  return (
    <div>
      <div className="h-[100svh] flex items-center" style={{ paddingBottom: bar }}>
        <HeroTitle key={started ? "s" : "i"} started={started} wide={false} done={done} onOpen={onOpen} />
      </div>
      <div className="relative px-5 pb-10">
        <div className="absolute left-[38px] top-0 bottom-0 w-px bg-gradient-to-b from-[#8f8676]/40 via-[#f2b35b]/60 to-[#f2b35b]/0" />
        {scenes.map((sc, i) => (
          <div key={sc.date + sc.short} ref={(el) => (refs.current[i] = el)} className="relative pl-14 py-10">
            <div className="absolute left-0 top-10 w-9 h-9 rounded-full bg-[#0a0907] border border-[#efe6d2]/25 flex items-center justify-center text-lg">
              {sc.emoji}
            </div>
            <div className="text-[5.5rem] leading-none cin-outline absolute right-0 top-4 select-none" aria-hidden>
              {pad(sc.n)}
            </div>
            <SceneText s={sc} onOpen={onOpen} wide={false} />
          </div>
        ))}
      </div>
    </div>
  );
};

// ── After the run: feature presentations, commentary, credits ──

const SectionHead = ({ kicker, title }: { kicker: string; title: string }) => (
  <div className="mb-10 md:mb-14">
    <div className="cin-mono text-[10px] md:text-[11px] text-[#f2b35b] mb-3">{kicker}</div>
    <h2 className="text-[clamp(2.4rem,6vw,5rem)] font-light italic leading-[0.95]">{title}</h2>
  </div>
);

const Contact = () => (
  <section className="px-5 md:px-12 pt-28 md:pt-36 pb-10 max-w-6xl mx-auto">
    <div className="cin-mono text-[10px] md:text-[11px] text-[#8f8676]">now showing</div>
    <div className="mt-3 text-[clamp(1.8rem,4vw,3rem)] font-light leading-tight max-w-3xl">
      Incoming software engineer at <em className="text-[#f2b35b]">Amazon Web Services</em> (MSK), currently building{" "}
      <em className="text-[#f2b35b]">TaxBuddy</em>.
    </div>
    <div className="mt-8 flex flex-wrap gap-3">
      {CONTACT.map((c) => (
        <a
          key={c.label}
          href={c.href}
          target={c.href.startsWith("http") ? "_blank" : undefined}
          rel="noopener noreferrer"
          className="cin-mono text-[11px] px-5 py-3 border border-[#efe6d2]/25 hover:border-[#f2b35b] hover:text-[#f2b35b] transition-colors"
        >
          {c.label} ↗
        </a>
      ))}
    </div>
  </section>
);

const Features = ({ onOpen, onGuide }: { onOpen: (id: string) => void; onGuide: (id: string) => void }) => (
  <>
    <section className="px-5 md:px-12 py-16 md:py-24 max-w-6xl mx-auto">
      <SectionHead kicker="feature presentations" title="Now playing" />
      <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p, i) => {
          const img = p.image || p.screenshots?.[0];
          return (
            <motion.button
              key={p.id}
              onClick={() => onOpen(p.id)}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.9, delay: (i % 3) * 0.12, ease: [0.2, 0.7, 0.2, 1] }}
              className="cin-poster text-left group"
            >
              <div className="cin-still aspect-[16/10] bg-[#14120e] border border-[#efe6d2]/10 group-hover:border-[#f2b35b]/60 transition-colors">
                {img ? (
                  <img src={img} alt={p.title} className="w-full h-full object-cover object-top" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl italic font-light text-[#efe6d2]/50 px-6 text-center">
                    {p.title}
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="cin-mono text-[10px] text-[#8f8676]">{pad(i + 1)}</span>
                <span className="text-2xl italic group-hover:text-[#f2b35b] transition-colors">{p.title}</span>
              </div>
              <p className="mt-1.5 pl-8 text-[#8f8676] text-base leading-snug line-clamp-2">{p.description}</p>
            </motion.button>
          );
        })}
      </div>
    </section>

    <section className="px-5 md:px-12 py-16 md:py-24 max-w-6xl mx-auto">
      <SectionHead kicker="bonus features" title="Director's commentary" />
      <div className="border-t border-[#efe6d2]/15">
        {guides.map((g) => (
          <button
            key={g.id}
            onClick={() => onGuide(g.id)}
            className="group w-full text-left grid md:grid-cols-[160px_1fr_auto] gap-2 md:gap-8 py-6 border-b border-[#efe6d2]/15 items-baseline"
          >
            <span className="cin-mono text-[10px] text-[#8f8676]">
              {g.category} · {g.publishDate}
            </span>
            <span>
              <span className="block text-2xl md:text-3xl italic group-hover:text-[#f2b35b] transition-colors">{g.title}</span>
              <span className="block text-[#8f8676] mt-1 line-clamp-1">{g.description}</span>
            </span>
            <span className="hidden md:block cin-mono text-[11px] text-[#8f8676] group-hover:text-[#f2b35b] group-hover:translate-x-1 transition">
              play →
            </span>
          </button>
        ))}
      </div>
    </section>
  </>
);

const CreditBlock = ({ role, lines }: { role: string; lines: { a: string; b: string }[] }) => (
  <div className="mb-14">
    <div className="cin-mono text-[10px] text-[#8f8676] mb-5">{role}</div>
    {lines.map((l) => (
      <div key={l.a + l.b} className="grid grid-cols-2 gap-6 md:gap-10 py-1.5 text-[1.05rem] md:text-xl">
        <span className="text-right italic text-[#cfc5b0]">{l.a}</span>
        <span className="text-left">{l.b}</span>
      </div>
    ))}
  </div>
);

const Credits = () => (
  <section className="px-5 pt-24 pb-48 text-center">
    <div className="cin-mono text-[10px] text-[#f2b35b] mb-4">end credits</div>
    <div className="text-[clamp(2.6rem,7vw,5.5rem)] font-light tracking-[0.25em] pl-[0.25em] mb-20">JONATHAN</div>
    <div className="max-w-3xl mx-auto">
      <CreditBlock role="education" lines={education.map((e) => ({ a: e.school, b: e.gpa ? `${e.degree} · GPA ${e.gpa}` : e.degree }))} />
      <CreditBlock role="experience" lines={experiences.map((e) => ({ a: e.title, b: `${e.company} · ${e.period}` }))} />
      <CreditBlock role="supporting roles" lines={involvements.map((v) => ({ a: v.role, b: v.organization }))} />
      <CreditBlock
        role="filmed on location"
        lines={[{ a: "Urbana-Champaign", b: "Illinois" }]}
      />
      <div className="mt-20 flex flex-wrap justify-center gap-x-8 gap-y-3 cin-mono text-[11px]">
        {CONTACT.map((c) => (
          <a key={c.label} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="hover:text-[#f2b35b]">
            {c.label === "Email" ? "jbw7@illinois.edu" : c.label}
          </a>
        ))}
      </div>
      <div className="mt-24 italic text-2xl text-[#8f8676]">fin.</div>
    </div>
  </section>
);

export default Cinema;
