import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { experiences, education, involvements } from "../../data";
import { projects } from "../../data/projects";
import { guides } from "../../data/guides";
import { milestones } from "../../data/journey";
import "./kinetic.css";

const RED = "#ff3b1f";
const INK = "#111111";
const CREAM = "#efe9dc";
const CONTACT = [
  { label: "Email", href: "mailto:jbw7@illinois.edu" },
  { label: "GitHub", href: "https://github.com/jbw9" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/jwidjajakusuma/" },
];
const pad = (n: number) => String(n).padStart(2, "0");
const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
const logo = (src: string) => (src.startsWith("/") || src.startsWith("http") ? src : `/${src}`);

// ── Scramble: characters decode left to right ──

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*@$/<>";
const Scramble = ({ text, trigger = 0, className }: { text: string; trigger?: number; className?: string }) => {
  const [out, setOut] = useState(text);
  const raf = useRef(0);
  const run = () => {
    cancelAnimationFrame(raf.current);
    const start = performance.now();
    const step = (now: number) => {
      const f = (now - start) / 28;
      const s = Array.from(text)
        .map((ch, i) => (ch === " " || f > i * 0.9 + 3 ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
        .join("");
      setOut(s);
      if (s !== text) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };
  useEffect(() => {
    if (trigger) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return (
    <span className={className} onMouseEnter={run} aria-label={text}>
      {out}
    </span>
  );
};

// ── Marquee: speed and direction follow scroll velocity ──

const Marquee = ({ items, reverse, className, sep = "✺" }: { items: string[]; reverse?: boolean; className: string; sep?: string }) => {
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let x = 0;
    let lastY = window.scrollY;
    let vel = 0;
    let dir = 1;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;
      vel += (dy - vel) * 0.15;
      if (Math.abs(dy) > 1) dir = dy > 0 ? 1 : -1;
      const el = track.current;
      if (!el) return;
      const half = el.scrollWidth / 2;
      x -= (1.1 + Math.min(Math.abs(vel) * 0.6, 40)) * dir * (reverse ? -1 : 1);
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      el.style.transform = `translate3d(${x}px,0,0)`;
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [reverse]);
  const run = items.map((t) => `${t} ${sep} `).join("");
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <div ref={track} className="inline-block will-change-transform">
        <span className="px-2">{run}</span>
        <span className="px-2">{run}</span>
      </div>
    </div>
  );
};

// ── Intro: words slam in, the screen shakes, then the whole thing crunches into the hero ──

const WORDS = ["HEY.", "I'M", "JONATHAN.", "I BUILD", "THINGS."];
const BG = [INK, CREAM, RED, INK, RED];
const FG = [CREAM, INK, CREAM, RED, INK];

const Intro = ({ onDone }: { onDone: () => void }) => {
  const [i, setI] = useState(0);
  const [crunch, setCrunch] = useState(false);
  useEffect(() => {
    const t = [
      ...WORDS.map((_, k) => setTimeout(() => setI(k), k * 420)),
      setTimeout(() => setCrunch(true), WORDS.length * 420 + 160),
      setTimeout(onDone, WORDS.length * 420 + 520),
    ];
    return () => t.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const w = WORDS[i];
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const size = Math.min((vw * 0.92) / (w.length * 0.46), vh * 0.62);
  const big = w === "JONATHAN.";
  return (
    <motion.div
      className="fixed inset-0 z-[80] overflow-hidden"
      style={{ background: BG[i] }}
      initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
      animate={crunch ? { clipPath: "inset(50% 0% 50% 0%)" } : { clipPath: "inset(0% 0% 0% 0%)" }}
      transition={{ duration: 0.38, ease: [0.7, 0, 0.3, 1] }}
    >
      <motion.div
        key={i}
        className="absolute inset-0 flex items-center justify-center"
        animate={{ x: [0, -18, 15, -10, 7, -3, 0], y: [0, 10, -12, 7, -4, 2, 0] }}
        transition={{ duration: big ? 0.45 : 0.32, delay: 0.1 }}
      >
        <motion.div
          className="k-display leading-[0.85] whitespace-nowrap"
          style={{ fontSize: size, color: FG[i] }}
          initial={{ scale: 2.8, opacity: 0, rotate: i % 2 ? 6 : -6, filter: "blur(10px)" }}
          animate={{ scale: 1, opacity: 1, rotate: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.16, ease: [0.3, 1.5, 0.5, 1] }}
        >
          {w}
        </motion.div>
      </motion.div>
      <div className="absolute bottom-6 left-6 k-mono text-xs" style={{ color: FG[i] }}>
        {pad(i + 1)}/{pad(WORDS.length)}
      </div>
      <div className="absolute top-6 right-6 k-mono text-xs" style={{ color: FG[i] }}>
        click to skip
      </div>
    </motion.div>
  );
};

// ── Sections ──

const SectionTitle = ({ n, children, light }: { n: string; children: string; light?: boolean }) => (
  <div className={`flex items-end gap-4 md:gap-8 border-b-2 pb-4 mb-10 md:mb-14 ${light ? "border-[#efe9dc]" : "border-[#111]"}`}>
    <span className="k-mono text-sm md:text-base pb-2 md:pb-4">({n})</span>
    <h2 className="k-display text-[clamp(3.5rem,13vw,12rem)] leading-[0.8]">
      <Scramble text={children} />
    </h2>
  </div>
);

const JourneyRow = ({ m, i }: { m: (typeof milestones)[number]; i: number }) => {
  const [open, setOpen] = useState(false);
  const [trig, setTrig] = useState(0);
  return (
    <div
      onMouseEnter={() => {
        setOpen(true);
        setTrig((t) => t + 1);
      }}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((o) => !o)}
      className={`relative border-b-2 border-[#111] cursor-pointer transition-colors duration-200 ${open ? "bg-[#111] text-[#efe9dc]" : ""}`}
    >
      <div className="grid grid-cols-[3rem_1fr] md:grid-cols-[7rem_1fr_14rem] items-baseline gap-x-4 px-3 md:px-6 py-4 md:py-5">
        <span className={`k-mono text-sm md:text-lg ${open ? "text-[#ff3b1f]" : ""}`}>{pad(i + 1)}</span>
        <span className="k-display text-[clamp(1.9rem,5.4vw,5rem)] leading-[0.95]">
          <Scramble text={m.short} trigger={trig} />
        </span>
        <span className="hidden md:block k-mono text-xs text-right">
          {fmt(m.date)} · vibe {m.vibe}
        </span>
      </div>
      {/* vibe bar */}
      <div className="absolute left-0 bottom-0 h-[3px] bg-[#ff3b1f] transition-all duration-500" style={{ width: open ? `${m.vibe}%` : "0%" }} />
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-[3rem_1fr] md:grid-cols-[7rem_1fr_14rem] gap-x-4 px-3 md:px-6 pb-6">
              <span className="text-4xl md:text-6xl leading-none">{m.emoji}</span>
              <div>
                <div className="text-lg md:text-2xl font-bold">{m.title}</div>
                <p className="mt-1 md:text-lg max-w-2xl opacity-80">{m.body}</p>
                <div className="md:hidden k-mono text-xs mt-2 text-[#ff3b1f]">
                  {fmt(m.date)} · vibe {m.vibe}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CARD_STYLES = [
  { bg: RED, fg: CREAM, border: INK },
  { bg: INK, fg: CREAM, border: INK },
  { bg: CREAM, fg: INK, border: INK },
];

const ExperienceStack = () => (
  <div className="relative">
    {experiences.map((e, i) => {
      const c = CARD_STYLES[i % 3];
      return (
        <div
          key={e.title + e.company}
          className="sticky mb-10 md:mb-16"
          style={{ top: 70 + i * 26 }}
        >
          <div
            className="border-2 p-5 md:p-10 min-h-[56vh] md:min-h-[62vh] flex flex-col justify-between"
            style={{ background: c.bg, color: c.fg, borderColor: c.border, boxShadow: `0 -10px 0 0 ${CREAM}`, transform: `rotate(${i % 2 ? 0.6 : -0.6}deg)` }}
          >
            <div className="flex justify-between items-start gap-4 k-mono text-xs md:text-sm">
              <span>
                ({pad(i + 1)}/{pad(experiences.length)}) — {e.period}
              </span>
              <img src={logo(e.companyIcon)} alt="" className="w-10 h-10 md:w-14 md:h-14 object-contain bg-white border-2 border-[#111] p-1" />
            </div>
            <div>
              <div className="k-display text-[clamp(2.6rem,9vw,9rem)] leading-[0.82] break-words">
                <Scramble text={e.company.replace(/\s*\(.*\)/, "")} />
              </div>
              <div className="mt-4 md:mt-6 grid md:grid-cols-[1fr_1.4fr] gap-3 md:gap-10 items-end">
                <div className="text-xl md:text-3xl font-extrabold leading-tight">{e.title}</div>
                <p className="md:text-xl leading-snug opacity-90">{e.description}</p>
              </div>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

const ProjectList = ({ onOpen }: { onOpen: (id: string) => void }) => {
  const [hover, setHover] = useState(-1);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 260, damping: 26 });
  const y = useSpring(my, { stiffness: 260, damping: 26 });
  const imgOf = (p: (typeof projects)[number]) => p.image || p.screenshots?.[0];
  const hp = hover >= 0 ? projects[hover] : null;
  return (
    <div
      className="relative border-t-2 border-[#111]"
      onMouseMove={(e) => {
        mx.set(e.clientX);
        my.set(e.clientY);
      }}
      onMouseLeave={() => setHover(-1)}
    >
      {projects.map((p, i) => (
        <button
          key={p.id}
          onMouseEnter={() => setHover(i)}
          onClick={() => onOpen(p.id)}
          className="k-row group w-full text-left border-b-2 border-[#111] grid grid-cols-[2.5rem_1fr_auto] md:grid-cols-[6rem_1fr_auto] items-center gap-x-3 md:gap-x-4 px-3 md:px-6 py-3 md:py-4 hover:bg-[#ff3b1f] hover:text-[#efe9dc] transition-colors duration-150"
        >
          <span className="k-mono text-xs md:text-base">{pad(i + 1)}</span>
          <span className="min-w-0">
            <span className="k-display block text-[clamp(2rem,7.4vw,7rem)] leading-[0.9] truncate">{p.title}</span>
            <span className="block k-mono text-[10px] md:text-xs mt-1 opacity-70 truncate">{p.technologies.slice(0, 4).join(" / ")}</span>
          </span>
          <span className="flex items-center gap-3">
            {imgOf(p) && <img src={imgOf(p)} alt="" className="md:hidden w-14 h-10 object-cover border-2 border-[#111]" />}
            <span className="k-row-arrow hidden md:block k-display text-6xl">→</span>
          </span>
        </button>
      ))}
      {/* preview follows the cursor */}
      <motion.div className="fixed left-0 top-0 z-30 pointer-events-none hidden md:block" style={{ x, y }}>
        <AnimatePresence>
          {hp && (
            <motion.div
              key={hp.id}
              initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: hover % 2 ? 4 : -4 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-[340px] border-2 border-[#111] bg-[#efe9dc]"
              style={{ boxShadow: `10px 10px 0 ${INK}` }}
            >
              {imgOf(hp) ? (
                <img src={imgOf(hp)} alt="" className="w-full aspect-[16/10] object-cover object-top" />
              ) : (
                <div className="aspect-[16/10] bg-[#111] text-[#ff3b1f] k-display text-7xl flex items-center justify-center">
                  {hp.title.split(" ").map((w) => w[0]).join("")}
                </div>
              )}
              <div className="p-3 text-sm leading-snug border-t-2 border-[#111]">{hp.description}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// ── Page ──

const Kinetic = () => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [done, setDone] = useState(!!reduce);
  const [titleTrig, setTitleTrig] = useState(0);
  const uiuc = education.find((e) => e.gpa);
  const others = education.filter((e) => !e.gpa);

  useEffect(() => {
    if (done) {
      setTitleTrig(1);
      return;
    }
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    const skip = () => setDone(true);
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    window.addEventListener("wheel", skip, { passive: true });
    return () => {
      html.style.overflow = prev;
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("wheel", skip);
    };
  }, [done]);

  const open = (id: string) => navigate(`/project/${id}`);
  const shake = { x: [0, -10, 8, -5, 3, 0], y: [0, 6, -6, 3, -2, 0] };

  return (
    <div className="v-kinetic min-h-screen">
      {!done && <Intro onDone={() => setDone(true)} />}

      {/* ── Hero ── */}
      <motion.section
        className="relative min-h-[100svh] flex flex-col k-noise"
        animate={done && !reduce ? shake : undefined}
        transition={{ duration: 0.35, delay: 0.32 }}
      >
        <header className="flex justify-between items-center px-4 md:px-8 py-4 border-b-2 border-[#111] k-mono text-[11px] md:text-xs">
          <span>J.W. — Portfolio ©{new Date().getFullYear()}</span>
          <span className="hidden md:flex gap-6">
            {["journey", "work", "projects", "school", "contact"].map((s) => (
              <button key={s} onClick={() => document.getElementById(`k-${s}`)?.scrollIntoView({ behavior: "smooth" })} className="hover:text-[#ff3b1f]">
                <Scramble text={`[${s}]`} />
              </button>
            ))}
          </span>
          <span className="md:hidden">Urbana, IL</span>
        </header>

        <div className="relative flex-1 flex flex-col justify-center px-3 md:px-6 pt-10 md:pt-6">
          <h1 className="k-display leading-[0.92] md:leading-[0.8] text-[44vw] md:text-[24.5vw] tracking-[-0.02em] flex flex-wrap md:flex-nowrap justify-center select-none" aria-label="Jonathan">
            {Array.from("JONATHAN").map((ch, i) => (
              <motion.span
                key={i}
                className="inline-block hover:text-[#ff3b1f] transition-colors"
                initial={reduce ? false : { y: "-110%", scaleY: 1.6, opacity: 0 }}
                animate={done ? { y: "0%", scaleY: 1, opacity: 1 } : undefined}
                transition={{ delay: 0.02 + i * 0.045, duration: 0.42, ease: [0.3, 1.45, 0.5, 1] }}
              >
                <Scramble text={ch} trigger={titleTrig} />
              </motion.span>
            ))}
          </h1>

          {/* stickers slapped over the name */}
          <motion.div
            initial={reduce ? false : { scale: 2.2, opacity: 0, rotate: -20 }}
            animate={done ? { scale: 1, opacity: 1, rotate: -7 } : undefined}
            transition={{ delay: 0.3, duration: 0.22, ease: [0.3, 1.5, 0.5, 1] }}
            className="absolute left-[4%] md:left-[7%] top-[4%] md:top-[10%] bg-[#ff3b1f] text-[#efe9dc] border-2 border-[#111] px-3 md:px-5 py-1.5 md:py-2 k-display text-lg md:text-4xl"
            style={{ boxShadow: `6px 6px 0 ${INK}` }}
          >
            CS &amp; Econs @ UIUC
          </motion.div>
          <motion.div
            initial={reduce ? false : { scale: 2.2, opacity: 0, rotate: 20 }}
            animate={done ? { scale: 1, opacity: 1, rotate: 5 } : undefined}
            transition={{ delay: 0.42, duration: 0.22, ease: [0.3, 1.5, 0.5, 1] }}
            className="absolute right-[4%] md:right-[8%] top-[88%] md:top-[56%] bg-[#111] text-[#efe9dc] border-2 border-[#111] px-3 md:px-5 py-1.5 md:py-2 k-display text-lg md:text-4xl"
            style={{ boxShadow: `6px 6px 0 ${RED}` }}
          >
            ☁ Incoming SDE @ AWS
          </motion.div>
          <motion.button
            onClick={() => open("taxbuddy")}
            initial={reduce ? false : { scale: 2.2, opacity: 0, rotate: -15 }}
            animate={done ? { scale: 1, opacity: 1, rotate: -3 } : undefined}
            whileHover={{ rotate: 0, scale: 1.06 }}
            transition={{ delay: 0.54, duration: 0.22, ease: [0.3, 1.5, 0.5, 1] }}
            className="absolute left-[3%] md:left-[30%] top-[45%] md:top-[68%] bg-[#efe9dc] border-2 border-[#111] px-3 md:px-4 py-1.5 md:py-2 text-left"
            style={{ boxShadow: `6px 6px 0 ${INK}` }}
          >
            <span className="flex items-center gap-2 k-mono text-[9px] md:text-[11px] text-[#ff3b1f]">
              <span className="w-2 h-2 rounded-full bg-[#ff3b1f] animate-pulse" /> now building
            </span>
            <span className="k-display text-xl md:text-3xl">TaxBuddy ↗</span>
          </motion.button>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={done ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="grid md:grid-cols-[1.3fr_1fr] gap-6 items-end px-4 md:px-8 pt-8 pb-8 md:pb-10"
        >
          <p className="text-2xl md:text-4xl font-extrabold leading-[1.05] tracking-tight max-w-2xl">
            Building software that solves <span className="bg-[#ff3b1f] text-[#efe9dc] px-1 box-decoration-clone">real problems.</span>
          </p>
          <div className="flex flex-wrap gap-3 md:justify-end">
            {CONTACT.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="k-btn bg-[#efe9dc] k-mono text-xs md:text-sm px-4 py-3 font-bold"
              >
                {c.label} ↗
              </a>
            ))}
          </div>
        </motion.div>

        <div className="relative h-28 md:h-36 mb-6">
          <Marquee
            items={["Incoming SDE @ AWS", "TaxBuddy", "UIUC", "CS & Econs", "GPA 3.90", "Ex-CTO @ Tulip", "Kafka @ scale"]}
            className="absolute inset-x-[-5%] top-4 bg-[#ff3b1f] text-[#efe9dc] k-display text-3xl md:text-5xl py-2 border-y-2 border-[#111] -rotate-[3deg]"
          />
          <Marquee
            reverse
            items={projects.map((p) => p.title)}
            sep="●"
            className="absolute inset-x-[-5%] top-14 md:top-20 bg-[#111] text-[#efe9dc] k-display text-2xl md:text-4xl py-2 rotate-[2deg]"
          />
        </div>
      </motion.section>

      {/* ── Journey ── */}
      <section id="k-journey" className="px-3 md:px-8 pt-24 md:pt-36">
        <SectionTitle n="01">Journey</SectionTitle>
        <div className="grid md:grid-cols-[1fr_2.2fr] gap-8 mb-10">
          <p className="k-mono text-xs md:text-sm max-w-xs">
            Finance major → SDE @ AWS. {milestones.length} moments. Hover a line to open it. The red bar is how cracked I felt.
          </p>
        </div>
        <div className="border-t-2 border-[#111]">
          {milestones.map((m, i) => (
            <JourneyRow key={m.date + m.short} m={m} i={i} />
          ))}
        </div>
      </section>

      {/* ── Experience ── */}
      <section id="k-work" className="px-3 md:px-8 pt-24 md:pt-36">
        <SectionTitle n="02">Work</SectionTitle>
        <ExperienceStack />
      </section>

      <Marquee
        items={["Ship it", "Break it", "Fix it", "Ship it again"]}
        className="my-16 md:my-24 bg-[#111] text-[#ff3b1f] k-display text-5xl md:text-8xl py-3 -rotate-[1.5deg] mx-[-2%]"
      />

      {/* ── Projects ── */}
      <section id="k-projects" className="px-3 md:px-8 pt-8">
        <SectionTitle n="03">Projects</SectionTitle>
        <ProjectList onOpen={open} />
      </section>

      {/* ── School + involvement: asymmetric ── */}
      <section id="k-school" className="px-3 md:px-8 pt-24 md:pt-36">
        <SectionTitle n="04">School</SectionTitle>
        <div className="grid md:grid-cols-12 gap-6 md:gap-8">
          {uiuc && (
            <div className="md:col-span-7 border-2 border-[#111] p-5 md:p-8 relative overflow-hidden">
              <div className="k-mono text-xs">{uiuc.period}</div>
              <div className="mt-2 text-2xl md:text-4xl font-extrabold leading-tight">{uiuc.degree}</div>
              <div className="text-lg">{uiuc.school}</div>
              <div className="flex items-end gap-4 mt-6">
                <span className="k-display text-[clamp(6rem,20vw,16rem)] leading-[0.8] text-[#ff3b1f]">{uiuc.gpa?.split("/")[0]}</span>
                <span className="k-mono text-sm pb-3">/ 4.0 GPA</span>
              </div>
              {uiuc.relevantCourses && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {uiuc.relevantCourses.map((c) => (
                    <span key={c} className="k-mono text-[11px] border-2 border-[#111] px-2 py-1">
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="md:col-span-5 md:mt-24 flex flex-col gap-6">
            {others.map((e) => (
              <div key={e.school} className="bg-[#111] text-[#efe9dc] p-5 md:p-6 rotate-[2deg] border-2 border-[#111]" style={{ boxShadow: `8px 8px 0 ${RED}` }}>
                <div className="flex items-center gap-3">
                  <img src={e.image} alt="" className="w-10 h-10 object-contain" />
                  <div>
                    <div className="k-display text-2xl md:text-3xl">{e.degree}</div>
                    <div className="k-mono text-[11px]">
                      {e.school} · {e.period}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {involvements.map((v, i) => (
            <div
              key={v.organization}
              className={`md:col-span-4 border-2 border-[#111] p-5 ${i === 1 ? "bg-[#ff3b1f] text-[#efe9dc] md:mt-14" : ""} ${i === 2 ? "md:-mt-6" : ""}`}
              style={{ transform: `rotate(${[-1.5, 1, -0.5][i % 3]}deg)` }}
            >
              <div className="flex items-center gap-3">
                <img src={v.image} alt="" className="w-10 h-10 object-contain bg-white border-2 border-[#111]" />
                <div className="min-w-0">
                  <div className="font-extrabold leading-tight">{v.role}</div>
                  <div className="k-mono text-[10px]">{v.period}</div>
                </div>
              </div>
              <div className="k-display text-2xl mt-4 leading-none">{v.organization}</div>
              <p className="mt-2 text-sm leading-snug">{v.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Guides ── */}
      <section className="px-3 md:px-8 pt-24 md:pt-36">
        <SectionTitle n="05">Guides</SectionTitle>
        <div className="border-t-2 border-[#111]">
          {guides.map((g) => (
            <button
              key={g.id}
              onClick={() => navigate(`/guide/${g.id}`)}
              className="k-row w-full text-left border-b-2 border-[#111] grid md:grid-cols-[12rem_1fr_auto] gap-x-6 gap-y-1 items-center px-3 md:px-6 py-5 hover:bg-[#111] hover:text-[#efe9dc] transition-colors"
            >
              <span className="k-mono text-xs">
                {g.category} / {g.publishDate}
              </span>
              <span className="text-xl md:text-3xl font-extrabold leading-tight">{g.title}</span>
              <span className="k-row-arrow hidden md:block k-display text-5xl text-[#ff3b1f]">→</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="k-contact" className="mt-24 md:mt-36 bg-[#ff3b1f] text-[#111] pt-10 pb-36 overflow-hidden">
        <Marquee items={["Say hi", "Say hi", "Say hi"]} sep="→" className="k-display text-[22vw] md:text-[16vw] leading-[0.9]" />
        <div className="px-4 md:px-8 mt-8 grid md:grid-cols-2 gap-8 items-end">
          <a href="mailto:jbw7@illinois.edu" className="k-display text-[clamp(1.8rem,5.5vw,5rem)] leading-none break-all hover:text-[#efe9dc] transition-colors">
            jbw7@illinois.edu
          </a>
          <div className="flex flex-wrap gap-3 md:justify-end">
            {CONTACT.slice(1).map((c) => (
              <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" className="k-btn bg-[#efe9dc] k-mono text-sm px-5 py-3 font-bold">
                {c.label} ↗
              </a>
            ))}
          </div>
        </div>
        <div className="px-4 md:px-8 mt-16 k-mono text-[11px] flex justify-between">
          <span>Jonathan — CS &amp; Econs @ UIUC</span>
          <span className="hidden md:inline">Set in Anton &amp; Archivo</span>
        </div>
      </section>
    </div>
  );
};

export default Kinetic;
