import { ReactNode, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, animate, motion, PanInfo, useMotionValue } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, Github, Linkedin, Mail, X } from "lucide-react";
import { experiences, education, involvements } from "../../data";
import { projects } from "../../data/projects";
import { milestones } from "../../data/journey";
import { guides } from "../../data/guides";
import "./deck.css";

const RED = "#a8202c";
const INK = "#17161a";
const EMAIL = "mailto:jbw7@illinois.edu";
const GITHUB = "https://github.com/jbw9";
const LINKEDIN = "https://www.linkedin.com/in/jwidjajakusuma/";
const logo = (p: string) => (p.startsWith("/") || p.startsWith("http") ? p : `/${p}`);
const fmt = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" });

type Go = (path: string) => void;
interface Chapter {
  key: string;
  rank: string;
  suit: "♠" | "♥" | "♣" | "♦";
  title: string;
  kicker: string;
  art: ReactNode;
  body: (go: Go) => ReactNode;
}

// ── detail sides ─────────────────────────────────────────────────────────
const Sub = ({ children }: { children: ReactNode }) => <div className="dk-mono text-[11px] uppercase tracking-[0.18em] text-[#8a6d3b]">{children}</div>;

const Row = ({ img, title, sub, children, round }: { img?: string; title: ReactNode; sub: ReactNode; children?: ReactNode; round?: boolean }) => (
  <div className="flex gap-3 py-3 border-b border-[#d9ccaf] last:border-0">
    {img && <img src={img} alt="" className={`w-10 h-10 object-contain bg-white border border-[#d9ccaf] p-0.5 shrink-0 ${round ? "rounded-full" : "rounded-md"}`} />}
    <div className="min-w-0">
      <div className="font-semibold text-[16.5px] leading-tight">{title}</div>
      <div className="dk-mono text-[11.5px] text-[#7a6a4f] mt-0.5">{sub}</div>
      {children && <p className="text-[14.5px] leading-snug mt-1 text-[#3b372f]">{children}</p>}
    </div>
  </div>
);

const Vibe = () => {
  const w = 300;
  const h = 70;
  const pts = milestones.map((m, i) => `${(i / (milestones.length - 1)) * w},${h - (m.vibe / 100) * h}`).join(" ");
  return (
    <svg viewBox={`-6 -8 ${w + 12} ${h + 16}`} className="w-full h-auto">
      <polyline points={pts} fill="none" stroke={RED} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" />
      {milestones.map((m, i) => (
        <circle key={i} cx={(i / (milestones.length - 1)) * w} cy={h - (m.vibe / 100) * h} r={3} fill={m.dip ? INK : RED} />
      ))}
    </svg>
  );
};

const RANKS = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"];

