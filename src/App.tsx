import { useEffect, useRef } from "react";
// Remove this line: import { useNavigate } from "react-router-dom";
import { Button } from "./components/button";
import { Card, CardContent } from "./components/card";
import { Badge } from "./components/badge";
import {
  Mail,
  Github,
  Linkedin,
  FileText,
  ExternalLink,
  GraduationCap,
} from "lucide-react";
import ExperienceTimeline from "./components/experiencetimeline";

function App() {
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  // Remove this line: const navigate = useNavigate();

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

  // Rest of your data arrays remain the same...
  const experiences = [
    {
      title: "Software Engineer Intern",
      company: "Kredivo Group",
      companyIcon:
        "https://media.licdn.com/dms/image/v2/D560BAQEcTpBN5xjLQQ/company-logo_200_200/company-logo_200_200/0/1693461125877/kredivo_group_logo?e=1754524800&v=beta&t=KuobEwkUY_KV9dnjITlcVJMRwO1KZIgUOP9vniH6NXo",
      period: "Summer 2025",
      description:
        "Developing an MCP server, and integrating it with the company's LLM and customer support system",
      technologies: ["Python", "Ollama", "Flask", "MCP"],
    },
    {
      title: "Co-Founder & CTO",
      company: "Tulip",
      companyIcon:
        "https://media.licdn.com/dms/image/v2/D560BAQGwgNKT8En_Fw/company-logo_200_200/company-logo_200_200/0/1729296904460/tulipestate_logo?e=1754524800&v=beta&t=aS4WoWT6VvmIVhbPysGi5ZSbaZd9AQLlt2F_8HXRki0",
      period: "Jan 2024 - May 2025",
      description:
        "Led development of Tulip's mobile app, beta website and Automated Market Maker (AMM) algorithm.",
      website: "https://www.tulip.markets/",
      technologies: ["Python", "AWS", "React Native", "React", "Flask"],
    },
    {
      title: "Founder in Residence (iV10)",
      company: "Iventure Accelerator",
      companyIcon:
        "https://media.licdn.com/dms/image/v2/C4D0BAQGxjXbhDRFjRw/company-logo_100_100/company-logo_100_100/0/1663165310322/iventureaccelerator_logo?e=1754524800&v=beta&t=XmqJmtwGRMC7MhOVqEs5CU4YMfN_GjhcWs_U66cMCoc",
      period: "Jan 2024 - May 2025",
      description: "Building Tulip",
      technologies: [],
    },
    {
      title: "Software Engineer Intern",
      company: "We Hear You, Inc",
      companyIcon:
        "https://media.licdn.com/dms/image/v2/D560BAQFvP6vMuT95LA/company-logo_200_200/company-logo_200_200/0/1726942046647?e=1754524800&v=beta&t=eyNEd3jiRfir4MXf2vf6KMY6YUCrgkovsWswWWXHSLw",
      period: "Summer 2024",
      description:
        "Developed a real time American Sign Language to English Android application. Optimized translation system through machine learning.",
      technologies: ["Python", "TensorFlow", "Android Studio"],
    },
  ];

  const projects = [
    {
      id: "task-management",
      title: "Task Management App",
      description:
        "A full-stack task management application with real-time collaboration features. Users can create teams, assign tasks, and track progress.",
      technologies: ["React", "Express.js", "MongoDB", "Socket.io"],
      github: "#",
      demo: "#",
    },
    {
      id: "ecommerce-platform",
      title: "E-commerce Platform",
      description:
        "Modern e-commerce platform with payment integration, inventory management, and admin dashboard.",
      technologies: ["Next.js", "Stripe", "Prisma", "PostgreSQL"],
      github: "#",
      demo: "#",
    },
    {
      id: "ml-dashboard",
      title: "Machine Learning Dashboard",
      description:
        "Interactive dashboard for visualizing machine learning model performance and data analytics.",
      technologies: ["Python", "Flask", "D3.js", "Scikit-learn"],
      github: "#",
      demo: "#",
    },
  ];

  const education = [
    {
      degree: "Bachelor of Science in Computer Science",
      school: "University of Illinois at Urbana - Champaign",
      image:
        "https://media.licdn.com/dms/image/v2/C4E0BAQGFFDl_Z9pIAA/company-logo_100_100/company-logo_100_100/0/1630611684443/university_of_illinois_at_urbana_champaign_logo?e=1754524800&v=beta&t=yXHWVm7AICqQokMi7Aj7XGmgzURFf3ltojHzoaq3EnQ",
      period: "2022 - 2026",
      gpa: "3.87/4.0",
      relevantCourses: [
        "Data Structures & Algorithms",
        "Database Systems",
        "Data Mining",
        "Discrete Math",
      ],
    },
    {
      degree: "YC AI Startup School",
      school: "Y Combinator",
      period: "2025",
      image:
        "https://media.licdn.com/dms/image/v2/C4D0BAQGPzdBPNxrmEg/company-logo_100_100/company-logo_100_100/0/1673555093250/y_combinator_logo?e=1754524800&v=beta&t=Zaeq6nS7bCLmXIoIScDFQ_CS78JmcrLyTM9l-d6w_Ro",
      description:
        "One of 2000 undergrad and grad students selected for the first ever YC AI Startup School. Link - https://events.ycombinator.com/ai-sus",
    },
  ];

  const involvements = [
    {
      role: "Consultant",
      organization: "OTCR Consulting",
      period: "Aug 2023 - June 2024",
      description:
        "The university's premier consulting organization with a 5% acceptance rate. Led an engagement with a startup to develop and evaluate expansion strategies, resulting in a validated go-to-market plan.",
      image:
        "https://media.licdn.com/dms/image/v2/C4E0BAQEjAlC8LwihOQ/company-logo_100_100/company-logo_100_100/0/1631348661882?e=1754524800&v=beta&t=jHh41QTnM_D_uw0HHgi_rc9thn5iFlrp8OyyL8pS5Ks",
    },
    {
      role: "Technology & Fundraising Officer",
      organization: "Permias UIUC",
      period: "Aug 2023 - May 2025",
      description:
        "Led development of the official https://permiasuiuc.org/ website. Built with React, Typescript, and Tailwind CSS.",
      image:
        "https://media.licdn.com/dms/image/v2/C510BAQGHwSXiJ6nXjA/company-logo_100_100/company-logo_100_100/0/1631353110459?e=1754524800&v=beta&t=Sc0tsniMiGKbag6fxN3tFmekQEJoWCZ6BVpVkuZqBV4",
    },
    {
      role: "CS128 Course Assistant",
      organization: "Siebel School of Computing and Data Science",
      period: "Jan 2025 - Present",
      description:
        "Assisting students with course material through hosting office hours and answering forum questions.",
      image:
        "https://media.licdn.com/dms/image/v2/D4D0BAQHnn2vmCGlTeg/company-logo_100_100/B4DZYQ355YHsAg-/0/1744039813085/illinoiscds_logo?e=1754524800&v=beta&t=7kKDSDh2F7Gk23eGryH1AT8UB9M9l4gK8_9T82rKcQY",
    },
  ];

  return (
    <div className="min-h-screen bg-portfolio-dark text-portfolio-light">
      {/* Hero Section */}
      <section className="px-6 pt-32 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="animate-slide-in-left">
            <h1 className="mb-6 text-5xl font-bold text-white md:text-7xl">
              Hello, I'm <span className="text-portfolio-blue">Jonathan</span>
            </h1>
            <h2 className="mb-8 text-2xl md:text-3xl text-portfolio-accent">
              SWE Intern @Kredivo Group | CS @UIUC
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
                onClick={() => window.open("mailto:your.email@example.com")}
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
                onClick={() => window.open("https://github.com/yourusername")}
                title="GitHub"
              >
                <Github className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                className="p-3 border-portfolio-accent text-portfolio-light hover:bg-portfolio-slate"
                onClick={() =>
                  window.open("https://linkedin.com/in/yourprofile")
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
                // Replace navigate with a simple alert or window.location
                onClick={() => alert(`Viewing project: ${project.title}`)}
              >
                <CardContent className="flex flex-col h-full p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white transition-colors group-hover:text-portfolio-blue">
                      {project.title}
                    </h3>
                    <div className="flex space-x-2">
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
