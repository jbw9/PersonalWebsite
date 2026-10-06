import React, { useLayoutEffect, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Github, Linkedin, ArrowUpRight } from "lucide-react";
import JourneyGraph from "./components/journeygraph";
import CommitLog from "./components/commitlog";
import { involvements, education } from "./data";
import { projects } from "./data/projects";
import { guides } from "./data/guides";
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const BADGE = "text-xs px-2.5 py-0.5 rounded-full font-medium bg-white border border-[#DDD8CF] text-[#3A3933]";

// Faint dot grid (bullet-journal paper) behind the whole page, so every block sits on one sheet
const PAPER = {
  backgroundImage: "radial-gradient(rgba(158,148,133,0.32) 1px, transparent 1.4px)",
  backgroundSize: "22px 22px",
};

const CARD = "bg-[#FFFDF8] border border-warm-border rounded-2xl";

// Pinned-to-the-page tilt; cards straighten on hover
const TILTS = [-1.2, 0.8, -0.6, 1.2, -1, 0.6];
const pinned = {
  hidden: { opacity: 0, y: 30, rotate: 0 },
  visible: (tilt: number) => ({
    opacity: 1,
    y: 0,
    rotate: tilt,
    transition: { duration: 0.6, ease: "easeOut" },
  }),
};

