import { useLayoutEffect, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Github, Linkedin, ArrowUpRight } from "lucide-react";
import ExperienceTimeline from "./components/experiencetimeline";
import { experiences, involvements, education } from "./data";
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
      style={{ opacity: isScrollRestored ? 1 : 0, transition: "opacity 0.2s" }}
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
        className="relative min-h-screen flex items-center px-6 pt-24 pb-20"
      >
        {/* ── Draggable floating tags — positioned relative to section, desktop only ── */}

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
          ☁ Incoming SDE Intern @ AWS
        </motion.div>

        {/* Tag 3: VisuLearn — bottom-left, arrow-only navigation */}
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
            VisuLearn
            <span
              onClick={(e) => { e.stopPropagation(); navigate("/project/visulearn"); }}
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
                className="flex items-center gap-2 px-5 py-2.5 border border-warm-border text-warm-navy rounded-full text-sm font-medium hover:bg-warm-surface transition-all"
              >
                <Github className="w-4 h-4" />
                GitHub
              </button>
              <button
                onClick={() =>
                  window.open("https://www.linkedin.com/in/jwidjajakusuma/")
                }
                className="flex items-center gap-2 px-5 py-2.5 border border-warm-border text-warm-navy rounded-full text-sm font-medium hover:bg-warm-surface transition-all"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-warm-muted"
        >
          <span className="text-xs tracking-widest uppercase">scroll</span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-8 bg-warm-border"
          />
        </motion.div>
      </section>

      {/* ── Experience ─────────────────────────────────────────────── */}
      <section id="experience" className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl font-display font-bold text-warm-navy mb-12"
            >
              Experience
            </motion.h2>
            <ExperienceTimeline experiences={experiences} />
          </motion.div>
        </div>
      </section>

      {/* ── Projects ───────────────────────────────────────────────── */}
      <section id="projects" className="px-6 py-24 bg-warm-surface">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl font-display font-bold text-warm-navy mb-10"
            >
              Projects
            </motion.h2>

            <motion.div
              variants={stagger}
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              {projects.map((project, index) => (
                <motion.div
                  key={index}
                  variants={fadeUp}
                  whileHover={{ y: -5, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  onClick={() => handleProjectClick(project)}
                  className="bg-warm-bg border border-warm-border rounded-2xl p-5 cursor-pointer group hover:shadow-soft-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {project.id === "visulearn" && (
                        <span className="relative flex h-2 w-2 flex-shrink-0 mt-1">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                        </span>
                      )}
                      <h3 className="font-semibold text-warm-navy group-hover:text-[#6B93C4] transition-colors leading-snug">
                        {project.title}
                      </h3>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-warm-muted group-hover:text-warm-navy transition-colors flex-shrink-0 mt-0.5 ml-2" />
                  </div>
                  <p className="text-sm text-warm-muted leading-relaxed mb-4 line-clamp-3">
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
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Education ──────────────────────────────────────────────── */}
      <section id="education" className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl font-display font-bold text-warm-navy mb-10"
            >
              Education
            </motion.h2>

            <motion.div variants={stagger} className="space-y-4">
              {education.map((edu, index) => (
                <motion.div
                  key={index}
                  variants={fadeUp}
                  className="bg-warm-surface border border-warm-border rounded-2xl p-6 flex items-start gap-4"
                >
                  <img
                    src={edu.image}
                    alt={edu.school}
                    className="w-12 h-12 rounded-xl object-contain flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 mb-2">
                      <div>
                        <h3 className="font-semibold text-warm-navy">
                          {edu.degree}
                        </h3>
                        <p className="text-sm text-warm-muted">{edu.school}</p>
                      </div>
                      <div className="md:text-right flex-shrink-0">
                        <span className="text-sm text-warm-muted">
                          {edu.period}
                        </span>
                        {edu.gpa && (
                          <p className="text-sm font-medium text-warm-navy">
                            GPA: {edu.gpa}
                          </p>
                        )}
                      </div>
                    </div>
                    {edu.relevantCourses && edu.relevantCourses.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {edu.relevantCourses.map((course) => (
                          <span key={course} className={BADGE}>
                            {course}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Involvements ───────────────────────────────────────────── */}
      <section id="involvement" className="px-6 py-24 bg-warm-surface">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl font-display font-bold text-warm-navy mb-10"
            >
              Involvements
            </motion.h2>

            <motion.div
              variants={stagger}
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              {involvements.map((involvement, index) => (
                <motion.div
                  key={index}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="bg-warm-bg border border-warm-border rounded-2xl p-5"
                >
                  <img
                    src={involvement.image}
                    alt={involvement.organization}
                    className="w-10 h-10 rounded-xl object-contain mb-4"
                  />
                  <h3 className="font-semibold text-warm-navy mb-0.5">
                    {involvement.role}
                  </h3>
                  <p className="text-sm font-medium text-[#6B93C4] mb-1">
                    {involvement.organization}
                  </p>
                  <p className="text-xs text-warm-muted mb-3">
                    {involvement.period}
                  </p>
                  <p className="text-sm text-warm-muted leading-relaxed">
                    {involvement.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Dev Guides ─────────────────────────────────────────────── */}
      <section id="guides" className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl font-display font-bold text-warm-navy mb-10"
            >
              Dev Guides
            </motion.h2>

            <motion.div variants={stagger} className="space-y-4">
              {guides.map((guide, index) => (
                <motion.div
                  key={index}
                  variants={fadeUp}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  onClick={() => handleGuideClick(guide)}
                  className="flex items-center justify-between p-5 border border-warm-border rounded-2xl cursor-pointer group hover:bg-warm-surface transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={BADGE}>{guide.category}</span>
                      <span className="text-xs text-warm-muted">
                        {guide.publishDate}
                      </span>
                    </div>
                    <h3 className="font-semibold text-warm-navy group-hover:text-[#6B93C4] transition-colors mb-1">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-warm-muted line-clamp-1">
                      {guide.description}
                    </p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-warm-muted group-hover:text-warm-navy flex-shrink-0 ml-4 transition-colors" />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="px-6 py-10 border-t border-warm-border">
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
