import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, MotionValue, useMotionValue, useSpring, useTransform } from "framer-motion";
import { X, Minus, Maximize2, Wifi, BatteryFull, Search, Cloud } from "lucide-react";
import { APPS, APP_ORDER, AppIcon } from "./apps";
import Terminal from "./Terminal";
import { AppId, OSContext } from "./shared";

const MENU_H = 28;
const DOCK_W = 96;

interface Win {
  id: AppId;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  min: boolean;
  max: boolean;
  ox: number; // screen point the window grows from / shrinks into
  oy: number;
  autorun?: string;
}
interface OpenOpts {
  x?: number;
  y?: number;
  autorun?: string;
}
interface Note {
  id: number;
  app: string;
  title: string;
  body: string;
  icon: AppId | "aws";
  action: () => void;
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const center = (r: DOMRect) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });

const useViewport = () => {
  const [vp, setVp] = useState({ W: window.innerWidth, H: window.innerHeight });
  useEffect(() => {
    const r = () => setVp({ W: window.innerWidth, H: window.innerHeight });
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);
  return vp;
};

const useClock = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
};

/* ─────────────────────────── Window ─────────────────────────── */
const Window = ({
  win,
  focused,
  vp,
  onFocus,
  onClose,
  onMin,
  onMax,
  onMove,
}: {
  win: Win;
  focused: boolean;
  vp: { W: number; H: number };
  onFocus: () => void;
  onClose: () => void;
  onMin: () => void;
  onMax: () => void;
  onMove: (x: number, y: number) => void;
}) => {
  const app = APPS[win.id];
  const Body = app.Body;
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const g = win.max ? { x: DOCK_W, y: MENU_H + 8, w: vp.W - DOCK_W - 12, h: vp.H - MENU_H - 92 } : win;

  const down = (e: React.PointerEvent) => {
    if (win.max || e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, x: win.x, y: win.y };
    setDragging(true);
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    onMove(clamp(d.x + e.clientX - d.px, 120 - win.w, vp.W - 120), clamp(d.y + e.clientY - d.py, MENU_H, vp.H - 48));
  };
  const up = () => {
    drag.current = null;
    setDragging(false);
  };

  const light = (bg: string, Icon: typeof X, fn: () => void, label: string) => (
    <button
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        fn();
      }}
      className="w-3 h-3 rounded-full grid place-items-center"
      style={{ background: focused ? bg : "rgba(255,255,255,0.16)" }}
    >
      <Icon className="w-2 h-2 text-black/60" strokeWidth={3} />
    </button>
  );

  return (
    <motion.div
      className={`absolute rounded-xl overflow-hidden flex flex-col os-window ${focused ? "" : "os-blurred"} ${dragging ? "" : "os-geom"}`}
      style={{
        left: g.x,
        top: g.y,
        width: g.w,
        height: g.h,
        zIndex: win.z,
        transformOrigin: `${win.ox - g.x}px ${win.oy - g.y}px`,
        pointerEvents: win.min ? "none" : "auto",
      }}
      initial={{ opacity: 0, scaleX: 0.05, scaleY: 0.02 }}
      animate={win.min ? { opacity: 0, scaleX: 0.03, scaleY: 0.05 } : { opacity: 1, scaleX: 1, scaleY: 1 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.18 } }}
      transition={{
        scaleX: { type: "spring", stiffness: 330, damping: 30 },
        scaleY: { type: "spring", stiffness: 190, damping: 23 },
        opacity: { duration: win.min ? 0.35 : 0.15 },
      }}
      onPointerDown={onFocus}
    >
      <div
        className={`h-[38px] flex-shrink-0 flex items-center px-3.5 relative border-b border-white/[0.06] ${focused ? "bg-white/[0.03]" : ""}`}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onDoubleClick={onMax}
      >
        <div className="os-lights flex gap-2 relative z-10" onPointerDown={(e) => e.stopPropagation()}>
          {light("#FF5F57", X, onClose, "Close")}
          {light("#FEBC2E", Minus, onMin, "Minimise")}
          {light("#28C840", Maximize2, onMax, "Zoom")}
        </div>
        <div className={`absolute inset-x-0 text-center text-[12.5px] font-medium pointer-events-none truncate px-24 ${focused ? "text-white/75" : "text-white/35"}`}>
          {app.title}
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-auto os-scroll">{win.id === "terminal" ? <Terminal autorun={win.autorun} /> : <Body />}</div>
    </motion.div>
  );
};

