import { ReactElement } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const components = {
  // Fenced blocks arrive as <pre><code class="language-x">; inline code never has a <pre>
  pre: ({ children }: any) => {
    const { className, children: text } = (children as ReactElement).props;
    const lang = /language-(\w+)/.exec(className || "")?.[1];
    return (
      <div className="rxp-code">
        {lang && <span className="rxp-code-lang rx-mono">{lang}</span>}
        <SyntaxHighlighter
          language={lang || "text"}
          style={vscDarkPlus as any}
          PreTag="div"
          customStyle={{ margin: 0, padding: "1.3rem 1.4rem", background: "transparent", fontSize: "13.5px", lineHeight: 1.65 }}
          codeTagProps={{ style: { fontFamily: '"IBM Plex Mono", ui-monospace, monospace', background: "none" } }}
        >
          {String(text).replace(/\n$/, "")}
        </SyntaxHighlighter>
      </div>
    );
  },
  a: ({ href, children }: any) => (
    <a href={href} {...(href && href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {children}
    </a>
  ),
  // span, not figure: images sit inside <p>
  img: ({ src, alt }: any) => (
    <span className="rxp-figure">
      <img src={src} alt={alt || ""} loading="lazy" />
      {alt && <span className="rx-mono">{alt}</span>}
    </span>
  ),
  table: ({ children }: any) => (
    <div className="rxp-table">
      <table>{children}</table>
    </div>
  ),
};

export const Markdown = ({ children }: { children: string }) => (
  <div className="rxp-prose">
    {/* Some content writes "•" bullets on bare lines, which markdown would run together into one paragraph */}
    <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
      {children.replace(/^• /gm, "- ")}
    </ReactMarkdown>
  </div>
);
