import { useEffect, useRef, useLayoutEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Badge } from "./components/badge";
import { Mail, Github, Linkedin, ExternalLink } from "lucide-react";
import { experiences, involvements, education } from "./data";
import { projects } from "./data/projects";
import { guides } from "./data/guides";

function AppNew() {
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrollRestored, setIsScrollRestored] = useState(false);

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
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("opacity-0");
            entry.target.classList.add("opacity-100", "animate-fade-in");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const addToRefs = (el: HTMLElement | null) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  const handleProjectClick = (project: any) => {
    const scrollData = {
      position: window.scrollY,
      pageHeight: document.documentElement.scrollHeight,
      timestamp: Date.now(),
    };
    sessionStorage.setItem("portfolioScrollData", JSON.stringify(scrollData));
    navigate(`/new-design/project/${project.id}`);
  };

  const handleGuideClick = (guide: any) => {
    const scrollData = {
      position: window.scrollY,
      pageHeight: document.documentElement.scrollHeight,
      timestamp: Date.now(),
    };
    sessionStorage.setItem("portfolioScrollData", JSON.stringify(scrollData));
    navigate(`/new-design/guide/${guide.id}`);
  };

  return (
    <div
      className="min-h-screen bg-warm-bg text-warm-dark"
      style={{
        opacity: isScrollRestored ? 1 : 0,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Hero Section */}
      <section className="px-6 pt-32 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="animate-slide-in-left">
            <h1 className="mb-6 text-5xl font-bold text-warm-dark md:text-7xl">
              Hello, I'm{" "}
              <span
                className="relative inline-block"
                style={{ color: "#2C3B4D" }}
              >
                Jonathan
                <span
                  className="absolute bottom-1 left-0 w-full h-3 -z-10 rounded"
                  style={{ backgroundColor: "#FFB162", opacity: 0.4 }}
                />
              </span>
            </h1>
            <h2 className="mb-8 text-2xl md:text-3xl text-warm-muted">
              CS & Econs @UIUC
            </h2>
            <p className="max-w-2xl mb-12 text-lg leading-relaxed text-warm-navy/80">
              I love to build useful software projects that solves everyday
              problems! I dream one day to create an open source software that
              helps millions of people :)
            </p>

            {/* Contact Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => window.open("mailto:jbw7@illinois.edu")}
                title="Email"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white transition-all duration-200 shadow-soft hover:shadow-soft-md hover:opacity-90"
                style={{ backgroundColor: "#2C3B4D" }}
              >
                <Mail className="w-4 h-4" />
                Email
              </button>
              <button
                onClick={() => window.open("https://github.com/jbw9")}
                title="GitHub"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 border shadow-soft hover:shadow-soft-md"
                style={{
                  backgroundColor: "#F4F0E8",
                  borderColor: "#C9C1B1",
                  color: "#1B2632",
                }}
              >
                <Github className="w-4 h-4" />
                GitHub
              </button>
              <button
                onClick={() =>
                  window.open("https://www.linkedin.com/in/jwidjajakusuma/")
                }
                title="LinkedIn"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 border shadow-soft hover:shadow-soft-md"
                style={{
                  backgroundColor: "#F4F0E8",
                  borderColor: "#C9C1B1",
                  color: "#1B2632",
                }}
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section
        id="experience"
        ref={addToRefs}
        className="px-6 py-20 transition-opacity duration-1000 opacity-0"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="mb-12 text-3xl font-bold text-center text-warm-dark">
            Experience
          </h2>

          {/* Timeline */}
          <div className="relative">
            <div
              className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full"
              style={{
                background:
                  "linear-gradient(to bottom, #C9C1B1, #C9C1B1, transparent)",
              }}
            />

            <div className="space-y-12">
              {experiences.map((exp, index) => (
                <div key={index} className="relative">
                  <div
                    className="absolute z-10 w-4 h-4 transform -translate-x-1/2 border-4 rounded-full left-1/2"
                    style={{
                      backgroundColor: "#2C3B4D",
                      borderColor: "#EEE9DF",
                    }}
                  />

                  {/* Desktop layout */}
                  <div
                    className={`hidden md:flex items-center ${
                      index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                    }`}
                  >
                    <div
                      className={`w-5/12 ${
                        index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"
                      }`}
                    >
                      <div className="inline-block mb-4">
                        <span
                          className="px-4 py-2 text-sm font-medium text-white rounded-full"
                          style={{ backgroundColor: "#2C3B4D" }}
                        >
                          {exp.period}
                        </span>
                      </div>

                      <div
                        className="p-6 rounded-2xl border shadow-soft-md transition-all duration-300 hover:shadow-soft-lg"
                        style={{
                          backgroundColor: "#F4F0E8",
                          borderColor: "#C9C1B1",
                        }}
                      >
                        <div
                          className={`flex items-start gap-4 ${
                            index % 2 === 0 ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          {exp.companyIcon && (
                            <div className="flex-shrink-0">
                              <img
                                src={exp.companyIcon}
                                alt={`${exp.company} logo`}
                                className="object-contain w-12 h-12 rounded-xl"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="mb-1 text-lg font-semibold text-warm-dark">
                              {exp.title}
                            </h3>
                            <p
                              className="mb-3 font-medium text-sm"
                              style={{ color: "#2C3B4D" }}
                            >
                              {exp.company}
                            </p>
                            <p className="mb-4 text-sm leading-relaxed text-warm-muted">
                              {exp.description}
                              {exp.website && (
                                <>
                                  {" "}
                                  <a
                                    href={exp.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline hover:opacity-70"
                                    style={{ color: "#2C3B4D" }}
                                  >
                                    Check out our website
                                  </a>
                                </>
                              )}
                            </p>
                            <div
                              className={`flex flex-wrap gap-2 ${
                                index % 2 === 0
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              {exp.technologies.map((tech) => (
                                <span
                                  key={tech}
                                  className="px-2.5 py-1 text-xs rounded-lg border font-medium"
                                  style={{
                                    backgroundColor: "#EEE9DF",
                                    borderColor: "#C9C1B1",
                                    color: "#1B2632",
                                  }}
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="w-5/12" />
                  </div>

                  {/* Mobile layout */}
                  <div className="pl-8 md:hidden">
                    <div className="mb-4">
                      <span
                        className="px-4 py-2 text-sm font-medium text-white rounded-full"
                        style={{ backgroundColor: "#2C3B4D" }}
                      >
                        {exp.period}
                      </span>
                    </div>
                    <div
                      className="relative p-6 rounded-2xl border shadow-soft-md"
                      style={{
                        backgroundColor: "#F4F0E8",
                        borderColor: "#C9C1B1",
                      }}
                    >
                      {exp.companyIcon && (
                        <div className="absolute top-4 right-4">
                          <img
                            src={exp.companyIcon}
                            alt={`${exp.company} logo`}
                            className="object-contain w-12 h-12 rounded-xl"
                          />
                        </div>
                      )}
                      <div className={`${exp.companyIcon ? "mr-16" : ""}`}>
                        <h3 className="mb-1 text-lg font-semibold text-warm-dark">
                          {exp.title}
                        </h3>
                        <p
                          className="mb-3 font-medium text-sm"
                          style={{ color: "#2C3B4D" }}
                        >
                          {exp.company}
                        </p>
                        <p className="mb-4 text-sm leading-relaxed text-warm-muted">
                          {exp.description}
                          {exp.website && (
                            <>
                              {" "}
                              <a
                                href={exp.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:opacity-70"
                                style={{ color: "#2C3B4D" }}
                              >
                                Check out our website
                              </a>
                            </>
                          )}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {exp.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="px-2.5 py-1 text-xs rounded-lg border font-medium"
                              style={{
                                backgroundColor: "#EEE9DF",
                                borderColor: "#C9C1B1",
                                color: "#1B2632",
                              }}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section
        id="projects"
        ref={addToRefs}
        className="px-6 py-20 transition-opacity duration-1000 opacity-0"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="mb-12 text-3xl font-bold text-warm-dark">Projects</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <div
                key={index}
                className="flex flex-col h-full rounded-2xl border cursor-pointer transition-all duration-300 shadow-soft hover:shadow-soft-lg group"
                style={{ backgroundColor: "#F4F0E8", borderColor: "#C9C1B1" }}
                onClick={() => handleProjectClick(project)}
              >
                <div className="flex flex-col h-full p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3
                      className="text-lg font-semibold text-warm-dark transition-colors group-hover:text-warm-navy"
                      style={{ color: "#1B2632" }}
                    >
                      {project.title}
                    </h3>
                    <div className="flex space-x-1 ml-2 flex-shrink-0">
                      {project.github && (
                        <button
                          className="w-8 h-8 p-1.5 rounded-lg text-warm-muted hover:text-warm-navy transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(project.github);
                          }}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                        </button>
                      )}
                      <button
                        className="w-8 h-8 p-1.5 rounded-lg text-warm-muted hover:text-warm-navy transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(project.demo);
                        }}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="flex-grow mb-4 text-sm leading-relaxed text-warm-muted">
                    {project.description}
                  </p>
                  <div className="mt-auto">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-1 text-xs rounded-lg border font-medium"
                          style={{
                            backgroundColor: "#EEE9DF",
                            borderColor: "#C9C1B1",
                            color: "#1B2632",
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#2C3B4D" }}
                    >
                      View details →
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guides Section */}
      <section
        id="guides"
        ref={addToRefs}
        className="px-6 py-20 transition-opacity duration-1000 opacity-0"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="mb-12 text-3xl font-bold text-warm-dark">
            Development Guides
          </h2>
          <div className="space-y-4">
            {guides.map((guide, index) => (
              <div
                key={index}
                className="cursor-pointer group"
                onClick={() => handleGuideClick(guide)}
              >
                <div
                  className="p-6 rounded-2xl border shadow-soft transition-all duration-300 hover:shadow-soft-md"
                  style={{
                    backgroundColor: "#F4F0E8",
                    borderColor: "#C9C1B1",
                  }}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span
                      className="px-3 py-1 text-xs font-semibold rounded-full text-white"
                      style={{ backgroundColor: "#2C3B4D" }}
                    >
                      {guide.category}
                    </span>
                    <span className="text-sm text-warm-muted">
                      {guide.publishDate}
                    </span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-warm-dark transition-colors group-hover:text-warm-navy">
                    {guide.title}
                  </h3>
                  <p className="mb-3 text-sm leading-relaxed text-warm-muted">
                    {guide.description}
                  </p>
                  <p className="text-sm font-medium" style={{ color: "#2C3B4D" }}>
                    Read article →
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section
        id="education"
        ref={addToRefs}
        className="px-6 py-20 transition-opacity duration-1000 opacity-0"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="mb-12 text-3xl font-bold text-warm-dark">Education</h2>
          <div className="space-y-6">
            {education.map((edu, index) => (
              <div
                key={index}
                className="rounded-2xl border shadow-soft-md"
                style={{ backgroundColor: "#F4F0E8", borderColor: "#C9C1B1" }}
              >
                <div className="p-8">
                  <div className="flex flex-col mb-6 md:flex-row md:justify-between md:items-start">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 overflow-hidden rounded-xl shadow-soft">
                        <img
                          src={edu.image}
                          alt={`${edu.school} logo`}
                          className="object-cover w-16 h-16 rounded-xl"
                        />
                      </div>
                      <div>
                        <h3 className="mb-1 text-xl font-semibold text-warm-dark">
                          {edu.degree}
                        </h3>
                        <p className="font-medium" style={{ color: "#2C3B4D" }}>
                          {edu.school}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 text-right md:mt-0">
                      <span className="block text-sm text-warm-muted">
                        {edu.period}
                      </span>
                      {edu.gpa && (
                        <span
                          className="text-sm font-semibold"
                          style={{ color: "#FFB162" }}
                        >
                          GPA: {edu.gpa}
                        </span>
                      )}
                    </div>
                  </div>
                  {edu.description && (
                    <p className="mb-4 text-sm leading-relaxed text-warm-muted">
                      {edu.description}
                    </p>
                  )}
                  {edu.relevantCourses && edu.relevantCourses.length > 0 && (
                    <div>
                      <h4 className="mb-3 text-sm font-semibold text-warm-dark">
                        Relevant Coursework
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {edu.relevantCourses.map((course) => (
                          <span
                            key={course}
                            className="px-2.5 py-1 text-xs rounded-lg border font-medium"
                            style={{
                              backgroundColor: "#EEE9DF",
                              borderColor: "#C9C1B1",
                              color: "#1B2632",
                            }}
                          >
                            {course}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* University Involvement Section */}
      <section
        id="involvement"
        ref={addToRefs}
        className="px-6 py-20 transition-opacity duration-1000 opacity-0"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="mb-12 text-3xl font-bold text-center text-warm-dark">
            University Involvements
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {involvements.map((involvement, index) => (
              <div
                key={index}
                className="flex flex-col h-full rounded-2xl border shadow-soft transition-all duration-300 hover:shadow-soft-lg"
                style={{ backgroundColor: "#F4F0E8", borderColor: "#C9C1B1" }}
              >
                <div className="flex flex-col h-full p-6">
                  <div className="mb-4">
                    <div className="mb-4">
                      <img
                        src={involvement.image}
                        alt={`${involvement.organization} logo`}
                        className="object-cover w-12 h-12 rounded-xl shadow-soft"
                      />
                    </div>
                    <h3 className="mb-1 text-lg font-semibold text-warm-dark">
                      {involvement.role}
                    </h3>
                    <p className="font-medium text-sm" style={{ color: "#2C3B4D" }}>
                      {involvement.organization}
                    </p>
                    <span className="text-xs text-warm-muted">
                      {involvement.period}
                    </span>
                  </div>
                  <p className="flex-grow text-sm leading-relaxed text-warm-muted">
                    {involvement.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-6 py-12 border-t"
        style={{ borderColor: "#C9C1B1" }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-warm-muted text-sm">
            Built from scratch © 2026 Jonathan Bernard Widjajakusuma
          </p>
        </div>
      </footer>
    </div>
  );
}

export default AppNew;
