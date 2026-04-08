import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { guides } from "../data/guides";
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
    <blockquote className="pl-4 my-4 italic border-l-4 border-[#2563EB] text-warm-muted bg-warm-surface rounded-r-xl py-2">
      {props.children}
    </blockquote>
  ),
  a: (props: any) => (
    <a
      href={props.href}
      className="underline underline-offset-2 text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
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
  img: (props: any) => (
    <img
      src={props.src}
      alt={props.alt}
      className="h-auto max-w-full my-4 rounded-2xl border border-warm-border"
    />
  ),
};

const GuideDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const guide = guides.find((g) => g.id === id);

  if (!guide) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-warm-bg text-warm-navy">
        <div className="text-center">
          <h1 className="font-display mb-4 text-4xl font-bold">Guide Not Found</h1>
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
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${getTechBadgeColor(guide.category)}`}
            >
              {guide.category}
            </span>
            <span className="text-sm text-warm-muted">{guide.publishDate}</span>
          </div>
          <h1 className="font-display mb-3 text-4xl font-bold text-warm-navy md:text-5xl leading-tight">
            {guide.title}
          </h1>
          <p className="text-lg text-warm-muted leading-relaxed max-w-2xl">
            {guide.description}
          </p>
        </div>

        {/* Article content */}
        <div className="bg-warm-surface border border-warm-border rounded-2xl p-6 md:p-8">
          <div className="prose max-w-none">
            <ReactMarkdown
              components={markdownComponents}
              remarkPlugins={[remarkGfm]}
            >
              {guide.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideDetail;
