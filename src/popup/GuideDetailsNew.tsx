import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { guides } from "../data/guides";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const GuideDetailsNew = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const guide = guides.find((g) => g.id === id);

  if (!guide) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: "#EEE9DF", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
      >
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold" style={{ color: "#1B2632" }}>Guide Not Found</h1>
          <button
            onClick={() => navigate("/new-design")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white mx-auto"
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
        <SyntaxHighlighter {...rest} PreTag="div" language={match[1]} style={vscDarkPlus as any} className="rounded-xl">
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code className="px-1.5 py-0.5 rounded text-sm font-mono" style={{ backgroundColor: "#E5DFD3", color: "#2C3B4D" }} {...rest}>
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
    img: (props: any) => <img src={props.src} alt={props.alt} className="h-auto max-w-full my-4 rounded-xl border shadow-soft" style={{ borderColor: "#C9C1B1" }} />,
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#EEE9DF", color: "#1B2632", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      {/* Navigation */}
      <nav className="border-b" style={{ borderColor: "#C9C1B1" }}>
        <div className="max-w-6xl px-6 py-4 mx-auto">
          <button
            onClick={() => navigate("/new-design")}
            className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: "#2C3B4D" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portfolio
          </button>
        </div>
      </nav>

      {/* Guide Content */}
      <div className="max-w-4xl px-6 py-12 mx-auto">
        <div className="mb-12">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 text-xs font-semibold rounded-full text-white" style={{ backgroundColor: "#2C3B4D" }}>
              {guide.category}
            </span>
            <span className="text-sm" style={{ color: "#9E9485" }}>{guide.publishDate}</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl" style={{ color: "#1B2632" }}>{guide.title}</h1>
          <p className="text-lg" style={{ color: "#9E9485" }}>{guide.description}</p>
        </div>

        <div className="rounded-2xl border shadow-soft-md p-8" style={{ backgroundColor: "#F4F0E8", borderColor: "#C9C1B1" }}>
          <div className="prose max-w-none">
            <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
              {guide.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideDetailsNew;
