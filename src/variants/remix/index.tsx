import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { AchievementId } from "./contracts";
import AskTerminal from "./ask/AskTerminal";
import { createField, Field, NameBox, ShapeKey } from "./engine";
import Sections, { SECTIONS } from "./Sections";
import Story, { StoryApi } from "./StoryMode";
import { ACHIEVEMENTS, Panel, Toasts } from "./Achievements";
import { scenes, pad } from "./timeline";
import "./remix.css";

type Mode = "sections" | "story";
const instant = "instant" as ScrollBehavior;
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
  <div className="relative flex p-0.5 border border-[#e6ecf5]/15 rx-mono text-[9px] md:text-[10px]" role="tablist" aria-label="View mode">
    {(["sections", "story"] as Mode[]).map((m) => (
      <button key={m} role="tab" aria-selected={mode === m} onClick={() => onChange(m)} className={`relative px-2.5 md:px-3 py-1.5 transition-colors ${mode === m ? "text-[#070b14]" : "text-[#a3adbf] hover:text-[#e6ecf5]"}`}>
        {mode === m && <motion.span layoutId="rx-seg" className="absolute inset-0 bg-[#e6ecf5]" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
        <span className="relative">{m === "story" ? "🎬 Story" : "Sections"}</span>
      </button>
    ))}
  </div>
);

