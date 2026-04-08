import { useEffect, useLayoutEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Github, Linkedin, ArrowUpRight } from "lucide-react";
import { experiences, involvements, education } from "./data";
import { projects } from "./data/projects";
import { guides } from "./data/guides";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

// Single neutral badge style — reduces visual noise across all sections
const BADGE =
  "text-xs px-2.5 py-0.5 rounded-full font-medium bg-white border border-[#DDD8CF] text-[#3A3933]";

function AppNew() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrollRestored, setIsScrollRestored] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useLayoutEffect(() => {
    if (location.pathname === "/new-design") {
      const savedScrollData = sessionStorage.getItem("portfolioScrollData");
      if (savedScrollData) {
        try {
          const { position } = JSON.parse(savedScrollData);
          window.scrollTo(0, position);
          sessionStorage.removeItem("portfolioScrollData");
        } catch (e) {
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

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleProjectClick = (project: any) => {
    sessionStorage.setItem(
      "portfolioScrollData",
      JSON.stringify({
        position: window.scrollY,
        pageHeight: document.documentElement.scrollHeight,
        timestamp: Date.now(),
      })
    );
    navigate(`/new-design/project/${project.id}`);
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
    navigate(`/new-design/guide/${guide.id}`);
  };

  return (
    <div
      className="min-h-screen font-sans"
      style={{ opacity: isScrollRestored ? 1 : 0, transition: "opacity 0.2s" }}
    >
      {/* ── Sticky Nav ──────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-warm-bg/90 backdrop-blur-md border-b border-warm-border shadow-soft"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-display text-lg font-bold text-warm-dark">
            jonathan.
          </span>
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
                className="text-sm text-warm-muted hover:text-warm-dark transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Hero (bg: warm-bg) ──────────────────────────────────────── */}
      <section className="bg-warm-bg min-h-screen flex items-center px-6 pt-24 pb-20">
        <div className="max-w-5xl mx-auto w-full">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.p
              variants={fadeUp}
              className="text-warm-muted text-base mb-3 tracking-wide"
            >
              Hey there 👋
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="font-display text-6xl md:text-8xl font-bold text-warm-dark leading-tight mb-6"
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
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <button
                onClick={() => window.open("mailto:jbw7@illinois.edu")}
                className="flex items-center gap-2 px-5 py-2.5 bg-warm-dark text-warm-bg rounded-full text-sm font-medium hover:bg-warm-dark/80 transition-all"
              >
                <Mail className="w-4 h-4" />
                Email me
              </button>
              <button
                onClick={() => window.open("https://github.com/jbw9")}
                className="flex items-center gap-2 px-5 py-2.5 border border-warm-border text-warm-dark rounded-full text-sm font-medium hover:bg-warm-surface transition-all"
              >
                <Github className="w-4 h-4" />
                GitHub
              </button>
              <button
                onClick={() =>
                  window.open("https://www.linkedin.com/in/jwidjajakusuma/")
                }
                className="flex items-center gap-2 px-5 py-2.5 border border-warm-border text-warm-dark rounded-full text-sm font-medium hover:bg-warm-surface transition-all"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Experience (bg: warm-surface) ───────────────────────────── */}
      <section id="experience" className="bg-warm-surface px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl font-bold text-warm-dark mb-12"
            >
              Experience
            </motion.h2>

            {/* Single-column left-aligned timeline */}
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-warm-border via-warm-border to-transparent" />

              <div className="space-y-8">
                {experiences.map((exp, index) => (
                  <motion.div
                    key={index}
                    variants={fadeUp}
                    className="relative pl-14"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-5 top-6 w-3 h-3 rounded-full bg-warm-dark border-2 border-warm-surface -translate-x-1/2 z-10" />

                    {/* Period */}
                    <div className="mb-3">
                      <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-warm-dark text-warm-bg">
                        {exp.period}
                      </span>
                    </div>

                    {/* White card */}
                    <div className="bg-white border border-[#DDD8CF] rounded-2xl p-5 shadow-soft hover:shadow-soft-md transition-shadow">
                      <div className="flex items-start gap-4">
                        {exp.companyIcon && (
                          <img
                            src={exp.companyIcon}
                            alt={`${exp.company} logo`}
                            className="w-10 h-10 rounded-xl object-contain flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-warm-dark mb-0.5">
                            {exp.title}
                          </h3>
                          <p className="text-sm font-medium text-warm-navy mb-3">
                            {exp.company}
                            {exp.website && (
                              <>
                                {" · "}
                                <a
                                  href={exp.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline underline-offset-2 hover:opacity-70 transition-opacity"
                                >
                                  Visit website
                                </a>
                              </>
                            )}
                          </p>
                          <p className="text-sm text-warm-muted leading-relaxed mb-4">
                            {exp.description}
                          </p>
                          {exp.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {exp.technologies.map((tech) => (
                                <span key={tech} className={BADGE}>
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Projects (bg: warm-bg) ───────────────────────────────────── */}
      <section id="projects" className="bg-warm-bg px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl font-bold text-warm-dark mb-10"
            >
              Projects
            </motion.h2>

            <motion.div
              variants={stagger}
              className="grid gap-5 md:grid-cols-2"
            >
              {projects.map((project, index) => (
                <motion.div
                  key={index}
                  variants={fadeUp}
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  onClick={() => handleProjectClick(project)}
                  className="bg-white border border-[#DDD8CF] rounded-2xl p-5 cursor-pointer group hover:shadow-soft-md transition-shadow flex flex-col"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {project.id === "visulearn" && (
                        <span className="relative flex h-2 w-2 flex-shrink-0 mt-1">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                        </span>
                      )}
                      <h3 className="font-semibold text-warm-dark group-hover:text-warm-navy transition-colors leading-snug">
                        {project.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                      {project.github && (
                        <button
                          className="w-7 h-7 p-1.5 rounded-lg text-warm-muted hover:text-warm-dark transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(project.github);
                          }}
                        >
                          <Github className="w-4 h-4" />
                        </button>
                      )}
                      <ArrowUpRight className="w-4 h-4 text-warm-muted group-hover:text-warm-dark transition-colors mt-0.5" />
                    </div>
                  </div>
                  <p className="text-sm text-warm-muted leading-relaxed mb-4 flex-grow line-clamp-3">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {project.technologies.slice(0, 5).map((tech) => (
                      <span key={tech} className={BADGE}>
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 5 && (
                      <span className={BADGE}>
                        +{project.technologies.length - 5}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Education (bg: warm-surface) ────────────────────────────── */}
      <section id="education" className="bg-warm-surface px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl font-bold text-warm-dark mb-10"
            >
              Education
            </motion.h2>

            <motion.div variants={stagger} className="space-y-4">
              {education.map((edu, index) => (
                <motion.div
                  key={index}
                  variants={fadeUp}
                  className="bg-white border border-[#DDD8CF] rounded-2xl p-6 shadow-soft flex items-start gap-4"
                >
                  <img
                    src={edu.image}
                    alt={edu.school}
                    className="w-12 h-12 rounded-xl object-contain flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 mb-2">
                      <div>
                        <h3 className="font-semibold text-warm-dark">
                          {edu.degree}
                        </h3>
                        <p className="text-sm font-medium text-warm-navy">
                          {edu.school}
                        </p>
                      </div>
                      <div className="md:text-right flex-shrink-0">
                        <span className="text-sm text-warm-muted">
                          {edu.period}
                        </span>
                        {edu.gpa && (
                          <p className="text-sm font-semibold text-warm-dark">
                            GPA: {edu.gpa}
                          </p>
                        )}
                      </div>
                    </div>
                    {edu.description && (
                      <p className="text-sm text-warm-muted leading-relaxed mb-3">
                        {edu.description}
                      </p>
                    )}
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

      {/* ── Involvement (bg: warm-bg) ────────────────────────────────── */}
      <section id="involvement" className="bg-warm-bg px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl font-bold text-warm-dark mb-10"
            >
              Involvements
            </motion.h2>

            <motion.div
              variants={stagger}
              className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
            >
              {involvements.map((involvement, index) => (
                <motion.div
                  key={index}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="bg-white border border-[#DDD8CF] rounded-2xl p-5 shadow-soft hover:shadow-soft-md transition-shadow flex flex-col"
                >
                  <img
                    src={involvement.image}
                    alt={involvement.organization}
                    className="w-10 h-10 rounded-xl object-contain mb-4"
                  />
                  <h3 className="font-semibold text-warm-dark mb-0.5">
                    {involvement.role}
                  </h3>
                  <p className="text-sm font-medium text-warm-navy mb-1">
                    {involvement.organization}
                  </p>
                  <p className="text-xs text-warm-muted mb-3">
                    {involvement.period}
                  </p>
                  <p className="text-sm text-warm-muted leading-relaxed flex-grow">
                    {involvement.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Dev Guides (bg: warm-surface) ───────────────────────────── */}
      <section id="guides" className="bg-warm-surface px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl font-bold text-warm-dark mb-10"
            >
              Dev Guides
            </motion.h2>

            <motion.div variants={stagger} className="space-y-3">
              {guides.map((guide, index) => (
                <motion.div
                  key={index}
                  variants={fadeUp}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  onClick={() => handleGuideClick(guide)}
                  className="flex items-center justify-between p-5 bg-white border border-[#DDD8CF] rounded-2xl cursor-pointer group hover:shadow-soft transition-shadow"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={BADGE}>{guide.category}</span>
                      <span className="text-xs text-warm-muted">
                        {guide.publishDate}
                      </span>
                    </div>
                    <h3 className="font-semibold text-warm-dark group-hover:text-warm-navy transition-colors mb-1">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-warm-muted line-clamp-1">
                      {guide.description}
                    </p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-warm-muted group-hover:text-warm-dark flex-shrink-0 ml-4 transition-colors" />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="bg-warm-bg border-t border-warm-border px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-warm-muted text-sm">
            Built from scratch © 2026 Jonathan Bernard Widjajakusuma
          </p>
          <div className="flex items-center gap-5">
            <button
              onClick={() => window.open("https://github.com/jbw9")}
              className="text-warm-muted hover:text-warm-dark transition-colors"
            >
              <Github className="w-5 h-5" />
            </button>
            <button
              onClick={() =>
                window.open("https://www.linkedin.com/in/jwidjajakusuma/")
              }
              className="text-warm-muted hover:text-warm-dark transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </button>
            <button
              onClick={() => window.open("mailto:jbw7@illinois.edu")}
              className="text-warm-muted hover:text-warm-dark transition-colors"
            >
              <Mail className="w-5 h-5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AppNew;
