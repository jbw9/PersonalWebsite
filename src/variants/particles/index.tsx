import { ReactNode, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ArrowUpRight, Github, Linkedin, Mail } from "lucide-react";
import { experiences, education, involvements } from "../../data";
import { projects } from "../../data/projects";
import { guides } from "../../data/guides";
import { milestones } from "../../data/journey";
import { createField, Field, NameBox, ShapeKey } from "./engine";
import "./particles.css";

const CONTACT = [
  { label: "Email", href: "mailto:jbw7@illinois.edu", Icon: Mail },
  { label: "GitHub", href: "https://github.com/jbw9", Icon: Github },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/jwidjajakusuma/", Icon: Linkedin },
];
const aws = experiences.filter((e) => e.company.includes("AWS"));
const taxbuddy = projects.find((p) => p.id === "taxbuddy");
const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });

// ── Small interaction pieces ──

const Magnetic = ({ children, className, href, onClick }: { children: ReactNode; className: string; href?: string; onClick?: () => void }) => {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 15 });
  const y = useSpring(my, { stiffness: 220, damping: 15 });
  const move = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left - r.width / 2) * 0.35);
    my.set((e.clientY - r.top - r.height / 2) * 0.35);
  };
  const leave = () => {
    mx.set(0);
    my.set(0);
  };
  const props = { style: { x, y }, onPointerMove: move, onPointerLeave: leave, className, "data-magnetic": true };
  return href ? (
    <motion.a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" {...props}>
      {children}
    </motion.a>
  ) : (
    <motion.button onClick={onClick} {...props}>
      {children}
    </motion.button>
  );
};

const Cursor = ({ root }: { root: React.RefObject<HTMLDivElement> }) => {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const p = { x: -100, y: -100, rx: -100, ry: -100, s: 1, ts: 1, on: false };
    const move = (e: PointerEvent) => {
      p.x = e.clientX;
      p.y = e.clientY;
      const t = e.target as HTMLElement;
      p.on = !!root.current && root.current.contains(t);
      p.ts = t.closest && t.closest("a,button,[data-magnetic]") ? 2.2 : 1;
    };
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      p.rx += (p.x - p.rx) * 0.18;
      p.ry += (p.y - p.ry) * 0.18;
      p.s += (p.ts - p.s) * 0.15;
      if (dot.current && ring.current) {
        dot.current.style.transform = `translate(${p.x}px, ${p.y}px)`;
        ring.current.style.transform = `translate(${p.rx}px, ${p.ry}px) scale(${p.s})`;
        dot.current.style.opacity = ring.current.style.opacity = p.on ? "1" : "0";
      }
    };
    window.addEventListener("pointermove", move);
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
    };
  }, [root]);
  return (
    <>
      <div ref={dot} className="fixed left-0 top-0 z-[90] w-1.5 h-1.5 -ml-[3px] -mt-[3px] rounded-full bg-white pointer-events-none" />
      <div ref={ring} className="fixed left-0 top-0 z-[90] w-9 h-9 -ml-[18px] -mt-[18px] rounded-full border border-[#96cdff]/60 pointer-events-none mix-blend-difference" />
    </>
  );
};

