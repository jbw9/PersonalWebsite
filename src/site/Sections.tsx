import { ReactNode, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { IconBrandGithub, IconBrandLinkedin, IconMail } from "@tabler/icons-react";
import { experiences, education, involvements } from "../data";
import { projects } from "../data/projects";
import { guides } from "../data/guides";
import { GlobeBox } from "./contracts";
import HeroCurve from "./HeroCurve";
import { CONTACT, periodRange } from "./timeline";

export const SECTIONS = [
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "school", label: "School" },
  { id: "involvement", label: "Involvement" },
  { id: "guides", label: "Guides" },
];

const featured = projects.find((p) => p.id === "taxbuddy");
const rest = projects.filter((p) => p.id !== "taxbuddy");
const ext = (href: string) => (href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {});
const imgOf = (src: string) => (src.startsWith("http") || src.startsWith("data:") || src.startsWith("/") ? src : `/${src}`);
const ICONS: Record<string, typeof IconMail> = { Email: IconMail, GitHub: IconBrandGithub, LinkedIn: IconBrandLinkedin };
const status = (period: string) => {
  const [a, b] = periodRange(period);
  const now = Date.now();
  return a > now ? "upcoming" : b > now ? "current" : "";
};

const Reveal = ({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.8, delay, ease: [0.2, 0.7, 0.2, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const Head = ({ n, title }: { n: string; title: string }) => (
  <Reveal className="mb-10 md:mb-12">
    <div className="rx-mono text-[10px] md:text-[11px] text-[#5b9cff] mb-3 flex items-center gap-3">
      <span>{n}</span>
      <span className="w-8 h-px rounded-full bg-[#5b9cff]/40" />
    </div>
    <h2 className="text-[clamp(2.6rem,5.5vw,4.6rem)] font-light italic leading-[0.95]">{title}</h2>
  </Reveal>
);

const Logo = ({ src, size = "w-11 h-11" }: { src: string; size?: string }) => (
  <img src={imgOf(src)} alt="" className={`${size} rounded-xl bg-white object-contain p-1 shrink-0`} />
);

// Experience as a git graph: one branch, newest commit on top, the line draws itself as you scroll
const Timeline = () => {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 55%"] });
  const grow = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return (
    <ol ref={ref} className="relative">
      <span className="absolute left-[15px] top-3 bottom-3 w-px rounded-full bg-[#e6ecf5]/[0.08]" />
      <motion.span
        className="absolute left-[15px] top-3 bottom-3 w-px rounded-full origin-top"
        style={{ scaleY: grow, background: "linear-gradient(#bcd7ff, #5b9cff 40%, rgba(91,156,255,0.25))", boxShadow: "0 0 12px rgba(91,156,255,0.6)" }}
      />
      {experiences.map((e, i) => {
        const st = status(e.period);
        return (
          <li key={e.title + e.company} className="relative grid grid-cols-[32px_1fr] gap-3 md:gap-4">
            <span className="relative flex justify-center pt-[1.55rem]">
              {st && <span className="absolute top-[1.55rem] w-3.5 h-3.5 rounded-full bg-[#5b9cff] rx-ping" />}
              <span
                className={`relative w-3.5 h-3.5 rounded-full border-2 ${
                  st ? "bg-[#5b9cff] border-[#bcd7ff] shadow-[0_0_14px_rgba(91,156,255,0.9)]" : "bg-[#070b14] border-[#5b9cff]/70"
                }`}
              />
            </span>
            <Reveal delay={0.04 * i}>
              <div className="group rounded-3xl px-4 md:px-5 py-4 -ml-1 transition-colors hover:bg-[#e6ecf5]/[0.035]">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="rx-mono text-[10px] text-[#8692a8]">{e.period}</span>
                  {st && <span className="rx-mono text-[9px] px-2.5 py-0.5 rounded-full bg-[#5b9cff] text-[#070b14]">{i === 0 ? "head · " : ""}{st}</span>}
                </div>
                <div className="mt-1 text-[1.4rem] md:text-[1.55rem] italic leading-tight">{e.title}</div>
                <div className="mt-1.5 flex items-center gap-2.5">
                  <Logo src={e.companyIcon} size="w-7 h-7" />
                  {e.website ? (
                    <a href={e.website} {...ext(e.website)} className="text-[1.08rem] text-[#c2cbdb] hover:text-[#5b9cff] transition-colors">
                      {e.company} ↗
                    </a>
                  ) : (
                    <span className="text-[1.08rem] text-[#c2cbdb]">{e.company}</span>
                  )}
                </div>
                <p className="text-[1rem] text-[#8692a8] leading-snug mt-2">{e.description}</p>
              </div>
            </Reveal>
          </li>
        );
      })}
    </ol>
  );
};

// A card that shows a photo on hover (tap on touch); the hint only appears once the photo loads
const PhotoPeek = ({ src, caption, children }: { src: string; caption: string; children: ReactNode }) => {
  const [ok, setOk] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const img = new Image();
    img.onload = () => setOk(true);
    img.src = src;
  }, [src]);
  if (!ok) return <>{children}</>;
  return (
    <div className="relative cursor-pointer" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onClick={() => setOpen((o) => !o)} data-card>
      {children}
      <span className="absolute top-4 right-4 rx-chip bg-[#070b14]/70 pointer-events-none">📷 photo</span>
      <AnimatePresence>
        {open && (
          <div className="absolute z-20 left-1/2 -translate-x-1/2 bottom-[calc(100%-12px)] md:left-[calc(100%+32px)] md:translate-x-0 md:bottom-auto md:top-[-30px] pointer-events-none">
            <motion.figure
              initial={{ opacity: 0, y: 16, rotate: -8, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, rotate: -3, scale: 1 }}
              exit={{ opacity: 0, y: 10, rotate: -6, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              className="w-[260px] md:w-[320px] p-2.5 pb-3 rounded-[22px] bg-[#e6ecf5] shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
            >
              <img src={src} alt={caption} className="w-full rounded-2xl object-cover" />
              <figcaption className="mt-2 text-center italic text-[1.05rem] text-[#070b14]">{caption}</figcaption>
            </motion.figure>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

type Props = {
  vw: number;
  navH: number;
  globe: GlobeBox | null;
  done: boolean;
  fine: boolean;
  reduce: boolean;
  onOpen: (id: string) => void;
  onGuide: (id: string) => void;
  onAsk: () => void;
  onPick: (i: number) => void; // a moment on the vibe line → Story at that scene
};

const Sections = ({ vw, navH, globe, done, fine, reduce, onOpen, onGuide, onAsk, onPick }: Props) => {
  const show = { opacity: done ? 1 : 0, y: done ? 0 : 14 };
  const wide = vw >= 768;
  const col = "w-full md:w-[52%] max-w-[620px]";
  const pad = "px-5 md:pl-[7vw] md:pr-0";
  const sec = { scrollMarginTop: navH };
  return (
    <div>
      {/* ── Hero: the canvas draws the name ── */}
      <section data-shape="globe" className="relative z-10 h-[100svh]">
        {globe && (
          // desktop: a column left of the globe, centred on it; phone: centred below it
          <div
            className={`absolute flex flex-col ${wide ? "items-start text-left" : "inset-x-0 items-center text-center px-5"}`}
            style={wide ? { left: "7vw", width: Math.min(globe.cx - globe.r - vw * 0.07 - 32, 600), top: globe.cy, transform: "translateY(-50%)" } : { top: globe.cy + globe.r + 30 }}
          >
            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={show}
              transition={{ duration: 0.9, delay: 0.3 }}
              className="text-[2.5rem] md:text-[clamp(2.8rem,4.2vw,3.9rem)] font-light italic leading-[1.02]"
            >
              Hi, I'm Jonathan.
            </motion.h1>
            <motion.p initial={reduce ? false : { opacity: 0, y: 14 }} animate={show} transition={{ duration: 0.9, delay: 0.4 }} className="mt-3 text-[1.2rem] md:text-[1.45rem] italic text-[#c2cbdb] leading-snug max-w-xl">
              CS &amp; Econs @ UIUC — building software that <span className="whitespace-nowrap">solves real problems.</span>
            </motion.p>
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={show}
              transition={{ duration: 0.9, delay: 0.5 }}
              className={`mt-3 rx-plain text-[11px] md:text-[12px] text-[#8692a8] flex flex-wrap items-center gap-x-3 gap-y-1 ${wide ? "" : "justify-center"}`}
            >
              <span>Incoming SDE @ AWS</span>
              <span className="w-1 h-1 rounded-full bg-[#8692a8]/50" />
              <button data-card onClick={() => onOpen("taxbuddy")} className="hover:text-[#e6ecf5] transition-colors">
                building TaxBuddy ↗
              </button>
            </motion.div>
            <motion.div initial={reduce ? false : { opacity: 0, y: 14 }} animate={show} transition={{ duration: 0.9, delay: 0.65 }} className="mt-7 md:mt-8 flex items-center gap-2.5">
              <button onClick={onAsk} className="rx-btn whitespace-nowrap">
                <span className="text-sm leading-none">✻</span> Ask Alfred<span className="hidden sm:inline -ml-1"> about me</span>
                {fine && <span className="text-[10px] w-5 h-5 rounded-full border border-[#070b14]/30 flex items-center justify-center">/</span>}
              </button>
              {CONTACT.map((c) => {
                const Icon = ICONS[c.label];
                return (
                  <a
                    key={c.label}
                    href={c.href}
                    {...ext(c.href)}
                    aria-label={c.label}
                    title={c.label}
                    className="w-11 h-11 rounded-full border border-[#e6ecf5]/15 bg-black/30 flex items-center justify-center text-[#c2cbdb] hover:text-[#5b9cff] hover:border-[#5b9cff]/60 transition-colors"
                  >
                    <Icon size={18} stroke={1.6} />
                  </a>
                );
              })}
            </motion.div>
          </div>
        )}
        {/* the vibe line runs along the foot of the hero, part of the same frame */}
        <div className="absolute inset-x-0" style={{ bottom: vw >= 768 ? 4 : 44 }}>
          <HeroCurve vw={vw} done={done} reduce={reduce} onPick={onPick} />
        </div>
      </section>

      <div className="relative z-10">
        {/* ── Experience ── */}
        <section id="rx-experience" data-shape="cloud" data-sec="experience" style={sec} className={`${pad} py-20 md:py-28`}>
          <div className={col}>
            <Head n="01" title="Experience" />
            <Timeline />
          </div>
        </section>

        {/* ── Projects: the particles trace every [data-frame] ── */}
        <section id="rx-projects" data-shape="frames" data-sec="projects" style={sec} className="px-5 md:px-[7vw] py-20 md:py-28">
          <Head n="02" title="Projects" />
          {featured && (
            <Reveal>
              <div data-frame="28" className="rx-card rx-poster !rounded-[28px] overflow-hidden grid md:grid-cols-[1.25fr_1fr] !border-[#5b9cff]/25">
                <button data-card onClick={() => onOpen(featured.id)} className="rx-still aspect-[16/10] bg-black block text-left" aria-label={`Open ${featured.title}`}>
                  <img src={featured.image} alt={featured.title} className="w-full h-full object-cover object-top" />
                </button>
                <div className="p-6 md:p-9 flex flex-col">
                  <div className="rx-mono text-[10px] text-[#7bd88f] flex items-center gap-2">
                    <span className="relative w-1.5 h-1.5 rx-live">
                      <span className="absolute inset-0 rounded-full bg-[#7bd88f]" />
                    </span>
                    active project
                  </div>
                  <h3 className="mt-3 text-[2.6rem] md:text-[3.2rem] italic font-light leading-none">{featured.title}</h3>
                  <p className="mt-4 text-[1.1rem] text-[#c2cbdb] leading-snug">{featured.description}</p>
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {featured.technologies.slice(0, 6).map((t) => (
                      <span key={t} className="rx-chip">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto pt-7 flex flex-wrap gap-2.5">
                    <button data-card onClick={() => onOpen(featured.id)} className="rx-btn">
                      View project →
                    </button>
                    {featured.demo && (
                      <a href={featured.demo} {...ext(featured.demo)} className="rx-btn-ghost">
                        {featured.demo.replace(/^https?:\/\/(www\.)?/, "")} ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          )}
          <div className="mt-14 grid gap-x-7 gap-y-11 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p, i) => {
              const img = p.image || p.screenshots?.[0];
              return (
                <Reveal key={p.id} delay={(i % 3) * 0.08}>
                  <button data-card onClick={() => onOpen(p.id)} className="rx-poster text-left group w-full">
                    <div data-frame="22" className="rx-still aspect-[16/10] rounded-[22px] bg-[#0f1626] border border-[#e6ecf5]/10 group-hover:border-[#5b9cff]/60 transition-colors">
                      {img ? (
                        <img src={img} alt={p.title} className="w-full h-full object-cover object-top" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl italic font-light text-[#e6ecf5]/45 px-6 text-center">{p.title}</div>
                      )}
                    </div>
                    <div className="mt-4 px-1 flex items-baseline gap-3">
                      <span className="rx-mono text-[10px] text-[#5d687c]">{String(i + 2).padStart(2, "0")}</span>
                      <span className="text-[1.5rem] italic leading-tight group-hover:text-[#5b9cff] transition-colors">{p.title}</span>
                    </div>
                    <p className="mt-1 pl-9 pr-1 text-[#8692a8] text-[1rem] leading-snug line-clamp-2">{p.description}</p>
                  </button>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ── School ── */}
        <section id="rx-school" data-shape="gpa" data-sec="school" style={sec} className={`${pad} py-20 md:py-28 md:min-h-[90vh]`}>
          <div className={col}>
            <Head n="03" title="School" />
            <div className="space-y-4">
              {education.map((e) => {
                const card = (
                  <div className="rx-card p-5 md:p-7">
                    <div className="flex gap-4 items-center">
                      <img src={imgOf(e.image)} alt="" className="w-12 h-12 rounded-xl object-contain shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-[1.35rem] italic leading-tight">{e.degree}</div>
                        <div className="text-[1rem] text-[#8692a8]">
                          {e.school} · {e.period}
                        </div>
                      </div>
                      {e.gpa && (
                        <div className="text-right shrink-0">
                          <div className="text-[2.4rem] font-light leading-none text-[#5b9cff]">{e.gpa.split("/")[0]}</div>
                          <div className="rx-mono text-[9px] text-[#8692a8] mt-1">gpa / 4.0</div>
                        </div>
                      )}
                    </div>
                    {e.relevantCourses && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {e.relevantCourses.map((c) => (
                          <span key={c} className="rx-chip">
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                    {e.description && (
                      <p className="mt-3 text-[1rem] text-[#8692a8]">
                        {e.description.split(/(https?:\/\/\S+)/).map((part, i) =>
                          part.startsWith("http") ? (
                            <a key={i} href={part} {...ext(part)} className="text-[#c2cbdb] hover:text-[#5b9cff] underline decoration-[#e6ecf5]/20 underline-offset-4">
                              {part.replace(/^https?:\/\//, "")}
                            </a>
                          ) : (
                            part
                          )
                        )}
                      </p>
                    )}
                  </div>
                );
                return (
                  <Reveal key={e.school}>
                    {e.photo ? (
                      <PhotoPeek src={e.photo} caption={`${e.degree} · ${e.period}`}>
                        {card}
                      </PhotoPeek>
                    ) : (
                      card
                    )}
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Involvement ── */}
        <section id="rx-involvement" data-shape="people" data-sec="involvement" style={sec} className={`${pad} py-20 md:py-28 md:min-h-[90vh]`}>
          <div className={col}>
            <Head n="04" title="Involvement" />
            <div className="space-y-3">
              {involvements.map((v, i) => (
                <Reveal key={v.organization} delay={0.05 * i}>
                  <div className="rx-card p-5 md:p-6 hover:!border-[#5b9cff]/40">
                    <div className="flex gap-4 items-center">
                      <Logo src={v.image} size="w-10 h-10" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                          <span className="text-[1.3rem] italic leading-tight">{v.role}</span>
                          <span className="rx-mono text-[10px] text-[#8692a8]">{v.period}</span>
                        </div>
                        <div className="text-[1rem] text-[#c2cbdb]">{v.organization}</div>
                      </div>
                    </div>
                    <p className="mt-3 text-[1rem] text-[#8692a8] leading-snug">{v.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Guides + contact ── */}
        <section id="rx-guides" data-shape="book" data-sec="guides" style={sec} className={`${pad} pt-20 md:pt-28 pb-16`}>
          <div className={col}>
            <Head n="05" title="Guides" />
            <div className="space-y-2">
              {guides.map((g) => (
                <Reveal key={g.id}>
                  <button data-card onClick={() => onGuide(g.id)} className="group w-full text-left rounded-3xl px-5 py-5 -mx-5 flex items-center gap-5 transition-colors hover:bg-[#e6ecf5]/[0.04]">
                    <span className="flex-1 min-w-0">
                      <span className="block rx-mono text-[9px] text-[#8692a8]">
                        {g.category} · {g.publishDate}
                      </span>
                      <span className="block text-[1.45rem] md:text-[1.65rem] italic leading-tight mt-1 group-hover:text-[#5b9cff] transition-colors">{g.title}</span>
                      <span className="block text-[1rem] text-[#8692a8] mt-1 line-clamp-1">{g.description}</span>
                    </span>
                    <span className="hidden md:flex w-10 h-10 shrink-0 rounded-full border border-[#e6ecf5]/15 items-center justify-center text-[#8692a8] transition-colors group-hover:bg-[#5b9cff] group-hover:border-[#5b9cff] group-hover:text-[#070b14]">
                      →
                    </span>
                  </button>
                </Reveal>
              ))}
            </div>

            <Reveal className="mt-24 md:mt-32">
              <div className="rx-mono text-[10px] md:text-[11px] text-[#5b9cff] mb-3">— contact —</div>
              <h2 className="text-[clamp(3rem,6.5vw,5.4rem)] font-light italic leading-[0.95]">Let's talk.</h2>
              <p className="mt-5 text-[1.2rem] md:text-[1.35rem] text-[#c2cbdb] leading-snug max-w-lg">
                Incoming software engineer at <em className="text-[#5b9cff]">Amazon Web Services</em> (MSK), currently building <em className="text-[#5b9cff]">TaxBuddy</em>.
              </p>
              <div className="mt-8 flex flex-wrap gap-2.5">
                {CONTACT.map((c) =>
                  c.label === "Email" ? (
                    <a key={c.label} href={c.href} className="rx-btn">
                      jbw7@illinois.edu
                    </a>
                  ) : (
                    <a key={c.label} href={c.href} {...ext(c.href)} className="rx-btn-ghost">
                      {c.label} ↗
                    </a>
                  )
                )}
                <button onClick={onAsk} className="rx-btn-ghost !border-[#5b9cff]/50 !text-[#5b9cff]">
                  ✻ Ask Alfred
                </button>
              </div>
              <div className="mt-24 md:mt-28 italic text-2xl text-[#5d687c]">fin.</div>
            </Reveal>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Sections;
