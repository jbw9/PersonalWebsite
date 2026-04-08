import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Github, ExternalLink, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { projects } from "../data/projects";
import { getTechBadgeColor } from "../lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

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
        className="!rounded-xl !my-4"
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code
        className="bg-warm-surface border border-warm-border text-[#1B2D4F] px-1.5 py-0.5 rounded text-sm font-mono"
        {...rest}
      >
        {children}
      </code>
    );
  },
  h1: (props: any) => (
    <h1 className="font-display mt-8 mb-4 text-3xl font-bold text-warm-navy first:mt-0">
      {props.children}
    </h1>
  ),
  h2: (props: any) => (
    <h2 className="font-display mt-6 mb-3 text-2xl font-semibold text-warm-navy">
      {props.children}
    </h2>
  ),
  h3: (props: any) => (
    <h3 className="font-display mt-5 mb-2 text-xl font-semibold text-warm-navy">
      {props.children}
    </h3>
  ),
  h4: (props: any) => (
    <h4 className="mt-4 mb-2 text-lg font-semibold text-warm-navy">
      {props.children}
    </h4>
  ),
  p: (props: any) => (
    <p className="mb-4 leading-relaxed text-warm-muted">{props.children}</p>
  ),
  ul: (props: any) => (
    <ul className="pl-6 mb-4 space-y-2 list-disc text-warm-muted">
      {props.children}
    </ul>
  ),
  ol: (props: any) => (
    <ol className="pl-6 mb-4 space-y-2 list-decimal text-warm-muted">
      {props.children}
    </ol>
  ),
  li: (props: any) => <li className="text-warm-muted">{props.children}</li>,
  blockquote: (props: any) => (
    <blockquote className="pl-4 my-4 italic border-l-4 border-[#6B93C4] text-warm-muted bg-warm-surface rounded-r-xl py-2">
      {props.children}
    </blockquote>
  ),
  a: (props: any) => (
    <a
      href={props.href}
      className="underline underline-offset-2 text-[#6B93C4] hover:text-[#4D7AAF] transition-colors"
      target="_blank"
      rel="noopener noreferrer"
    >
      {props.children}
    </a>
  ),
  table: (props: any) => (
    <div className="my-4 overflow-x-auto rounded-xl border border-warm-border">
      <table className="w-full border-collapse">{props.children}</table>
    </div>
  ),
  th: (props: any) => (
    <th className="px-4 py-2.5 font-semibold text-left text-warm-navy bg-warm-surface border-b border-warm-border">
      {props.children}
    </th>
  ),
  td: (props: any) => (
    <td className="px-4 py-2.5 border-b border-warm-border/60 text-warm-muted">
      {props.children}
    </td>
  ),
  hr: () => <hr className="my-8 border-warm-border" />,
  strong: (props: any) => (
    <strong className="font-semibold text-warm-navy">{props.children}</strong>
  ),
  em: (props: any) => (
    <em className="italic text-warm-muted">{props.children}</em>
  ),
};

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notebookLoading, setNotebookLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-warm-bg text-warm-navy">
        <div className="text-center">
          <h1 className="font-display mb-4 text-4xl font-bold text-warm-navy">
            Project Not Found
          </h1>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-5 py-2.5 bg-warm-navy text-warm-bg rounded-full text-sm font-medium hover:bg-warm-navy/80 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portfolio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-bg text-warm-navy font-sans">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-warm-bg/90 backdrop-blur-md border-b border-warm-border">
        <div className="max-w-4xl px-6 py-4 mx-auto">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-warm-muted hover:text-warm-navy transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portfolio
          </button>
        </div>
      </nav>

      <div className="max-w-4xl px-6 py-12 mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display mb-3 text-4xl font-bold text-warm-navy md:text-5xl leading-tight">
            {project.title}
          </h1>
          <p className="text-lg text-warm-muted leading-relaxed mb-6 max-w-2xl">
            {project.description}
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            {project.github && (
              <button
                onClick={() => window.open(project.github)}
                className="flex items-center gap-2 px-5 py-2.5 bg-warm-navy text-warm-bg rounded-full text-sm font-medium hover:bg-warm-navy/80 transition-all"
              >
                <Github className="w-4 h-4" />
                View Code
              </button>
            )}
            {project.demo && (
              <button
                onClick={() => window.open(project.demo)}
                className="flex items-center gap-2 px-5 py-2.5 border border-warm-border text-warm-navy rounded-full text-sm font-medium hover:bg-warm-surface transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Try it Out
              </button>
            )}
            {project.dmgUrl && (
              <a href={project.dmgUrl} download>
                <button className="flex items-center gap-2 px-5 py-2.5 border border-warm-border text-warm-navy rounded-full text-sm font-medium hover:bg-warm-surface transition-all">
                  <Download className="w-4 h-4" />
                  Download DMG
                </button>
              </a>
            )}
          </div>
        </div>

        {/* Hero image */}
        {project.image && (
          <div className="mb-10">
            <img
              src={project.image}
              alt={project.title}
              className="object-cover w-full h-64 md:h-96 rounded-2xl border border-warm-border"
            />
          </div>
        )}

        {/* Screenshots */}
        {project.screenshots && project.screenshots.length > 0 && (
          <div className="mb-10">
            <h2 className="font-display mb-4 text-xl font-semibold text-warm-navy">
              Screenshots
            </h2>
            <div
              className={`grid gap-4 ${
                project.screenshots.length > 1 ? "md:grid-cols-2" : ""
              }`}
            >
              {project.screenshots.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt={`${project.title} screenshot ${i + 1}`}
                  className="w-full rounded-2xl border border-warm-border"
                />
              ))}
            </div>
          </div>
        )}

        {/* Technologies */}
        <div className="mb-6 bg-warm-surface border border-warm-border rounded-2xl p-6">
          <h2 className="font-display mb-4 text-xl font-semibold text-warm-navy">
            Technologies
          </h2>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${getTechBadgeColor(tech)}`}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* About */}
        <div className="mb-6 bg-warm-surface border border-warm-border rounded-2xl p-6">
          <h2 className="font-display mb-4 text-xl font-semibold text-warm-navy">
            About This Project
          </h2>
          {project.videoUrl && (
            <div className="mb-6">
              <h3 className="mb-3 text-base font-semibold text-warm-navy">Demo</h3>
              <video
                src={project.videoUrl}
                controls
                className="w-full rounded-2xl border border-warm-border"
                style={{ maxHeight: "480px" }}
              >
                Your browser does not support the video tag.
              </video>
              {project.dmgUrl && (
                <p className="mt-3 text-sm text-warm-muted">
                  Want to try it yourself?{" "}
                  <a
                    href={project.dmgUrl}
                    download
                    className="text-[#6B93C4] underline underline-offset-2 hover:text-[#4D7AAF] transition-colors"
                  >
                    Click here to download
                  </a>
                  .
                </p>
              )}
            </div>
          )}
          <div className="text-warm-muted leading-relaxed space-y-4">
            {project.longDescription.split("\n\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* How It Works */}
        {project.howItWorks && (
          <div className="mb-6 bg-warm-surface border border-warm-border rounded-2xl p-6">
            <h2 className="font-display mb-4 text-xl font-semibold text-warm-navy">
              How It Works
            </h2>
            <div className="prose max-w-none">
              <ReactMarkdown
                components={markdownComponents}
                remarkPlugins={[remarkGfm]}
              >
                {project.howItWorks}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Key Features */}
        <div className="mb-6 bg-warm-surface border border-warm-border rounded-2xl p-6">
          <h2 className="font-display mb-4 text-xl font-semibold text-warm-navy">
            Key Features
          </h2>
          <ul className="space-y-3">
            {project.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3 text-warm-muted">
                <div className="flex-shrink-0 w-1.5 h-1.5 mt-2.5 rounded-full bg-[#6B93C4]" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Jupyter Notebook */}
        {project.notebookUrl && (
          <div className="bg-warm-surface border border-warm-border rounded-2xl p-6">
            <h2 className="font-display mb-2 text-xl font-semibold text-warm-navy">
              Interactive Notebook
            </h2>
            <p className="mb-4 text-sm text-warm-muted">
              Full Jupyter notebook with implementation, experiments, and results.
            </p>
            {notebookLoading && (
              <div className="flex items-center gap-3 p-6 mb-4 bg-warm-bg rounded-xl border border-warm-border text-warm-muted text-sm">
                <div className="w-5 h-5 border-2 border-[#6B93C4] border-t-transparent rounded-full animate-spin" />
                Loading notebook…
              </div>
            )}
            <div className="relative w-full overflow-hidden rounded-xl border border-warm-border">
              <iframe
                src={project.notebookUrl}
                title={`${project.title} — Jupyter Notebook`}
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

export default ProjectDetail;