const STICKY = ["bg-[#FFF1C2]", "bg-[#E2EBF5]", "bg-[#F7E2D6]"];

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrollRestored, setIsScrollRestored] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (location.pathname === "/") {
      const savedScrollData = sessionStorage.getItem("portfolioScrollData");
      if (savedScrollData) {
        try {
          const { position } = JSON.parse(savedScrollData);
          window.scrollTo(0, position);
          sessionStorage.removeItem("portfolioScrollData");
        } catch {
          const oldPosition = sessionStorage.getItem("portfolioScrollPosition");
          if (oldPosition) {
            window.scrollTo(0, parseInt(oldPosition));
            sessionStorage.removeItem("portfolioScrollPosition");
          }
        }
      }
    }
    setIsScrollRestored(true);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleProjectClick = (project: any) => {
    sessionStorage.setItem(
      "portfolioScrollData",
      JSON.stringify({
        position: window.scrollY,
        pageHeight: document.documentElement.scrollHeight,
        timestamp: Date.now(),
      })
    );
    navigate(`/project/${project.id}`);
  };

  const handleGuideClick = (guide: any) => {
    sessionStorage.setItem(
      "portfolioScrollData",
      JSON.stringify({
        position: window.scrollY,
        pageHeight: document.documentElement.scrollHeight,
        timestamp: Date.now(),
      })
    );
    navigate(`/guide/${guide.id}`);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className="min-h-screen bg-warm-bg text-warm-navy font-sans"
      style={{ ...PAPER, opacity: isScrollRestored ? 1 : 0, transition: "opacity 0.2s" }}
    >
      {/* ── Sticky Nav ─────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-warm-bg/90 backdrop-blur-md border-b border-warm-border shadow-soft"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-end">
          <div className="hidden md:flex items-center gap-7">
            {(
              [
                ["Journey", "journey"],
                ["Experience", "experience"],
                ["Projects", "projects"],
                ["Education", "education"],
                ["Involvement", "involvement"],
              ] as const
            ).map(([label, id]) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className="text-sm text-warm-muted hover:text-warm-navy transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative px-6 pt-32 md:pt-36 pb-6 md:min-h-[600px]"
      >
        {/* ── Draggable floating tags — positioned relative to section, desktop only ── */}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute hidden md:block font-handwritten text-xl text-warm-muted rotate-3 select-none"
          style={{ top: "120px", right: "130px" }}
        >
          psst, these are draggable ↙
        </motion.p>

        {/* Tag 1: UIUC — top-left */}
        <motion.div
          drag
          dragConstraints={heroRef}
          dragElastic={0.08}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6, ease: "easeOut" }}
          whileHover={{ scale: 1.03 }}
          whileDrag={{ scale: 1.05, boxShadow: "0 14px 36px rgba(0,0,0,0.13)", zIndex: 20 }}
          className="absolute hidden md:block cursor-grab active:cursor-grabbing select-none z-10
                     bg-[#F0EDE8] border border-warm-border text-warm-navy
                     text-base font-medium px-5 py-3 rounded-2xl shadow-soft rotate-1"
          style={{ top: "185px", right: "360px" }}
        >
          CS + Econs @ UIUC
        </motion.div>

        {/* Tag 2: AWS — center, right of main text */}
        <motion.div
          drag
          dragConstraints={heroRef}
          dragElastic={0.08}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6, ease: "easeOut" }}
          whileHover={{ scale: 1.03 }}
          whileDrag={{ scale: 1.05, boxShadow: "0 14px 36px rgba(0,0,0,0.22)", zIndex: 20 }}
          className="absolute hidden md:block cursor-grab active:cursor-grabbing select-none z-10
                     bg-[#1B2D4F] text-white
                     text-base font-medium px-6 py-3.5 rounded-2xl shadow-soft-md -rotate-1"
          style={{ top: "295px", right: "70px" }}
        >
          ☁ Incoming SDE @ AWS
        </motion.div>

        {/* Tag 3: TaxBuddy — bottom-left, arrow-only navigation */}
        <motion.div
          drag
          dragConstraints={heroRef}
          dragElastic={0.08}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.6, ease: "easeOut" }}
          whileHover={{ scale: 1.03 }}
          whileDrag={{ scale: 1.05, boxShadow: "0 14px 36px rgba(55,48,163,0.15)", zIndex: 20 }}
          className="absolute hidden md:block cursor-grab active:cursor-grabbing select-none z-10
                     bg-[#EEF2FF] border border-[#C7D2FE] text-[#3730A3]
                     text-base px-5 py-3.5 rounded-2xl shadow-soft rotate-1"
          style={{ top: "460px", right: "325px" }}
        >
          <span className="flex items-center gap-1.5 text-[11px] text-[#6366F1] mb-1.5 font-semibold tracking-widest uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            active project
          </span>
          <span className="flex items-center gap-1 font-medium">
            TaxBuddy
            <span
              onClick={(e) => { e.stopPropagation(); navigate("/project/taxbuddy"); }}
              className="cursor-pointer hover:text-[#4338CA] transition-colors ml-0.5"
              title="View project"
            >
              ↗
            </span>
          </span>
        </motion.div>

        {/* Main content */}
        <div className="max-w-5xl mx-auto w-full">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <motion.p
              variants={fadeUp}
              className="text-warm-muted text-base mb-3 tracking-wide"
            >
              Hey there 👋
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="font-display text-6xl md:text-8xl font-bold text-warm-navy leading-tight mb-6"
            >
              I'm Jonathan.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-xl md:text-2xl text-warm-muted max-w-lg leading-relaxed mb-10"
            >
              CS & Econs student @UIUC — building software that solves real
              problems.
            </motion.p>

            {/* Contact buttons */}
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap gap-3"
            >
              <button
                onClick={() => window.open("mailto:jbw7@illinois.edu")}
                className="flex items-center gap-2 px-5 py-2.5 bg-warm-navy text-warm-bg rounded-full text-sm font-medium hover:bg-warm-navy/80 transition-all"
              >
                <Mail className="w-4 h-4" />
                Email me
              </button>
              <button
                onClick={() => window.open("https://github.com/jbw9")}
                className="flex items-center gap-2 px-5 py-2.5 border border-warm-border bg-warm-bg text-warm-navy rounded-full text-sm font-medium hover:bg-warm-surface transition-all"
              >
                <Github className="w-4 h-4" />
                GitHub
              </button>
              <button
                onClick={() =>
                  window.open("https://www.linkedin.com/in/jwidjajakusuma/")
                }
                className="flex items-center gap-2 px-5 py-2.5 border border-warm-border bg-warm-bg text-warm-navy rounded-full text-sm font-medium hover:bg-warm-surface transition-all"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Journey: flows straight out of the hero, no section break ── */}
      <section id="journey" className="px-6 pb-4 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mb-6"
          >
            <span className="block font-display text-2xl md:text-3xl font-semibold text-warm-navy">
              From finance major to SDE intern at AWS
            </span>
            <span className="block mt-1 text-sm md:text-base text-warm-muted">
              A week-by-week timeline. Hover or tap a point for details.
            </span>
          </motion.p>
          <JourneyGraph />
        </div>
      </section>


      {/* ── Experience + Education ─────────────────────────────────── */}
      <section className="px-6 pt-2 pb-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="max-w-5xl mx-auto grid gap-10 md:grid-cols-5 items-start"
        >
          <motion.div id="experience" variants={fadeUp} className="md:col-span-3 min-w-0 scroll-mt-24">
            <div className="flex flex-wrap items-baseline gap-x-3 mb-5">
              <h2 className="text-3xl font-display font-bold text-warm-navy">Where I've worked</h2>
            </div>
            <CommitLog />
          </motion.div>

          {/* Offset down so the two columns don't line up like a table */}
          <motion.div id="education" variants={fadeUp} className="md:col-span-2 md:mt-24 scroll-mt-24">
            <div className="flex flex-wrap items-baseline gap-x-3 mb-5">
              <h2 className="text-3xl font-display font-bold text-warm-navy">School</h2>
            </div>
            <div className="space-y-6">
              {education.map((edu, index) =>
                edu.gpa ? (
                  <div key={edu.school} className={`${CARD} p-5 shadow-soft`}>
                    <div className="flex items-start gap-3 mb-4">
                      <img
                        src={edu.image}
                        alt={edu.school}
                        className="w-11 h-11 rounded-xl object-contain flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="font-semibold text-warm-navy leading-snug">{edu.degree}</h3>
                        <p className="text-sm text-warm-muted">{edu.school}</p>
                        <p className="font-mono text-xs text-warm-muted mt-1">{edu.period}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs uppercase tracking-widest text-warm-muted">GPA</span>
                      {/* Red-pen circle, like a graded paper */}
                      <span className="relative inline-block px-3">
                        <span className="font-handwritten text-4xl font-semibold text-[#C8553D]">
                          {edu.gpa.split("/")[0]}
                        </span>
                        <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible">
                          <motion.path
                            d="M8,28 C6,8 90,4 94,24 C98,44 14,50 6,30 C4,22 20,12 34,10"
                            stroke="#C8553D"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                            vectorEffect="non-scaling-stroke"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                          />
                        </svg>
                      </span>
                    </div>
                    {edu.relevantCourses && (
                      <div className="flex flex-wrap gap-1.5">
                        {edu.relevantCourses.map((course) => (
                          <span key={course} className={BADGE}>
                            {course}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    key={edu.school}
                    className={`${STICKY[(index + 1) % STICKY.length]} rounded-md p-4 shadow-soft-md rotate-2 flex items-center gap-3`}
                  >
                    <img src={edu.image} alt={edu.school} className="w-9 h-9 rounded-lg object-contain flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-warm-navy leading-snug">{edu.degree}</h3>
                      <p className="text-xs text-warm-muted">
                        {edu.school} · {edu.period}
                        {edu.description?.includes("http") && (
                          <a
                            href={edu.description.slice(edu.description.indexOf("http"))}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-1.5 underline underline-offset-2 hover:text-warm-navy"
                          >
                            details ↗
                          </a>
                        )}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </motion.div>
        </motion.div>
      </section>


      {/* ── Projects ───────────────────────────────────────────────── */}
      <section id="projects" className="px-6 pt-2 pb-8 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="flex flex-wrap items-baseline gap-x-3 mb-8">
              <h2 className="text-3xl font-display font-bold text-warm-navy">Projects</h2>
            </motion.div>

            <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, index) => {
                const featured = project.id === "taxbuddy";
                return (
                  <motion.div
                    key={project.id}
                    custom={TILTS[index % TILTS.length]}
                    variants={pinned}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-40px" }}
                    whileHover={{ y: -6, rotate: 0, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    onClick={() => handleProjectClick(project)}
                    className={`relative ${CARD} p-5 pt-6 cursor-pointer group shadow-soft hover:shadow-soft-lg transition-shadow ${
                      featured ? "md:col-span-2" : ""
                    }`}
                  >
                    {/* Tape */}
                    <span
                      className={`absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-5 rounded-sm ${
                        index % 2 ? "bg-[#6B93C4]/30 rotate-2" : "bg-warm-amber/45 -rotate-3"
                      }`}
                    />
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {featured && (
                          <span className="relative flex h-2 w-2 flex-shrink-0 mt-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                          </span>
                        )}
                        <h3
                          className={`font-semibold text-warm-navy group-hover:text-[#6B93C4] transition-colors leading-snug ${
                            featured ? "text-xl font-display font-bold" : ""
                          }`}
                        >
                          {project.title}
                        </h3>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-warm-muted group-hover:text-warm-navy transition-colors flex-shrink-0 mt-0.5 ml-2" />
                    </div>
                    <p
                      className={`text-sm text-warm-muted leading-relaxed mb-4 ${
                        featured ? "md:text-base" : "line-clamp-3"
                      }`}
                    >
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {project.technologies.slice(0, 4).map((tech) => (
                        <span key={tech} className={BADGE}>
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 4 && (
                        <span className={BADGE}>
                          +{project.technologies.length - 4}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>


      {/* ── Guides + Involvements ──────────────────────────────────── */}
      <section className="px-6 pt-2 pb-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="max-w-5xl mx-auto grid gap-12 md:grid-cols-5 items-start"
        >
          <motion.div id="involvement" variants={fadeUp} className="md:col-span-2 md:order-2 scroll-mt-24">
            <div className="flex flex-wrap items-baseline gap-x-3 mb-6">
              <h2 className="text-3xl font-display font-bold text-warm-navy">Involvement</h2>
            </div>
            <div className="flex flex-col">
              {involvements.map((involvement, index) => (
                <motion.div
                  key={involvement.organization}
                  whileHover={{ rotate: 0, scale: 1.03, zIndex: 10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className={`relative ${STICKY[index % STICKY.length]} rounded-md p-5 shadow-soft-md ${
                    index % 2 ? "rotate-2 md:ml-6" : "-rotate-1 md:mr-6"
                  } ${index ? "-mt-2" : ""}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={involvement.image}
                      alt={involvement.organization}
                      className="w-8 h-8 rounded-lg object-contain flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-warm-navy leading-snug">{involvement.role}</h3>
                      <p className="text-xs text-warm-muted">
                        {involvement.organization} · {involvement.period}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-warm-navy/70 leading-relaxed">{involvement.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div id="guides" variants={fadeUp} className="md:col-span-3 md:order-1 md:mt-16 scroll-mt-24">
            <div className="flex flex-wrap items-baseline gap-x-3 mb-5">
              <h2 className="text-3xl font-display font-bold text-warm-navy">Development Guides</h2>
            </div>
            <div className={`${CARD} px-5 shadow-soft`}>
              {guides.map((guide) => (
                <motion.div
                  key={guide.id}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  onClick={() => handleGuideClick(guide)}
                  className="flex items-center justify-between py-5 border-b border-dashed border-warm-border last:border-0 cursor-pointer group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={BADGE}>{guide.category}</span>
                      <span className="font-mono text-xs text-warm-muted">{guide.publishDate}</span>
                    </div>
                    <h3 className="font-semibold text-warm-navy group-hover:text-[#6B93C4] transition-colors mb-1">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-warm-muted line-clamp-1">{guide.description}</p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-warm-muted group-hover:text-warm-navy flex-shrink-0 ml-4 transition-colors" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="px-6 py-10 border-t border-warm-border bg-warm-bg">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-warm-muted text-sm font-sans">
            Built by Jonathan 2026
          </p>
          <div className="flex items-center gap-5">
            <button
              onClick={() => window.open("https://github.com/jbw9")}
              className="text-warm-muted hover:text-warm-navy transition-colors"
            >
              <Github className="w-5 h-5" />
            </button>
            <button
              onClick={() =>
                window.open("https://www.linkedin.com/in/jwidjajakusuma/")
              }
              className="text-warm-muted hover:text-warm-navy transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </button>
            <button
              onClick={() => window.open("mailto:jbw7@illinois.edu")}
              className="text-warm-muted hover:text-warm-navy transition-colors"
            >
              <Mail className="w-5 h-5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
