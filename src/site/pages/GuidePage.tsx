import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { guides } from "../../data/guides";
import { guidePath } from "../contracts";
import { Markdown } from "./markdown";
import { NotFound, PrevNext, Rise, Shell } from "./shared";

const neighbour = (i: number) => {
  const g = guides[(i + guides.length) % guides.length];
  return { to: guidePath(g.id), title: g.title, meta: g.category };
};

// Same-origin page, sized to its content so the site scrolls instead of the frame (skills expand on click)
const Page = ({ src, title }: { src: string; title: string }) => {
  const ref = useRef<HTMLIFrameElement>(null);
  const [h, setH] = useState(900);
  const fit = () => {
    const body = ref.current?.contentDocument?.body;
    if (!body) return;
    const measure = () => setH(body.scrollHeight);
    measure();
    new ResizeObserver(measure).observe(body);
  };
  return <iframe ref={ref} src={src} title={title} onLoad={fit} style={{ height: h }} className="block w-full rounded-3xl border border-[#e6ecf5]/10" />;
};

const GuidePage = () => {
  const { id } = useParams();
  const i = guides.findIndex((g) => g.id === id);
  const g = guides[i];
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 220, damping: 32, restDelta: 0.001 });

  if (!g) return <NotFound section="guides" what="guide" />;

  const minutes = Math.max(1, Math.round(g.content.split(/\s+/).length / 220));

  return (
    <Shell section="guides">
      <motion.div className="rxp-progress" style={{ scaleX: reduce ? scrollYProgress : smooth }} />
      <article className="mx-auto max-w-[47rem] px-5 md:px-8 pt-28 md:pt-40">
        <header>
          <Rise>
            <div className="rx-mono text-[10.5px] text-[#5b9cff] flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>{g.category}</span>
              <span className="text-[#5d687c]">·</span>
              <span className="text-[#8692a8]">{g.publishDate}</span>
              <span className="text-[#5d687c]">·</span>
              <span className="text-[#8692a8]">{minutes} min read</span>
            </div>
          </Rise>
          <Rise d={0.08}>
            <h1 className="mt-6 text-[clamp(2.9rem,6.4vw,5.2rem)] italic font-light leading-[0.95] tracking-[-0.01em]">{g.title}</h1>
          </Rise>
          <Rise d={0.16}>
            <p className="mt-6 text-[1.35rem] md:text-[1.5rem] leading-[1.4] text-[#c2cbdb]">{g.description}</p>
          </Rise>
          <Rise d={0.22}>
            <div className="mt-12 md:mt-14 h-px bg-gradient-to-r from-[#5b9cff]/50 via-[#e6ecf5]/10 to-transparent" />
          </Rise>
        </header>
        {!g.page && (
          <Rise d={0.3} className="mt-12 md:mt-14">
            <Markdown>{g.content}</Markdown>
          </Rise>
        )}
      </article>
      {g.page && (
        <Rise d={0.3} className="mx-auto max-w-[1128px] px-5 md:px-8 mt-12 md:mt-14">
          <Page src={g.page} title={g.title} />
          <a href={g.page} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rx-mono text-[11px] text-[#8692a8] hover:text-[#5b9cff] transition-colors">
            open full page ↗
          </a>
        </Rise>
      )}
      <div className="mx-auto max-w-[60rem] px-5 md:px-8 mt-24 md:mt-32">
        <Rise view>
          <PrevNext prev={neighbour(i - 1)} next={neighbour(i + 1)} />
        </Rise>
      </div>
    </Shell>
  );
};

export default GuidePage;
