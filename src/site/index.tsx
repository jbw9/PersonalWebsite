import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, useMotionValue, useReducedMotion } from "framer-motion";
import AskTerminal from "./ask/AskTerminal";
import { createField, Field } from "./engine";
import { GlobeBox, guidePath, projectPath, Resume, ShapeKey } from "./contracts";
import Sections, { SECTIONS } from "./Sections";
import Story, { StoryApi, storyNodes } from "./StoryMode";
import Bridge, { Pt } from "./Bridge";
import "./remix.css";

// the hidden game pulls in three.js, so it loads only when someone finds it
const Game = lazy(() => import("./game"));

type Mode = "sections" | "story";
const instant = "instant" as ScrollBehavior;
const docTop = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;
const EASE: [number, number, number, number] = [0.7, 0, 0.2, 1];
const typing = (t: EventTarget | null) => {
  const el = t as HTMLElement | null;
  return !!el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));
};

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

// Segmented Sections | Story control
const Toggle = ({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) => (
  <div className="relative flex p-1 rounded-full border border-[#e6ecf5]/12 bg-[#0b111e]/70 backdrop-blur-md rx-mono text-[9px] md:text-[10px]" role="tablist" aria-label="View mode">
    {(["sections", "story"] as Mode[]).map((m) => (
      <button key={m} role="tab" aria-selected={mode === m} onClick={() => onChange(m)} className={`relative px-3 md:px-3.5 py-1.5 rounded-full transition-colors ${mode === m ? "text-[#070b14]" : "text-[#a3adbf] hover:text-[#e6ecf5]"}`}>
        {mode === m && <motion.span layoutId="rx-seg" className="absolute inset-0 rounded-full bg-[#e6ecf5]" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
        <span className="relative">{m === "story" ? "🎬 Story" : "Sections"}</span>
      </button>
    ))}
  </div>
);

const Remix = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // back from a detail page: no intro, land where the visitor left off
  const [resume] = useState(() => (location.state as Resume | null)?.resume ?? null);
  const reduce = !!useReducedMotion();
  const grain = useGrain();
  const { w: vw, h: vh } = useViewport();
  const wide = vw >= 768;
  const navH = wide ? 52 : 48;
  const [fine] = useState(() => window.matchMedia("(pointer: fine)").matches);

  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const field = useRef<Field | null>(null);
  const [globe, setGlobe] = useState<GlobeBox | null>(null);
  // no splash: the page opens on the settled globe
  const done = true;
  const skipped = useRef(true);

  const [mode, setMode] = useState<Mode>("sections");
  // the outgoing mode fades while the incoming one fades in; bridge = the vibe line morphing into Story
  const [leaving, setLeaving] = useState(false);
  const [bridge, setBridge] = useState<{ from: Pt[]; to: Pt[]; fadeIn: boolean } | null>(null);
  const busy = useRef(false);
  const storyApi = useRef<StoryApi | null>(null);
  const progress = useMotionValue(0);
  const [storyStart, setStoryStart] = useState(0);
  const restore = useRef<number | string | null>(null);
  const savedY = useRef(0);

  const [active, setActive] = useState("");
  const [askOpen, setAskOpen] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // ── Easter egg: three hard flicks of the globe within 4s open the journey game ──
  const [game, setGame] = useState(false);
  const [stir, setStir] = useState(false);
  const flicks = useRef<number[]>([]);
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("%c✈  psst: give the globe a few good spins.", "color:#5b9cff;font:12px monospace");
  }, []);
  useEffect(() => {
    if (!game) return;
    field.current?.setRunning(false);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      if (mode === "sections") field.current?.setRunning(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game]);

  // ── Particles ──
  // phones get no particles at all: no globe, no shapes, so no game either
  useEffect(() => {
    if (!wide) return;
    const f = createField(canvasRef.current as HTMLCanvasElement, {
      reduce,
      resume: true,
      onGlobe: setGlobe,
      onIntroDone: () => {},
      onFlick: () => {
        const now = Date.now();
        flicks.current = flicks.current.filter((t) => now - t < 4000).concat(now);
        if (flicks.current.length >= 3) {
          flicks.current = [];
          setStir(false);
          setGame(true);
        } else if (flicks.current.length === 2) {
          setStir(true);
          later(() => setStir(false), 2600);
        }
      },
    });
    field.current = f;
    return () => {
      f.destroy();
      field.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, wide]);

  // Story is desktop-only; a window narrowed to phone width drops back to Sections
  useEffect(() => {
    if (!wide) setMode("sections");
  }, [wide]);

  // after VariantPage's scroll-to-top; the stamp is consumed so a reload plays the intro again
  useEffect(() => {
    if (!resume) return;
    const st = window.history.state || {};
    window.history.replaceState({ ...st, usr: null }, "");
    const id = requestAnimationFrame(() => {
      const el = resume.section ? document.getElementById(`rx-${resume.section}`) : null;
      window.scrollTo({ top: el ? docTop(el) : resume.y ?? 0, behavior: instant });
    });
    return () => cancelAnimationFrame(id);
  }, [resume]);

  useEffect(() => {
    field.current?.setShape("globe");
  }, []);

  // ── Sections: the section crossing the middle of the screen picks the particle shape ──
  useEffect(() => {
    if (mode !== "sections") return;
    const onScroll = () => {
      const mid = window.innerHeight * 0.5;
      const secs = Array.from(document.querySelectorAll<HTMLElement>(".v-remix [data-shape]"));
      const hits = secs.filter((s) => {
        const r = s.getBoundingClientRect();
        return r.top <= mid && r.bottom > mid;
      });
      // the innermost wins, so an experience row can override its section's shape
      const inner = hits[hits.length - 1];
      const hit = hits.find((s) => s.dataset.sec);
      if (done) field.current?.setShape(((inner && inner.dataset.shape) || "globe") as ShapeKey);
      const id = (hit && hit.dataset.sec) || "";
      setActive(id);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [mode, done]);

  // ── Shockwave: clicks on empty space in Sections mode ──
  useEffect(() => {
    if (!done || mode !== "sections") return;
    const shock = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (!rootRef.current?.contains(t) || t.closest("a,button,input,textarea,[data-card],[data-chrome]") || field.current?.overGlobe(e.clientX, e.clientY)) return;
      field.current?.shock(e.clientX, e.clientY);
    };
    window.addEventListener("pointerdown", shock);
    return () => window.removeEventListener("pointerdown", shock);
  }, [done, mode]);

  // ── Mode switching: a crossfade; into Story on desktop the hero's vibe line becomes the film's ──
  const switchMode = (to: Mode, opts: { at?: number; section?: string } = {}) => {
    if (busy.current) return;
    if (to === mode) {
      if (to === "story" && opts.at !== undefined) storyApi.current?.seek(opts.at);
      if (to === "sections" && opts.section) document.getElementById(`rx-${opts.section}`)?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    const swap = () => {
      if (to === "story") {
        savedY.current = window.scrollY;
        setStoryStart(opts.at ?? 0);
        field.current?.setRunning(false);
      } else {
        restore.current = opts.section ?? savedY.current;
        field.current?.setRunning(true);
      }
      setMode(to);
    };
    if (reduce) return swap();
    busy.current = true;
    if (to === "story" && wide) {
      const to = storyNodes(vw, vh, 32, opts.at ?? 0);
      let from = Array.from(document.querySelectorAll<HTMLElement>(".v-remix [data-hero-node]")).map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
      // scrolled away from the hero: the line rises in from the foot of the screen instead
      const seen = from.length === to.length && from.some((q) => q.y > 0 && q.y < vh);
      if (from.length !== to.length) from = to.map((q) => ({ x: q.x, y: vh + 60 }));
      else if (!seen) {
        const dy = vh - 70 - Math.max(...from.map((q) => q.y));
        from = from.map((q) => ({ x: q.x, y: q.y + dy }));
      }
      setBridge({ from, to, fadeIn: !seen });
    }
    setLeaving(true);
    later(() => {
      swap();
      setLeaving(false);
    }, 420);
    later(() => (busy.current = false), 900);
  };

  // returning to Sections lands where you left off (or on the section you asked for)
  useLayoutEffect(() => {
    if (mode !== "sections" || restore.current === null) return;
    const r = restore.current;
    restore.current = null;
    const el = typeof r === "string" ? document.getElementById(`rx-${r}`) : null;
    window.scrollTo({ top: el ? docTop(el) : (r as number), behavior: instant });
  }, [mode]);

  const goSection = (id: string) => switchMode("sections", { section: id });
  // the drawer stays mounted; it is only hidden once it has slid out, and is visible in the same
  // render that opens it so the terminal can take focus
  const [drawerShown, setDrawerShown] = useState(false);
  const openAsk = useCallback(() => {
    setDrawerShown(true);
    setAskOpen(true);
  }, []);
  const closeAsk = useCallback(() => setAskOpen(false), []);

  // ── Keys: "/" opens Alfred, Esc closes it ──
  useEffect(() => {
    if (!done) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (askOpen) setAskOpen(false);
        return;
      }
      if (e.key === "/" && !askOpen && !typing(e.target) && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        openAsk();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, askOpen, openAsk]);

  const leave = (path: string, section: string) => {
    const st = window.history.state || {};
    const back: Resume = { resume: mode === "story" ? { section } : { y: window.scrollY } };
    window.history.replaceState({ ...st, usr: back }, "");
    navigate(path);
  };
  const openProject = (id: string) => leave(projectPath(id), "projects");
  const openGuide = (id: string) => leave(guidePath(id), "guides");

  const story = mode === "story";
  // no bar in Sections; Story keeps its letterbox
  const topH = story ? navH : 0;
  // the bottom bar only stays (thin, as in cinema) while the film runs sideways
  const botBar = story && wide ? 32 : 0;
  const botH = botBar;
  const barT = { duration: 0.8, ease: EASE };
  // on phones the open terminal is full-screen and has its own close
  const chrome = done && (wide || !askOpen);

  return (
    <div ref={rootRef} className="v-remix relative min-h-screen">
      {wide && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-500"
          style={{ opacity: story ? 0 : 1 }}
        />
      )}
      <div className="rx-vignette z-[5]" />

      <motion.div key={mode} initial={{ opacity: 0 }} animate={{ opacity: leaving ? 0 : 1 }} transition={{ duration: leaving ? 0.38 : 0.6 }}>
      {story ? (
        <Story
          vw={vw}
          vh={vh}
          navH={navH}
          bar={botBar}
          progress={progress}
          api={storyApi}
          startAt={storyStart}
          onBack={() => switchMode("sections")}
          onAsk={openAsk}
        />
      ) : (
        <Sections
          vw={vw}
          navH={24}
          globe={globe}
          done={done}
          fine={fine}
          reduce={reduce}
          onOpen={openProject}
          onGuide={openGuide}
          onAsk={openAsk}
          onPick={(i) => switchMode("story", { at: i })}
        />
      )}
      </motion.div>

      {/* ── Letterbox, top: 2.39:1 during the titles; Story keeps a thin bar with its HUD ── */}
      <motion.header
        data-chrome
        className={`fixed top-0 inset-x-0 z-50 bg-black ${topH > 0 ? "border-b border-[#e6ecf5]/[0.07]" : ""}`}
        initial={{ height: 0 }}
        animate={{ height: topH }}
        transition={barT}
      >
      </motion.header>

      {/* ── Phones: one Ask pill at thumb height, once the hero's own Ask button has scrolled away ── */}
      {!wide && (
        <motion.button
          data-chrome
          initial={false}
          animate={{ opacity: active && !askOpen ? 1 : 0, y: active && !askOpen ? 0 : 16 }}
          transition={{ duration: 0.35 }}
          onClick={openAsk}
          className="rx-btn fixed right-4 z-[58] !py-2.5 !px-4 !text-[11px] rx-mono"
          style={{ bottom: "calc(16px + env(safe-area-inset-bottom))", pointerEvents: active && !askOpen ? "auto" : "none" }}
        >
          <span className="text-sm leading-none">✻</span> Ask Alfred
        </motion.button>
      )}

      {/* ── Floating controls: no bar, just two pills in the corner ── */}
      {wide && (
      <motion.div
        data-chrome
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: chrome ? 1 : 0, y: chrome ? 0 : -8 }}
        transition={{ duration: 0.6, delay: chrome && !skipped.current ? 0.5 : 0 }}
        className="fixed right-3 md:right-5 z-[63] flex items-center gap-2"
        style={{ top: story ? (navH - 36) / 2 : wide ? 18 : 12, pointerEvents: chrome ? "auto" : "none" }}
      >
        <Toggle mode={mode} onChange={(m) => switchMode(m)} />
        <button
          onClick={() => (askOpen ? closeAsk() : openAsk())}
          className={`rx-mono text-[10px] h-9 flex items-center gap-2 px-3.5 md:px-4 rounded-full border shrink-0 backdrop-blur-md transition-colors ${
            askOpen ? "bg-[#5b9cff] text-[#070b14] border-[#5b9cff]" : "bg-[#0b111e]/70 border-[#5b9cff]/50 text-[#5b9cff] hover:bg-[#5b9cff] hover:text-[#070b14]"
          }`}
        >
          <span className="text-[12px] leading-none">✻</span>
          <span>
            {askOpen ? "Close" : <>Ask<span className="hidden md:inline"> Alfred</span></>}
          </span>
        </button>
      </motion.div>
      )}

      {/* ── Section rail: where you are, one click to anywhere ── */}
      {!story && (
        <motion.nav
          data-chrome
          aria-label="Sections"
          initial={{ opacity: 0 }}
          animate={{ opacity: done ? 1 : 0 }}
          transition={{ duration: 0.6, delay: done && !skipped.current ? 0.7 : 0 }}
          className="hidden lg:flex fixed right-5 top-1/2 -translate-y-1/2 z-[55] flex-col items-end gap-3.5"
          style={{ pointerEvents: done ? "auto" : "none" }}
        >
          {[{ id: "", label: "Top" }, ...SECTIONS].map((sct) => {
            const on = active === sct.id;
            return (
              <button
                key={sct.label}
                onClick={() => (sct.id ? goSection(sct.id) : window.scrollTo({ top: 0, behavior: "smooth" }))}
                className="group flex items-center gap-3 rx-mono text-[9px]"
                aria-label={sct.label}
              >
                <span className={`transition-all duration-300 ${on ? "text-[#e6ecf5]" : "text-[#8692a8]"} opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0`}>{sct.label}</span>
                <span className={`rounded-full transition-all duration-300 ${on ? "w-1.5 h-6 bg-[#5b9cff] shadow-[0_0_10px_rgba(91,156,255,0.8)]" : "w-1.5 h-1.5 bg-[#e6ecf5]/30 group-hover:bg-[#e6ecf5]/70"}`} />
              </button>
            );
          })}
        </motion.nav>
      )}

      {/* ── Letterbox, bottom: opens away entirely in Sections ── */}
      <motion.div
        className={`fixed bottom-0 inset-x-0 z-50 bg-black ${botH > 0 ? "border-t border-[#e6ecf5]/[0.07]" : ""}`}
        initial={{ height: 0 }}
        animate={{ height: botH }}
        transition={barT}
      />

      {bridge && <Bridge {...bridge} onDone={() => setBridge(null)} />}

      {/* ── Ask drawer: mounted once so the conversation survives closing ── */}
      <motion.div
        data-chrome
        initial={false}
        animate={{ opacity: askOpen && wide ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        onClick={closeAsk}
        className="fixed inset-0 z-[61] bg-black/45"
        style={{ pointerEvents: askOpen && wide ? "auto" : "none" }}
      />
      <motion.aside
        data-chrome
        aria-label="Ask Alfred about Jonathan"
        aria-hidden={!askOpen}
        initial={false}
        animate={askOpen ? { x: 0, y: 0 } : wide ? { x: "110%", y: 0 } : { x: 0, y: "100%" }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        onAnimationComplete={() => !askOpen && setDrawerShown(false)}
        className="fixed right-0 z-[62] flex flex-col overflow-hidden bg-[#0a0f1a] border border-[#e6ecf5]/10 shadow-[-30px_0_80px_rgba(0,0,0,0.55)] md:rounded-[28px]"
        // floats below the corner pills; 470 wide so it ends right of the switcher pill at bottom-centre
        style={{ ...(wide ? { top: 66, bottom: 16, right: 16, width: 470 } : { top: 0, bottom: 0, left: 0 }), visibility: drawerShown ? "visible" : "hidden" }}
      >
        <div className="flex-1 min-h-0">
          <AskTerminal active={askOpen} onClose={closeAsk} />
        </div>
      </motion.aside>


      <div className="rx-grain z-[60]" style={{ backgroundImage: `url(${grain})` }} />

      {stir && globe && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed z-[70] -translate-x-1/2 rx-mono text-[11px] text-[#bcd7ff] pointer-events-none"
          style={{ left: globe.cx, top: globe.cy + globe.r + 18 }}
        >
          ✈ something stirs… one more spin
        </motion.div>
      )}
      {game && (
        <Suspense fallback={<div className="fixed inset-0 z-[100] bg-[#070b14]" />}>
          <Game onExit={() => setGame(false)} />
        </Suspense>
      )}
    </div>
  );
};

export default Remix;