const Remix = () => {
  const navigate = useNavigate();
  const reduce = !!useReducedMotion();
  const grain = useGrain();
  const { w: vw, h: vh } = useViewport();
  const wide = vw >= 768;
  const navH = wide ? 52 : 48;
  const [fine] = useState(() => window.matchMedia("(pointer: fine)").matches);

  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const field = useRef<Field | null>(null);
  const [nameBox, setNameBox] = useState<NameBox | null>(null);
  const [done, setDone] = useState(reduce);
  const skipped = useRef(reduce);

  const [mode, setMode] = useState<Mode>("sections");
  const [curtain, setCurtain] = useState(false);
  const [slate, setSlate] = useState("");
  const busy = useRef(false);
  const storyApi = useRef<StoryApi | null>(null);
  const progress = useMotionValue(-1);
  const [storyStart, setStoryStart] = useState(-1);
  const restore = useRef<number | string | null>(null);
  const savedY = useRef(0);

  const [active, setActive] = useState("");
  const [askOpen, setAskOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [unlocked, setUnlocked] = useState<AchievementId[]>([]);
  const [toasts, setToasts] = useState<AchievementId[]>([]);
  const got = useRef(new Set<AchievementId>());
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const unlock = useCallback((id: AchievementId) => {
    if (got.current.has(id)) return;
    got.current.add(id);
    setUnlocked(ACHIEVEMENTS.filter((a) => got.current.has(a.id)).map((a) => a.id));
    setToasts((q) => [...q, id]);
    timers.current.push(setTimeout(() => setToasts((q) => q.filter((x) => x !== id)), 3800));
  }, []);

  // ── Particles ──
  useEffect(() => {
    const f = createField(canvasRef.current as HTMLCanvasElement, {
      reduce,
      onNameBox: setNameBox,
      onIntroDone: () => setDone(true),
    });
    field.current = f;
    return () => {
      f.destroy();
      field.current = null;
    };
  }, [reduce]);

  // ── Intro: scroll locked, any input skips; the title settles into the hero as the bars open ──
  useEffect(() => {
    if (done) {
      field.current?.setShape("name");
      return;
    }
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    const skip = () => {
      skipped.current = true;
      field.current?.skipIntro();
      setDone(true);
    };
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchstart", skip, { passive: true });
    return () => {
      html.style.overflow = prev;
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchstart", skip);
    };
  }, [done]);

  // ── Sections: the section crossing the middle of the screen picks the particle shape ──
  const visited = useRef(new Set<string>());
  useEffect(() => {
    if (mode !== "sections") return;
    const onScroll = () => {
      const mid = window.innerHeight * 0.5;
      const secs = Array.from(document.querySelectorAll<HTMLElement>(".v-remix [data-shape]"));
      const hit = secs.find((s) => {
        const r = s.getBoundingClientRect();
        return r.top <= mid && r.bottom > mid;
      });
      if (done) field.current?.setShape(((hit && hit.dataset.shape) || "name") as ShapeKey);
      const id = (hit && hit.dataset.sec) || "";
      setActive(id);
      if (id) visited.current.add(id);
      if (SECTIONS.every((s) => visited.current.has(s.id))) unlock("explorer");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [mode, done, unlock]);

  // ── Shockwave: clicks on empty space in Sections mode ──
  useEffect(() => {
    if (!done || mode !== "sections") return;
    const shock = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (!rootRef.current?.contains(t) || t.closest("a,button,input,textarea,[data-card],[data-chrome]")) return;
      field.current?.shock(e.clientX, e.clientY);
      unlock("shockwave");
    };
    window.addEventListener("pointerdown", shock);
    return () => window.removeEventListener("pointerdown", shock);
  }, [done, mode, unlock]);

  // ── Mode switching: the bars close, the reel changes, the bars reopen ──
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
        setStoryStart(opts.at ?? -1);
        field.current?.setRunning(false);
        unlock("story");
      } else {
        restore.current = opts.section ?? savedY.current;
        field.current?.setRunning(true);
      }
      setMode(to);
    };
    if (reduce) return swap();
    busy.current = true;
    setPanelOpen(false);
    setSlate(to === "story" ? "🎬  story mode" : "sections");
    setCurtain(true);
    later(swap, 520);
    later(() => {
      setCurtain(false);
      busy.current = false;
    }, 820);
  };

  // returning to Sections lands where you left off (or on the section you asked for)
  useLayoutEffect(() => {
    if (mode !== "sections" || restore.current === null) return;
    const r = restore.current;
    restore.current = null;
    const el = typeof r === "string" ? document.getElementById(`rx-${r}`) : null;
    window.scrollTo({ top: el ? el.offsetTop - navH : (r as number), behavior: instant });
  }, [mode, navH]);

  const goSection = (id: string) => switchMode("sections", { section: id });
  // the drawer stays mounted; it is only hidden once it has slid out, and is visible in the same
  // render that opens it so the terminal can take focus
  const [drawerShown, setDrawerShown] = useState(false);
  const openAsk = useCallback(() => {
    setPanelOpen(false);
    setDrawerShown(true);
    setAskOpen(true);
  }, []);
  const closeAsk = useCallback(() => setAskOpen(false), []);

  // ── Keys: "/" opens Claude, Esc closes whatever is on top ──
  useEffect(() => {
    if (!done) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (panelOpen) setPanelOpen(false);
        else if (askOpen) setAskOpen(false);
        return;
      }
      if (e.key === "/" && !askOpen && !typing(e.target) && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        openAsk();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, askOpen, panelOpen, openAsk]);

  // ── Story HUD: scene label + timecode in the top bar ──
  const [sceneIdx, setSceneIdx] = useState(-1);
  const tcRef = useRef<HTMLSpanElement>(null);
  const timecode = (f: number) => {
    const fr = Math.max(0, Math.round((f + 1) * 24 * 9));
    return `00:${pad(Math.floor(fr / 1440) % 60)}:${pad(Math.floor(fr / 24) % 60)}:${pad(fr % 24)}`;
  };
  useMotionValueEvent(progress, "change", (f) => {
    const i = f < -0.5 ? -1 : Math.min(scenes.length - 1, Math.round(f));
    setSceneIdx((p) => (p === i ? p : i));
    if (tcRef.current) tcRef.current.textContent = timecode(f);
  });

  const openProject = (id: string) => navigate(`/project/${id}`);
  const openGuide = (id: string) => navigate(`/guide/${id}`);

  const barIntro = Math.max(28, (vh - Math.max(vw / (wide ? 2.39 : 1.85), vh * 0.42)) / 2);
  const closed = vh / 2 + 1;
  const topH = curtain ? closed : done ? navH : barIntro;
  const story = mode === "story";
  // the bottom bar only stays (thin, as in cinema) while the film runs sideways
  const botBar = story && wide ? 32 : 0;
  const botH = curtain ? closed : done ? botBar : barIntro;
  const barT = curtain ? { duration: 0.5, ease: [0.6, 0, 0.4, 1] as typeof EASE } : { duration: skipped.current || busy.current ? 0.55 : 1.0, ease: EASE };
  const cur = sceneIdx >= 0 ? scenes[sceneIdx] : null;

  return (
    <div ref={rootRef} className="v-remix relative min-h-screen">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-500"
        style={{ opacity: story ? 0 : 1 }}
      />
      <div className="rx-vignette z-[5]" />

      {story ? (
        <Story
          vw={vw}
          vh={vh}
          navH={navH}
          bar={botBar}
          progress={progress}
          api={storyApi}
          startAt={storyStart}
          onOpen={openProject}
          onBack={() => switchMode("sections")}
          onAsk={openAsk}
        />
      ) : (
        <Sections
          vw={vw}
          navH={navH}
          nameBox={nameBox}
          done={done}
          fine={fine}
          reduce={reduce}
          onOpen={openProject}
          onGuide={openGuide}
          onAsk={openAsk}
          onPick={(i) => switchMode("story", { at: i })}
          onVibe={() => unlock("vibe")}
        />
      )}

      {/* intro: an anamorphic flare rides across the title as it forms */}
      {!reduce && (
        <motion.div
          initial={{ left: "-10%", opacity: 0 }}
          animate={done ? { opacity: 0 } : { left: "110%", opacity: [0, 1, 1, 0] }}
          transition={done ? { duration: 0.2 } : { delay: 1.15, duration: 1.3, ease: [0.3, 0.5, 0.3, 1] }}
          className="fixed z-[44] pointer-events-none -translate-x-1/2"
          style={{ top: vh / 2 }}
        >
          <div className="w-[60vw] h-[2px] -translate-y-1/2" style={{ background: "linear-gradient(90deg, transparent, rgba(170,205,255,0.85), transparent)" }} />
          <div className="absolute left-1/2 top-1/2 w-24 h-24 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(circle, rgba(220,235,255,0.75), transparent 60%)" }} />
        </motion.div>
      )}

      {/* ── Letterbox, top: 2.39:1 during the titles, then the nav ── */}
      <motion.header
        data-chrome
        className="fixed top-0 inset-x-0 z-50 bg-black border-b border-[#e6ecf5]/[0.07]"
        initial={{ height: reduce ? navH : barIntro }}
        animate={{ height: topH }}
        transition={barT}
      >
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: done ? 1 : 0 }}
          transition={{ duration: 0.6, delay: done && !skipped.current ? 0.5 : 0 }}
          className="absolute top-0 inset-x-0 flex items-center gap-3 md:gap-5 px-3 md:px-6"
          style={{ height: navH, pointerEvents: done ? "auto" : "none" }}
        >
          <button
            onClick={() => (story ? switchMode("sections") : window.scrollTo({ top: 0, behavior: "smooth" }))}
            className="text-[26px] md:text-[28px] italic leading-none pr-1 shrink-0"
            aria-label="Jonathan — back to top"
          >
            J<span className="text-[#5b9cff]">.</span>
          </button>

          <div className="flex-1 min-w-0 rx-mono text-[10px] text-[#8692a8]">
            {story ? (
              <div className="hidden sm:flex items-center gap-4">
                <span className="truncate">
                  <span className="text-[#c4372b] mr-2">●</span>
                  {cur ? (
                    <>
                      <span className="hidden md:inline">scene </span>
                      {pad(cur.n)}/{scenes.length}
                      <span className="hidden md:inline text-[#c2cbdb]"> · {cur.short}</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden md:inline">title </span>card
                    </>
                  )}
                </span>
                <span ref={tcRef} className="hidden lg:inline tabular-nums text-[#5d687c]">
                  {timecode(progress.get())}
                </span>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-6">
                {SECTIONS.map((s) => (
                  <button key={s.id} onClick={() => goSection(s.id)} className={`flex items-center gap-1.5 transition-colors ${active === s.id ? "text-[#e6ecf5]" : "hover:text-[#e6ecf5]"}`}>
                    <span className={`w-1 h-1 rounded-full transition-colors ${active === s.id ? "bg-[#5b9cff]" : "bg-transparent"}`} />
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Toggle mode={mode} onChange={(m) => switchMode(m)} />
          <button data-trophy onClick={() => setPanelOpen((o) => !o)} className={`rx-mono text-[10px] flex items-center gap-1.5 px-1 shrink-0 transition-colors ${panelOpen ? "text-[#5b9cff]" : "text-[#a3adbf] hover:text-[#e6ecf5]"}`} aria-label="Achievements">
            <motion.span key={unlocked.length} initial={{ scale: unlocked.length ? 1.6 : 1 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 12 }} className="text-[13px] leading-none">
              🏆
            </motion.span>
            <span className="tabular-nums">
              {unlocked.length}/{ACHIEVEMENTS.length}
            </span>
          </button>
          <button
            onClick={() => (askOpen ? closeAsk() : openAsk())}
            className={`rx-mono text-[10px] flex items-center gap-2 px-2.5 md:px-3.5 py-1.5 md:py-2 border shrink-0 transition-colors ${
              askOpen ? "bg-[#5b9cff] text-[#070b14] border-[#5b9cff]" : "border-[#5b9cff]/50 text-[#5b9cff] hover:bg-[#5b9cff] hover:text-[#070b14]"
            }`}
          >
            <span className="text-[12px] leading-none">✻</span>
            <span>
              Ask<span className="hidden md:inline"> Claude</span>
            </span>
          </button>
        </motion.nav>
      </motion.header>

      {/* ── Letterbox, bottom: opens away entirely in Sections ── */}
      <motion.div
        className={`fixed bottom-0 inset-x-0 z-50 bg-black ${botH > 0 ? "border-t border-[#e6ecf5]/[0.07]" : ""}`}
        initial={{ height: reduce ? 0 : barIntro }}
        animate={{ height: botH }}
        transition={barT}
      />

      {/* the slate shown while the bars are shut */}
      <motion.div
        initial={false}
        animate={{ opacity: curtain ? 1 : 0 }}
        transition={{ duration: 0.25, delay: curtain ? 0.25 : 0 }}
        className="fixed inset-x-0 z-[51] pointer-events-none flex items-center justify-center gap-4"
        style={{ top: vh / 2 - 12, height: 24 }}
      >
        <span className="w-16 h-px bg-[#5b9cff]/50" />
        <span className="rx-mono text-[11px] text-[#e6ecf5]">{slate}</span>
        <span className="w-16 h-px bg-[#5b9cff]/50" />
      </motion.div>

      {/* ── Ask drawer: mounted once so the conversation survives closing ── */}
      <motion.div
        data-chrome
        initial={false}
        animate={{ opacity: askOpen && wide ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        onClick={closeAsk}
        className="fixed inset-x-0 z-[61] bg-black/45"
        style={{ top: navH, bottom: 0, pointerEvents: askOpen && wide ? "auto" : "none" }}
      />
      <motion.aside
        data-chrome
        aria-label="Ask Claude about Jonathan"
        aria-hidden={!askOpen}
        initial={false}
        animate={askOpen ? { x: 0, y: 0 } : wide ? { x: "100%", y: 0 } : { x: 0, y: "100%" }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        onAnimationComplete={() => !askOpen && setDrawerShown(false)}
        className="fixed right-0 z-[62] flex flex-col bg-[#0a0f1a] border-l border-[#e6ecf5]/10 shadow-[-30px_0_80px_rgba(0,0,0,0.55)]"
        // 490 wide so it ends right of the switcher pill at bottom-centre
        style={{ ...(wide ? { top: navH, bottom: 0, width: 490 } : { top: 0, bottom: 0, left: 0 }), visibility: drawerShown ? "visible" : "hidden" }}
      >
        <div className="flex-1 min-h-0">
          <AskTerminal active={askOpen} onClose={closeAsk} onUnlock={unlock} />
        </div>
      </motion.aside>

      {/* toasts step aside from an open drawer so they never cover its close button */}
      <Toasts queue={toasts} top={askOpen && !wide ? navH + 40 : navH} right={askOpen && wide ? 506 : undefined} />
      <Panel open={panelOpen} unlocked={unlocked} onClose={() => setPanelOpen(false)} top={navH} />

      <div className="rx-grain z-[60]" style={{ backgroundImage: `url(${grain})` }} />
    </div>
  );
};

export default Remix;
