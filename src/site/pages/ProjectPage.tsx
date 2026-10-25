import { ReactNode, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowUpRight, Download, Github } from "lucide-react";
import { projects } from "../../data/projects";
import { projectPath } from "../contracts";
import { Markdown } from "./markdown";
import { Label, NotFound, PrevNext, Rise, Shell } from "./shared";

const ext = { target: "_blank", rel: "noopener noreferrer" };
const num = (i: number) => String(i + 1).padStart(2, "0");
const neighbour = (i: number) => {
  const p = projects[(i + projects.length) % projects.length];
  return { to: projectPath(p.id), title: p.title, meta: num(projects.indexOf(p)), img: p.thumbnail || p.image || p.screenshots?.[0] };
};

const Block = ({ label, title, children }: { label: string; title?: string; children: ReactNode }) => (
  <Rise view>
    <section>
      <Label>{label}</Label>
      {title && <h2 className="mt-4 mb-8 text-[clamp(2.1rem,3.6vw,2.9rem)] italic font-light leading-none">{title}</h2>}
      {children}
    </section>
  </Rise>
);

// VisuLearn's exported animations report their height to the parent, so the frame fits without scrolling
const Player = ({ url, title }: { url: string; title: string }) => {
  const ref = useRef<HTMLIFrameElement>(null);
  const [h, setH] = useState(560);
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.source === ref.current?.contentWindow && e.data?.type === "resize" && e.data.height > 0) setH(e.data.height);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);
  return <iframe ref={ref} src={url} title={title} style={{ height: h }} className="block w-full rounded-3xl bg-[#ece7dd]" />;
};

const Notebook = ({ url, title }: { url: string; title: string }) => {
  const [loading, setLoading] = useState(true);
  return (
    <>
      <div className="rxp-media relative rounded-3xl overflow-hidden !bg-white">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center gap-3 bg-[#0b111e] rx-mono text-[10.5px] text-[#8692a8]">
            <span className="w-5 h-5 rounded-full border-2 border-[#5b9cff] border-t-transparent animate-spin" />
            Loading notebook…
          </div>
        )}
        <iframe
          src={url}
          title={`${title} — Jupyter notebook`}
          className="block w-full h-[78vh] min-h-[560px]"
          onLoad={() => setLoading(false)}
          sandbox="allow-scripts"
        />
      </div>
      <a href={url} {...ext} className="rx-btn-ghost rx-mono mt-5">
        Open full screen <ArrowUpRight className="w-3.5 h-3.5" />
      </a>
    </>
  );
};

