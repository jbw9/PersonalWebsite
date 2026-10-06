import { ReactNode, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight, Github, Linkedin, Mail } from "lucide-react";
import { experiences, education, involvements } from "../../data";
import { projects } from "../../data/projects";
import { milestones } from "../../data/journey";
import { guides } from "../../data/guides";
import "./gravity.css";

const INK = "#111";
const COLORS = ["#FF5A36", "#2D5BFF", "#ffffff", "#B8F35A", "#FF8FD1", "#7FD8FF", "#FF9900"];
const LETTER_COLORS = ["#FF5A36", "#2D5BFF", "#ffffff", "#B8F35A", "#FF8FD1", "#7FD8FF", "#FF9900", "#ffffff"];
const EMAIL = "mailto:jbw7@illinois.edu";
const GITHUB = "https://github.com/jbw9";
const LINKEDIN = "https://www.linkedin.com/in/jwidjajakusuma/";
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const logo = (p: string) => (p.startsWith("/") || p.startsWith("http") ? p : `/${p}`);
const fmt = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" });

// ── a thing that falls from above and lands with a bounce + squash ───────
// skipAt: when the intro was skipped. Anything already on screen then lands instantly;
// anything scrolled to later still gets to fall.
const Drop = ({
  children,
  delay = 0,
  height = 420,
  tilt = 0,
  skipAt,
  className = "",
  onView,
}: {
  children: ReactNode;
  delay?: number;
  height?: number;
  tilt?: number;
  skipAt: number | null;
  className?: string;
  onView?: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const seenAt = useRef<number | null>(null);
  const go = onView === undefined ? inView : onView;
  if (go && seenAt.current === null) seenAt.current = performance.now();
  const instant = skipAt !== null && seenAt.current !== null && seenAt.current <= skipAt;
  return (
    <div ref={ref} className={className}>
      <motion.div
        className="h-full"
        style={{ transformOrigin: "50% 100%" }}
        initial={{ y: -height, rotate: tilt, opacity: 0, scaleY: 1 }}
        animate={
          !go
            ? undefined
            : instant
            ? { y: 0, rotate: 0, opacity: 1, scaleY: 1, scaleX: 1 }
            : { y: [-height, 0, -height * 0.05, 0], rotate: [tilt, 0, -tilt * 0.15, 0], opacity: [0, 1, 1, 1], scaleY: [1.04, 0.9, 1.02, 1], scaleX: [0.97, 1.06, 0.99, 1] }
        }
        transition={instant ? { duration: 0 } : { duration: 0.8, delay, times: [0, 0.6, 0.78, 1], ease: ["easeIn", "easeOut", "easeIn"], opacity: { duration: 0.12, delay } }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// ── the name: letters drop one by one with real-ish gravity ──────────────
const Letter = ({ ch, i, size, color, skipped }: { ch: string; i: number; size: number; color: string; skipped: boolean }) => {
  const H = 700;
  return (
    <motion.span
      className="gv-letter inline-block"
      style={{ fontSize: size, color, transformOrigin: "50% 100%" }}
      initial={{ y: -H, opacity: 0 }}
      animate={
        skipped
          ? { y: 0, opacity: 1, scaleX: 1, scaleY: 1 }
          : {
              y: [-H, 0, -size * 0.32, 0, -size * 0.08, 0],
              scaleY: [1.18, 0.68, 1.08, 0.9, 1.03, 1],
              scaleX: [0.88, 1.28, 0.95, 1.08, 0.99, 1],
              opacity: [1, 1, 1, 1, 1, 1],
            }
      }
      transition={
        skipped
          ? { duration: 0 }
          : { duration: 1.0, delay: 0.2 + i * 0.1, times: [0, 0.42, 0.62, 0.8, 0.9, 1], ease: ["easeIn", "easeOut", "easeIn", "easeOut", "easeIn"] }
      }
      whileHover={{ y: -size * 0.12, rotate: i % 2 ? 6 : -6, transition: { type: "spring", stiffness: 500, damping: 12 } }}
    >
      {ch}
    </motion.span>
  );
};

// ── toy box: hand-rolled circle physics ──────────────────────────────────
interface BallDef {
  id: string;
  r: number;
  bg: string;
  fg?: string;
  node: ReactNode;
  tap?: "taxbuddy" | number; // number = milestone index
}
interface Body {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  m: number;
  a: number;
  w: number;
  live: boolean;
}

const TECH = [
  ["TypeScript", "#7FD8FF"],
  ["Python", "#ffffff"],
  ["C++", "#111111"],
  ["React", "#FF8FD1"],
  ["Kafka", "#ffffff"],
  ["Next.js", "#111111"],
  ["PyTorch", "#FF9900"],
];

const BALLS: BallDef[] = [
  {
    id: "aws",
    r: 66,
    bg: "#FF9900",
    node: (
      <>
        <span className="text-[0.62em] font-semibold uppercase tracking-wider opacity-70">incoming</span>
        <span className="text-[1.3em] leading-none mt-0.5">SDE @</span>
        <span className="text-[1.5em] leading-none">AWS</span>
      </>
    ),
  },
  {
    id: "tb",
    r: 66,
    bg: "#2D5BFF",
    fg: "#fff",
    tap: "taxbuddy",
    node: (
      <>
        <span className="flex items-center gap-1 text-[0.62em] font-semibold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-[#B8F35A] border border-black" /> active
        </span>
        <span className="text-[1.25em] leading-none mt-1">TaxBuddy</span>
        <span className="text-[0.75em] mt-1 opacity-80">tap me ↗</span>
      </>
    ),
  },
  { id: "uiuc", r: 54, bg: "#FF5A36", fg: "#fff", node: <span className="text-[1.45em]">UIUC</span> },
  {
    id: "gpa",
    r: 48,
    bg: "#ffffff",
    node: (
      <>
        <span className="text-[1.4em]">3.90</span>
        <span className="text-[0.65em] font-semibold uppercase tracking-wider">gpa</span>
      </>
    ),
  },
  {
    id: "cs",
    r: 50,
    bg: "#B8F35A",
    node: (
      <>
        <span>CS +</span>
        <span>Econs</span>
      </>
    ),
  },
  ...TECH.map(([t, bg], i) => ({ id: `t${i}`, r: t.length > 6 ? 46 : 38, bg, fg: bg === "#111111" ? "#fff" : INK, node: <span className={t.length > 6 ? "text-[0.85em]" : ""}>{t}</span> })),
  ...milestones.map((m, i) => ({ id: `m${i}`, r: 27, bg: "#ffffff", tap: i, node: <span className="text-[1.9em] leading-none">{m.emoji}</span> })),
];

const ToyBox = ({ pour, instant, mobile, onPick, picked }: { pour: boolean; instant: boolean; mobile: boolean; onPick: (i: number) => void; picked: number | null }) => {
  const navigate = useNavigate();
  const boxRef = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLDivElement | null)[]>([]);
  const bodies = useRef<Body[]>([]);
  const zeroG = useRef(false);
  const [zg, setZg] = useState(false);
  const grab = useRef<{ i: number; ox: number; oy: number; tx: number; ty: number; vx: number; vy: number; lx: number; ly: number; lt: number; sx: number; sy: number; t0: number } | null>(null);
  const cursor = useRef<{ x: number; y: number } | null>(null);
  const pourAt = useRef<number | null>(null);
  const scale = mobile ? 0.66 : 0.92;
  const tapRef = useRef<(i: number) => void>(() => {});
  tapRef.current = (i: number) => {
    const t = BALLS[i].tap;
    if (t === "taxbuddy") navigate("/project/taxbuddy");
    else if (typeof t === "number") onPick(t);
    const b = bodies.current[i];
    b.vy -= 700;
    b.w += rand(-12, 12);
  };

  // Pour order: emojis and tech first so the headline balls land on top where you can see them
  const order = useRef(
    BALLS.map((_, i) => i).sort((a, b) => (BALLS[a].r > 60 ? 1 : 0) - (BALLS[b].r > 60 ? 1 : 0) || Math.random() - 0.5)
  );

  useEffect(() => {
    const box = boxRef.current!;
    let W = box.clientWidth;
    let H = box.clientHeight;
    const ro = new ResizeObserver(() => {
      W = box.clientWidth;
      H = box.clientHeight;
    });
    ro.observe(box);
    bodies.current = BALLS.map((d) => {
      const r = d.r * scale;
      return { x: rand(r, W - r), y: -r - rand(20, 260), vx: rand(-80, 80), vy: rand(0, 200), r, m: r * r, a: rand(-0.6, 0.6), w: 0, live: false };
    });

    const step = (dt: number) => {
      const bs = bodies.current;
      const g = zeroG.current ? 0 : 2200;
      const gr = grab.current;
      const c = cursor.current;
      for (let i = 0; i < bs.length; i++) {
        const b = bs[i];
        if (!b.live) continue;
        if (gr && gr.i === i) {
          b.vx = (gr.tx - gr.ox - b.x) / dt / 6;
          b.vy = (gr.ty - gr.oy - b.y) / dt / 6;
        } else {
          b.vy += g * dt;
          if (zeroG.current) {
            b.vx *= 0.998;
            b.vy *= 0.998;
          }
          if (c) {
            const dx = b.x - c.x;
            const dy = b.y - c.y;
            const d = Math.hypot(dx, dy) || 1;
            const reach = b.r + 46;
            if (d < reach) {
              const f = (1 - d / reach) * 9000 * dt;
              b.vx += (dx / d) * f;
              b.vy += (dy / d) * f;
            }
          }
        }
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        // weighted like a roly-poly toy, so labels mostly end up the right way up
        if (!zeroG.current) b.w -= Math.sin(b.a) * 28 * dt;
        b.a += b.w * dt;
        b.w *= 0.99;
      }
      for (let it = 0; it < 2; it++)
        for (let i = 0; i < bs.length; i++) {
          const p = bs[i];
          if (!p.live) continue;
          for (let j = i + 1; j < bs.length; j++) {
            const q = bs[j];
            if (!q.live) continue;
            const dx = q.x - p.x;
            const dy = q.y - p.y;
            const R = p.r + q.r;
            const d2 = dx * dx + dy * dy;
            if (d2 >= R * R || d2 < 1e-6) continue;
            const d = Math.sqrt(d2);
            const nx = dx / d;
            const ny = dy / d;
            const ip = gr && gr.i === i ? 0 : 1 / p.m;
            const iq = gr && gr.i === j ? 0 : 1 / q.m;
            const sum = ip + iq;
            if (!sum) continue;
            const ov = (R - d) / sum;
            p.x -= nx * ov * ip * 0.8;
            p.y -= ny * ov * ip * 0.8;
            q.x += nx * ov * iq * 0.8;
            q.y += ny * ov * iq * 0.8;
            const rvx = q.vx - p.vx;
            const rvy = q.vy - p.vy;
            const vn = rvx * nx + rvy * ny;
            if (vn < 0) {
              const jn = (-(1 + (zeroG.current ? 0.85 : 0.3)) * vn) / sum;
              p.vx -= jn * ip * nx;
              p.vy -= jn * ip * ny;
              q.vx += jn * iq * nx;
              q.vy += jn * iq * ny;
              const vt = -rvx * ny + rvy * nx;
              p.w -= (vt / p.r) * 0.08;
              q.w -= (vt / q.r) * 0.08;
            }
          }
        }
      const e = zeroG.current ? 0.85 : 0.4;
      for (let i = 0; i < bs.length; i++) {
        const b = bs[i];
        if (!b.live) continue;
        if (b.y > H - b.r) {
          b.y = H - b.r;
          if (b.vy > 0) b.vy = b.vy < 60 && !zeroG.current ? 0 : -b.vy * e;
          if (!zeroG.current) b.vx *= 0.985;
        }
        if (b.x < b.r) {
          b.x = b.r;
          if (b.vx < 0) b.vx = -b.vx * e;
        }
        if (b.x > W - b.r) {
          b.x = W - b.r;
          if (b.vx > 0) b.vx = -b.vx * e;
        }
        if (b.y < b.r - 420) {
          b.y = b.r - 420;
          if (b.vy < 0) b.vy = -b.vy * e;
        }
      }
    };

    const draw = () => {
      bodies.current.forEach((b, i) => {
        const el = els.current[i];
        if (!el) return;
        el.style.visibility = b.live ? "visible" : "hidden";
        el.style.transform = `translate3d(${b.x - b.r}px,${b.y - b.r}px,0) rotate(${b.a}rad)`;
      });
    };

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      if (pourAt.current !== null) {
        const t = now - pourAt.current;
        order.current.forEach((bi, k) => {
          if (!bodies.current[bi].live && t > k * 55) bodies.current[bi].live = true;
        });
      }
      for (let s = 0; s < 3; s++) step(dt / 3);
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const toLocal = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onMove = (e: PointerEvent) => {
      const p = toLocal(e);
      const gr = grab.current;
      if (gr) {
        const now = performance.now();
        const dtm = Math.max(now - gr.lt, 1) / 1000;
        gr.vx = gr.vx * 0.6 + ((p.x - gr.lx) / dtm) * 0.4;
        gr.vy = gr.vy * 0.6 + ((p.y - gr.ly) / dtm) * 0.4;
        gr.lx = p.x;
        gr.ly = p.y;
        gr.lt = now;
        gr.tx = p.x;
        gr.ty = p.y;
      } else if (e.pointerType === "mouse" && p.x > 0 && p.y > 0 && p.x < W && p.y < H) cursor.current = p;
      else cursor.current = null;
    };
    const onUp = (e: PointerEvent) => {
      const gr = grab.current;
      if (!gr) return;
      grab.current = null;
      const b = bodies.current[gr.i];
      const p = toLocal(e);
      if (Math.hypot(p.x - gr.sx, p.y - gr.sy) < 6 && performance.now() - gr.t0 < 350) tapRef.current(gr.i);
      else {
        const lim = 3200;
        b.vx = Math.max(-lim, Math.min(lim, gr.vx));
        b.vy = Math.max(-lim, Math.min(lim, gr.vy));
        b.w = b.vx / b.r;
      }
    };
    const onLeave = () => (cursor.current = null);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    box.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      box.removeEventListener("pointerleave", onLeave);
    };
  }, [scale]);

  // Start pouring; on skip / reduced motion, drop everything in at once and pre-settle the pile
  useEffect(() => {
    if (instant) {
      const box = boxRef.current!;
      const W = box.clientWidth;
      const H = box.clientHeight;
      bodies.current.forEach((b, k) => {
        b.live = true;
        b.x = rand(b.r, W - b.r);
        b.y = H - b.r - (k % 6) * 30 - rand(0, 40);
        b.vx = 0;
        b.vy = 0;
      });
      pourAt.current = null;
    } else if (pour && pourAt.current === null) pourAt.current = performance.now();
  }, [pour, instant]);

  const shake = () =>
    bodies.current.forEach((b) => {
      b.vy -= rand(900, 1700);
      b.vx += rand(-600, 600);
      b.w += rand(-14, 14);
    });
  const toggleZeroG = () => {
    zeroG.current = !zeroG.current;
    setZg(zeroG.current);
    if (zeroG.current)
      bodies.current.forEach((b) => {
        b.vy -= rand(150, 450);
        b.vx += rand(-200, 200);
      });
  };

  const pm = picked === null ? null : milestones[picked];
  return (
    <div className="gv-card bg-white overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b-[3px] border-[#111] bg-[#111] text-white">
        <div className="font-extrabold text-[15px] tracking-tight whitespace-nowrap">
          TOY BOX <span className="font-medium text-white/60 hidden sm:inline">· grab, throw, poke</span>
        </div>
        <div className="flex gap-2">
          <button onClick={shake} className="rounded-full bg-[#FFD84D] text-[#111] text-[13px] font-bold px-3 py-1 border-2 border-white hover:-rotate-3 active:scale-90 transition-transform">
            Shake
          </button>
          <button
            onClick={toggleZeroG}
            className={`rounded-full text-[13px] font-bold px-3 py-1 border-2 border-white hover:rotate-3 active:scale-90 transition-transform ${zg ? "bg-[#B8F35A] text-[#111]" : "bg-transparent text-white"}`}
          >
            {zg ? "Gravity on" : "Zero-G"}
          </button>
        </div>
      </div>
      <div ref={boxRef} className="gv-box relative flex-1 overflow-hidden" style={{ touchAction: "pan-y" }}>
        <div className="absolute left-4 top-3 right-4 pointer-events-none z-10 text-[13px] leading-snug">
          {pm ? (
            <div className="inline-block bg-[#111] text-white rounded-xl px-3 py-2 max-w-[340px]">
              <span className="text-[#FFD84D] font-bold">{fmt(pm.date)}</span> · {pm.title}
            </div>
          ) : (
            <span className="text-black/45 font-medium">tap an emoji to read that chapter ↓</span>
          )}
        </div>
        {BALLS.map((d, i) => (
          <div
            key={d.id}
            ref={(el) => (els.current[i] = el)}
            className="gv-ball"
            style={{ width: d.r * 2 * scale, height: d.r * 2 * scale, background: d.bg, color: d.fg || INK, fontSize: 15 * scale, visibility: "hidden", zIndex: d.r > 60 ? 3 : 2 }}
            onPointerDown={(e) => {
              const r = boxRef.current!.getBoundingClientRect();
              const px = e.clientX - r.left;
              const py = e.clientY - r.top;
              const b = bodies.current[i];
              grab.current = { i, ox: px - b.x, oy: py - b.y, tx: px, ty: py, vx: 0, vy: 0, lx: px, ly: py, lt: performance.now(), sx: px, sy: py, t0: performance.now() };
              cursor.current = null;
            }}
          >
            {d.node}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── bento pieces ─────────────────────────────────────────────────────────
const Btn = ({ href, icon, children, bg }: { href: string; icon: ReactNode; children: ReactNode; bg: string }) => (
  <a
    href={href}
    target={href.startsWith("mailto") ? undefined : "_blank"}
    rel="noreferrer"
    className="gv-press inline-flex items-center gap-2 rounded-full border-[3px] border-[#111] px-5 py-2.5 font-bold text-[15px] text-[#111] shadow-[4px_4px_0_#111]"
    style={{ background: bg }}
  >
    {icon}
    {children}
  </a>
);

const Heading = ({ kicker, children, light }: { kicker: string; children: ReactNode; light?: boolean }) => (
  <div className="mb-4">
    <div className={`text-[12px] font-bold uppercase tracking-[0.2em] ${light ? "text-white/70" : "text-black/50"}`}>{kicker}</div>
    <div className="font-extrabold text-[28px] md:text-[34px] leading-none tracking-tight mt-1">{children}</div>
  </div>
);

const Gravity = () => {
  const navigate = useNavigate();
  const [W, setW] = useState(() => window.innerWidth);
  const [skipAt, setSkipAt] = useState<number | null>(null);
  const [pour, setPour] = useState(false);
  const [sel, setSel] = useState(milestones.length - 1);
  const [picked, setPicked] = useState<number | null>(null);
  const skipRef = useRef(false);
  const mobile = W < 768;

  const skip = () => {
    if (skipRef.current) return;
    skipRef.current = true;
    setSkipAt(performance.now());
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) skip();
    const t1 = window.setTimeout(() => setPour(true), 1750);
    const t2 = window.setTimeout(() => (skipRef.current = true), 3300); // intro over: later clicks are just clicks
    const onKey = () => skip();
    const onDown = () => skip();
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown, true);
    const onResize = () => setW(window.innerWidth);
    window.addEventListener("resize", onResize);
    const prevBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#ffd84d";
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("resize", onResize);
      document.body.style.backgroundColor = prevBg;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const skipped = skipAt !== null;
  const nameSize = mobile ? Math.min((W - 32) / 2.55, 150) : Math.min(W * 0.172, 236);
  const words = mobile ? ["JONA", "THAN"] : ["JONATHAN"];
  const pick = (i: number) => {
    setPicked(i);
    setSel(i);
  };
  const m = milestones[sel];
  const maxVibe = 100;

  let li = 0;
  return (
    <div className="v-gravity min-h-screen overflow-x-hidden pb-28">
      {/* ── hero ── */}
      <section className="max-w-[1240px] mx-auto px-4 md:px-8 pt-6 md:pt-8">
        <div className="flex items-center justify-between">
          <Drop skipAt={skipAt} onView delay={0.05} height={120}>
            <span className="inline-block gv-card !rounded-full bg-white px-4 py-1.5 font-bold text-[14px] -rotate-2">hey 👋 i'm</span>
          </Drop>
          <div className="hidden md:block text-[13px] font-semibold text-black/50">everything here obeys gravity. mostly.</div>
        </div>
        <h1 className="mt-3 md:mt-1 select-none" aria-label="Jonathan">
          {words.map((w) => (
            <div key={w} className="whitespace-nowrap" style={{ height: nameSize * 0.86 }}>
              {w.split("").map((ch) => {
                const i = li++;
                return <Letter key={i} ch={ch} i={i} size={nameSize} color={LETTER_COLORS[i]} skipped={skipped} />;
              })}
            </div>
          ))}
        </h1>
        <motion.div
          className="h-[5px] bg-[#111] rounded-full origin-left -mt-1"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={skipped ? { duration: 0 } : { duration: 0.5, delay: 0.05, ease: "easeOut" }}
        />

        <div className="grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6 md:gap-8 mt-6 md:mt-7 items-stretch">
          <Drop skipAt={skipAt} onView delay={1.1} height={500} tilt={-4}>
            <div className="flex flex-col h-full">
              <p className="text-[24px] md:text-[31px] font-semibold leading-[1.12] tracking-tight">
                <span className="bg-[#111] text-[#FFD84D] px-2 rounded-md">CS & Econs @ UIUC</span> — building software that solves real problems.
              </p>
              <div className="flex flex-wrap gap-3 mt-5">
                <Btn href={EMAIL} icon={<Mail className="w-4 h-4" />} bg="#fff">
                  Email
                </Btn>
                <Btn href={GITHUB} icon={<Github className="w-4 h-4" />} bg="#FF8FD1">
                  GitHub
                </Btn>
                <Btn href={LINKEDIN} icon={<Linkedin className="w-4 h-4" />} bg="#7FD8FF">
                  LinkedIn
                </Btn>
              </div>
              <div className="hidden md:block mt-auto pt-4 text-[14px] font-semibold text-black/55">← the box is real physics. grab a ball and throw it.</div>
              <div className="mt-6 md:mt-3 grid grid-cols-2 gap-3">
                <div className="gv-card !rounded-2xl bg-[#FF9900] p-3 -rotate-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-black/60">incoming · feb 2027</div>
                  <div className="font-extrabold text-[19px] leading-tight">SDE @ AWS</div>
                </div>
                <button onClick={() => navigate("/project/taxbuddy")} className="gv-card gv-press !rounded-2xl bg-[#2D5BFF] text-white p-3 text-left rotate-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-white/70">active project</div>
                  <div className="font-extrabold text-[19px] leading-tight flex items-center gap-1">
                    TaxBuddy <ArrowUpRight className="w-4 h-4" />
                  </div>
                </button>
              </div>
            </div>
          </Drop>
          <Drop skipAt={skipAt} onView delay={1.3} height={600} tilt={3} className={mobile ? "h-[360px]" : "h-[400px]"}>
            <ToyBox pour={pour} instant={skipped && !pour} mobile={mobile} onPick={pick} picked={picked} />
          </Drop>
        </div>
      </section>

      {/* ── bento: everything else rains down as you scroll ── */}
      <section className="max-w-[1240px] mx-auto px-4 md:px-8 mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
        {/* journey */}
        <Drop skipAt={skipAt} className="md:col-span-12" tilt={-2}>
          <div className="gv-card bg-white p-5 md:p-7">
            <Heading kicker="the journey · tap a bar">From finance major to AWS, one block at a time</Heading>
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_320px] gap-6 items-end">
              <div className="flex items-end gap-1 md:gap-2 h-[230px] md:h-[250px] border-b-[3px] border-[#111]">
                {milestones.map((ms, i) => (
                  <Drop key={i} skipAt={skipAt} delay={0.15 + i * 0.06} height={300} className="flex-1 min-w-0 h-full flex flex-col justify-end">
                    <button
                      onClick={() => setSel(i)}
                      className="w-full flex flex-col items-center justify-end h-full group"
                      title={ms.short}
                    >
                      <span className={`text-[13px] md:text-[24px] leading-none mb-1 transition-transform ${sel === i ? "-translate-y-2 scale-125" : "group-hover:-translate-y-1"}`}>{ms.emoji}</span>
                      <span
                        className="w-full rounded-t-lg md:rounded-t-xl border-[3px] border-b-0 border-[#111] transition-colors"
                        style={{ height: `${(ms.vibe / maxVibe) * 78}%`, background: sel === i ? "#111" : COLORS[i % COLORS.length] }}
                      />
                    </button>
                  </Drop>
                ))}
              </div>
              <div className="gv-card !rounded-2xl bg-[#FFD84D] p-4 md:p-5 min-h-[190px]">
                <div className="flex items-center justify-between">
                  <span className="text-[34px] leading-none">{m.emoji}</span>
                  <span className="text-[12px] font-bold uppercase tracking-wider bg-white border-2 border-[#111] rounded-full px-2 py-0.5">
                    {fmt(m.date)} · vibe {m.vibe}
                  </span>
                </div>
                <div className="font-extrabold text-[20px] leading-tight mt-3">{m.title}</div>
                <p className="text-[14.5px] leading-snug mt-1.5 text-black/75">{m.body}</p>
              </div>
            </div>
          </div>
        </Drop>

        {/* experience: slabs stack bottom-first */}
        <div className="md:col-span-7">
          <Drop skipAt={skipAt} tilt={2} height={300}>
            <div className="gv-card bg-[#2D5BFF] text-white p-5 md:p-6">
              <Heading kicker="experience" light>
                Where I've worked
              </Heading>
              <div className="flex flex-col gap-3">
                {experiences.map((e, i) => (
                  <Drop key={i} skipAt={skipAt} delay={(experiences.length - 1 - i) * 0.11} height={260} tilt={i % 2 ? 3 : -3}>
                    <div className="gv-card !rounded-2xl !shadow-[4px_4px_0_#111] p-3.5 md:p-4 text-[#111]" style={{ background: i === 0 ? "#FF9900" : ["#ffffff", "#FFD84D", "#B8F35A", "#FF8FD1", "#7FD8FF"][i % 5] }}>
                      <div className="flex items-start gap-3">
                        <img src={logo(e.companyIcon)} alt="" className="w-11 h-11 rounded-xl border-2 border-[#111] bg-white object-contain p-1 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                            <div className="font-extrabold text-[17px] leading-tight">{e.title}</div>
                            <div className="text-[12px] font-bold uppercase tracking-wide text-black/55 whitespace-nowrap">{e.period}</div>
                          </div>
                          <div className="text-[14px] font-semibold text-black/65">
                            {e.website ? (
                              <a href={e.website} target="_blank" rel="noreferrer" className="underline decoration-2 underline-offset-2">
                                {e.company}
                              </a>
                            ) : (
                              e.company
                            )}
                          </div>
                          <p className="text-[14px] leading-snug mt-1 text-black/80">{e.description}</p>
                        </div>
                      </div>
                    </div>
                  </Drop>
                ))}
              </div>
            </div>
          </Drop>
        </div>

        <div className="md:col-span-5 flex flex-col gap-5 md:gap-6">
          <Drop skipAt={skipAt} tilt={-3}>
            <div className="gv-card bg-[#FF5A36] text-white p-5 md:p-6">
              <Heading kicker="school" light>
                {education[0].school}
              </Heading>
              <div className="flex items-end gap-3">
                <span className="gv-letter text-[84px] md:text-[96px] text-[#FFD84D]" style={{ WebkitTextStroke: "5px #111", textShadow: "5px 5px 0 #111" }}>
                  {education[0].gpa?.split("/")[0]}
                </span>
                <span className="font-bold text-[15px] mb-3">GPA / 4.0</span>
              </div>
              <div className="font-bold text-[16px] mt-2">{education[0].degree}</div>
              <div className="text-[13px] font-semibold text-white/75">{education[0].period}</div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {education[0].relevantCourses?.map((c) => (
                  <span key={c} className="text-[12.5px] font-bold bg-white text-[#111] border-2 border-[#111] rounded-full px-2.5 py-0.5">
                    {c}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3 bg-[#111] rounded-2xl p-3">
                <img src={education[1].image} alt="" className="w-10 h-10 rounded-lg" />
                <div>
                  <div className="font-extrabold text-[15px] leading-tight">{education[1].degree}</div>
                  <div className="text-[12.5px] text-white/65">
                    {education[1].school} · {education[1].period}
                  </div>
                </div>
              </div>
            </div>
          </Drop>
          <Drop skipAt={skipAt} tilt={3} delay={0.1}>
            <div className="gv-card bg-white p-5 md:p-6">
              <Heading kicker="involvement">Outside class</Heading>
              <div className="flex flex-col gap-4">
                {involvements.map((v, i) => (
                  <div key={i} className="flex gap-3">
                    <img src={v.image} alt="" className="w-11 h-11 rounded-full border-2 border-[#111] bg-white object-contain shrink-0" />
                    <div>
                      <div className="font-extrabold text-[16px] leading-tight">{v.role}</div>
                      <div className="text-[13px] font-semibold text-black/55">
                        {v.organization} · {v.period}
                      </div>
                      <p className="text-[13.5px] leading-snug mt-1 text-black/75">{v.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Drop>
        </div>

        {/* projects */}
        <Drop skipAt={skipAt} className="md:col-span-12" height={200} tilt={-1}>
          <div className="flex items-end justify-between gap-4 pt-6">
            <div className="font-extrabold text-[44px] md:text-[72px] leading-none tracking-tight">Things I've built</div>
            <div className="hidden md:block font-semibold text-black/55 mb-2">{projects.length} projects · click one ↘</div>
          </div>
        </Drop>
        {projects.map((p, i) => {
          const img = p.image || p.screenshots?.[0];
          const bg = ["#ffffff", "#7FD8FF", "#FF8FD1", "#B8F35A", "#FF9900", "#ffffff", "#2D5BFF", "#FF5A36"][i % 8];
          const dark = bg === "#2D5BFF" || bg === "#FF5A36";
          return (
            <Drop key={p.id} skipAt={skipAt} delay={(i % 3) * 0.12} tilt={[-5, 4, -3][i % 3]} className={i === 0 ? "md:col-span-8" : "md:col-span-4"}>
              <button onClick={() => navigate(`/project/${p.id}`)} className="gv-card gv-press w-full h-full text-left overflow-hidden flex flex-col" style={{ background: bg, color: dark ? "#fff" : INK }}>
                <div className={`relative w-full border-b-[3px] border-[#111] bg-[#111] overflow-hidden ${i === 0 ? "h-[200px] md:h-[260px]" : "h-[170px]"}`}>
                  {img ? (
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center gv-letter text-[110px]" style={{ color: COLORS[(i + 2) % COLORS.length] }}>
                      {p.title.charAt(0)}
                    </div>
                  )}
                  {p.id === "taxbuddy" && <span className="absolute top-3 left-3 gv-card !rounded-full !shadow-[3px_3px_0_#111] bg-[#B8F35A] text-[#111] px-3 py-0.5 text-[13px] font-extrabold">● active project</span>}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-extrabold text-[21px] leading-tight">{p.title}</div>
                    <ArrowUpRight className="w-5 h-5 shrink-0 mt-0.5" />
                  </div>
                  <p className={`text-[14px] leading-snug mt-1.5 ${dark ? "text-white/85" : "text-black/75"}`}>{p.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-auto pt-3">
                    {p.technologies.slice(0, 4).map((t) => (
                      <span key={t} className="text-[11.5px] font-bold border-2 border-[#111] rounded-full px-2 py-[1px] bg-white text-[#111]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            </Drop>
          );
        })}

        {/* guides + contact */}
        <Drop skipAt={skipAt} className="md:col-span-7" tilt={-3}>
          <div className="gv-card bg-[#B8F35A] p-5 md:p-6 h-full">
            <Heading kicker="writing">Guides I wrote</Heading>
            <div className="flex flex-col gap-3">
              {guides.map((g) => (
                <button key={g.id} onClick={() => navigate(`/guide/${g.id}`)} className="gv-card gv-press !rounded-2xl !shadow-[4px_4px_0_#111] bg-white p-3.5 text-left flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11.5px] font-bold uppercase tracking-wider text-black/50">
                      {g.category} · {g.publishDate}
                    </div>
                    <div className="font-extrabold text-[17px] leading-tight mt-0.5">{g.title}</div>
                    <p className="text-[13.5px] leading-snug text-black/70 mt-0.5">{g.description}</p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </Drop>
        <Drop skipAt={skipAt} className="md:col-span-5" tilt={4} delay={0.12}>
          <div className="gv-card bg-[#111] text-white p-5 md:p-7 h-full flex flex-col">
            <div className="font-extrabold text-[48px] md:text-[60px] leading-[0.9] tracking-tight text-[#FFD84D]">Say hi 👋</div>
            <p className="text-white/70 mt-3 text-[15px]">Internships, startups, or just to talk about Kafka. My inbox is open.</p>
            <div className="flex flex-wrap gap-3 mt-auto pt-6">
              <Btn href={EMAIL} icon={<Mail className="w-4 h-4" />} bg="#FFD84D">
                <span className="text-[#111]">jbw7@illinois.edu</span>
              </Btn>
              <Btn href={GITHUB} icon={<Github className="w-4 h-4" />} bg="#fff">
                <span className="text-[#111]">GitHub</span>
              </Btn>
              <Btn href={LINKEDIN} icon={<Linkedin className="w-4 h-4" />} bg="#7FD8FF">
                <span className="text-[#111]">LinkedIn</span>
              </Btn>
            </div>
          </div>
        </Drop>
      </section>
    </div>
  );
};

export default Gravity;
