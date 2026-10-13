import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GameProps } from "../contracts";
import { CONTACT, fmtMonth } from "../timeline";
import { GATES, NOW, START } from "./chapters";
import { createGame, GameApi, GameEvent } from "./scene";

type Gate = Extract<GameEvent, { kind: "gate" }>;
type Stop = Extract<GameEvent, { kind: "stop" }>;
type Fin = Extract<GameEvent, { kind: "finale" }>;
const ext = { target: "_blank", rel: "noopener noreferrer" };

// The hidden journey: a paper plane from Bandung to Seattle, one gate per chapter
const Game = ({ onExit }: GameProps) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const marker = useRef<HTMLDivElement>(null);
  const markerLabel = useRef<HTMLSpanElement>(null);
  const boost = useRef<HTMLDivElement>(null);
  const api = useRef<GameApi | null>(null);
  const [flying, setFlying] = useState(false);
  const [passed, setPassed] = useState(0);
  const [card, setCard] = useState<Gate | null>(null);
  const [toast, setToast] = useState<Stop | null>(null);
  const [fin, setFin] = useState<Fin | null>(null);
  const [noGl, setNoGl] = useState(false);
  const [stick, setStick] = useState<{ x: number; y: number; dx: number; dy: number } | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const touch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  useEffect(() => {
    const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));
    let g: GameApi;
    try {
      g = createGame(
      canvas.current as HTMLCanvasElement,
      { marker: marker.current as HTMLElement, markerLabel: markerLabel.current as HTMLElement, boost: boost.current as HTMLElement },
      (e) => {
        if (e.kind === "gate") {
          setPassed(e.i + 1);
          setCard(e);
          setToast(null);
          if (e.i < GATES.length - 1) later(() => setCard((c) => (c === e ? null : c)), 4200);
        } else if (e.kind === "stop") {
          setToast(e);
          later(() => setToast((t) => (t === e ? null : t)), 3600);
        } else {
          setCard(null);
          setFin(e);
        }
      }
      );
    } catch {
      // no WebGL (old device, or hardware acceleration off): say so instead of a blank screen
      setNoGl(true);
      return;
    }
    api.current = g;
    const t = timers.current;
    return () => {
      t.forEach(clearTimeout);
      g.destroy();
    };
  }, []);

  const takeOff = () => {
    api.current?.start();
    setFlying(true);
  };
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onExit();
      if (!flying && (e.key === "Enter" || e.key === " ")) takeOff();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });

  const again = () => {
    api.current?.restart();
    setFin(null);
    setCard(null);
    setPassed(0);
    setFlying(false);
  };

  // drag anywhere to steer: sideways turns, up climbs
  const onDown = (e: React.PointerEvent) => {
    if (!flying || fin) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setStick({ x: e.clientX, y: e.clientY, dx: 0, dy: 0 });
  };
  const onMove = (e: React.PointerEvent) => {
    if (!stick || !api.current) return;
    const dx = Math.max(-60, Math.min(60, e.clientX - stick.x));
    const dy = Math.max(-60, Math.min(60, e.clientY - stick.y));
    api.current.input.x = dx / 60;
    api.current.input.y = -dy / 60;
    setStick({ ...stick, dx, dy });
  };
  const onUp = () => {
    if (api.current) api.current.input.x = api.current.input.y = 0;
    setStick(null);
  };
  const setBoost = (on: boolean) => api.current && (api.current.input.boost = on);

  if (noGl)
    return (
      <div className="fixed inset-0 z-[100] bg-[#070b14] flex flex-col items-center justify-center text-center px-6" data-chrome>
        <div className="rx-mono text-[10px] text-[#5b9cff]">✦ you found it</div>
        <p className="mt-3 max-w-[26rem] text-[1.15rem] text-[#c2cbdb]">The plane needs WebGL, and this browser has it switched off. Try again on a laptop with hardware acceleration on.</p>
        <button onClick={onExit} className="rx-btn-ghost mt-6">
          Back to the site
        </button>
      </div>
    );

  return (
    <div className="fixed inset-0 z-[100] bg-[#070b14] select-none overflow-hidden" data-chrome style={{ touchAction: "none" }}>
      <canvas ref={canvas} className="absolute inset-0 w-full h-full" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} />

      {/* next gate: on screen it rings the target, off screen it sits on the edge and points */}
      <div ref={marker} className="rx-gm-marker absolute left-0 top-0 pointer-events-none opacity-0" style={{ transition: "opacity 0.3s" }}>
        <div className="rx-gm-arrow" />
        <span ref={markerLabel} className="rx-mono absolute left-1/2 top-[26px] -translate-x-1/2 whitespace-nowrap text-[10px] text-[#bcd7ff]" />
      </div>

      {stick && (
        <div className="absolute pointer-events-none w-[120px] h-[120px] -ml-[60px] -mt-[60px] rounded-full border border-[#e6ecf5]/20" style={{ left: stick.x, top: stick.y }}>
          <div className="absolute left-1/2 top-1/2 w-10 h-10 -ml-5 -mt-5 rounded-full bg-[#5b9cff]/50" style={{ transform: `translate(${stick.dx}px, ${stick.dy}px)` }} />
        </div>
      )}

      {/* top: exit and the chapter track */}
      <button onClick={onExit} className="rx-btn-ghost absolute top-4 left-4 !py-2 !px-4 bg-black/40" aria-label="Exit the game">
        ✕ exit
      </button>
      <div className="absolute top-[68px] md:top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 md:gap-2 rounded-full bg-black/40 border border-[#e6ecf5]/10 px-3 py-2">
        {GATES.map((g, i) => (
          <span
            key={g.m.short}
            title={g.m.short}
            className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-sm md:text-base transition-all duration-500 ${
              i < passed ? "bg-[#4ade80]/20 border border-[#4ade80]/70" : i === passed && flying ? "border border-[#5b9cff] shadow-[0_0_14px_rgba(91,156,255,0.6)]" : "border border-[#e6ecf5]/10 opacity-40 grayscale"
            }`}
          >
            {g.m.emoji}
          </span>
        ))}
      </div>

      {/* bottom: boost */}
      {/* always mounted: the loop writes the boost level into it every frame */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none transition-opacity duration-500" style={{ opacity: flying && !fin ? 1 : 0 }}>
          <div className="w-40 h-1.5 rounded-full bg-[#e6ecf5]/10 overflow-hidden">
            <div ref={boost} className="h-full w-full rounded-full origin-left bg-gradient-to-r from-[#5b9cff] to-[#bcd7ff]" />
          </div>
          {!touch && <div className="rx-mono text-[9px] text-[#8692a8]">← → steer · ↑ ↓ climb · space boost · rings refill</div>}
      </div>
      {touch && flying && !fin && (
        <button
          className="absolute bottom-6 right-5 w-16 h-16 rounded-full bg-[#5b9cff]/25 border border-[#5b9cff]/60 text-2xl"
          onPointerDown={() => setBoost(true)}
          onPointerUp={() => setBoost(false)}
          onPointerLeave={() => setBoost(false)}
          aria-label="Boost"
        >
          ⚡
        </button>
      )}

      {/* title */}
      <AnimatePresence>
        {!flying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-x-0 bottom-[12vh] flex flex-col items-center text-center px-6"
          >
            <div className="rx-mono text-[10px] text-[#5b9cff] mb-3">✦ you found it</div>
            <h2 className="text-[clamp(2.4rem,6vw,4.4rem)] italic font-light leading-[0.95]">The long way to Seattle</h2>
            <p className="mt-4 max-w-[34rem] text-[1.1rem] text-[#c2cbdb] leading-snug">
              Fly a paper plane through my journey: from {START.place}, through a finance major turned CS, to AWS. Every gate is a chapter; storms are the rough patches.
            </p>
            <button onClick={takeOff} className="rx-btn mt-7 !text-[13px]">
              ✈ Take off
            </button>
            <div className="rx-mono text-[9px] text-[#8692a8] mt-4">{touch ? "drag to steer · ⚡ to boost" : "← → steer · ↑ ↓ climb · space to boost · esc to leave"}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* a chapter, as you fly through its gate */}
      <AnimatePresence>
        {card && !fin && (
          <motion.div
            key={card.i}
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 w-[min(92vw,440px)] rx-card !bg-[#0b111e]/85 p-5 pointer-events-none"
          >
            <div className="rx-mono text-[9px] text-[#4ade80]">
              ✦ chapter {card.i + 1} of {GATES.length} · {fmtMonth(card.m.date)}
              {card.place ? ` · ${card.place}` : ""}
            </div>
            <div className="mt-2 flex items-start gap-3">
              <span className="text-3xl leading-none">{card.m.emoji}</span>
              <div>
                <div className="text-[1.3rem] italic leading-tight">{card.m.title}</div>
                <p className="mt-1.5 text-[1rem] text-[#c2cbdb] leading-snug">{card.m.body}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* the moments in between: storms (dips) and small wins */}
      <AnimatePresence>
        {toast && !card && (
          <motion.div
            key={toast.m.short}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[min(92vw,400px)] rx-card !bg-[#0b111e]/85 px-4 py-3 pointer-events-none"
          >
            <div className={`rx-mono text-[9px] ${toast.dip ? "text-[#ff8a8a]" : "text-[#ffd479]"}`}>
              {toast.dip ? "⛈ turbulence" : "✦ picked up"} · {fmtMonth(toast.m.date)}
            </div>
            <div className="mt-1 text-[1.08rem] italic leading-tight">
              {toast.m.emoji} {toast.m.title}
            </div>
            <p className="mt-1 text-[0.95rem] text-[#a3adbf] leading-snug">{toast.m.body}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* landed */}
      <AnimatePresence>
        {fin && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-[6vh] w-[min(92vw,480px)] rx-card !bg-[#0b111e]/90 p-6 md:p-7 text-center"
          >
            <div className="rx-mono text-[10px] text-[#4ade80]">📍 landed · Seattle, WA</div>
            <div className="mt-2 text-[1.7rem] italic leading-tight">{NOW.title}</div>
            <p className="mt-2 text-[1.05rem] text-[#c2cbdb] leading-snug">{NOW.body} Incoming SDE at AWS.</p>
            <div className="rx-mono text-[10px] text-[#8692a8] mt-4">
              {GATES.length} chapters · {Math.floor(fin.secs / 60)}m {String(fin.secs % 60).padStart(2, "0")}s · {fin.rings}/{fin.ringsTotal} rings
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-2.5">
              <button onClick={again} className="rx-btn">
                ✈ Fly again
              </button>
              <button onClick={onExit} className="rx-btn-ghost">
                Back to the site
              </button>
            </div>
            <div className="mt-4 flex justify-center gap-4 rx-mono text-[10px]">
              {CONTACT.map((c) => (
                <a key={c.label} href={c.href} {...(c.href.startsWith("http") ? ext : {})} className="text-[#8692a8] hover:text-[#5b9cff]">
                  {c.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Game;
