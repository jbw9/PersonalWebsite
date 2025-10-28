import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/button";
import { Card, CardContent } from "../components/card";
import { Badge } from "../components/badge";
import { ArrowLeft, Github, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { projects } from "../data/projects";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

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
      <div className="flex items-center justify-center min-h-screen bg-portfolio-dark text-portfolio-light">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">
            Project Not Found
          </h1>
          <Button
            onClick={() => navigate("/")}
            className="bg-portfolio-blue hover:bg-portfolio-blue/80"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Portfolio
          </Button>
        </div>
      </div>
    );
  }

  // Custom components for markdown rendering
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
          className="rounded-md"
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code
          className="bg-portfolio-accent/20 text-portfolio-blue px-1.5 py-0.5 rounded text-sm font-mono"
          {...rest}
        >
          {children}
        </code>
      );
    },
    h1(props: any) {
      return (
        <h1 className="mt-8 mb-6 text-3xl font-bold text-white first:mt-0">
          {props.children}
        </h1>
      );
    },
    h2(props: any) {
      return (
        <h2 className="mt-6 mb-4 text-2xl font-semibold text-white">
          {props.children}
        </h2>
      );
    },
    h3(props: any) {
      return (
        <h3 className="mt-5 mb-3 text-xl font-semibold text-white">
          {props.children}
        </h3>
      );
    },
    h4(props: any) {
      return (
        <h4 className="mt-4 mb-2 text-lg font-semibold text-white">
          {props.children}
        </h4>
      );
    },
    p(props: any) {
      return (
        <p className="mb-4 leading-relaxed text-portfolio-light">
          {props.children}
        </p>
      );
    },
    ul(props: any) {
      return (
        <ul className="pl-6 mb-4 space-y-2 list-disc text-portfolio-light">
          {props.children}
        </ul>
      );
    },
    ol(props: any) {
      return (
        <ol className="pl-6 mb-4 space-y-2 list-decimal text-portfolio-light">
          {props.children}
        </ol>
      );
    },
    li(props: any) {
      return <li className="text-portfolio-light">{props.children}</li>;
    },
    blockquote(props: any) {
      return (
        <blockquote className="pl-4 my-4 italic border-l-4 border-portfolio-blue text-portfolio-accent">
          {props.children}
        </blockquote>
      );
    },
    a(props: any) {
      return (
        <a
          href={props.href}
          className="underline text-portfolio-blue hover:text-portfolio-blue/80"
          target="_blank"
          rel="noopener noreferrer"
        >
          {props.children}
        </a>
      );
    },
    table(props: any) {
      return (
        <div className="my-4 overflow-x-auto">
          <table className="w-full border border-collapse border-portfolio-accent/30">
            {props.children}
          </table>
        </div>
      );
    },
    th(props: any) {
      return (
        <th className="px-4 py-2 font-semibold text-left text-white border border-portfolio-accent/30 bg-portfolio-accent/10">
          {props.children}
        </th>
      );
    },
    td(props: any) {
      return (
        <td className="px-4 py-2 border border-portfolio-accent/30 text-portfolio-light">
          {props.children}
        </td>
      );
    },
    hr() {
      return <hr className="my-8 border-portfolio-accent/30" />;
    },
    strong(props: any) {
      return (
        <strong className="font-semibold text-white">{props.children}</strong>
      );
    },
    em(props: any) {
      return <em className="italic text-portfolio-accent">{props.children}</em>;
    },
  };

  return (
    <div className="min-h-screen bg-portfolio-dark text-portfolio-light">
      {/* Navigation */}
      <nav className="border-b border-portfolio-slate">
        <div className="max-w-6xl px-6 py-4 mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-portfolio-light hover:text-portfolio-blue"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Portfolio
          </Button>
        </div>
      </nav>

      {/* Project Content */}
      <div className="max-w-4xl px-6 py-12 mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            {project.title}
          </h1>
          <p className="mb-6 text-xl text-portfolio-light">
            {project.description}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-4">
            {project.github && (
              <Button
                className="bg-portfolio-blue hover:bg-portfolio-blue/80"
                onClick={() => window.open(project.github)}
              >
                <Github className="w-4 h-4 mr-2" />
                View Code
              </Button>
            )}
            {project.demo && (
              <Button
                variant="outline"
                className="border-portfolio-accent text-portfolio-light hover:bg-portfolio-slate"
                onClick={() => window.open(project.demo)}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Try it Out!
              </Button>
            )}
          </div>
        </div>

        {/* Project Image - Only show if image exists */}
        {project.image && (
          <div className="mb-12">
            <img
              src={project.image}
              alt={project.title}
              className="object-cover w-full h-64 border rounded-lg md:h-96 border-portfolio-accent/20"
            />
          </div>
        )}

        {/* Technologies */}
        <Card className="mb-8 bg-portfolio-slate border-portfolio-accent/20">
          <CardContent className="p-6">
            <h2 className="mb-4 text-2xl font-semibold text-white">
              Technologies Used
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <Badge
                  key={tech}
                  variant="secondary"
                  className="bg-portfolio-dark text-portfolio-light"
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="mb-8 bg-portfolio-slate border-portfolio-accent/20">
          <CardContent className="p-6">
            <h2 className="mb-4 text-2xl font-semibold text-white">
              About This Project
            </h2>
            <div className="leading-relaxed text-portfolio-light">
              {project.longDescription.split("\n\n").map((paragraph, index) => (
                <p key={index} className={index > 0 ? "mt-4" : ""}>
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* How It Works Section - Only show if project has howItWorks content */}
        {project.howItWorks && (
          <Card className="mb-8 bg-portfolio-slate border-portfolio-accent/20">
            <CardContent className="p-6">
              <h2 className="mb-4 text-2xl font-semibold text-white">
                How It Works
              </h2>
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown
                  components={markdownComponents}
                  remarkPlugins={[remarkGfm]}
                >
                  {project.howItWorks}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <Card className="bg-portfolio-slate border-portfolio-accent/20">
          <CardContent className="p-6">
            <h2 className="mb-4 text-2xl font-semibold text-white">
              Key Features
            </h2>
            <ul className="space-y-3">
              {project.features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-start text-portfolio-light"
                >
                  <div className="flex-shrink-0 w-2 h-2 mt-2 mr-3 rounded-full bg-portfolio-blue"></div>
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Jupyter Notebook Embedding - Only show if notebookUrl exists */}
        {project.notebookUrl && (
          <Card className="mt-8 bg-portfolio-slate border-portfolio-accent/20">
            <CardContent className="p-6">
              <h2 className="mb-4 text-2xl font-semibold text-white">
                Interactive Notebook
              </h2>
              <p className="mb-4 text-portfolio-light">
                Below is the full Jupyter notebook showcasing the implementation,
                experiments, and results of this project.
              </p>

              {/* Loading indicator */}
              {notebookLoading && (
                <div className="flex items-center justify-center p-8 mb-4 bg-portfolio-dark rounded-lg">
                  <div className="text-portfolio-light">
                    <div className="inline-block w-8 h-8 border-4 border-portfolio-blue border-t-transparent rounded-full animate-spin mr-3"></div>
                    Loading notebook...
                  </div>
                </div>
              )}

              {/* Notebook iframe */}
              <div className="relative w-full overflow-hidden rounded-lg border border-portfolio-accent/20">
                <iframe
                  src={project.notebookUrl}
                  title={`${project.title} - Jupyter Notebook`}
                  className="w-full bg-white"
                  style={{
                    height: '800px',
                    minHeight: '600px',
                  }}
                  onLoad={() => setNotebookLoading(false)}
                  sandbox="allow-same-origin allow-scripts"
                />
              </div>

              {/* Helpful tips */}
              <div className="mt-4 p-4 bg-portfolio-dark rounded-lg">
                <p className="text-sm text-portfolio-accent">
                  💡 <strong>Tip:</strong> You can scroll through the notebook above to see the code,
                  visualizations, and detailed explanations.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