/* ─────────────────────────── Dock ─────────────────────────── */
const DockItem = ({
  id,
  mouseY,
  running,
  launches,
  onClick,
  register,
}: {
  id: AppId;
  mouseY: MotionValue<number>;
  running: boolean;
  launches: number;
  onClick: (r: DOMRect) => void;
  register: (el: HTMLElement | null) => void;
}) => {
  const ref = useRef<HTMLButtonElement | null>(null);
  const dist = useTransform(mouseY, (y) => {
    const r = ref.current?.getBoundingClientRect();
    return r ? y - (r.top + r.height / 2) : 999;
  });
  const size = useSpring(useTransform(dist, [-150, 0, 150], [48, 78, 48]), { mass: 0.1, stiffness: 180, damping: 13 });
  return (
    <div className="relative flex items-center group">
      <motion.button
        ref={(el) => {
          ref.current = el;
          register(el);
        }}
        style={{ width: size, height: size }}
        onClick={(e) => onClick(e.currentTarget.getBoundingClientRect())}
        aria-label={APPS[id].name}
      >
        {/* Re-keyed per launch so the icon does the little sideways hop */}
        <motion.div key={launches} className="w-full h-full" animate={launches ? { x: [0, 18, 0, 8, 0] } : undefined} transition={{ duration: 0.7, ease: "easeOut" }}>
          <AppIcon id={id} />
        </motion.div>
      </motion.button>
      {running && <span className="absolute -left-[7px] w-1 h-1 rounded-full bg-white/85" />}
      <span className="pointer-events-none absolute left-full ml-4 px-2.5 py-1 rounded-md os-glass text-[12px] font-medium whitespace-nowrap opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
        {APPS[id].name}
      </span>
    </div>
  );
};

