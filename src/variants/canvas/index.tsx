import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Minus, Maximize, Play, ChevronLeft, ChevronRight, X, MousePointer2 } from "lucide-react";
import World, { HerePin, ISLANDS, ISLAND_ORDER, WORLD, HERE, ROAD, POI, Box, IslandId, EMAIL } from "./world";
import "./canvas.css";

interface Cam {
  x: number; // screen = world * s + (x, y)
  y: number;
  s: number;
}
interface View {
  cx: number; // world point at the centre of the safe area
  cy: number;
  s: number;
}
interface Anim {
  kind: "fly" | "intro";
  from: View;
  to: View;
  t0: number;
  dur: number;
  bump: number;
  done?: () => void;
}

const MIN_S = 0.06;
const MAX_S = 3;
const INTRO_S = 5;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const prefersReduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isPhone = () => window.innerWidth < 700;

// Area not covered by chrome: toolbar (top), switcher (bottom), layers panel + minimap (desktop sides)
const safe = () => {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const phone = isPhone();
  const top = phone ? 64 : 76;
  const bottom = 92;
  const left = phone ? 0 : 210;
  const right = phone ? 0 : 250;
  return { W, H, cx: (left + W - right) / 2, cy: (top + H - bottom) / 2, w: W - left - right, h: H - top - bottom };
};
const fit = (b: Box, pad = 56, padX = pad): View => {
  const a = safe();
  return { cx: b.x + b.w / 2, cy: b.y + b.h / 2, s: clamp(Math.min((a.w - padX * 2) / b.w, (a.h - pad) / b.h), MIN_S, 1.2) };
};
const toCam = (v: View): Cam => {
  const a = safe();
  return { x: a.cx - v.cx * v.s, y: a.cy - v.cy * v.s, s: v.s };
};
const fromCam = (c: Cam): View => {
  const a = safe();
  return { cx: (a.cx - c.x) / c.s, cy: (a.cy - c.y) / c.s, s: c.s };
};
const homeView = () => (isPhone() ? fit(ISLANDS.hero, 16) : fit(WORLD, 30, 0));

const TOUR: { view: () => View; title: string; caption: string; island?: IslandId }[] = [
  { view: () => fit(ISLANDS.hero, 40), island: "hero", title: "Hi, I'm Jonathan", caption: "CS & Econs at UIUC. Incoming SDE at AWS, currently shipping TaxBuddy." },
  { view: () => fit(ISLANDS.experience), island: "experience", title: "Where I've worked", caption: "AWS (twice), Massive, Kredivo, a startup I co-founded, and more." },
  { view: () => fit(ISLANDS.projects), island: "projects", title: "Things I've built", caption: "Click any frame to open it. TaxBuddy is the live one." },
  { view: () => fit({ x: -1820, y: 640, w: 2100, h: 1080 }), island: "journey", title: "The journey, part 1", caption: "Showed up as a finance major. Took CS124 'for fun'. Fell in love." },
  { view: () => fit({ x: 200, y: 640, w: 2240, h: 1080 }), island: "journey", title: "The journey, part 2", caption: "Tulip, internships, recruiting season, and finally AWS." },
  { view: () => ({ cx: HERE.x, cy: HERE.y + 120, s: isPhone() ? 0.9 : 1.1 }), island: "journey", title: "You are here", caption: "Today: building TaxBuddy. Still mildly surprised I'm not in finance." },
  { view: () => fit(ISLANDS.school), island: "school", title: "School", caption: "Computer Science at Illinois, plus YC's AI Startup School." },
  { view: () => fit(ISLANDS.guides), island: "guides", title: "Guides I've written", caption: "MCP, a modern React setup, and hosting on GitHub Pages." },
  { view: () => fit(ISLANDS.involvement), island: "involvement", title: "Off the keyboard", caption: "Consulting, a student association's website, and TA-ing CS128." },
  { view: homeView, title: "That's the map", caption: "Drag to pan, scroll or pinch to zoom, click anything that looks clickable." },
];