const Reveal = ({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.9, delay, ease: [0.2, 0.7, 0.2, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const Kicker = ({ n, label }: { n: string; label: string }) => (
  <div className="pt-mono text-[11px] uppercase text-[#7d8597] mb-5 flex items-center gap-3">
    <span className="text-[#96cdff]">{n}</span>
    <span className="w-8 h-px bg-white/20" />
    {label}
  </div>
);

// ── Page ──

const Particles = () => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const field = useRef<Field | null>(null);
  const [nameBox, setNameBox] = useState<NameBox | null>(null);
  const [done, setDone] = useState(!!reduce);
  const [fine] = useState(() => window.matchMedia("(pointer: fine)").matches);
  const [focus, setFocus] = useState(-1);

  useEffect(() => {
    const f = createField(canvasRef.current as HTMLCanvasElement, {
      reduce: !!reduce,
      onNameBox: setNameBox,
      onIntroDone: () => setDone(true),
    });
    field.current = f;
    return () => {
      f.destroy();
      field.current = null;
    };
  }, [reduce]);

  // intro: scroll locked, any input skips; afterwards clicks on empty space send a shockwave
  useEffect(() => {
    if (done) {
      const shock = (e: PointerEvent) => {
        const t = e.target as HTMLElement;
        if (!rootRef.current?.contains(t) || t.closest("a,button,[data-card]")) return;
        field.current?.shock(e.clientX, e.clientY);
      };
      window.addEventListener("pointerdown", shock);
      return () => window.removeEventListener("pointerdown", shock);
    }
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    const skip = () => {
      field.current?.skipIntro();
      setDone(true);
    };
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

  // the section crossing the middle of the screen decides what the particles become
  useEffect(() => {
    const onScroll = () => {
      const mid = window.innerHeight * 0.5;
      const secs = Array.from(document.querySelectorAll<HTMLElement>(".v-particles [data-shape]"));
      const hit = secs.find((s) => {
        const r = s.getBoundingClientRect();
        return r.top <= mid && r.bottom > mid;
      });
      field.current?.setShape(((hit && hit.dataset.shape) || "name") as ShapeKey);
      const items = Array.from(document.querySelectorAll<HTMLElement>(".v-particles [data-milestone]"));
      let f = -1;
      items.forEach((el, i) => {
        if (el.getBoundingClientRect().top < mid) f = i;
      });
      field.current?.setFocus(f);
      setFocus(f);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openProject = (id: string) => navigate(`/project/${id}`);
  const heroTop = nameBox ? nameBox.cy + nameBox.h / 2 + 34 : 0;
  const show = { opacity: done ? 1 : 0, y: done ? 0 : 16 };

  return (
    <div ref={rootRef} className={`v-particles relative min-h-screen ${fine ? "pt-fine" : ""}`}>
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
      {fine && <Cursor root={rootRef} />}

      {/* ── Hero: the canvas draws the name ── */}
      <section data-shape="name" className="relative z-10 h-[100svh]">
        <h1 className="sr-only">Jonathan</h1>
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: done ? 1 : 0 }}
          transition={{ duration: 1 }}
          className="absolute top-0 inset-x-0 flex justify-between items-center px-5 md:px-10 py-5"
        >
          <span className="text-sm font-semibold tracking-tight">
            jonathan<span className="text-[#96cdff]">.</span>
          </span>
          <div className="hidden md:flex gap-8 pt-mono text-[11px] uppercase text-[#7d8597]">
            {[
              ["now", "now"],
              ["journey", "journey"],
              ["work", "work"],
              ["projects", "projects"],
              ["contact", "contact"],
            ].map(([l, id]) => (
              <button key={id} onClick={() => document.getElementById(`pt-${id}`)?.scrollIntoView({ behavior: "smooth" })} className="hover:text-white transition-colors">
                {l}
              </button>
            ))}
          </div>
        </motion.nav>

        {nameBox && (
          <div className="absolute inset-x-0 flex flex-col items-center text-center px-5" style={{ top: heroTop }}>
            <motion.p animate={show} initial={{ opacity: 0, y: 16 }} transition={{ duration: 0.9, delay: reduce ? 0 : 0.1 }} className="text-[15px] md:text-lg text-[#aab1c2] font-light max-w-xl">
              CS &amp; Econs @ UIUC — building software that solves real problems.
            </motion.p>
            <motion.div animate={show} initial={{ opacity: 0, y: 16 }} transition={{ duration: 0.9, delay: reduce ? 0 : 0.25 }} className="mt-5 flex flex-wrap justify-center gap-2.5">
              <span className="pt-glass !rounded-full px-4 py-1.5 text-[13px]">
                <span className="text-[#96cdff]">☁</span> Incoming SDE @ AWS
              </span>
              <button data-magnetic onClick={() => openProject("taxbuddy")} className="pt-glass pt-hover !rounded-full px-4 py-1.5 text-[13px] flex items-center gap-2">
                <span className="relative w-1.5 h-1.5 pt-live">
                  <span className="absolute inset-0 rounded-full bg-[#5eead4]" />
                </span>
                Building TaxBuddy <ArrowUpRight className="w-3.5 h-3.5 text-[#7d8597]" />
              </button>
            </motion.div>
            <motion.div animate={show} initial={{ opacity: 0, y: 16 }} transition={{ duration: 0.9, delay: reduce ? 0 : 0.4 }} className="mt-7 flex gap-3">
              {CONTACT.map(({ label, href, Icon }) => (
                <Magnetic key={label} href={href} className="w-12 h-12 rounded-full border border-white/15 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                  <Icon className="w-[18px] h-[18px]" />
                  <span className="sr-only">{label}</span>
                </Magnetic>
              ))}
            </motion.div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: done ? 1 : 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="absolute left-5 md:left-10 bottom-24 md:bottom-8 pt-mono text-[10px] uppercase text-[#7d8597] leading-relaxed"
        >
          {fine ? "move to disturb" : "touch to disturb"}
          <br />
          {fine ? "click for a shockwave" : "tap for a shockwave"}
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: done ? 1 : 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="absolute right-5 md:right-10 bottom-24 md:bottom-8 flex flex-col items-center gap-2 pt-mono text-[10px] uppercase text-[#7d8597]"
        >
          scroll
          <span className="w-px h-10 bg-gradient-to-b from-[#96cdff] to-transparent pt-scrollline" />
        </motion.div>
      </section>

      <div className="relative z-10">
        {/* ── Now: AWS cloud ── */}
        <section id="pt-now" data-shape="cloud" className="min-h-[100svh] flex items-center px-5 md:pl-[7vw] py-24">
          <div className="w-full md:w-[42%] max-w-xl">
            <Reveal>
              <Kicker n="01" label="now" />
              <h2 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.02]">
                Headed for <span className="pt-grad">the cloud.</span>
              </h2>
            </Reveal>
            <div className="mt-10 space-y-3">
              {aws.map((e, i) => (
                <Reveal key={e.title} delay={0.1 * i}>
                  <div className="pt-glass p-5 flex items-center gap-4">
                    <img src={e.companyIcon} alt="" className="w-11 h-11 rounded-xl bg-white object-contain p-1.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{e.title}</div>
                      <div className="text-sm text-[#7d8597]">{e.description}</div>
                    </div>
                    <div className="pt-mono text-[11px] text-[#96cdff] text-right shrink-0">{e.period.split(" - ")[0]}</div>
                  </div>
                </Reveal>
              ))}
              {taxbuddy && (
                <Reveal delay={0.2}>
                  <button data-card onClick={() => openProject("taxbuddy")} className="pt-glass pt-hover p-5 w-full text-left group">
                    <div className="flex items-center gap-2 pt-mono text-[10px] uppercase text-[#5eead4] mb-2">
                      <span className="relative w-1.5 h-1.5 pt-live">
                        <span className="absolute inset-0 rounded-full bg-[#5eead4]" />
                      </span>
                      active project
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xl font-semibold">{taxbuddy.title}</div>
                        <p className="text-sm text-[#aab1c2] mt-1.5 leading-relaxed">{taxbuddy.description}</p>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-[#7d8597] group-hover:text-white group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition shrink-0" />
                    </div>
                  </button>
                </Reveal>
              )}
            </div>
          </div>
        </section>

        {/* ── Journey: the vibe curve ── */}
        <section id="pt-journey" data-shape="curve" className="px-5 md:pl-[7vw] py-24 md:py-40">
          <div className="w-full md:w-[42%] max-w-xl">
            <Reveal>
              <Kicker n="02" label="journey" />
              <h2 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.02]">
                Finance major <span className="pt-grad">→ AWS.</span>
              </h2>
              <p className="mt-5 text-[#aab1c2] font-light">
                The line is how cracked I felt, week by week. Scroll and it follows along.
              </p>
            </Reveal>
            <div className="mt-12 relative">
              <div className="absolute left-[19px] top-2 bottom-2 w-px bg-white/10" />
              {milestones.map((m, i) => (
                <div key={m.date + m.short} data-milestone className="relative pl-14 py-5">
                  <div
                    className={`absolute left-0 top-5 w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-500 ${
                      i === focus ? "bg-[#96cdff]/15 border border-[#96cdff]/60 scale-110" : "bg-[#05060a] border border-white/10"
                    }`}
                  >
                    {m.emoji}
                  </div>
                  <div className="pt-mono text-[11px] uppercase text-[#7d8597] flex gap-3">
                    <span>{fmt(m.date)}</span>
                    <span className={i === focus ? "text-[#96cdff]" : ""}>vibe {m.vibe}</span>
                  </div>
                  <div className={`mt-1 text-lg font-medium transition-colors duration-500 ${i === focus ? "text-white" : "text-[#aab1c2]"}`}>{m.title}</div>
                  <p className={`text-sm leading-relaxed transition-all duration-500 ${i === focus ? "text-[#aab1c2] opacity-100" : "text-[#7d8597] opacity-60"}`}>{m.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Experience: the particles become a timeline ── */}
        <section id="pt-work" data-shape="gantt" className="min-h-[100svh] px-5 md:pl-[7vw] py-24 md:py-40">
          <div className="w-full md:w-[42%] max-w-xl">
            <Reveal>
              <Kicker n="03" label="work" />
              <h2 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.02]">
                Where I've <span className="pt-grad">shipped.</span>
              </h2>
            </Reveal>
            <div className="mt-10 space-y-2.5">
              {experiences.map((e, i) => (
                <Reveal key={e.title + e.company} delay={0.05 * i}>
                  <div className="pt-glass p-4 flex gap-4 items-start">
                    <img src={e.companyIcon.startsWith("/") ? e.companyIcon : `/${e.companyIcon}`} alt="" className="w-10 h-10 rounded-xl bg-white object-contain p-1 shrink-0" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-3">
                        <span className="font-medium">{e.company}</span>
                        <span className="pt-mono text-[10px] text-[#7d8597]">{e.period}</span>
                      </div>
                      <div className="text-sm text-[#96cdff]">{e.title}</div>
                      <p className="text-sm text-[#aab1c2] mt-1 leading-relaxed font-light">{e.description}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Projects: a grid of tiles behind glass ── */}
        <section id="pt-projects" data-shape="grid" className="px-5 md:px-[7vw] py-24 md:py-40">
          <Reveal>
            <Kicker n="04" label="projects" />
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.02]">
              Things I've <span className="pt-grad">built.</span>
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => {
              const img = p.image || p.screenshots?.[0];
              return (
                <Reveal key={p.id} delay={(i % 3) * 0.08}>
                  <motion.button
                    data-card
                    onClick={() => openProject(p.id)}
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    className="pt-glass pt-hover !bg-[#0a0c12]/80 w-full h-full text-left overflow-hidden group flex flex-col"
                  >
                    <div className="aspect-[16/9] overflow-hidden bg-white/[0.03] border-b border-white/[0.06]">
                      {img ? (
                        <img src={img} alt="" className="w-full h-full object-cover object-top opacity-80 group-hover:opacity-100 group-hover:scale-[1.04] transition duration-700" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                          <span className="text-6xl font-bold pt-grad">{p.title.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
                          <span className="pt-mono text-[10px] uppercase text-[#7d8597]">{p.technologies.slice(0, 3).join(" · ")}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold">{p.title}</span>
                        <ArrowUpRight className="w-4 h-4 text-[#7d8597] group-hover:text-white transition" />
                      </div>
                      <p className="text-sm text-[#aab1c2] mt-2 leading-relaxed font-light line-clamp-3">{p.description}</p>
                    </div>
                  </motion.button>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ── School + involvement: the particles spell the GPA ── */}
        <section data-shape="gpa" className="min-h-[100svh] px-5 md:pl-[7vw] py-24 md:py-40">
          <div className="w-full md:w-[42%] max-w-xl">
            <Reveal>
              <Kicker n="05" label="school & community" />
              <h2 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.02]">
                Learning, <span className="pt-grad">loudly.</span>
              </h2>
            </Reveal>
            <div className="mt-10 space-y-3">
              {education.map((e) => (
                <Reveal key={e.school}>
                  <div className="pt-glass p-5">
                    <div className="flex gap-4 items-center">
                      <img src={e.image} alt="" className="w-11 h-11 rounded-xl object-contain shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium leading-snug">{e.degree}</div>
                        <div className="text-sm text-[#7d8597]">
                          {e.school} · {e.period}
                        </div>
                      </div>
                      {e.gpa && (
                        <div className="text-right shrink-0">
                          <div className="text-2xl font-semibold pt-grad">{e.gpa.split("/")[0]}</div>
                          <div className="pt-mono text-[9px] uppercase text-[#7d8597]">gpa</div>
                        </div>
                      )}
                    </div>
                    {e.relevantCourses && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {e.relevantCourses.map((c) => (
                          <span key={c} className="text-[11px] px-2.5 py-1 rounded-full border border-white/10 text-[#aab1c2]">
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Reveal>
              ))}
              {involvements.map((v, i) => (
                <Reveal key={v.organization} delay={0.05 * i}>
                  <div className="pt-glass p-5">
                    <div className="flex gap-4 items-center">
                      <img src={v.image} alt="" className="w-10 h-10 rounded-xl object-contain shrink-0 bg-white/90 p-0.5" />
                      <div>
                        <div className="font-medium">{v.role}</div>
                        <div className="text-sm text-[#7d8597]">
                          {v.organization} · {v.period}
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-[#aab1c2] leading-relaxed font-light">{v.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Guides + contact: a slowly turning globe ── */}
        <section id="pt-contact" data-shape="sphere" className="min-h-[100svh] px-5 md:pl-[7vw] pt-24 md:pt-40 pb-40">
          <div className="w-full md:w-[42%] max-w-xl">
            <Reveal>
              <Kicker n="06" label="writing" />
            </Reveal>
            <div className="space-y-2.5">
              {guides.map((g) => (
                <Reveal key={g.id}>
                  <button data-card onClick={() => navigate(`/guide/${g.id}`)} className="pt-glass pt-hover p-5 w-full text-left group">
                    <div className="pt-mono text-[10px] uppercase text-[#7d8597]">
                      {g.category} · {g.publishDate}
                    </div>
                    <div className="mt-1 flex justify-between gap-3">
                      <span className="font-medium">{g.title}</span>
                      <ArrowUpRight className="w-4 h-4 text-[#7d8597] group-hover:text-white transition shrink-0 mt-1" />
                    </div>
                  </button>
                </Reveal>
              ))}
            </div>

            <Reveal className="mt-24">
              <Kicker n="07" label="contact" />
              <h2 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[0.98]">
                Let's build
                <br />
                <span className="pt-grad">something.</span>
              </h2>
              <div className="mt-10 flex flex-wrap gap-3">
                {CONTACT.map(({ label, href, Icon }) => (
                  <Magnetic
                    key={label}
                    href={href}
                    className={`flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-medium transition-colors ${
                      label === "Email" ? "bg-white text-black hover:bg-[#96cdff]" : "border border-white/15 hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label === "Email" ? "jbw7@illinois.edu" : label}
                  </Magnetic>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Particles;
