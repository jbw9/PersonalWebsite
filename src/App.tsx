import { useEffect, useRef, useLayoutEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./components/button";
import { Card, CardContent } from "./components/card";
import { Badge } from "./components/badge";
import { Mail, Github, Linkedin, FileText, ExternalLink } from "lucide-react";
import ExperienceTimeline from "./components/experiencetimeline";
import { experiences, involvements, education } from "./data";
import { projects } from "./data/projects";
import { guides } from "./data/guides";

function App() {
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrollRestored, setIsScrollRestored] = useState(false);

  // Restore scroll position BEFORE the component renders (useLayoutEffect)
  useLayoutEffect(() => {
    if (location.pathname === "/") {
      const savedScrollData = sessionStorage.getItem("portfolioScrollData");
      if (savedScrollData) {
        try {
          const { position } = JSON.parse(savedScrollData);
          // Restore immediately, before paint
          window.scrollTo(0, position);
          sessionStorage.removeItem("portfolioScrollData");
        } catch (e) {
          // Fallback to old method if JSON parsing fails
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

  // Handle project click with scroll position saving
  const handleProjectClick = (project: any) => {
    // Save current scroll position and page height for better restoration
    const scrollData = {
      position: window.scrollY,
      pageHeight: document.documentElement.scrollHeight,
      timestamp: Date.now(),
    };
    sessionStorage.setItem("portfolioScrollData", JSON.stringify(scrollData));
    navigate(`/project/${project.id}`);
  };

  // Handle guide click with scroll position saving
  const handleGuideClick = (guide: any) => {
    // Save current scroll position and page height for better restoration
    const scrollData = {
      position: window.scrollY,
      pageHeight: document.documentElement.scrollHeight,
      timestamp: Date.now(),
    };
    sessionStorage.setItem("portfolioScrollData", JSON.stringify(scrollData));
    navigate(`/guide/${guide.id}`);
  };

  return (
    <div
      className="min-h-screen bg-portfolio-dark text-portfolio-light"
      style={{ opacity: isScrollRestored ? 1 : 0 }}
    >
      {/* Hero Section */}
      <section className="px-6 pt-32 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="animate-slide-in-left">
            <h1 className="mb-6 text-5xl font-bold text-white md:text-7xl">
              Hello, I'm <span className="text-portfolio-blue">Jonathan</span>
            </h1>
            <h2 className="mb-8 text-2xl md:text-3xl text-portfolio-accent">
              SWE Intern @Massive, Inc. | CS @UIUC
            </h2>
            <p className="max-w-2xl mb-12 text-lg leading-relaxed text-portfolio-light">
              Passionate about building innovative software solutions and
              exploring the intersection of technology and user experience.
              Currently pursuing my degree while gaining hands-on experience
              through internships and personal projects.
            </p>

            {/* Contact Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                className="p-3 text-white bg-portfolio-blue hover:bg-portfolio-blue/80"
                onClick={() =>
                  window.open("mailto:jonathanbernard265@gmail.com")
                }
                title="Email"
              >
                <Mail className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                className="p-3 border-portfolio-accent text-portfolio-light hover:bg-portfolio-slate"
                onClick={() => window.open("#")}
                title="Resume"
              >
                <FileText className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                className="p-3 border-portfolio-accent text-portfolio-light hover:bg-portfolio-slate"
                onClick={() => window.open("https://github.com/jbw9")}
                title="GitHub"
              >
                <Github className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                className="p-3 border-portfolio-accent text-portfolio-light hover:bg-portfolio-slate"
                onClick={() =>
                  window.open("https://www.linkedin.com/in/jwidjajakusuma/")
                }
                title="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </Button>
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
          <h2 className="mb-12 text-3xl font-bold text-center text-white">
            Experience
          </h2>
          <ExperienceTimeline experiences={experiences} />
        </div>
      </section>

      {/* Projects Section */}
      <section
        id="projects"
        ref={addToRefs}
        className="px-6 py-20 transition-opacity duration-1000 opacity-0"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="mb-12 text-3xl font-bold text-white">Projects</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <Card
                key={index}
                className="h-full transition-all duration-300 cursor-pointer bg-portfolio-slate border-portfolio-accent/20 hover:border-portfolio-blue/50 group"
                onClick={() => handleProjectClick(project)}
              >
                <CardContent className="flex flex-col h-full p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white transition-colors group-hover:text-portfolio-blue">
                      {project.title}
                    </h3>
                    <div className="flex space-x-2">
                      {project.github && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-8 h-8 p-1 text-portfolio-accent hover:text-portfolio-blue"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(project.github);
                          }}
                        >
                          <Github className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-8 h-8 p-1 text-portfolio-accent hover:text-portfolio-blue"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(project.demo);
                        }}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="flex-grow mb-4 leading-relaxed text-portfolio-light">
                    {project.description}
                  </p>
                  <div className="mt-auto">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.map((tech) => (
                        <Badge
                          key={tech}
                          variant="secondary"
                          className="text-xs bg-portfolio-dark text-portfolio-light"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm font-medium text-portfolio-blue">
                      Click to view details →
                    </p>
                  </div>
                </CardContent>
              </Card>
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
          <h2 className="mb-12 text-3xl font-bold text-white">
            Development Guides
          </h2>
          <div className="space-y-6">
            {guides.map((guide, index) => (
              <div
                key={index}
                className="cursor-pointer group"
                onClick={() => handleGuideClick(guide)}
              >
                <div className="flex flex-col gap-6 p-6 transition-all duration-300 border rounded-lg md:flex-row bg-gradient-to-r from-portfolio-slate/50 to-portfolio-slate/30 border-portfolio-accent/10 hover:border-portfolio-blue/30">
                  <div className="flex-grow">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className="text-xs border-portfolio-blue/50 text-portfolio-blue"
                      >
                        {guide.category}
                      </Badge>
                      <span className="text-sm text-portfolio-accent">•</span>
                      <span className="text-sm text-portfolio-accent">
                        {guide.publishDate}
                      </span>
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-white transition-colors group-hover:text-portfolio-blue">
                      {guide.title}
                    </h3>
                    <p className="mb-4 leading-relaxed text-portfolio-light">
                      {guide.description}
                    </p>
                    <div className="flex items-center text-sm font-medium text-portfolio-blue">
                      Click to read article →
                    </div>
                  </div>
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
          <h2 className="mb-12 text-3xl font-bold text-white">Education</h2>
          <div className="space-y-6">
            {education.map((edu, index) => (
              <Card
                key={index}
                className="bg-portfolio-slate border-portfolio-accent/20"
              >
                <CardContent className="p-8">
                  <div className="flex flex-col mb-4 md:flex-row md:justify-between md:items-start">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 overflow-hidden rounded-lg">
                        <img
                          src={edu.image}
                          alt={`${edu.school} logo`}
                          className="object-cover w-16 h-16 rounded-lg"
                        />
                      </div>
                      <div>
                        <h3 className="mb-2 text-xl font-semibold text-white">
                          {edu.degree}
                        </h3>
                        <p className="font-medium text-portfolio-blue">
                          {edu.school}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 text-right md:mt-0">
                      <span className="block text-portfolio-accent">
                        {edu.period}
                      </span>
                      {edu.gpa && (
                        <span className="text-portfolio-light">
                          GPA: {edu.gpa}
                        </span>
                      )}
                    </div>
                  </div>
                  {edu.description && (
                    <div className="mb-4">
                      <p className="leading-relaxed text-portfolio-light">
                        {edu.description}
                      </p>
                    </div>
                  )}
                  {edu.relevantCourses && edu.relevantCourses.length > 0 && (
                    <div>
                      <h4 className="mb-2 font-medium text-portfolio-light">
                        Relevant Coursework:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {edu.relevantCourses.map((course) => (
                          <Badge
                            key={course}
                            variant="secondary"
                            className="bg-portfolio-dark text-portfolio-light"
                          >
                            {course}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
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
          <h2 className="mb-12 text-3xl font-bold text-center text-white">
            University Involvements
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {involvements.map((involvement, index) => (
              <div key={index} className="relative group">
                <div className="absolute inset-0 transition-opacity duration-300 rounded-lg opacity-0 bg-gradient-to-r from-portfolio-blue to-purple-600 group-hover:opacity-20"></div>
                <Card className="relative z-10 h-full transition-all duration-300 bg-portfolio-slate border-portfolio-accent/20 hover:border-portfolio-blue/50">
                  <CardContent className="flex flex-col h-full p-6">
                    <div className="mb-4">
                      <div className="mb-4 overflow-hidden rounded-lg">
                        <img
                          src={involvement.image}
                          alt={`${involvement.organization} logo`}
                          className="object-cover w-12 h-12 rounded-lg"
                        />
                      </div>
                      <h3 className="mb-2 text-xl font-semibold text-white">
                        {involvement.role}
                      </h3>
                      <p className="font-medium text-portfolio-blue">
                        {involvement.organization}
                      </p>
                      <span className="text-sm text-portfolio-accent">
                        {involvement.period}
                      </span>
                    </div>
                    <p className="flex-grow leading-relaxed text-portfolio-light">
                      {involvement.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-portfolio-slate">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-portfolio-accent">
            Built from scratch with React & Tailwind CSS. © 2025 Jonathan
            Bernard Widjajakusuma
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
