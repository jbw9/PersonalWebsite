import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Milestone, milestones } from "../../data/journey";
import { GameProps } from "../contracts";
import { CONTACT, fmtTerm } from "../timeline";
import { FRAMES, QUALIFY, REAL_ROLLS, frameDone, marks, totals } from "./frames";
import { LaneApi, createLane } from "./lane";

// A replays Jonathan's game ball for ball (the swipe only lets it go); C deals his setbacks and lets the visitor bowl the rest
type Mode = "a" | "c";
type Card = { kicker: string; items: Milestone[]; note?: string; button?: string; tone?: "rough" | "good" };

const ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const ext = { target: "_blank", rel: "noopener noreferrer" };
const ms = (short: string) => milestones.find((m) => m.short === short) as Milestone;
const NOW = milestones[milestones.length - 1];
const REAL_TOTAL = totals(REAL_ROLLS)[9] as number;
const pinList = (ns: number[]) => (ns.length === 1 ? `the ${ns[0]} pin` : ns.join("-"));

const Bowling = ({ onExit }: GameProps) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const lane = useRef<LaneApi | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [f, setF] = useState(0);
  const [rolls, setRolls] = useState<number[][]>([]);
  const [standing, setStanding] = useState<number[]>(ALL);
  const [card, setCard] = useState<Card | null>(null);
  const [done, setDone] = useState(false);
  const onSettled = useRef<(down: number[]) => void>(() => {});
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));

  useEffect(() => {
    const l = createLane(canvas.current as HTMLCanvasElement, (down) => onSettled.current(down));
    l.rack(ALL);
    lane.current = l;
    const t = timers.current;
    return () => {
      t.forEach(clearTimeout);
      l.destroy();
    };
  }, []);

  const setRack = (pins: number[]) => {
    setStanding(pins);
    lane.current?.rack(pins);
  };

  const head = (fi: number) => {
    const m = ms(FRAMES[fi].balls[0].short);
    return `frame ${fi + 1} of 10 · ${fmtTerm(m.date)}`;
  };

  // A: every ball is a milestone, and it does exactly what it did
  const showBall = (fi: number, b: number) => {
    const ball = FRAMES[fi].balls[b];
    const m = ms(ball.short);
    setCard({ kicker: `${head(fi)} · ball ${b + 1}`, items: [m], note: "Swipe up to roll it.", tone: m.dip ? "rough" : "good" });
    lane.current?.arm({ script: ball.knock });
  };

  const startFrame = (md: Mode, fi: number) => {
    setF(fi);
    setRack(ALL);
    const fr = FRAMES[fi];
    const first = ms(fr.balls[0].short);
    lane.current?.sign(`${first.emoji} ${first.short}`);
    if (md === "a") return showBall(fi, 0);
    if (fr.rough)
      return setCard({ kicker: `${head(fi)} · rough patch`, items: [first], note: "Life rolls this one. You get the next ball.", button: "Roll it", tone: "rough" });
    setCard({ kicker: head(fi), items: fr.balls.map((b) => ms(b.short)), note: "Your rack. Swipe up to bowl.", tone: "good" });
    lane.current?.arm({});
  };

  const begin = (md: Mode) => {
    setMode(md);
    setRolls(FRAMES.map(() => []));
    setDone(false);
    startFrame(md, 0);
  };

  const next = () => {
    setCard(null);
    if (f === 9) setDone(true);
    else startFrame(mode as Mode, f + 1);
  };

  // the card's button: in C's rough frames it lets life's ball go, otherwise it moves on
  const press = () => {
    if (!card?.button) return;
    if (card.button === "Roll it") {
      setCard({ ...card, button: undefined, note: "…" });
      lane.current?.auto({ script: FRAMES[f].balls[0].knock, life: true });
    } else next();
  };

  onSettled.current = (down) => {
    const md = mode as Mode;
    const fr = FRAMES[f];
    const r = rolls[f].concat(down.length);
    setRolls(rolls.map((x, i) => (i === f ? r : x)));
    let left = standing.filter((n) => !down.includes(n));
    // a cleared deck gets a fresh rack (only the 10th frame rolls on after one)
    if (left.length === 0) left = ALL;
    const b = r.length;

    if (md === "a") {
      if (b < fr.balls.length)
        return later(() => {
          setRack(left);
          showBall(f, b);
        }, 500);
      setCard(null);
      return later(next, 900);
    }

    if (fr.rough && b === 1) {
      setRack(left);
      const note = down.length === 0 ? "A gutter ball. The whole rack is yours." : left.length <= 4 ? `It left the ${pinList(left)}. Pick it up.` : `${left.length} pins left. Pick them up.`;
      setCard({ kicker: `${head(f)} · your ball`, items: [], note, tone: "rough" });
      lane.current?.arm({});
      return;
    }
    if (fr.rough) {
      const got = down.length === standing.length;
      setCard({
        kicker: "what actually happened next",
        items: [ms(fr.balls[1].short)],
        note: got ? "You picked it up. So did I, eventually." : `You left ${standing.length - down.length}. Not every split gets converted.`,
        button: f === 9 ? "Finish" : "Next frame",
        tone: "good",
      });
      return;
    }
    if (!frameDone(f, r))
      return later(() => {
        setRack(left);
        lane.current?.arm({});
      }, 500);
    setCard(null);
    later(next, 900);
  };

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onExit();
      else if (e.key === "Enter" || (e.key === " " && card?.button)) press();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });

  const yourTotal = totals(rolls)[9];
  const rows =
    mode === "c"
      ? [
          { label: "you", rolls, life: true },
          { label: "Jonathan", rolls: REAL_ROLLS, life: false },
        ]
      : [{ label: "Jonathan", rolls, life: false }];

  return (
    <div className="fixed inset-0 z-[100] bg-[#070b14] select-none overflow-hidden" data-chrome style={{ touchAction: "none" }}>
      <canvas ref={canvas} className="absolute inset-0 w-full h-full" />

      <button onClick={onExit} className="rx-btn-ghost absolute top-4 left-4 !py-2 !px-4 bg-black/40 z-10" aria-label="Exit the game">
        ✕ exit
      </button>

      {/* scorecard: one box per chapter */}
      {mode && (
        <div className="absolute top-16 md:top-4 left-1/2 -translate-x-1/2 rounded-xl bg-black/50 border border-[#e6ecf5]/10 px-2 py-2 max-w-[96vw] overflow-x-auto">
          <table className="rx-mono text-[10px] md:text-[11px] border-collapse">
            <thead>
              <tr>
                <td />
                {FRAMES.map((fr, i) => (
                  <td key={i} title={ms(fr.balls[0].short).title} className={`text-center px-1 pb-1 text-sm ${i === f && !done ? "" : "opacity-50"}`}>
                    {ms(fr.balls[0].short).emoji}
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const tot = totals(row.rolls);
                return (
                  <tr key={row.label}>
                    <td className="pr-2 text-[#8692a8] whitespace-nowrap">{row.label}</td>
                    {row.rolls.map((r, i) => (
                      <td key={i} className={`border border-[#e6ecf5]/15 min-w-[38px] md:min-w-[46px] align-top ${i === f && !done && row.rolls === rolls ? "bg-[#5b9cff]/15" : ""}`}>
                        <div className="flex justify-end gap-1 px-1 h-4">
                          {marks(r).map((m, k) => (
                            <span key={k} className={row.life && k === 0 && FRAMES[i].rough ? "text-[#ff8a8a]" : m === "X" || m === "/" ? "text-[#4ade80]" : "text-[#e6ecf5]"}>
                              {m}
                            </span>
                          ))}
                        </div>
                        <div className="text-center text-[#e6ecf5] h-4">{tot[i] ?? ""}</div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {mode === "c" && <div className="rx-mono text-[9px] text-[#8692a8] mt-1 px-1"><span className="text-[#ff8a8a]">red</span> = life's ball</div>}
        </div>
      )}

      {/* which pins are still up, seen from the bowler: back row on top */}
      {mode && !done && (
        <div className="absolute right-5 bottom-6 flex flex-col items-center gap-1.5 pointer-events-none">
          {[[7, 8, 9, 10], [4, 5, 6], [2, 3], [1]].map((row) => (
            <div key={row[0]} className="flex gap-1.5">
              {row.map((n) => (
                <span key={n} className={`w-3 h-3 rounded-full ${standing.includes(n) ? "bg-[#e6ecf5]" : "border border-[#e6ecf5]/25"}`} />
              ))}
            </div>
          ))}
        </div>
      )}

      {mode && !done && !card?.button && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rx-mono text-[9px] text-[#8692a8] pointer-events-none text-center">
          {mode === "c" ? "drag up from where you want to release · bow the swipe to hook · ← → then space works too" : "swipe up (or space) to let it go · esc to leave"}
        </div>
      )}

      {/* the chapter this ball or frame stands for */}
      <AnimatePresence mode="wait">
        {card && !done && (
          <motion.div
            key={card.kicker + card.items.map((m) => m.short).join()}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className={`absolute left-1/2 -translate-x-1/2 bottom-24 md:bottom-auto md:top-[150px] md:left-6 md:translate-x-0 w-[min(92vw,380px)] rx-card !bg-[#0b111e]/90 p-5 ${card.button ? "" : "pointer-events-none"}`}
          >
            <div className={`rx-mono text-[10px] ${card.tone === "rough" ? "text-[#ff8a8a]" : "text-[#4ade80]"}`}>✦ {card.kicker}</div>
            {card.items.map((m) => (
              <div key={m.short} className="mt-3">
                <div className="flex items-start gap-2.5">
                  {m.logo ? <img src={m.logo} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" /> : <span className="text-2xl leading-none">{m.emoji}</span>}
                  <div className="text-[1.2rem] italic leading-tight">{m.title}</div>
                </div>
                <p className="mt-1.5 text-[0.98rem] text-[#c2cbdb] leading-snug">{m.body}</p>
              </div>
            ))}
            {card.note && <div className="rx-mono text-[10px] text-[#bcd7ff] mt-3">{card.note}</div>}
            {card.button && (
              <button onClick={press} className="rx-btn mt-4 !py-2 !px-4">
                {card.button} <span className="opacity-60 hidden md:inline">↵</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* title */}
      <AnimatePresence>
        {!mode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-x-0 bottom-[8vh] flex flex-col items-center text-center px-6"
          >
            <div className="rx-mono text-[10px] text-[#5b9cff] mb-3">✦ you found it</div>
            <h2 className="text-[clamp(2.4rem,6vw,4.4rem)] italic font-light leading-[0.95]">Ten frames</h2>
            <p className="mt-4 max-w-[36rem] text-[1.1rem] text-[#c2cbdb] leading-snug">
              Before code, I bowled: national junior champion in Indonesia, then 2nd of about 400 qualifiers in Malaysia. So here's my journey the way I know best, one chapter per frame.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button onClick={() => begin("a")} className="rx-btn !text-[13px]">
                ▶ Version A · replay my game
              </button>
              <button onClick={() => begin("c")} className="rx-btn !text-[13px]">
                🎳 Version C · bowl my frames
              </button>
            </div>
            <div className="rx-mono text-[9px] text-[#8692a8] mt-4 max-w-[34rem]">
              A: every ball is a milestone and lands exactly as it did · C: life rolls my setbacks, you try to pick up the spare
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* final score */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-[6vh] w-[min(92vw,480px)] rx-card !bg-[#0b111e]/90 p-6 md:p-7 text-center"
          >
            <div className="rx-mono text-[10px] text-[#4ade80]">✦ game over · {mode === "c" ? `you ${yourTotal} · Jonathan ${REAL_TOTAL}` : `final ${REAL_TOTAL}`}</div>
            <div className="mt-2 text-[1.7rem] italic leading-tight">
              {mode === "c" && yourTotal !== null && yourTotal > REAL_TOTAL ? "You beat my real game." : `${REAL_TOTAL}. Not a ${QUALIFY}, but every frame got finished.`}
            </div>
            <p className="mt-2 text-[1.02rem] text-[#c2cbdb] leading-snug">
              In Malaysia I had to average about {QUALIFY} just to qualify. Life is a lower-scoring lane. {NOW.body}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2.5">
              <button onClick={() => begin(mode as Mode)} className="rx-btn">
                🎳 Bowl again
              </button>
              <button onClick={() => begin(mode === "a" ? "c" : "a")} className="rx-btn-ghost">
                Try version {mode === "a" ? "C" : "A"}
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

export default Bowling;