const ProjectPage = () => {
  const { id } = useParams();
  const i = projects.findIndex((p) => p.id === id);
  const p = projects[i];

  // Sticky side column; one taller than the viewport scrolls until its end shows, then sticks
  const side = useRef<HTMLElement>(null);
  const [top, setTop] = useState(96);
  useEffect(() => {
    const fit = () => side.current && setTop(Math.min(96, window.innerHeight - side.current.offsetHeight - 32));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [id]);

  if (!p) return <NotFound section="projects" what="project" />;

  const hero = p.image || p.screenshots?.[0];
  const shots = (p.screenshots || []).filter((s) => s !== hero);
  const [lede, ...paras] = p.longDescription.split("\n\n");
  const pad = "max-w-[1320px] mx-auto px-5 md:px-[7vw]";

  return (
    <Shell section="projects">
      <header className={`${pad} pt-28 md:pt-40`}>
        <Rise>
          <Label>
            Project {num(i)} <span className="text-[#5d687c]">/ {num(projects.length - 1)}</span>
          </Label>
        </Rise>
        <Rise d={0.08}>
          <h1 className="mt-6 text-[clamp(3.4rem,9vw,8rem)] italic font-light leading-[0.88] tracking-[-0.015em]">{p.title}</h1>
        </Rise>
        <Rise d={0.16}>
          <p className="mt-7 max-w-[42ch] text-[1.35rem] md:text-[1.6rem] leading-[1.35] text-[#c2cbdb]">{p.description}</p>
        </Rise>
        <Rise d={0.24} className="mt-9 flex flex-wrap gap-3">
          {p.demo && (
            <a href={p.demo} {...ext} className="rx-btn rx-mono">
              {p.demo.includes("apps.apple.com") ? "App Store" : "Visit live site"} <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          )}
          {p.github && (
            <a href={p.github} {...ext} className={`${p.demo ? "rx-btn-ghost" : "rx-btn"} rx-mono`}>
              <Github className="w-3.5 h-3.5" /> Source code
            </a>
          )}
          {p.dmgUrl && (
            <a href={p.dmgUrl} {...ext} className="rx-btn-ghost rx-mono">
              <Download className="w-3.5 h-3.5" /> Download for macOS
            </a>
          )}
        </Rise>
      </header>

      {(hero || p.videoUrl) && (
        <Rise d={0.32} className={`${pad} mt-14 md:mt-20`}>
          <div className="rxp-hero rounded-3xl overflow-hidden">
            {hero ? (
              <img src={hero} alt={p.title} className="block w-full h-auto" />
            ) : (
              <video src={p.videoUrl} controls playsInline preload="metadata" className="block w-full max-h-[80vh] bg-black" />
            )}
          </div>
        </Rise>
      )}

      <div className={`${pad} mt-20 md:mt-28 grid gap-16 lg:gap-x-20 lg:grid-cols-[minmax(0,1fr)_340px]`}>
        <Block label="Overview">
          <p className="mt-6 text-[1.5rem] md:text-[1.7rem] leading-[1.38] text-[#e6ecf5]">{lede}</p>
          <div className="mt-6 space-y-5 text-[1.25rem] md:text-[1.32rem] leading-[1.68] text-[#c2cbdb]">
            {paras.map((t, k) => (
              <p key={k}>{t}</p>
            ))}
          </div>
        </Block>

        <aside ref={side} style={{ top }} className="self-start lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky">
          <Rise view className="rx-card !rounded-3xl p-6 md:p-7">
            <div className="rx-mono text-[10px] text-[#8692a8]">Highlights</div>
            <ul className="mt-4 space-y-3">
              {p.features.map((f, k) => (
                <li key={k} className="flex gap-3 text-[1.08rem] leading-snug text-[#c2cbdb]">
                  <span className="mt-[0.55em] w-1.5 h-1.5 rounded-full bg-[#5b9cff] shadow-[0_0_8px_#5b9cff] shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-7 pt-6 border-t border-[#e6ecf5]/[0.08] rx-mono text-[10px] text-[#8692a8]">Built with</div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.technologies.map((t) => (
                <span key={t} className="rx-chip">
                  {t}
                </span>
              ))}
            </div>
          </Rise>
        </aside>

        {(p.videoUrl && hero) || p.playerUrl || p.howItWorks || p.notebookUrl ? (
          <div className="lg:col-start-1 space-y-24 min-w-0">
            {p.videoUrl && hero && (
              <Block label="Demo" title="See it run">
                <video src={p.videoUrl} controls playsInline preload="metadata" className="rxp-media block w-full max-h-[80vh] rounded-3xl bg-black" />
              </Block>
            )}
            {p.playerUrl && (
              <Block label="Try it" title="Click through it">
                <Player url={p.playerUrl} title={`${p.title} demo`} />
                {p.demo && (
                  <a href={p.demo} {...ext} className="mt-6 rx-btn rx-mono inline-flex">
                    Ask your own question on {p.demo.replace(/^https?:\/\/(www\.)?/, "")} <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </Block>
            )}
            {p.howItWorks && (
              <Block label="Under the hood" title="How it works">
                <Markdown>{p.howItWorks}</Markdown>
              </Block>
            )}
            {p.notebookUrl && (
              <Block label="Notebook" title="The full notebook">
                <p className="-mt-3 mb-7 text-[1.2rem] text-[#8692a8]">Implementation, experiments and results, runnable top to bottom.</p>
                <Notebook url={p.notebookUrl} title={p.title} />
              </Block>
            )}
          </div>
        ) : null}
      </div>

      {shots.length > 0 && (
        <div className={`${pad} mt-24 md:mt-32`}>
          <Block label="Gallery" title="More screens">
            <div className={`grid gap-6 ${shots.length > 1 ? "md:grid-cols-2" : ""}`}>
              {shots.map((s, k) => (
                <img key={s} src={s} alt={`${p.title} screen ${k + 2}`} loading="lazy" className="rxp-media block w-full rounded-3xl" />
              ))}
            </div>
          </Block>
        </div>
      )}

      <div className={`${pad} mt-28 md:mt-36`}>
        <Rise view>
          <PrevNext prev={neighbour(i - 1)} next={neighbour(i + 1)} />
        </Rise>
      </div>
    </Shell>
  );
};

export default ProjectPage;
