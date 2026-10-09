import { ReactNode } from "react";
import { motion } from "framer-motion";
import { experiences, education, involvements } from "../../data";
import { projects } from "../../data/projects";
import { guides } from "../../data/guides";
import { NameBox } from "./engine";
import { Band } from "./VibeStrip";
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

const Head = ({ n, kicker, title }: { n: string; kicker: string; title: string }) => (
  <Reveal className="mb-10 md:mb-12">
    <div className="rx-mono text-[10px] md:text-[11px] text-[#f2b35b] mb-3 flex items-center gap-3">
      <span>{n}</span>
      <span className="w-8 h-px bg-[#f2b35b]/40" />
      <span className="text-[#8f8676]">{kicker}</span>
    </div>
    <h2 className="text-[clamp(2.6rem,5.5vw,4.6rem)] font-light italic leading-[0.95]">{title}</h2>
  </Reveal>
);

const Logo = ({ src, size = "w-11 h-11" }: { src: string; size?: string }) => (
  <img src={imgOf(src)} alt="" className={`${size} rounded-md bg-white object-contain p-1 shrink-0`} />
);

type Props = {
  navH: number;
  stripH: number;
  nameBox: NameBox | null;
  done: boolean;
  fine: boolean;
  reduce: boolean;
  onOpen: (id: string) => void;
  onGuide: (id: string) => void;
  onAsk: () => void;
  onBand: (b: Band | null) => void;
};