/* Fake multiplayer cursors that wander between points of interest */
interface Bot {
  name: string;
  color: string;
  from: { x: number; y: number };
  to: number;
  t0: number;
  dur: number;
  arc: number;
  sayUntil: number;
}
const BOTS: Bot[] = [
  { name: "recruiter", color: "#F24E1E", from: { x: 0, y: 0 }, to: 0, t0: 0, dur: 2200, arc: 80, sayUntil: 0 },
  { name: "Jonathan", color: "#7B61FF", from: { x: 600, y: 500 }, to: 1, t0: 0, dur: 2600, arc: -60, sayUntil: 0 },
];

const InfiniteCanvas = () => {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const miniRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLSpanElement>(null);
  const youRef = useRef<HTMLDivElement>(null);
  const botRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sayRefs = useRef<(HTMLDivElement | null)[]>([]);

  const cam = useRef<Cam>({ x: 0, y: 0, s: 1 });
  const dirty = useRef(true);
  const anim = useRef<Anim | null>(null);
  const vel = useRef({ x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({ moved: false, sx: 0, sy: 0, lastMove: 0, pinch: 0, mid: { x: 0, y: 0 } });
  const suppressClick = useRef(false);
  const bots = useRef(BOTS.map((b) => ({ ...b })));

  const [ready, setReady] = useState(prefersReduced);
  const [tour, setTour] = useState<number | null>(null);
  const [phone, setPhone] = useState(isPhone);
  const readyRef = useRef(ready);
  readyRef.current = ready;

  const go = useCallback((p: string) => navigate(p), [navigate]);

  const fly = useCallback((to: View, done?: () => void) => {
    const from = fromCam(cam.current);
    const a = safe();
    const d = Math.hypot(to.cx - from.cx, to.cy - from.cy);
    // Pull back mid-flight when the two views are far apart, so you see where you're going
    const sSee = (Math.min(a.w, a.h) * 0.9) / Math.max(d, 1);
    const sLow = Math.min(from.s, to.s);
    const bump = sSee < sLow ? Math.log(sLow / sSee) * 0.85 : 0;
    vel.current = { x: 0, y: 0 };
    anim.current = { kind: "fly", from, to, t0: performance.now(), dur: clamp(650 + bump * 380 + d * 0.08, 700, 1700), bump, done };
  }, []);

  const finishIntro = useCallback(() => {
    if (readyRef.current) return;
    anim.current = null;
    cam.current = toCam(homeView());
    dirty.current = true;
    if (fadeRef.current) fadeRef.current.style.opacity = "1";
    setReady(true);
  }, []);

  const endTour = () => setTour(null);
  const zoomAt = (px: number, py: number, f: number) => {
    const c = cam.current;
    const s = clamp(c.s * f, MIN_S, MAX_S);
    const k = s / c.s;
    cam.current = { x: px - (px - c.x) * k, y: py - (py - c.y) * k, s };
    dirty.current = true;
  };

  /* ── Render loop: camera, inertia, flights, cursors ── */
  useEffect(() => {
    const reduced = prefersReduced();
    const start = homeView();
    if (reduced) cam.current = toCam(start);
    else {
      cam.current = toCam({ cx: HERE.x, cy: HERE.y, s: INTRO_S });
      // Centre the dot on the true screen centre, not the safe area
      cam.current.x = window.innerWidth / 2 - HERE.x * INTRO_S;
      cam.current.y = window.innerHeight / 2 - HERE.y * INTRO_S;
      anim.current = { kind: "intro", from: fromCam(cam.current), to: start, t0: performance.now() + 700, dur: 2700, bump: 0, done: () => setReady(true) };
    }

    let raf = 0;
    const apply = () => {
      const { x, y, s } = cam.current;
      const w = worldRef.current;
      if (w) {
        w.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
        w.style.setProperty("--s", String(s));
      }
      // Dot grid: pick a power-of-two spacing that stays 18–36px on screen
      let step = 24;
      while (step * s < 18) step *= 2;
      while (step * s > 36) step /= 2;
      const g = gridRef.current;
      if (g) {
        g.style.backgroundSize = `${step * s}px ${step * s}px`;
        g.style.backgroundPosition = `${x}px ${y}px`;
      }
      const m = miniRef.current;
      if (m) {
        const k = 220 / WORLD.w;
        m.style.left = `${(-x / s - WORLD.x) * k}px`;
        m.style.top = `${(-y / s - WORLD.y) * k}px`;
        m.style.width = `${(window.innerWidth / s) * k}px`;
        m.style.height = `${(window.innerHeight / s) * k}px`;
      }
      if (zoomRef.current) zoomRef.current.textContent = `${Math.round(s * 100)}%`;
    };

    const tick = (now: number) => {
      const a = anim.current;
      if (a && now >= a.t0) {
        const t = Math.min(1, (now - a.t0) / a.dur);
        const u = ease(t);
        const s = Math.exp(lerp(Math.log(a.from.s), Math.log(a.to.s), u) - a.bump * Math.sin(Math.PI * u));
        if (a.kind === "intro") {
          // Anchor on the dot: it glides from screen centre to its final spot while we pull out
          const end = toCam(a.to);
          const px = lerp(window.innerWidth / 2, HERE.x * a.to.s + end.x, u);
          const py = lerp(window.innerHeight / 2, HERE.y * a.to.s + end.y, u);
          cam.current = { x: px - HERE.x * s, y: py - HERE.y * s, s };
          if (fadeRef.current) fadeRef.current.style.opacity = String(clamp((u - 0.03) / 0.35, 0, 1));
        } else {
          cam.current = toCam({ cx: lerp(a.from.cx, a.to.cx, u), cy: lerp(a.from.cy, a.to.cy, u), s });
        }
        dirty.current = true;
        if (t >= 1) {
          anim.current = null;
          a.done?.();
        }
      } else if (!a && pointers.current.size === 0 && (Math.abs(vel.current.x) > 0.05 || Math.abs(vel.current.y) > 0.05)) {
        cam.current.x += vel.current.x;
        cam.current.y += vel.current.y;
        vel.current.x *= 0.93;
        vel.current.y *= 0.93;
        dirty.current = true;
      }
      if (dirty.current) {
        apply();
        dirty.current = false;
      }

      // Bots
      const c = cam.current;
      if (readyRef.current) bots.current.forEach((b, i) => {
        const el = botRefs.current[i];
        if (!el) return;
        const target = POI[b.to];
        let t = (now - b.t0) / b.dur;
        if (t >= 1) {
          const line = target.say[i];
          if (line && b.sayUntil < b.t0 + b.dur) {
            b.sayUntil = now + 2400;
            const say = sayRefs.current[i];
            if (say) say.textContent = line;
          }
          if (now > b.t0 + b.dur + 1400 + (i ? 900 : 0) + (line ? 1400 : 0)) {
            b.from = { x: target.x, y: target.y };
            let next = Math.floor(Math.random() * POI.length);
            if (next === b.to) next = (next + 1) % POI.length;
            b.to = next;
            b.t0 = now;
            b.dur = 1800 + Math.random() * 1600;
            b.arc = (Math.random() - 0.5) * 300;
          }
          t = 1;
        }
        const u = 0.5 - Math.cos(Math.PI * Math.max(0, t)) / 2;
        const dx = target.x - b.from.x;
        const dy = target.y - b.from.y;
        const len = Math.hypot(dx, dy) || 1;
        const off = Math.sin(Math.PI * u) * b.arc;
        const wx = b.from.x + dx * u - (dy / len) * off;
        const wy = b.from.y + dy * u + (dx / len) * off;
        el.style.transform = `translate(${wx * c.s + c.x}px, ${wy * c.s + c.y}px)`;
        const say = sayRefs.current[i];
        if (say) say.style.opacity = now < b.sayUntil ? "1" : "0";
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onResize = () => {
      setPhone(isPhone());
      dirty.current = true;
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Bots start wandering once the intro hands over
  useEffect(() => {
    if (!ready) return;
    const now = performance.now();
    bots.current.forEach((b, i) => {
      b.from = { x: POI[(i * 3 + 2) % POI.length].x, y: POI[(i * 3 + 2) % POI.length].y };
      b.t0 = now + i * 700;
      b.sayUntil = 0;
    });
  }, [ready]);

  /* ── Wheel + keyboard (native listeners: wheel must be non-passive to stop page zoom) ── */
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest("[data-chrome]")) return;
      e.preventDefault();
      if (!readyRef.current) return finishIntro();
      setTour(null);
      anim.current = null;
      vel.current = { x: 0, y: 0 };
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      zoomAt(e.clientX, e.clientY, Math.exp(-dy * (e.ctrlKey ? 0.012 : 0.0016)));
    };
    const onKey = (e: KeyboardEvent) => {
      if (!readyRef.current) return finishIntro();
      const W = window.innerWidth / 2;
      const H = window.innerHeight / 2;
      const pan = (dx: number, dy: number) => {
        anim.current = null;
        vel.current = { x: dx, y: dy };
      };
      if (e.key === "Escape") setTour(null);
      else if (e.key === "+" || e.key === "=") zoomAt(W, H, 1.25);
      else if (e.key === "-" || e.key === "_") zoomAt(W, H, 0.8);
      else if (e.key === "0") fly(homeView());
      else if (e.key === "ArrowLeft") pan(14, 0);
      else if (e.key === "ArrowRight") pan(-14, 0);
      else if (e.key === "ArrowUp") pan(0, 14);
      else if (e.key === "ArrowDown") pan(0, -14);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [finishIntro, fly]);

  /* ── Tour: fly to each stop, auto-advance ── */
  useEffect(() => {
    if (tour === null) return;
    fly(TOUR[tour].view());
    const t = window.setTimeout(() => setTour((i) => (i === null || i >= TOUR.length - 1 ? null : i + 1)), 5200);
    return () => clearTimeout(t);
  }, [tour, fly]);

  /* ── Pointer pan / pinch ── */
  const onPointerDown = (e: React.PointerEvent) => {
    if (!readyRef.current) return finishIntro();
    if (e.pointerType === "mouse" && e.button !== 0) return;
    setTour(null);
    anim.current = null;
    vel.current = { x: 0, y: 0 };
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (pointers.current.size === 1) {
      // A drag doesn't always produce a click, so the flag is per-gesture
      suppressClick.current = false;
      g.moved = false;
      g.sx = e.clientX;
      g.sy = e.clientY;
    } else if (pointers.current.size === 2) {
      const [p, q] = Array.from(pointers.current.values());
      g.pinch = Math.hypot(p.x - q.x, p.y - q.y);
      g.mid = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
      g.moved = true;
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (youRef.current && e.pointerType === "mouse") {
      youRef.current.style.transform = `translate(${e.clientX + 14}px, ${e.clientY + 20}px)`;
      youRef.current.style.opacity = "1";
    }
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const cur = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, cur);
    const g = gesture.current;
    if (pointers.current.size === 1) {
      if (!g.moved && Math.hypot(cur.x - g.sx, cur.y - g.sy) < 4) return;
      if (!g.moved) (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      g.moved = true;
      const dx = cur.x - prev.x;
      const dy = cur.y - prev.y;
      cam.current.x += dx;
      cam.current.y += dy;
      vel.current = { x: vel.current.x * 0.2 + dx * 0.8, y: vel.current.y * 0.2 + dy * 0.8 };
      g.lastMove = performance.now();
      dirty.current = true;
    } else if (pointers.current.size === 2) {
      const [p, q] = Array.from(pointers.current.values());
      const dist = Math.hypot(p.x - q.x, p.y - q.y);
      const mid = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
      cam.current.x += mid.x - g.mid.x;
      cam.current.y += mid.y - g.mid.y;
      zoomAt(mid.x, mid.y, dist / (g.pinch || dist));
      g.pinch = dist;
      g.mid = mid;
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!pointers.current.delete(e.pointerId)) return;
    const g = gesture.current;
    if (pointers.current.size === 1) {
      // Pinch → pan handoff: re-seed so the remaining finger doesn't jump
      const [p] = Array.from(pointers.current.values());
      g.sx = p.x;
      g.sy = p.y;
    }
    if (pointers.current.size === 0) {
      if (g.moved) suppressClick.current = true;
      if (performance.now() - g.lastMove > 80) vel.current = { x: 0, y: 0 };
    }
  };

  const toIsland = (id: IslandId) => {
    setTour(null);
    fly(id === "hero" ? fit(ISLANDS.hero, 40) : fit(ISLANDS[id]));
  };

  const onMini = (e: React.PointerEvent) => {
    if (e.type === "pointermove" && !e.buttons) return;
    e.stopPropagation();
    const r = e.currentTarget.getBoundingClientRect();
    const k = 220 / WORLD.w;
    setTour(null);
    anim.current = null;
    vel.current = { x: 0, y: 0 };
    cam.current = toCam({ cx: WORLD.x + (e.clientX - r.left) / k, cy: WORLD.y + (e.clientY - r.top) / k, s: cam.current.s });
    dirty.current = true;
  };

  const chrome = (delay: number, from: { x?: number; y?: number }) => ({
    initial: { opacity: 0, ...from },
    animate: ready ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...from },
    transition: { delay: ready ? delay : 0, type: "spring" as const, stiffness: 260, damping: 26 },
  });
  const stop = tour !== null ? TOUR[tour] : null;
  const miniH = (WORLD.h * 220) / WORLD.w;

  return (
    <div
      ref={rootRef}
      className="v-canvas fixed inset-0 overflow-hidden bg-[#F3F4F7] cursor-grab active:cursor-grabbing"
      style={{ touchAction: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={() => youRef.current && (youRef.current.style.opacity = "0")}
      onClickCapture={(e) => {
        if (!suppressClick.current) return;
        suppressClick.current = false;
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <div ref={gridRef} className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(#C3C7D1 1.2px, transparent 1.4px)" }} />

      <div ref={worldRef} className="cv-world absolute left-0 top-0" style={{ transformOrigin: "0 0" }}>
        <div ref={fadeRef} style={{ opacity: ready ? 1 : 0 }}>
          <World onIsland={toIsland} go={go} />
        </div>
        <HerePin />
      </div>

      {/* Multiplayer cursors (screen space so they stay the same size at any zoom) */}
      <motion.div className="absolute inset-0 pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: ready ? 1 : 0 }} transition={{ delay: 0.6 }}>
        {bots.current.map((b, i) => (
          <div key={b.name} ref={(el) => (botRefs.current[i] = el)} className="absolute left-0 top-0" style={{ willChange: "transform" }}>
            <MousePointer2 className="w-5 h-5 -ml-0.5 -mt-0.5" style={{ color: b.color, fill: b.color }} strokeWidth={1.5} stroke="white" />
            <div className="ml-4 -mt-1 flex flex-col items-start gap-1">
              <span className="text-[12px] font-semibold text-white px-2 py-0.5 rounded-full rounded-tl-sm whitespace-nowrap" style={{ background: b.color }}>
                {b.name}
              </span>
              <div
                ref={(el) => (sayRefs.current[i] = el)}
                className="text-[13px] bg-white text-[#1e1e24] px-2.5 py-1 rounded-xl rounded-tl-sm shadow-md whitespace-nowrap transition-opacity duration-300"
                style={{ opacity: 0, border: `1.5px solid ${b.color}` }}
              />
            </div>
          </div>
        ))}
      </motion.div>
      {!phone && (
        <div ref={youRef} className="absolute left-0 top-0 pointer-events-none transition-opacity" style={{ opacity: 0 }}>
          <span className="text-[12px] font-semibold text-white px-2 py-0.5 rounded-full bg-[#0D99FF] whitespace-nowrap">you</span>
        </div>
      )}

      {/* ── Chrome ── */}
      <motion.div
        data-chrome
        {...chrome(0, { y: -20 })}
        className="absolute top-3 left-3 cv-chrome rounded-2xl flex items-center gap-1 p-1.5 pr-2"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="w-9 h-9 rounded-xl grid place-items-center text-white font-extrabold text-[17px]" style={{ background: "#1e1e24" }}>
          J
        </div>
        <div className="px-2 leading-tight hidden sm:block">
          <div className="text-[13px] font-semibold">jonathan.fig</div>
          <div className="text-[11px] text-[#8a8a98]">Drafts · edited just now</div>
        </div>
        <div className="w-px h-7 bg-black/10 mx-1 hidden sm:block" />
        <button
          onClick={() => setTour(tour === null ? 0 : null)}
          className={`flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-[13px] font-semibold text-white bg-[#7B61FF] hover:bg-[#6a4ff5] ${tour === null ? "cv-tour-glow" : ""}`}
        >
          {tour === null ? <Play className="w-3.5 h-3.5 fill-white" /> : <X className="w-4 h-4" />}
          {tour === null ? "Take the tour" : "End tour"}
        </button>
      </motion.div>

      {!phone && (
        <motion.div
          data-chrome
          {...chrome(0.08, { y: -20 })}
          className="absolute top-3 right-3 flex flex-col items-end gap-2.5"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="cv-chrome rounded-2xl flex items-center gap-2 p-1.5 pl-2.5">
            <div className="flex -space-x-2">
              {[
                ["R", "#F24E1E", "recruiter"],
                ["J", "#7B61FF", "Jonathan"],
                ["Y", "#0D99FF", "you"],
              ].map(([l, c, t]) => (
                <span key={l} title={t} className="w-8 h-8 rounded-full grid place-items-center text-white text-[13px] font-bold ring-2 ring-white" style={{ background: c }}>
                  {l}
                </span>
              ))}
            </div>
            <a href={`mailto:${EMAIL}`} className="h-8 px-3.5 rounded-xl bg-[#0D99FF] hover:bg-[#0a85e0] text-white text-[13px] font-semibold grid place-items-center">
              Contact
            </a>
          </div>
          {/* Minimap */}
          <div
            className="cv-chrome rounded-2xl p-2.5 cursor-crosshair"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              onMini(e);
            }}
            onPointerMove={onMini}
          >
            <div className="relative overflow-hidden rounded-lg bg-[#F3F4F7]" style={{ width: 220, height: miniH }}>
              <svg viewBox={`${WORLD.x} ${WORLD.y} ${WORLD.w} ${WORLD.h}`} className="absolute inset-0 w-full h-full">
                {ISLAND_ORDER.filter((id) => id !== "hero").map((id) => {
                  const f = ISLANDS[id];
                  return <rect key={id} x={f.x} y={f.y} width={f.w} height={f.h} rx={40} fill={f.color} fillOpacity={0.16} stroke={f.color} strokeOpacity={0.5} strokeWidth={14} />;
                })}
                <path d={ROAD} fill="none" stroke="#E5398F" strokeWidth={40} strokeLinecap="round" opacity={0.6} />
                <rect x={-540} y={-200} width={780} height={150} rx={30} fill="#1e1e24" />
                <circle cx={HERE.x} cy={HERE.y} r={60} fill="#0D99FF" />
              </svg>
              <div ref={miniRef} className="absolute border-2 border-[#0D99FF] bg-[#0D99FF]/10 rounded-[3px] pointer-events-none" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Layers panel = island index */}
      {!phone && (
        <motion.div
          data-chrome
          {...chrome(0.16, { x: -20 })}
          className="absolute left-3 top-[76px] cv-chrome rounded-2xl p-2 w-[188px]"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="text-[11px] font-semibold text-[#8a8a98] px-2 pt-1 pb-1.5 uppercase tracking-wider">Layers</div>
          {ISLAND_ORDER.map((id) => {
            const f = ISLANDS[id];
            const active = stop?.island === id;
            return (
              <button
                key={id}
                onClick={() => toIsland(id)}
                className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[13px] text-left ${active ? "bg-[#7B61FF]/12 text-[#5a40e0] font-semibold" : "hover:bg-black/[0.04]"}`}
              >
                <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: id === "hero" ? "#1e1e24" : f.color }} />
                {id === "hero" ? "Jonathan" : f.label.split(" —")[0]}
              </button>
            );
          })}
        </motion.div>
      )}

      {/* Zoom controls — bottom-right, clear of the switcher */}
      <motion.div
        data-chrome
        {...chrome(0.12, { y: 20 })}
        className={`absolute right-3 cv-chrome rounded-2xl flex items-center p-1 ${phone ? "flex-col bottom-[96px]" : "bottom-4"}`}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button aria-label="Zoom out" onClick={() => zoomAt(window.innerWidth / 2, window.innerHeight / 2, 0.8)} className="w-9 h-9 grid place-items-center rounded-xl hover:bg-black/5">
          <Minus className="w-4 h-4" />
        </button>
        {!phone && <span ref={zoomRef} className="cv-mono text-[12px] w-12 text-center tabular-nums text-[#55556a]" />}
        <button aria-label="Zoom in" onClick={() => zoomAt(window.innerWidth / 2, window.innerHeight / 2, 1.25)} className="w-9 h-9 grid place-items-center rounded-xl hover:bg-black/5">
          <Plus className="w-4 h-4" />
        </button>
        <button aria-label="Fit" onClick={() => fly(homeView())} className="w-9 h-9 grid place-items-center rounded-xl hover:bg-black/5">
          <Maximize className="w-4 h-4" />
        </button>
      </motion.div>

      {!phone && (
        <motion.div {...chrome(0.3, { y: 20 })} className="absolute left-3 bottom-4 text-[12px] text-[#8a8a98] cv-chrome rounded-xl px-3 py-2 pointer-events-none">
          Drag to pan · scroll to zoom · click anything
        </motion.div>
      )}

      {/* Tour caption */}
      <AnimatePresence>
        {stop && tour !== null && (
          <motion.div
            data-chrome
            key="tour"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`absolute left-1/2 cv-chrome rounded-2xl p-4 pr-3 flex items-start gap-3 ${phone ? "top-[62px] w-[calc(100%-24px)]" : "top-3 w-[460px]"}`}
            style={{ x: "-50%" }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <span className="cv-mono text-[12px] text-[#7B61FF] font-semibold mt-0.5 whitespace-nowrap">
              {tour + 1}/{TOUR.length}
            </span>
            <AnimatePresence mode="wait">
              <motion.div key={tour} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.18 }} className="flex-1 min-w-0">
                <div className="font-bold text-[15px] leading-tight">{stop.title}</div>
                <div className="text-[13px] text-[#55556a] leading-snug mt-0.5">{stop.caption}</div>
              </motion.div>
            </AnimatePresence>
            <div className="flex gap-1 flex-shrink-0">
              <button aria-label="Previous stop" onClick={() => setTour(Math.max(0, tour - 1))} className="w-8 h-8 grid place-items-center rounded-lg hover:bg-black/5">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button aria-label="Next stop" onClick={() => setTour(tour >= TOUR.length - 1 ? null : tour + 1)} className="w-8 h-8 grid place-items-center rounded-lg hover:bg-black/5">
                <ChevronRight className="w-4 h-4" />
              </button>
              <button aria-label="End tour" onClick={endTour} className="w-8 h-8 grid place-items-center rounded-lg hover:bg-black/5">
                <X className="w-4 h-4" />
              </button>
            </div>
            <motion.div key={`bar-${tour}`} className="absolute left-4 right-4 bottom-1.5 h-[2px] rounded-full bg-[#7B61FF]/60 origin-left" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 5.2, ease: "linear" }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InfiniteCanvas;
