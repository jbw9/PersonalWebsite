import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Github, ExternalLink, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { projects } from "../data/projects";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const ProjectDetailNew = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notebookLoading, setNotebookLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{
          backgroundColor: "#EEE9DF",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold" style={{ color: "#1B2632" }}>
            Project Not Found
          </h1>
          <button
            onClick={() => navigate("/new-design")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white transition-all duration-200 shadow-soft hover:opacity-90 mx-auto"
            style={{ backgroundColor: "#2C3B4D" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portfolio
          </button>
        </div>
      </div>
    );
  }

  const markdownComponents = {
    code(props: any) {
      const { children, className, ...rest } = props;
      const match = /language-(\w+)/.exec(className || "");
      return match ? (
        <SyntaxHighlighter
          {...rest}
          PreTag="div"
          language={match[1]}
          style={vscDarkPlus as any}
          className="rounded-xl"
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code
          className="px-1.5 py-0.5 rounded text-sm font-mono"
          style={{ backgroundColor: "#E5DFD3", color: "#2C3B4D" }}
          {...rest}
        >
          {children}
        </code>
      );
    },
    h1: (props: any) => <h1 className="mt-8 mb-6 text-3xl font-bold first:mt-0" style={{ color: "#1B2632" }}>{props.children}</h1>,
    h2: (props: any) => <h2 className="mt-6 mb-4 text-2xl font-semibold" style={{ color: "#1B2632" }}>{props.children}</h2>,
    h3: (props: any) => <h3 className="mt-5 mb-3 text-xl font-semibold" style={{ color: "#1B2632" }}>{props.children}</h3>,
    h4: (props: any) => <h4 className="mt-4 mb-2 text-lg font-semibold" style={{ color: "#1B2632" }}>{props.children}</h4>,
    p: (props: any) => <p className="mb-4 leading-relaxed" style={{ color: "#9E9485" }}>{props.children}</p>,
    ul: (props: any) => <ul className="pl-6 mb-4 space-y-2 list-disc" style={{ color: "#9E9485" }}>{props.children}</ul>,
    ol: (props: any) => <ol className="pl-6 mb-4 space-y-2 list-decimal" style={{ color: "#9E9485" }}>{props.children}</ol>,
    li: (props: any) => <li style={{ color: "#9E9485" }}>{props.children}</li>,
    blockquote: (props: any) => <blockquote className="pl-4 my-4 italic border-l-4" style={{ borderColor: "#FFB162", color: "#9E9485" }}>{props.children}</blockquote>,
    a: (props: any) => <a href={props.href} className="underline hover:opacity-70 transition-opacity" style={{ color: "#2C3B4D" }} target="_blank" rel="noopener noreferrer">{props.children}</a>,
    table: (props: any) => <div className="my-4 overflow-x-auto"><table className="w-full border border-collapse" style={{ borderColor: "#C9C1B1" }}>{props.children}</table></div>,
    th: (props: any) => <th className="px-4 py-2 font-semibold text-left border" style={{ borderColor: "#C9C1B1", backgroundColor: "#E5DFD3", color: "#1B2632" }}>{props.children}</th>,
    td: (props: any) => <td className="px-4 py-2 border" style={{ borderColor: "#C9C1B1", color: "#9E9485" }}>{props.children}</td>,
    hr: () => <hr className="my-8" style={{ borderColor: "#C9C1B1" }} />,
    strong: (props: any) => <strong className="font-semibold" style={{ color: "#1B2632" }}>{props.children}</strong>,
    em: (props: any) => <em className="italic" style={{ color: "#9E9485" }}>{props.children}</em>,
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "#EEE9DF",
        color: "#1B2632",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Navigation */}
      <nav className="border-b" style={{ borderColor: "#C9C1B1" }}>
        <div className="max-w-6xl px-6 py-4 mx-auto">
          <button
            onClick={() => navigate("/new-design")}
            className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: "#2C3B4D" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portfolio
          </button>
        </div>
      </nav>

      {/* Project Content */}
      <div className="max-w-4xl px-6 py-12 mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl" style={{ color: "#1B2632" }}>
            {project.title}
          </h1>
          <p className="mb-6 text-lg" style={{ color: "#9E9485" }}>
            {project.description}
          </p>
          <div className="flex flex-wrap gap-3">
            {project.github && (
              <button
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white transition-all duration-200 shadow-soft hover:opacity-90"
                style={{ backgroundColor: "#2C3B4D" }}
                onClick={() => window.open(project.github)}
              >
                <Github className="w-4 h-4" />
                View Code
              </button>
            )}
            {project.demo && (
              <button
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium border transition-all duration-200 shadow-soft hover:shadow-soft-md"
                style={{ backgroundColor: "#F4F0E8", borderColor: "#C9C1B1", color: "#1B2632" }}
                onClick={() => window.open(project.demo)}
              >
                <ExternalLink className="w-4 h-4" />
                Try it Out!
              </button>
            )}
            {project.dmgUrl && (
              <a href={project.dmgUrl} download>
                <button
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium border transition-all duration-200 shadow-soft hover:shadow-soft-md"
                  style={{ backgroundColor: "#F4F0E8", borderColor: "#C9C1B1", color: "#1B2632" }}
                >
                  <Download className="w-4 h-4" />
                  Download DMG
                </button>
              </a>
            )}
          </div>
        </div>

        {/* Project Image */}
        {project.image && (
          <div className="mb-12">
            <img
              src={project.image}
              alt={project.title}
              className="object-cover w-full h-64 rounded-2xl border md:h-96 shadow-soft-md"
              style={{ borderColor: "#C9C1B1" }}
            />
          </div>
        )}

        {/* Screenshots */}
        {project.screenshots && project.screenshots.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold" style={{ color: "#1B2632" }}>Screenshots</h2>
            <div className={`grid grid-cols-1 gap-4 ${project.screenshots.length > 1 ? "md:grid-cols-2" : ""}`}>
              {project.screenshots.map((src, i) => (
                <img key={src} src={src} alt={`${project.title} screenshot ${i + 1}`} className="w-full rounded-2xl border shadow-soft" style={{ borderColor: "#C9C1B1" }} />
              ))}
            </div>
          </div>
        )}

        {/* Technologies */}
        <div className="mb-6 rounded-2xl border shadow-soft-md p-6" style={{ backgroundColor: "#F4F0E8", borderColor: "#C9C1B1" }}>
          <h2 className="mb-4 text-xl font-semibold" style={{ color: "#1B2632" }}>Technologies Used</h2>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <span key={tech} className="px-3 py-1.5 text-sm rounded-xl border font-medium" style={{ backgroundColor: "#EEE9DF", borderColor: "#C9C1B1", color: "#1B2632" }}>
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* About */}
        <div className="mb-6 rounded-2xl border shadow-soft-md p-6" style={{ backgroundColor: "#F4F0E8", borderColor: "#C9C1B1" }}>
          <h2 className="mb-4 text-xl font-semibold" style={{ color: "#1B2632" }}>About This Project</h2>
          {project.videoUrl && (
            <div className="mb-6">
              <h3 className="mb-3 text-base font-semibold" style={{ color: "#1B2632" }}>Demo</h3>
              <video src={project.videoUrl} controls className="w-full rounded-xl border shadow-soft" style={{ maxHeight: "480px", borderColor: "#C9C1B1" }}>
                Your browser does not support the video tag.
              </video>
              {project.dmgUrl && (
                <p className="mt-3 text-sm" style={{ color: "#9E9485" }}>
                  Want to try it yourself?{" "}
                  <a href={project.dmgUrl} download className="underline hover:opacity-70 transition-opacity" style={{ color: "#2C3B4D" }}>Click here to download</a>.
                </p>
              )}
            </div>
          )}
          <div className="leading-relaxed" style={{ color: "#9E9485" }}>
            {project.longDescription.split("\n\n").map((paragraph, index) => (
              <p key={index} className={index > 0 ? "mt-4" : ""}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* How It Works */}
        {project.howItWorks && (
          <div className="mb-6 rounded-2xl border shadow-soft-md p-6" style={{ backgroundColor: "#F4F0E8", borderColor: "#C9C1B1" }}>
            <h2 className="mb-4 text-xl font-semibold" style={{ color: "#1B2632" }}>How It Works</h2>
            <div className="prose max-w-none">
              <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                {project.howItWorks}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="rounded-2xl border shadow-soft-md p-6" style={{ backgroundColor: "#F4F0E8", borderColor: "#C9C1B1" }}>
          <h2 className="mb-4 text-xl font-semibold" style={{ color: "#1B2632" }}>Key Features</h2>
          <ul className="space-y-3">
            {project.features.map((feature, index) => (
              <li key={index} className="flex items-start" style={{ color: "#9E9485" }}>
                <div className="flex-shrink-0 w-2 h-2 mt-2 mr-3 rounded-full" style={{ backgroundColor: "#FFB162" }} />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Jupyter Notebook */}
        {project.notebookUrl && (
          <div className="mt-6 rounded-2xl border shadow-soft-md p-6" style={{ backgroundColor: "#F4F0E8", borderColor: "#C9C1B1" }}>
            <h2 className="mb-4 text-xl font-semibold" style={{ color: "#1B2632" }}>Interactive Notebook</h2>
            <p className="mb-4 text-sm" style={{ color: "#9E9485" }}>
              Below is the full Jupyter notebook showcasing the implementation, experiments, and results.
            </p>
            {notebookLoading && (
              <div className="flex items-center justify-center p-8 mb-4 rounded-xl" style={{ backgroundColor: "#EEE9DF" }}>
                <div style={{ color: "#9E9485" }}>Loading notebook...</div>
              </div>
            )}
            <div className="relative w-full overflow-hidden rounded-xl border" style={{ borderColor: "#C9C1B1" }}>
              <iframe
                src={project.notebookUrl}
                title={`${project.title} - Jupyter Notebook`}
                className="w-full bg-white"
                style={{ height: "800px", minHeight: "600px" }}
                onLoad={() => setNotebookLoading(false)}
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailNew;