const Sections = ({ navH, stripH, nameBox, done, fine, reduce, onOpen, onGuide, onAsk, onBand }: Props) => {
  const show = { opacity: done ? 1 : 0, y: done ? 0 : 14 };
  const col = "w-full md:w-[52%] max-w-[620px]";
  const pad = "px-5 md:pl-[7vw] md:pr-0";
  const sec = { scrollMarginTop: navH };
  return (
    <div style={{ paddingBottom: stripH }}>
      {/* ── Hero: the canvas draws the name ── */}
      <section data-shape="name" className="relative z-10 h-[100svh]">
        <h1 className="sr-only">Jonathan</h1>
        {nameBox && (
          <div className="absolute inset-x-0 flex flex-col items-center text-center px-5" style={{ top: nameBox.cy + nameBox.h / 2 + (fine ? 34 : 26) }}>
            <motion.p initial={reduce ? false : { opacity: 0, y: 14 }} animate={show} transition={{ duration: 0.9, delay: 0.35 }} className="text-[1.25rem] md:text-[1.6rem] italic text-[#cfc5b0] leading-snug max-w-2xl">
              CS &amp; Econs @ UIUC — building software that solves real problems.
            </motion.p>
            <motion.div initial={reduce ? false : { opacity: 0, y: 14 }} animate={show} transition={{ duration: 0.9, delay: 0.5 }} className="mt-5 md:mt-6 flex flex-wrap justify-center gap-2.5 rx-plain text-[11px] md:text-[12px]">
              <span className="px-3.5 py-1.5 border border-[#efe6d2]/15 bg-black/30">
                <span className="text-[#f2b35b]">☁</span> Incoming SDE @ AWS <span className="text-[#8f8676]">· Feb 2027</span>
              </span>
              <button data-card onClick={() => onOpen("taxbuddy")} className="px-3.5 py-1.5 border border-[#efe6d2]/15 bg-black/30 hover:border-[#7bd88f]/60 transition-colors flex items-center gap-2">
                <span className="relative w-1.5 h-1.5 rx-live">
                  <span className="absolute inset-0 rounded-full bg-[#7bd88f]" />
                </span>
                Building TaxBuddy <span className="text-[#8f8676]">↗</span>
              </button>
            </motion.div>
            <motion.div initial={reduce ? false : { opacity: 0, y: 14 }} animate={show} transition={{ duration: 0.9, delay: 0.65 }} className="mt-7 md:mt-8 flex flex-col items-center gap-5">
              <button
                onClick={onAsk}
                className="group rx-mono text-[11px] pl-5 pr-4 py-3 bg-[#f2b35b] text-[#0a0907] hover:bg-[#ffc978] transition-colors flex items-center gap-3 shadow-[0_0_40px_rgba(242,179,91,0.18)]"
              >
                <span className="text-sm leading-none">✻</span> Ask Claude about me
                {fine && <span className="rx-plain text-[10px] px-1.5 py-0.5 border border-[#0a0907]/30 normal-case tracking-normal">/</span>}
              </button>
              <div className="flex gap-6 rx-mono text-[10px] md:text-[11px] text-[#a99f8c]">
                {CONTACT.map((c) => (
                  <a key={c.label} href={c.href} {...ext(c.href)} className="hover:text-[#f2b35b] transition-colors">
                    {c.label}
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        )}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: done ? 1 : 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute inset-x-5 md:inset-x-8 flex justify-between items-end rx-mono text-[9px] md:text-[10px] text-[#6f675a] pointer-events-none"
          style={{ bottom: stripH + 18 }}
        >
          <span className="leading-relaxed">
            {fine ? "move to disturb" : "touch to disturb"}
            <br />
            {fine ? "click for a shockwave" : "tap for a shockwave"}
          </span>
          <span className="flex flex-col items-center gap-2">
            scroll
            <span className="w-px h-8 bg-gradient-to-b from-[#f2b35b] to-transparent" />
          </span>
        </motion.div>
      </section>

      <div className="relative z-10">
        {/* ── Experience ── */}
        <section id="rx-experience" data-shape="cloud" data-sec="experience" style={sec} className={`${pad} py-20 md:py-28`}>
          <div className={col}>
            <Head n="01" kicker="the cast" title="Experience" />
            <div className="space-y-2.5">
              {experiences.map((e, i) => {
                const st = status(e.period);
                const [from, to] = periodRange(e.period);
                return (
                  <Reveal key={e.title + e.company} delay={0.04 * i}>
                    <div
                      onPointerEnter={() => onBand({ from, to, label: `${e.period} · ${e.company.replace(/ \(.*\)/, "")}` })}
                      onPointerLeave={() => onBand(null)}
                      className={`rx-card p-4 md:p-5 flex gap-4 items-start hover:!border-[#f2b35b]/45 ${st ? "!border-[#f2b35b]/50 !bg-[#f2b35b]/[0.06]" : ""}`}
                    >
                      <Logo src={e.companyIcon} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                          <span className="text-[1.35rem] md:text-[1.5rem] italic leading-tight">{e.title}</span>
                          <span className="rx-mono text-[10px] text-[#8f8676] shrink-0">{e.period}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                          {e.website ? (
                            <a href={e.website} {...ext(e.website)} className="text-[1.05rem] text-[#cfc5b0] hover:text-[#f2b35b] transition-colors">
                              {e.company} ↗
                            </a>
                          ) : (
                            <span className="text-[1.05rem] text-[#cfc5b0]">{e.company}</span>
                          )}
                          {st && <span className="rx-mono text-[9px] px-2 py-0.5 bg-[#f2b35b] text-[#0a0907]">{st}</span>}
                        </div>
                        <p className="text-[1rem] text-[#8f8676] leading-snug mt-1.5">{e.description}</p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Projects: now playing ── */}
        <section id="rx-projects" data-shape="grid" data-sec="projects" style={sec} className="px-5 md:px-[7vw] py-20 md:py-28">
          <Head n="02" kicker="now playing" title="Projects" />
          {featured && (
            <Reveal>
              <div className="rx-card rx-poster grid md:grid-cols-[1.25fr_1fr] gap-0 !border-[#f2b35b]/30">
                <button data-card onClick={() => onOpen(featured.id)} className="rx-still aspect-[16/10] bg-black block text-left" aria-label={`Open ${featured.title}`}>
                  <img src={featured.image} alt={featured.title} className="w-full h-full object-cover object-top" />
                </button>
                <div className="p-6 md:p-8 flex flex-col">
                  <div className="rx-mono text-[10px] text-[#7bd88f] flex items-center gap-2">
                    <span className="relative w-1.5 h-1.5 rx-live">
                      <span className="absolute inset-0 rounded-full bg-[#7bd88f]" />
                    </span>
                    feature presentation · active project
                  </div>
                  <h3 className="mt-3 text-[2.6rem] md:text-[3.2rem] italic font-light leading-none">{featured.title}</h3>
                  <p className="mt-4 text-[1.1rem] text-[#cfc5b0] leading-snug">{featured.description}</p>
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {featured.technologies.slice(0, 6).map((t) => (
                      <span key={t} className="rx-plain text-[10px] px-2 py-0.5 border border-[#efe6d2]/10 text-[#a99f8c]">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto pt-6 flex flex-wrap gap-3">
                    <button data-card onClick={() => onOpen(featured.id)} className="rx-mono text-[10px] px-4 py-2.5 bg-[#efe6d2] text-[#0a0907] hover:bg-[#f2b35b] transition-colors">
                      View project →
                    </button>
                    {featured.demo && (
                      <a href={featured.demo} {...ext(featured.demo)} className="rx-mono text-[10px] px-4 py-2.5 border border-[#efe6d2]/25 hover:border-[#f2b35b] hover:text-[#f2b35b] transition-colors">
                        {featured.demo.replace(/^https?:\/\/(www\.)?/, "")} ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          )}
          <div className="mt-14 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p, i) => {
              const img = p.image || p.screenshots?.[0];
              return (
                <Reveal key={p.id} delay={(i % 3) * 0.08}>
                  <button data-card onClick={() => onOpen(p.id)} className="rx-poster text-left group w-full">
                    <div className="rx-still aspect-[16/10] bg-[#14120e] border border-[#efe6d2]/10 group-hover:border-[#f2b35b]/60 transition-colors">
                      {img ? (
                        <img src={img} alt={p.title} className="w-full h-full object-cover object-top" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl italic font-light text-[#efe6d2]/45 px-6 text-center">{p.title}</div>
                      )}
                    </div>
                    <div className="mt-3.5 flex items-baseline gap-3">
                      <span className="rx-mono text-[10px] text-[#6f675a]">{String(i + 2).padStart(2, "0")}</span>
                      <span className="text-[1.5rem] italic leading-tight group-hover:text-[#f2b35b] transition-colors">{p.title}</span>
                    </div>
                    <p className="mt-1 pl-8 text-[#8f8676] text-[1rem] leading-snug line-clamp-2">{p.description}</p>
                  </button>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ── School ── */}
        <section id="rx-school" data-shape="gpa" data-sec="school" style={sec} className={`${pad} py-20 md:py-28 md:min-h-[90vh]`}>
          <div className={col}>
            <Head n="03" kicker="on location" title="School" />
            <div className="space-y-3">
              {education.map((e) => (
                <Reveal key={e.school}>
                  <div className="rx-card p-5 md:p-6">
                    <div className="flex gap-4 items-center">
                      <img src={e.image} alt="" className="w-12 h-12 rounded-md object-contain shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-[1.35rem] italic leading-tight">{e.degree}</div>
                        <div className="text-[1rem] text-[#8f8676]">
                          {e.school} · {e.period}
                        </div>
                      </div>
                      {e.gpa && (
                        <div className="text-right shrink-0">
                          <div className="text-[2.4rem] font-light leading-none text-[#f2b35b]">{e.gpa.split("/")[0]}</div>
                          <div className="rx-mono text-[9px] text-[#8f8676] mt-1">gpa / 4.0</div>
                        </div>
                      )}
                    </div>
                    {e.relevantCourses && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {e.relevantCourses.map((c) => (
                          <span key={c} className="rx-plain text-[10px] px-2 py-0.5 border border-[#efe6d2]/10 text-[#a99f8c]">
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                    {e.description && (
                      <p className="mt-3 text-[1rem] text-[#8f8676]">
                        {e.description.split(/(https?:\/\/\S+)/).map((part, i) =>
                          part.startsWith("http") ? (
                            <a key={i} href={part} {...ext(part)} className="text-[#cfc5b0] hover:text-[#f2b35b] underline decoration-[#efe6d2]/20 underline-offset-4">
                              {part.replace(/^https?:\/\//, "")}
                            </a>
                          ) : (
                            part
                          )
                        )}
                      </p>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Involvement ── */}
        <section id="rx-involvement" data-shape="gantt" data-sec="involvement" style={sec} className={`${pad} py-20 md:py-28 md:min-h-[90vh]`}>
          <div className={col}>
            <Head n="04" kicker="supporting roles" title="Involvement" />
            <div className="space-y-2.5">
              {involvements.map((v, i) => {
                const [from, to] = periodRange(v.period);
                return (
                  <Reveal key={v.organization} delay={0.05 * i}>
                    <div
                      onPointerEnter={() => onBand({ from, to, label: `${v.period} · ${v.organization}` })}
                      onPointerLeave={() => onBand(null)}
                      className="rx-card p-4 md:p-5 hover:!border-[#f2b35b]/45"
                    >
                      <div className="flex gap-4 items-center">
                        <Logo src={v.image} size="w-10 h-10" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                            <span className="text-[1.3rem] italic leading-tight">{v.role}</span>
                            <span className="rx-mono text-[10px] text-[#8f8676]">{v.period}</span>
                          </div>
                          <div className="text-[1rem] text-[#cfc5b0]">{v.organization}</div>
                        </div>
                      </div>
                      <p className="mt-3 text-[1rem] text-[#8f8676] leading-snug">{v.description}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Guides + contact ── */}
        <section id="rx-guides" data-shape="sphere" data-sec="guides" style={sec} className={`${pad} pt-20 md:pt-28 pb-16`}>
          <div className={col}>
            <Head n="05" kicker="director's commentary" title="Guides" />
            <div className="border-t border-[#efe6d2]/10">
              {guides.map((g) => (
                <Reveal key={g.id}>
                  <button data-card onClick={() => onGuide(g.id)} className="group w-full text-left py-5 border-b border-[#efe6d2]/10 flex items-baseline gap-4">
                    <span className="flex-1 min-w-0">
                      <span className="block rx-mono text-[9px] text-[#8f8676]">
                        {g.category} · {g.publishDate}
                      </span>
                      <span className="block text-[1.45rem] md:text-[1.65rem] italic leading-tight mt-1 group-hover:text-[#f2b35b] transition-colors">{g.title}</span>
                      <span className="block text-[1rem] text-[#8f8676] mt-1 line-clamp-1">{g.description}</span>
                    </span>
                    <span className="hidden md:block rx-mono text-[10px] text-[#8f8676] group-hover:text-[#f2b35b] group-hover:translate-x-1 transition">read →</span>
                  </button>
                </Reveal>
              ))}
            </div>

            <Reveal className="mt-24 md:mt-32">
              <div className="rx-mono text-[10px] md:text-[11px] text-[#f2b35b] mb-3">— contact —</div>
              <h2 className="text-[clamp(3rem,6.5vw,5.4rem)] font-light italic leading-[0.95]">Let's talk.</h2>
              <p className="mt-5 text-[1.2rem] md:text-[1.35rem] text-[#cfc5b0] leading-snug max-w-lg">
                Incoming software engineer at <em className="text-[#f2b35b]">Amazon Web Services</em> (MSK), currently building <em className="text-[#f2b35b]">TaxBuddy</em>.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {CONTACT.map((c) => (
                  <a
                    key={c.label}
                    href={c.href}
                    {...ext(c.href)}
                    className={`rx-mono text-[10px] md:text-[11px] px-5 py-3 transition-colors ${
                      c.label === "Email" ? "bg-[#efe6d2] text-[#0a0907] hover:bg-[#f2b35b]" : "border border-[#efe6d2]/25 hover:border-[#f2b35b] hover:text-[#f2b35b]"
                    }`}
                  >
                    {c.label === "Email" ? "jbw7@illinois.edu" : `${c.label} ↗`}
                  </a>
                ))}
                <button onClick={onAsk} className="rx-mono text-[10px] md:text-[11px] px-5 py-3 border border-[#f2b35b]/50 text-[#f2b35b] hover:bg-[#f2b35b] hover:text-[#0a0907] transition-colors">
                  ✻ Ask Claude
                </button>
              </div>
              <div className="mt-24 md:mt-28 italic text-2xl text-[#6f675a]">fin.</div>
            </Reveal>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Sections;
