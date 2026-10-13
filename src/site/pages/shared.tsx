import { ReactNode, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { HOME, Resume } from "../contracts";
import "../remix.css";
import "./pages.css";

type Section = "projects" | "guides";
const ease = [0.2, 0.7, 0.2, 1];

// Same film grain as the remix (one noise tile, jittered by .rx-grain), lighter for reading
const useGrain = () =>
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 160;
    const ctx = c.getContext("2d");
    if (!ctx) return "";
    const img = ctx.createImageData(160, 160);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    return c.toDataURL();
  }, []);

export const useHome = (section: Section) => {
  const navigate = useNavigate();
  const state: Resume = { resume: { section } };
  return () => (window.history.state?.idx > 0 ? navigate(-1) : navigate(HOME, { state }));
};

export const Shell = ({ section, children }: { section: Section; children: ReactNode }) => {
  const { pathname } = useLocation();
  const grain = useGrain();
  const back = useHome(section);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className="v-remix relative min-h-screen">
      <div className="rxp-glow" aria-hidden />
      <div className="rx-grain z-0" style={{ backgroundImage: `url(${grain})`, opacity: 0.045 }} aria-hidden />
      <button onClick={back} className="rxp-back rx-btn-ghost !text-[10.5px] rx-mono" aria-label="Back to Jonathan's site">
        <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
        Jonathan
      </button>
      <main key={pathname} className="relative z-10 pb-32 md:pb-36">
        {children}
      </main>
    </div>
  );
};

// Entrance on mount (header) or on first scroll into view (body); reduced motion renders in place
export const Rise = ({ children, className, d = 0, view }: { children: ReactNode; className?: string; d?: number; view?: boolean }) => {
  const reduce = useReducedMotion();
  const to = { opacity: 1, y: 0 };
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 22 }}
      animate={view ? undefined : to}
      whileInView={view ? to : undefined}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.85, delay: d, ease }}
    >
      {children}
    </motion.div>
  );
};

export const Label = ({ children }: { children: ReactNode }) => (
  <div className="rx-mono text-[10.5px] text-[#5b9cff] flex items-center gap-3">
    <span>{children}</span>
    <span className="w-10 h-px bg-[#5b9cff]/40" />
  </div>
);

export type Neighbour = { to: string; title: string; meta: string; img?: string };

export const PrevNext = ({ prev, next }: { prev: Neighbour; next: Neighbour }) => (
  <nav className="grid gap-4 md:grid-cols-2">
    {[prev, next].map((n, i) => (
      <Link
        key={i}
        to={n.to}
        replace
        className={`rx-card rxp-next group flex items-center gap-5 p-4 md:p-5 !rounded-3xl ${i ? "md:flex-row-reverse md:text-right" : ""}`}
      >
        {n.img && <img src={n.img} alt="" className="w-20 h-14 md:w-28 md:h-[4.5rem] rounded-2xl object-cover object-top shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" />}
        <span className={`min-w-0 flex-1 ${n.img ? "" : "px-2 py-2"}`}>
          <span className="block rx-mono text-[10px] text-[#8692a8] group-hover:text-[#5b9cff] transition-colors">
            {i ? `Next · ${n.meta} →` : `← Previous · ${n.meta}`}
          </span>
          <span className="block mt-1.5 text-[1.45rem] md:text-[1.7rem] italic font-light leading-tight line-clamp-2">{n.title}</span>
        </span>
      </Link>
    ))}
  </nav>
);

export const NotFound = ({ section, what }: { section: Section; what: string }) => {
  const back = useHome(section);
  return (
    <Shell section={section}>
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <Rise>
          <div className="rx-mono text-[10.5px] text-[#5b9cff]">404 · {what} not found</div>
        </Rise>
        <Rise d={0.08}>
          <h1 className="mt-5 text-[clamp(2.8rem,8vw,5.5rem)] italic font-light leading-[0.95]">This reel is missing.</h1>
        </Rise>
        <Rise d={0.16}>
          <p className="mt-5 text-[1.25rem] text-[#8692a8] max-w-md">The link may be old, or the {what} was renamed.</p>
        </Rise>
        <Rise d={0.24} className="mt-9">
          <button onClick={back} className="rx-btn rx-mono">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Jonathan
          </button>
        </Rise>
      </div>
    </Shell>
  );
};