const CHAPTERS: Chapter[] = [
  {
    key: "about",
    rank: "J",
    suit: "♠",
    title: "Jonathan",
    kicker: "the jack",
    art: <span className="italic font-black text-[3.6em] leading-none">J</span>,
    body: (go) => (
      <>
        <p className="text-[19px] leading-snug">
          CS & Econs student <b>@ UIUC</b> — building software that solves real problems.
        </p>
        <div className="grid grid-cols-2 gap-2.5 mt-4">
          <div className="rounded-lg border border-[#d9ccaf] bg-white/60 p-3">
            <Sub>incoming · feb 2027</Sub>
            <div className="font-bold text-[17px] leading-tight mt-1">SDE @ AWS</div>
            <div className="text-[13px] text-[#5b5446]">Managed Streaming for Kafka</div>
          </div>
          <button onClick={() => go("/project/taxbuddy")} className="text-left rounded-lg border border-[#d9ccaf] bg-white/60 p-3 hover:bg-white">
            <Sub>active project</Sub>
            <div className="font-bold text-[17px] leading-tight mt-1 flex items-center gap-1">
              TaxBuddy <ArrowUpRight className="w-4 h-4" />
            </div>
            <div className="text-[13px] text-[#5b5446]">tax filing for int'l students</div>
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            [EMAIL, <Mail key="m" className="w-4 h-4" />, "jbw7@illinois.edu"],
            [GITHUB, <Github key="g" className="w-4 h-4" />, "GitHub"],
            [LINKEDIN, <Linkedin key="l" className="w-4 h-4" />, "LinkedIn"],
          ].map(([href, icon, text]) => (
            <a
              key={text as string}
              href={href as string}
              target={(href as string).startsWith("mailto") ? undefined : "_blank"}
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#17161a] text-[#f4ecd8] px-3.5 py-1.5 text-[14px] hover:bg-[#a8202c]"
            >
              {icon}
              {text}
            </a>
          ))}
        </div>
        <p className="text-[13.5px] text-[#7a6a4f] italic mt-5">Swipe this card away (or press →) to draw the next one.</p>
      </>
    ),
  },
  {
    key: "journey",
    rank: "A",
    suit: "♥",
    title: "The Journey",
    kicker: "finance → aws",
    art: (
      <svg viewBox="0 0 100 60" className="w-[85%]">
        <polyline
          points={milestones.map((m, i) => `${(i / (milestones.length - 1)) * 100},${58 - (m.vibe / 100) * 56}`).join(" ")}
          fill="none"
          stroke={RED}
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    ),
    body: () => (
      <>
        <Sub>how cracked I felt, week by week</Sub>
        <div className="mt-2 mb-1">
          <Vibe />
        </div>
        {milestones.map((m, i) => (
          <div key={i} className="flex gap-3 py-2.5 border-b border-[#d9ccaf] last:border-0">
            <div className="text-[22px] leading-none w-8 shrink-0 text-center pt-0.5">{m.emoji}</div>
            <div>
              <div className="dk-mono text-[11px] text-[#7a6a4f]">
                {fmt(m.date)} · vibe {m.vibe}
              </div>
              <div className="font-semibold text-[16px] leading-tight">{m.title}</div>
              <p className="text-[14px] leading-snug text-[#3b372f] mt-0.5">{m.body}</p>
            </div>
          </div>
        ))}
      </>
    ),
  },
  {
    key: "experience",
    rank: "K",
    suit: "♣",
    title: "Experience",
    kicker: `${experiences.length} roles`,
    art: <img src="/awsLogo.png" alt="" className="w-[70%] object-contain" draggable={false} />,
    body: () => (
      <>
        {experiences.map((e, i) => (
          <Row key={i} img={logo(e.companyIcon)} title={e.title} sub={`${e.company} · ${e.period}`}>
            {e.description}
            {e.website && (
              <a href={e.website} target="_blank" rel="noreferrer" className="ml-1 underline text-[#a8202c]">
                site ↗
              </a>
            )}
          </Row>
        ))}
      </>
    ),
  },
  ...projects.map(
    (p, i): Chapter => ({
      key: p.id,
      rank: RANKS[i],
      suit: "♦",
      title: p.title,
      kicker: p.id === "taxbuddy" ? "active project" : "project",
      art:
        p.image || p.screenshots?.[0] ? (
          <img src={p.image || p.screenshots?.[0]} alt="" className="w-full h-full object-cover rounded-[0.3em]" draggable={false} />
        ) : (
          <span className="italic font-black text-[3em] leading-none" style={{ color: RED }}>
            {p.title.charAt(0)}
          </span>
        ),
      body: (go) => (
        <>
          {(p.image || p.screenshots?.[0]) && <img src={p.image || p.screenshots?.[0]} alt="" className="w-full h-[170px] object-cover rounded-lg border border-[#d9ccaf]" />}
          <p className="text-[16px] leading-snug mt-3">{p.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {p.technologies.map((t) => (
              <span key={t} className="dk-mono text-[11.5px] border border-[#cdbd98] rounded px-1.5 py-0.5 text-[#5b5446]">
                {t}
              </span>
            ))}
          </div>
          <ul className="mt-3 space-y-1">
            {p.features.slice(0, 4).map((f) => (
              <li key={f} className="text-[14px] leading-snug text-[#3b372f] flex gap-2">
                <span style={{ color: RED }}>♦</span>
                {f}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2 mt-4">
            <button onClick={() => go(`/project/${p.id}`)} className="inline-flex items-center gap-1.5 rounded-full bg-[#17161a] text-[#f4ecd8] px-4 py-2 text-[14px] hover:bg-[#a8202c]">
              Open project <ArrowUpRight className="w-4 h-4" />
            </button>
            {p.demo && (
              <a href={p.demo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-[#17161a] px-4 py-2 text-[14px] hover:bg-white">
                Live ↗
              </a>
            )}
          </div>
        </>
      ),
    })
  ),
  {
    key: "school",
    rank: "Q",
    suit: "♥",
    title: "School",
    kicker: "uiuc '27",
    art: <img src={education[0].image} alt="" className="w-[62%] rounded-[0.3em]" draggable={false} />,
    body: () => {
      const e = education[0];
      const y = education[1];
      return (
        <>
          <Sub>{e.period}</Sub>
          <div className="font-semibold text-[20px] leading-tight mt-1">{e.school}</div>
          <div className="text-[15px] text-[#5b5446]">{e.degree}</div>
          <div className="flex items-end gap-2 mt-3">
            <span className="font-black italic text-[64px] leading-none" style={{ color: RED }}>
              {e.gpa?.split("/")[0]}
            </span>
            <span className="dk-mono text-[12px] text-[#7a6a4f] mb-2">GPA / 4.0</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {e.relevantCourses?.map((c) => (
              <span key={c} className="text-[13px] border border-[#cdbd98] rounded-full px-2.5 py-0.5">
                {c}
              </span>
            ))}
          </div>
          <div className="mt-5">
            <Row img={y.image} title={y.degree} sub={`${y.school} · ${y.period}`} />
          </div>
        </>
      );
    },
  },
  {
    key: "involvement",
    rank: "10",
    suit: "♣",
    title: "Involvement",
    kicker: "outside class",
    art: (
      <div className="flex -space-x-[0.6em]">
        {involvements.map((v) => (
          <img key={v.organization} src={v.image} alt="" className="w-[1.9em] h-[1.9em] rounded-full bg-white object-contain border border-[#cdbd98]" draggable={false} />
        ))}
      </div>
    ),
    body: () => (
      <>
        {involvements.map((v, i) => (
          <Row key={i} round img={v.image} title={v.role} sub={`${v.organization} · ${v.period}`}>
            {v.description}
          </Row>
        ))}
      </>
    ),
  },
  {
    key: "guides",
    rank: "9",
    suit: "♠",
    title: "Guides",
    kicker: "things I wrote",
    art: <span className="text-[2.6em] leading-none">✎</span>,
    body: (go) => (
      <>
        {guides.map((g) => (
          <button key={g.id} onClick={() => go(`/guide/${g.id}`)} className="w-full text-left py-3 border-b border-[#d9ccaf] last:border-0 group">
            <div className="dk-mono text-[11px] text-[#7a6a4f]">
              {g.category} · {g.publishDate}
            </div>
            <div className="font-semibold text-[17px] leading-tight flex items-center gap-1 group-hover:text-[#a8202c]">
              {g.title} <ArrowUpRight className="w-4 h-4 shrink-0" />
            </div>
            <p className="text-[14px] leading-snug text-[#3b372f] mt-0.5">{g.description}</p>
          </button>
        ))}
      </>
    ),
  },
];
const N = CHAPTERS.length;
const isRed = (c: Chapter) => c.suit === "♥" || c.suit === "♦";

// ── card faces (sized in em so the same face works in the hand and zoomed) ─
const Index = ({ c, flip }: { c: Chapter; flip?: boolean }) => (
  <div className={`absolute flex flex-col items-center leading-none ${flip ? "right-[0.42em] bottom-[0.42em] rotate-180" : "left-[0.42em] top-[0.42em]"}`} style={{ color: isRed(c) ? RED : INK }}>
    <span className="font-bold text-[1.2em] tracking-tight">{c.rank}</span>
    <span className="text-[0.95em] mt-[0.05em]">{c.suit}</span>
  </div>
);

const Face = ({ c }: { c: Chapter }) => (
  <div className="dk-face absolute inset-0 overflow-hidden select-none">
    <Index c={c} />
    <Index c={c} flip />
    {/* spine title: readable even when the card is mostly covered in the fan */}
    <div
      className="dk-mono absolute left-[1.05em] top-[5.4em] text-[0.5em] uppercase tracking-[0.18em] whitespace-nowrap overflow-hidden"
      style={{ writingMode: "vertical-rl", color: isRed(c) ? RED : INK, maxHeight: "12.5em" }}
    >
      {c.title}
    </div>
    <div className="absolute left-[1.85em] right-[1.85em] top-[1.25em] bottom-[2.75em] rounded-[0.35em] border border-[#cdbd98] flex items-center justify-center overflow-hidden" style={{ color: isRed(c) ? RED : INK }}>
      {c.art}
    </div>
    <div className="absolute left-[1.4em] right-[1.4em] bottom-[0.95em] text-center">
      <div className="font-semibold text-[0.74em] leading-[1.05] line-clamp-1">{c.title}</div>
      <div className="dk-mono text-[0.42em] uppercase tracking-[0.18em] text-[#8a6d3b] mt-[0.2em] line-clamp-1">{c.kicker}</div>
    </div>
  </div>
);

const Back = ({ style }: { style?: React.CSSProperties }) => (
  <div className="dk-back absolute inset-0 flex items-center justify-center" style={style}>
    <div className="w-[2.6em] h-[2.6em] rounded-full bg-[#f4ecd8] border-[0.12em] border-[#e2c27a] flex items-center justify-center">
      <span className="italic font-black text-[1.5em] leading-none text-[#7c1622]">J</span>
    </div>
  </div>
);

// ── table geometry ───────────────────────────────────────────────────────
const geometry = (W: number, H: number) => {
  const mobile = W < 720;
  const cw = mobile ? Math.min(80, (W - 64) / 4) : Math.min(148, W / 8.6);
  const ch = cw * 1.4;
  const deck = { x: W / 2, y: mobile ? Math.min(H * 0.55, 470) : H * 0.47 };
  const slots = CHAPTERS.map((_, i) => {
    if (mobile) {
      // solitaire tableau: 4 overlapping columns
      const cols = [5, 4, 4, 4];
      let col = 0;
      let k = i;
      while (k >= cols[col]) k -= cols[col++];
      const gap = (W - 4 * cw) / 5;
      return { x: gap + cw / 2 + col * (cw + gap), y: Math.max(H * 0.39, 330) + ch / 2 + k * (ch * 0.42), rot: ((i * 37) % 5) - 2 };
    }
    const R = Math.max(760, W * 0.62);
    const step = Math.min(4.1, (Math.asin(Math.min(0.95, (W * 0.4) / R)) * 180) / Math.PI / ((N - 1) / 2));
    const a = ((i - (N - 1) / 2) * step * Math.PI) / 180;
    const cy = H - ch / 2 - Math.max(60, H * 0.16) + R;
    return { x: W / 2 + Math.sin(a) * R, y: cy - Math.cos(a) * R, rot: (a * 180) / Math.PI };
  });
  return { mobile, cw, ch, deck, slots };
};

type Phase = "deck" | "split" | "riffle" | "deal" | "done";

const Deck = () => {
  const navigate = useNavigate();
  const [size, setSize] = useState(() => ({ W: window.innerWidth, H: window.innerHeight }));
  const [phase, setPhase] = useState<Phase>("deck");
  const [instant, setInstant] = useState(false);
  const [round, setRound] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);
  const phaseRef = useRef<Phase>("deck");
  const focusRef = useRef<number | null>(null);
  const hoverRef = useRef<number | null>(null);
  const busy = useRef(false);
  phaseRef.current = phase;
  focusRef.current = focus;
  hoverRef.current = hover;

  const { W, H } = size;
  const { mobile, cw, ch, deck, slots } = geometry(W, H);
  const FW = Math.min(460, W * 0.9, (H * 0.8) / 1.4);
  const FH = FW * 1.4;

  // focus-card motion
  const fx = useMotionValue(0);
  const fy = useMotionValue(0);
  const fs = useMotionValue(1);
  const fr = useMotionValue(0);
  const fry = useMotionValue(0);
  const fo = useMotionValue(1);

  // ── intro timeline ──
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setInstant(true);
      setPhase("done");
      return;
    }
    setInstant(false);
    setPhase("deck");
    const at = (ms: number, p: Phase) => window.setTimeout(() => setPhase(p), ms);
    const ts = [at(520, "split"), at(900, "riffle"), at(1950, "deal"), at(1950 + (N - 1) * 65 + 650, "done")];
    return () => ts.forEach(clearTimeout);
  }, [round]);

  const skipIntro = () => {
    if (phaseRef.current === "done") return false;
    setInstant(true);
    setPhase("done");
    return true;
  };

  // ── open / close / cycle ──
  const center = () => ({ cx: W / 2, cy: H / 2 - (mobile ? 24 : 10) });
  const flyIn = (i: number) => {
    const s = slots[i];
    const { cx, cy } = center();
    fx.set(s.x - cx);
    fy.set(s.y - cy);
    fs.set(cw / FW);
    fr.set(s.rot);
    fry.set(0);
    fo.set(1);
    setFocus(i);
    const sp = { type: "spring" as const, stiffness: 170, damping: 22 };
    animate(fx, 0, sp);
    animate(fy, 0, sp);
    animate(fs, 1, sp);
    animate(fr, 0, sp);
    animate(fry, 180, { duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.08 });
  };
  const open = (i: number) => {
    if (busy.current || phaseRef.current !== "done") return;
    flyIn(i);
  };
  const close = () => {
    const i = focusRef.current;
    if (i === null || busy.current) return;
    busy.current = true;
    setClosing(true);
    const s = slots[i];
    const { cx, cy } = center();
    const t = { duration: 0.45, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] };
    animate(fry, 0, { duration: 0.35 });
    animate(fx, s.x - cx, t);
    animate(fy, s.y - cy, t);
    animate(fs, cw / FW, t);
    animate(fr, s.rot, t).then(() => {
      busy.current = false;
      setClosing(false);
      setFocus(null);
    });
  };
  const cycle = (dir: 1 | -1) => {
    const i = focusRef.current;
    if (i === null || busy.current) return;
    busy.current = true;
    const t = { duration: 0.32, ease: [0.4, 0, 1, 1] as [number, number, number, number] };
    animate(fx, -dir * (W * 0.6 + FW), t);
    animate(fr, -dir * 28, t);
    animate(fo, 0, { duration: 0.32 }).then(() => {
      busy.current = false;
      flyIn((i + dir + N) % N);
    });
  };
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 110 || Math.abs(info.velocity.x) > 650) cycle(info.offset.x < 0 ? 1 : -1);
    else {
      animate(fx, 0, { type: "spring", stiffness: 400, damping: 30 });
      animate(fr, 0, { type: "spring", stiffness: 400, damping: 30 });
    }
  };

  // ── global listeners ──
  useEffect(() => {
    const onResize = () => setSize({ W: window.innerWidth, H: window.innerHeight });
    const onKey = (e: KeyboardEvent) => {
      if (skipIntro()) return;
      if (focusRef.current !== null) {
        if (e.key === "Escape") close();
        if (e.key === "ArrowRight") cycle(1);
        if (e.key === "ArrowLeft") cycle(-1);
        return;
      }
      const h = hoverRef.current;
      if (e.key === "ArrowRight") setHover(h === null ? 0 : Math.min(N - 1, h + 1));
      if (e.key === "ArrowLeft") setHover(h === null ? N - 1 : Math.max(0, h - 1));
      if ((e.key === "Enter" || e.key === " ") && h !== null) {
        e.preventDefault();
        open(h);
      }
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
    };
  });

  const dealt = phase === "deal" || phase === "done";
  const shuffling = phase === "deck" || phase === "split" || phase === "riffle";
  const showTable = phase !== "deck";
  const tFade = (d: number) => (instant ? { duration: 0 } : { duration: 0.7, delay: d });
  const arc = mobile ? `M 4 76 Q ${W / 2 - 10} -16 ${W - 24} 76` : "M 60 150 Q 500 -10 940 150";

  return (
    <div className="v-deck fixed inset-0 overflow-hidden select-none" onClickCapture={(e) => skipIntro() && e.stopPropagation()}>
      <div className="dk-noise absolute inset-0 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 160px 40px rgba(0,0,0,0.55)" }} />
      {/* rail line printed on the felt */}
      <div className="absolute pointer-events-none rounded-[50%] border border-[#e2c27a]/25" style={{ left: "-10%", right: "-10%", top: mobile ? "8%" : "4%", height: mobile ? "70%" : "100%" }} />

      {/* ── felt printing ── */}
      <motion.div className="absolute left-0 right-0 top-0 flex flex-col items-center pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={tFade(0.15)}>
        <svg viewBox={mobile ? `0 0 ${W - 20} 80` : "0 0 1000 160"} className={mobile ? "mt-3" : "-mt-1"} style={{ width: mobile ? W - 20 : Math.min(1000, W * 0.82) }}>
          <path id="dk-arc" d={arc} fill="none" />
          <text className="dk-mono" fill="#e2c27a" fontSize={mobile ? 9.5 : 17} letterSpacing={mobile ? 1 : 4}>
            <textPath href="#dk-arc" startOffset="50%" textAnchor="middle">
              {mobile ? "✦ INCOMING SDE @ AWS ✦ BUILDING TAXBUDDY ✦" : "✦ INCOMING SDE @ AWS ✦ NOW BUILDING TAXBUDDY ✦ CS & ECONS @ UIUC ✦"}
            </textPath>
          </text>
        </svg>
        <h1 className={`italic font-black text-[#f4ecd8] leading-[0.9] tracking-tight ${mobile ? "text-[64px] -mt-6" : "text-[112px] -mt-[72px]"}`} style={{ textShadow: "0 3px 0 #0a3328, 0 10px 30px rgba(0,0,0,0.45)" }}>
          Jonathan
        </h1>
        <div className={`dk-gold dk-mono uppercase tracking-[0.3em] ${mobile ? "text-[10px] mt-2" : "text-[13px] mt-3"}`}>CS & Econs · UIUC · builder</div>
      </motion.div>

      {/* chips (contact) + dealer buttons (headline facts) */}
      <motion.div
        className={`absolute flex gap-3 ${mobile ? "left-0 right-0 justify-center" : "flex-col"}`}
        style={mobile ? { top: 196 } : { left: Math.max(24, W * 0.06), top: H * 0.33 }}
        initial={{ opacity: 0, x: mobile ? 0 : -30 }}
        animate={{ opacity: showTable ? 1 : 0, x: 0 }}
        transition={tFade(0.3)}
      >
        {[
          [EMAIL, <Mail key="m" className="w-4 h-4" />, "Email", "#a8202c"],
          [GITHUB, <Github key="g" className="w-4 h-4" />, "GitHub", "#17161a"],
          [LINKEDIN, <Linkedin key="l" className="w-4 h-4" />, "LinkedIn", "#1f4fa8"],
        ].map(([href, icon, label, col], i) => (
          <motion.a
            key={label as string}
            href={href as string}
            target={(href as string).startsWith("mailto") ? undefined : "_blank"}
            rel="noreferrer"
            className="dk-chip rounded-full flex items-center justify-center"
            style={{ ["--chip" as any]: col, width: mobile ? 62 : 78, height: mobile ? 62 : 78, marginLeft: mobile ? 0 : i * 14 }}
            whileHover={{ y: -6, rotate: 20 }}
            whileTap={{ scale: 0.92 }}
          >
            <span className="rounded-full flex flex-col items-center justify-center text-[#f4ecd8] border border-dashed border-[#f4ecd8]/60" style={{ background: col as string, width: mobile ? 44 : 56, height: mobile ? 44 : 56 }}>
              {icon}
              <span className="dk-mono text-[8.5px] uppercase tracking-wider mt-0.5">{label}</span>
            </span>
          </motion.a>
        ))}
      </motion.div>
      {!mobile && (
        <motion.div className="absolute flex flex-col items-end gap-3" style={{ right: Math.max(24, W * 0.06), top: H * 0.33 }} initial={{ opacity: 0, x: 30 }} animate={{ opacity: showTable ? 1 : 0, x: 0 }} transition={tFade(0.4)}>
          <div className="rounded-full bg-[#f4ecd8] text-[#17161a] w-[104px] h-[104px] flex flex-col items-center justify-center text-center shadow-[0_5px_0_rgba(0,0,0,0.35),0_12px_20px_rgba(0,0,0,0.35)] border-[3px] border-[#e2c27a] -rotate-6">
            <span className="dk-mono text-[8.5px] tracking-[0.2em] uppercase text-[#8a6d3b]">incoming</span>
            <span className="font-black italic text-[19px] leading-none mt-1">SDE @</span>
            <span className="font-black text-[22px] leading-none">AWS</span>
          </div>
          <motion.button
            onClick={() => navigate("/project/taxbuddy")}
            whileHover={{ y: -5, rotate: 8 }}
            className="rounded-full bg-[#17161a] text-[#f4ecd8] w-[96px] h-[96px] flex flex-col items-center justify-center text-center shadow-[0_5px_0_rgba(0,0,0,0.35),0_12px_20px_rgba(0,0,0,0.35)] border-[3px] border-[#e2c27a] mr-6 rotate-3"
          >
            <span className="dk-mono text-[8px] tracking-[0.2em] uppercase text-[#e2c27a]">now building</span>
            <span className="font-black italic text-[17px] leading-none mt-1">TaxBuddy</span>
            <ArrowUpRight className="w-4 h-4 mt-0.5" />
          </motion.button>
        </motion.div>
      )}

      {/* hint where the deck was */}
      <motion.div
        className="absolute left-0 right-0 text-center pointer-events-none"
        style={{ top: mobile ? Math.max(H * 0.39, 330) - 58 : deck.y - 20 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "done" && focus === null ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="italic text-[#e2c27a] text-[19px] md:text-[24px]">pick a card, any card</div>
        <div className="dk-mono text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-[#f4ecd8]/45 mt-1">{mobile ? "tap to flip · swipe to draw" : "hover · click to flip · ← → keys"}</div>
      </motion.div>

      {/* ── riffle shuffle (12 backs) ── */}
      {shuffling && (
        <div className="absolute" style={{ left: deck.x - cw / 2, top: deck.y - ch / 2, width: cw, height: ch, fontSize: (cw / 132) * 16 }}>
          {Array.from({ length: 12 }, (_, k) => {
            const left = k < 6;
            const o = left ? 2 * k : 2 * (k - 6) + 1; // interleaved order after the riffle
            const target =
              phase === "deck"
                ? { x: 0, y: -k * 0.8, rotate: 0, opacity: 1, zIndex: k }
                : phase === "split"
                ? { x: (left ? -1 : 1) * cw * 0.66, y: -(left ? k : k - 6) * 0.8 - 6, rotate: left ? -9 : 9, opacity: 1, zIndex: k }
                : { x: [(left ? -1 : 1) * cw * 0.66, (left ? -1 : 1) * cw * 0.2, 0], y: [-(left ? k : k - 6) * 0.8 - 6, -30, -o * 0.8], rotate: [left ? -9 : 9, left ? -4 : 4, 0], opacity: 1, zIndex: 20 + o };
            const transition =
              phase === "deck"
                ? { duration: 0.45, delay: k * 0.015, ease: [0.2, 0.8, 0.2, 1] }
                : phase === "split"
                ? { duration: 0.32, ease: [0.4, 0, 0.2, 1] }
                : { duration: 0.32, delay: o * 0.058, ease: "easeOut", zIndex: { delay: o * 0.058, duration: 0 } };
            return (
              <motion.div
                key={k}
                className="absolute inset-0 dk-shadow"
                initial={{ y: -120, opacity: 0, rotate: 0 }}
                animate={target as any}
                transition={transition as any}
              >
                <Back />
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── the hand ── */}
      {CHAPTERS.map((c, i) => {
        const s = slots[i];
        const d = i * 0.065;
        const lifted = hover === i && phase === "done" && focus === null;
        return (
          <motion.div
            key={c.key}
            className="absolute left-0 top-0"
            style={{ width: cw, height: ch, fontSize: (cw / 132) * 16, visibility: focus === i ? "hidden" : "visible", pointerEvents: phase === "done" ? "auto" : "none" }}
            initial={false}
            animate={
              dealt
                ? { x: s.x - cw / 2, y: s.y - ch / 2, rotate: s.rot, opacity: 1, zIndex: lifted ? 300 : 200 + i }
                : { x: deck.x - cw / 2, y: deck.y - ch / 2 - (N - i) * 0.6, rotate: 0, opacity: 0, zIndex: 100 - i }
            }
            transition={
              instant || !dealt
                ? { duration: 0 }
                : phase === "done"
                ? { type: "spring", stiffness: 260, damping: 28, zIndex: { duration: 0 } }
                : { duration: 0.6, delay: d, ease: [0.2, 0.75, 0.25, 1], opacity: { duration: 0 }, zIndex: { duration: 0, delay: d } }
            }
            onHoverStart={() => setHover(i)}
            onHoverEnd={() => setHover((h) => (h === i ? null : h))}
            onClick={() => open(i)}
          >
            <motion.div className="w-full h-full cursor-pointer" animate={{ y: lifted ? -ch * (mobile ? 0.12 : 0.3) : 0, scale: lifted ? 1.08 : 1 }} transition={{ type: "spring", stiffness: 420, damping: 26 }}>
              <motion.div
                className="dk-3d dk-shadow relative w-full h-full"
                style={{ transformPerspective: 900 }}
                initial={false}
                animate={{ rotateY: dealt ? 0 : 180 }}
                transition={instant || !dealt ? { duration: 0 } : { duration: 0.5, delay: d + 0.08, ease: "easeInOut" }}
              >
                <Face c={c} />
                <Back style={{ transform: "rotateY(180deg)" }} />
              </motion.div>
            </motion.div>
          </motion.div>
        );
      })}

      {phase === "done" && (
        <button
          onClick={() => {
            setFocus(null);
            setHover(null);
            setRound((r) => r + 1);
          }}
          style={mobile ? { top: slots[4].y + ch / 2 + 22, left: "50%", transform: "translateX(-50%)" } : { top: 20, right: 20 }}
          className="absolute dk-mono text-[11px] uppercase tracking-[0.2em] text-[#e2c27a] border border-[#e2c27a]/50 rounded-full px-3 py-1.5 hover:bg-[#e2c27a]/10 z-[400]"
        >
          ↻ reshuffle
        </button>
      )}

      {/* ── focused card: zoom + 3D flip; swipe to draw the next ── */}
      <AnimatePresence>
        {focus !== null && (
          <motion.div key="veil" className="absolute inset-0 z-[500] bg-[#04150f]/70 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: closing ? 0 : 1 }} exit={{ opacity: 0 }} onClick={close} />
        )}
      </AnimatePresence>
      {focus !== null && (
        <div className="absolute inset-0 z-[510] pointer-events-none flex items-center justify-center" style={{ paddingBottom: mobile ? 48 : 20 }}>
          <motion.div
            className="pointer-events-auto relative"
            style={{ width: FW, height: FH, x: fx, y: fy, scale: fs, rotate: fr, opacity: fo }}
            drag={closing ? false : "x"}
            dragMomentum={false}
            onDrag={() => fr.set(fx.get() * 0.04)}
            onDragEnd={onDragEnd}
          >
            <motion.div className="dk-3d relative w-full h-full" style={{ rotateY: fry, transformPerspective: 1600, fontSize: (FW / 132) * 16 }}>
              <Face c={CHAPTERS[focus]} />
              <div className="dk-face absolute inset-0 overflow-hidden flex flex-col" style={{ transform: "rotateY(180deg)", fontSize: 16, borderRadius: 18 }}>
                <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-3 border-b border-[#d9ccaf]">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex flex-col items-center leading-none pt-0.5" style={{ color: isRed(CHAPTERS[focus]) ? RED : INK }}>
                      <span className="font-bold text-[22px]">{CHAPTERS[focus].rank}</span>
                      <span className="text-[18px]">{CHAPTERS[focus].suit}</span>
                    </div>
                    <div className="min-w-0">
                      <Sub>{CHAPTERS[focus].kicker}</Sub>
                      <div className="font-bold text-[26px] leading-tight">{CHAPTERS[focus].title}</div>
                    </div>
                  </div>
                  <button onClick={close} onPointerDown={(e) => e.stopPropagation()} className="p-1.5 rounded-full hover:bg-black/5 shrink-0" aria-label="Close">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="dk-scroll flex-1 overflow-y-auto px-6 py-4" onPointerDownCapture={(e) => (e.target as HTMLElement).closest("a,button") && e.stopPropagation()}>
                  {CHAPTERS[focus].body((p) => navigate(p))}
                </div>
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#d9ccaf] dk-mono text-[11px] text-[#7a6a4f]">
                  <button onClick={() => cycle(-1)} onPointerDown={(e) => e.stopPropagation()} className="flex items-center gap-1 px-2 py-1 rounded hover:bg-black/5">
                    <ChevronLeft className="w-4 h-4" /> prev
                  </button>
                  <span>
                    {focus + 1} / {N} · swipe to draw
                  </span>
                  <button onClick={() => cycle(1)} onPointerDown={(e) => e.stopPropagation()} className="flex items-center gap-1 px-2 py-1 rounded hover:bg-black/5">
                    next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Deck;