/* ─────────────────────────── Menu bar ─────────────────────────── */
const MenuBar = ({
  appName,
  menu,
  setMenu,
  open,
  onRestart,
  go,
}: {
  appName: string;
  menu: string | null;
  setMenu: (m: string | null) => void;
  open: (id: AppId, r?: DOMRect | null, o?: OpenOpts) => void;
  onRestart: () => void;
  go: (p: string) => void;
}) => {
  const now = useClock();
  const item = (key: string, label: React.ReactNode, bold = false) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setMenu(menu === key ? null : key);
      }}
      onMouseEnter={() => menu && setMenu(key)}
      className={`px-2.5 h-[22px] rounded-[5px] ${bold ? "font-semibold" : ""} ${menu === key ? "bg-white/20" : "hover:bg-white/10"}`}
    >
      {label}
    </button>
  );
  const drop = (entries: ([string, () => void] | null)[]) => (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.12 }}
      className="absolute top-full mt-1 min-w-[230px] rounded-lg os-glass p-1.5 shadow-2xl"
      style={{ background: "rgba(30,30,38,0.85)" }}
      onClick={(e) => e.stopPropagation()}
    >
      {entries.map((en, i) =>
        en ? (
          <button
            key={i}
            onClick={() => {
              setMenu(null);
              en[1]();
            }}
            className="w-full text-left px-2.5 py-1 rounded-[5px] hover:bg-[#0A84FF] text-[13px]"
          >
            {en[0]}
          </button>
        ) : (
          <div key={i} className="h-px bg-white/10 my-1 mx-2" />
        )
      )}
    </motion.div>
  );
  return (
    <motion.div
      initial={{ y: -MENU_H }}
      animate={{ y: 0 }}
      transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 28 }}
      className="absolute top-0 left-0 right-0 z-[9500] flex items-center px-2 text-[13px] text-white/90 border-b border-white/[0.06]"
      style={{ height: MENU_H, background: "rgba(10,10,20,0.35)", backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)" }}
    >
      <div className="relative">
        {item(
          "logo",
          <span
            className="w-[15px] h-[15px] rounded-[4px] grid place-items-center text-[10px] font-bold"
            style={{ background: "linear-gradient(135deg,#FF5F05,#E11D74,#6D28D9)" }}
          >
            J
          </span>
        )}
        {menu === "logo" &&
          drop([
            ["About This Jonathan", () => open("about")],
            null,
            ["Open Terminal", () => open("terminal")],
            ["Send Jonathan an Email…", () => open("contact")],
            null,
            ["Restart…", onRestart],
          ])}
      </div>
      {item("app", appName, true)}
      <div className="relative">
        {item("go", "Go")}
        {menu === "go" && drop(APP_ORDER.map((id): [string, () => void] => [APPS[id].name, () => open(id)]))}
      </div>
      {item("help", "Help")}
      <div className="ml-auto flex items-center gap-3.5 pr-2 text-white/85">
        <button onClick={() => go("/project/taxbuddy")} className="hidden md:flex items-center gap-1.5 px-2 h-[22px] rounded-[5px] hover:bg-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-[#30D158] os-pulse" />
          <span className="text-[12px]">taxbuddy.service</span>
        </button>
        <Wifi className="w-4 h-4" />
        <BatteryFull className="w-[18px] h-[18px]" />
        <Search className="w-3.5 h-3.5" />
        <span className="tabular-nums whitespace-nowrap">
          {now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}{" "}
          {now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
        </span>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────── Desktop ─────────────────────────── */
const Desktop = ({ onRestart }: { onRestart: () => void }) => {
  const navigate = useNavigate();
  const vp = useViewport();
  const [wins, setWins] = useState<Win[]>([]);
  const [sel, setSel] = useState<AppId | null>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [launches, setLaunches] = useState<Partial<Record<AppId, number>>>({});
  const zTop = useRef(10);
  const dockEls = useRef<Partial<Record<AppId, HTMLElement | null>>>({});
  const mouseY = useMotionValue(Infinity);

  const dockPoint = (id: AppId) => {
    const el = dockEls.current[id];
    return el ? center(el.getBoundingClientRect()) : { x: 40, y: window.innerHeight / 2 };
  };

  const open = useCallback((id: AppId, from?: DOMRect | null, o: OpenOpts = {}) => {
    setLaunches((l) => ({ ...l, [id]: (l[id] ?? 0) + 1 }));
    setWins((ws) => {
      const z = ++zTop.current;
      const existing = ws.find((w) => w.id === id);
      if (existing) {
        const p = existing.min ? dockPoint(id) : { x: existing.ox, y: existing.oy };
        return ws.map((w) => (w.id === id ? { ...w, z, min: false, ox: p.x, oy: p.y } : w));
      }
      const W = window.innerWidth;
      const H = window.innerHeight;
      const a = APPS[id];
      const w = Math.min(a.w, W - DOCK_W - 24);
      // Leave ~90px at the bottom so new windows never land on the variant switcher
      const h = Math.min(a.h, H - MENU_H - 100);
      const n = ws.length % 5;
      const x = clamp(o.x ?? DOCK_W + (W - DOCK_W - 200 - w) / 2 + n * 28 - 28, DOCK_W, W - w - 10);
      const y = clamp(o.y ?? MENU_H + (H - MENU_H - 90 - h) / 2 + n * 24 - 24, MENU_H + 8, H - h - 90);
      const src = from ? center(from) : dockPoint(id);
      return [...ws, { id, x, y, w, h, z, min: false, max: false, ox: src.x, oy: src.y, autorun: o.autorun }];
    });
  }, []);

  const close = useCallback((id: AppId) => setWins((ws) => ws.filter((w) => w.id !== id)), []);
  const patch = (id: AppId, p: Partial<Win>) => setWins((ws) => ws.map((w) => (w.id === id ? { ...w, ...p } : w)));
  const focus = (id: AppId) => {
    const top = wins.reduce((a, b) => (b.z > a.z && !b.min ? b : a), wins[0]);
    if (top?.id !== id) patch(id, { z: ++zTop.current });
  };
  const go = useCallback((p: string) => navigate(p), [navigate]);
  const api = useMemo(() => ({ open, close, go, compact: false }), [open, close, go]);

  // Boot hand-off: README first, then a terminal that's already typing, then notifications
  useEffect(() => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const roomy = W >= 1180;
    const ts = [
      window.setTimeout(() => {
        if (roomy) open("terminal", null, { x: W - 640 - 220, y: H - 420 - 90, autorun: "neofetch" });
      }, 450),
      window.setTimeout(() => open("about", null, { x: roomy ? DOCK_W + 34 : undefined, y: roomy ? MENU_H + 34 : undefined }), 750),
      window.setTimeout(
        () =>
          setNotes((n) => [
            ...n,
            {
              id: 1,
              app: "AWS",
              icon: "aws",
              title: "Offer accepted",
              body: "Incoming Software Engineer · Amazon MSK · Feb 2027",
              action: () => open("experience"),
            },
          ]),
        1500
      ),
      window.setTimeout(
        () =>
          setNotes((n) => [
            ...n,
            {
              id: 2,
              app: "taxbuddy.service",
              icon: "projects",
              title: "Deploy succeeded ●",
              body: "TaxBuddy is live — 1040-NR for international students",
              action: () => navigate("/project/taxbuddy"),
            },
          ]),
        2400
      ),
      window.setTimeout(() => setNotes((n) => n.filter((x) => x.id !== 1)), 6500),
      window.setTimeout(() => setNotes((n) => n.filter((x) => x.id !== 2)), 7500),
    ];
    return () => ts.forEach(clearTimeout);
  }, [open, navigate]);

  const visible = wins.filter((w) => !w.min);
  const focused = visible.reduce<Win | null>((a, b) => (!a || b.z > a.z ? b : a), null);
  const rows = Math.max(1, Math.floor((vp.H - MENU_H - 40) / 100));

  return (
    <OSContext.Provider value={api}>
      <div
        className="absolute inset-0"
        onPointerDown={() => {
          setSel(null);
          setMenu(null);
        }}
      >
        {/* Wallpaper wordmark */}
        <div className="absolute bottom-6 right-8 text-right pointer-events-none select-none">
          <div className="text-[13px] font-semibold text-white/30 tracking-tight">JonathanOS 26.10</div>
          <div className="os-mono text-[10.5px] text-white/20">Champaign, IL · 40.11°N 88.24°W</div>
        </div>

        {/* Desktop icons, column-major from the top-right like Finder */}
        {APP_ORDER.map((id, i) => {
          const col = Math.floor(i / rows);
          const row = i % rows;
          return (
            <motion.button
              key={id}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 + i * 0.04, type: "spring", stiffness: 300, damping: 20 }}
              className="absolute w-[88px] flex flex-col items-center gap-1.5 py-1.5 rounded-lg z-[1]"
              style={{ right: 14 + col * 94, top: MENU_H + 16 + row * 100 }}
              onPointerDown={(e) => {
                e.stopPropagation();
                setSel(id);
                setMenu(null);
              }}
              onDoubleClick={(e) => open(id, e.currentTarget.getBoundingClientRect())}
              onKeyDown={(e) => e.key === "Enter" && open(id, e.currentTarget.getBoundingClientRect())}
            >
              <div className={`w-[56px] h-[56px] rounded-[14px] p-[3px] ${sel === id ? "bg-white/20 ring-1 ring-white/30" : ""}`}>
                <AppIcon id={id} />
              </div>
              <span
                className={`os-icon-label text-[11.5px] font-medium leading-tight px-1.5 py-[1px] rounded ${sel === id ? "bg-[#0A84FF] [text-shadow:none]" : ""}`}
              >
                {APPS[id].name}
              </span>
            </motion.button>
          );
        })}

        <AnimatePresence>
          {wins.map((w) => (
            <Window
              key={w.id}
              win={w}
              vp={vp}
              focused={focused?.id === w.id}
              onFocus={() => focus(w.id)}
              onClose={() => close(w.id)}
              onMin={() => {
                const p = dockPoint(w.id);
                patch(w.id, { min: true, ox: p.x, oy: p.y });
              }}
              onMax={() => patch(w.id, { max: !w.max })}
              onMove={(x, y) => patch(w.id, { x, y })}
            />
          ))}
        </AnimatePresence>

        {/* Notifications */}
        <div className="absolute right-3 z-[9400] flex flex-col gap-2 w-[340px]" style={{ top: MENU_H + 10 }}>
          <AnimatePresence>
            {notes.map((n) => (
              <motion.button
                key={n.id}
                layout
                initial={{ x: 380, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 380, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => {
                  setNotes((ns) => ns.filter((x) => x.id !== n.id));
                  n.action();
                }}
                className="os-glass rounded-2xl p-3 flex gap-3 text-left shadow-2xl"
                style={{ background: "rgba(40,40,52,0.6)" }}
              >
                <div className="w-9 h-9 flex-shrink-0">
                  {n.icon === "aws" ? (
                    <div className="w-full h-full rounded-[9px] grid place-items-center" style={{ background: "linear-gradient(160deg,#FFB547,#FF9900)" }}>
                      <Cloud className="w-5 h-5 text-[#232F3E]" strokeWidth={2.2} />
                    </div>
                  ) : (
                    <AppIcon id={n.icon} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[11px] uppercase tracking-wide text-white/45">{n.app}</span>
                    <span className="text-[11px] text-white/35">now</span>
                  </div>
                  <div className="text-[13px] font-semibold leading-tight mt-0.5">{n.title}</div>
                  <div className="text-[12.5px] text-white/65 leading-snug">{n.body}</div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Dock: vertical on the left so bottom-centre stays clear */}
        <motion.div
          initial={{ x: -110 }}
          animate={{ x: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 24 }}
          className="absolute left-2.5 top-0 bottom-0 z-[9300] flex items-center pointer-events-none"
          style={{ paddingTop: MENU_H }}
        >
          <div
            className="os-glass rounded-[24px] p-2 flex flex-col items-start gap-1.5 pointer-events-auto"
            onMouseMove={(e) => mouseY.set(e.clientY)}
            onMouseLeave={() => mouseY.set(Infinity)}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {APP_ORDER.map((id, i) => (
              <div key={id} className="contents">
                {i === APP_ORDER.length - 2 && <div className="h-px w-[48px] bg-white/15 my-1" />}
                <DockItem
                  id={id}
                  mouseY={mouseY}
                  running={wins.some((w) => w.id === id)}
                  launches={launches[id] ?? 0}
                  onClick={(r) => {
                    const w = wins.find((x) => x.id === id);
                    const p = center(r);
                    if (w && !w.min && focused?.id === id) patch(id, { min: true, ox: p.x, oy: p.y });
                    else open(id, r);
                  }}
                  register={(el) => (dockEls.current[id] = el)}
                />
              </div>
            ))}
          </div>
        </motion.div>

        <MenuBar
          appName={focused ? APPS[focused.id].name : "Finder"}
          menu={menu}
          setMenu={(m) => {
            // Help runs `help` in a fresh terminal
            if (m === "help") {
              setMenu(null);
              close("terminal");
              open("terminal", null, { autorun: "help" });
              return;
            }
            setMenu(m);
          }}
          open={open}
          onRestart={onRestart}
          go={go}
        />
      </div>
    </OSContext.Provider>
  );
};

export default Desktop;
