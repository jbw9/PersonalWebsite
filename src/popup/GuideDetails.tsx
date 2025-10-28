import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/button";
import { Card, CardContent } from "../components/card";
import { Badge } from "../components/badge";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { guides } from "../data/guides";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const GuideDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const guide = guides.find((g) => g.id === id);

  if (!guide) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-portfolio-dark text-portfolio-light">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">
            Guide Not Found
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
    img(props: any) {
      return (
        <img
          src={props.src}
          alt={props.alt}
          className="h-auto max-w-full my-4 rounded-lg"
          {...props}
        />
      );
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

      {/* Guide Content */}
      <div className="max-w-4xl px-6 py-12 mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="mb-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge
                  variant="outline"
                  className="border-portfolio-blue/50 text-portfolio-blue"
                >
                  {guide.category}
                </Badge>
                <span className="text-sm text-portfolio-accent">•</span>
                <span className="text-sm text-portfolio-accent">
                  {guide.publishDate}
                </span>
              </div>
              <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
                {guide.title}
              </h1>
              <p className="text-xl text-portfolio-light">
                {guide.description}
              </p>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <Card className="bg-portfolio-slate border-portfolio-accent/20">
          <CardContent className="p-8">
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown
                components={markdownComponents}
                remarkPlugins={[remarkGfm]}
              >
                {guide.content}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GuideDetail;
