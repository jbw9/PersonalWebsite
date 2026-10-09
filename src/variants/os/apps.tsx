import { useState, ComponentType } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Folder,
  Activity,
  TrendingUp,
  GraduationCap,
  BookOpen,
  StickyNote,
  Terminal as TerminalIcon,
  Mail,
  Github,
  Linkedin,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Send,
  Cloud,
  LucideIcon,
} from "lucide-react";
import { experiences, education, involvements } from "../../data";
import { projects } from "../../data/projects";
import { guides } from "../../data/guides";
import { milestones, JOURNEY_START } from "../../data/journey";
import Terminal from "./Terminal";
import { AppId, useOS, asset, periodStatus, EMAIL, GITHUB, LINKEDIN } from "./shared";

export interface AppDef {
  name: string;
  title: string;
  icon: LucideIcon;
  bg: string;
  fg: string;
  w: number;
  h: number;
  Body: ComponentType;
}

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.07] border border-white/10 text-white/70 whitespace-nowrap">
    {children}
  </span>
);

const LiveDot = () => (
  <span className="relative inline-flex w-2 h-2 rounded-full bg-[#30D158] os-pulse flex-shrink-0" />
);

/* ─────────────────────────── About / README ─────────────────────────── */
const About = () => {
  const { open, go } = useOS();
  const aws = experiences[0];
  return (
    <div className="p-6 sm:p-8">
      <div className="os-mono text-[11px] text-white/35 mb-6">~/README.md</div>
      <div className="flex items-center gap-4 mb-5">
        <div
          className="w-16 h-16 rounded-[20px] grid place-items-center text-[30px] font-bold shadow-lg flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#FF5F05 0%,#E11D74 55%,#6D28D9 100%)" }}
        >
          J
        </div>
        <div>
          <div className="text-[13px] text-white/50 mb-1">Hey there 👋</div>
          <h1 className="text-[34px] sm:text-[40px] font-semibold tracking-[-0.03em] leading-none">I'm Jonathan.</h1>
        </div>
      </div>
      <p className="text-[15px] text-white/70 leading-relaxed max-w-md">
        CS &amp; Econs @ UIUC — building software that solves real problems. Finance major turned engineer.
      </p>

      <div className="grid sm:grid-cols-2 gap-3 mt-6">
        <button
          onClick={(e) => open("experience", e.currentTarget.getBoundingClientRect())}
          className="text-left rounded-2xl p-4 bg-gradient-to-br from-[#FF9900]/20 to-[#FF9900]/5 border border-[#FF9900]/25 hover:border-[#FF9900]/50 transition-colors"
        >
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[#FFB547] font-semibold mb-1.5">
            <Cloud className="w-3.5 h-3.5" /> Incoming
          </div>
          <div className="font-semibold text-[15px]">SDE @ AWS</div>
          <div className="text-[12px] text-white/50 mt-0.5">
            {aws.description.replace("AWS ", "")} · {aws.period}
          </div>
        </button>
        <button
          onClick={() => go("/project/taxbuddy")}
          className="text-left rounded-2xl p-4 bg-gradient-to-br from-[#30D158]/20 to-[#30D158]/5 border border-[#30D158]/25 hover:border-[#30D158]/50 transition-colors group"
        >
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[#5BE07D] font-semibold mb-1.5">
            <LiveDot /> Active project
          </div>
          <div className="font-semibold text-[15px] flex items-center gap-1">
            TaxBuddy <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-[12px] text-white/50 mt-0.5">1040-NR for international students</div>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-6">
        <a href={`mailto:${EMAIL}`} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-[13px] font-medium hover:bg-white/85 transition-colors">
          <Mail className="w-4 h-4" /> Email me
        </a>
        <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-[13px] font-medium hover:bg-white/15 transition-colors">
          <Github className="w-4 h-4" /> GitHub
        </a>
        <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-[13px] font-medium hover:bg-white/15 transition-colors">
          <Linkedin className="w-4 h-4" /> LinkedIn
        </a>
      </div>

      <div className="mt-7 pt-4 border-t border-white/10 text-[12px] text-white/45 leading-relaxed">
        Poke around — every icon opens. Or open{" "}
        <button onClick={(e) => open("terminal", e.currentTarget.getBoundingClientRect())} className="os-mono text-[#64D2FF] hover:underline">
          Terminal
        </button>{" "}
        and try <span className="os-mono text-white/70">sudo hire jonathan</span>.
      </div>
    </div>
  );
};

/* ─────────────────────────── Projects / Finder ─────────────────────────── */
const PLACEHOLDER = [
  "linear-gradient(135deg,#0A84FF,#5E5CE6)",
  "linear-gradient(135deg,#FF375F,#FF9F0A)",
  "linear-gradient(135deg,#30D158,#64D2FF)",
  "linear-gradient(135deg,#BF5AF2,#FF375F)",
];
const thumbOf = (p: (typeof projects)[number]) => p.image ?? p.screenshots?.[0];

const Thumb = ({ p, i }: { p: (typeof projects)[number]; i: number }) => {
  const src = thumbOf(p);
  return src ? (
    <img src={asset(src)} alt={p.title} draggable={false} className="w-full h-full object-cover object-top" />
  ) : (
    <div className="w-full h-full grid place-items-center relative" style={{ background: PLACEHOLDER[i % PLACEHOLDER.length] }}>
      <span className="text-[44px] font-bold text-white/90 tracking-tight">{p.title[0]}</span>
      <span className="absolute bottom-1.5 left-2 os-mono text-[9px] text-white/70">{p.technologies[0]}</span>
    </div>
  );
};

const Projects = () => {
  const { go, compact, open } = useOS();
  const [sel, setSel] = useState(projects[0].id);
  const p = projects.find((x) => x.id === sel) ?? projects[0];
  return (
    <div className="flex h-full min-h-0">
      {!compact && (
        <aside className="w-[168px] flex-shrink-0 border-r border-white/[0.07] bg-white/[0.025] p-3 text-[12.5px]">
          <div className="text-[10.5px] font-semibold text-white/35 px-2 mb-1.5">Favourites</div>
          {(
            [
              ["projects", "Projects", Folder, "#0A84FF"],
              ["guides", "Guides", BookOpen, "#FFD60A"],
              ["journey", "Journey", TrendingUp, "#30D158"],
              ["school", "School", GraduationCap, "#FF5F05"],
            ] as [AppId, string, LucideIcon, string][]
          ).map(([id, label, Icon, c]) => (
            <button
              key={id}
              onClick={(e) => id !== "projects" && open(id, e.currentTarget.getBoundingClientRect())}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left ${id === "projects" ? "bg-white/10" : "hover:bg-white/5"}`}
            >
              <Icon className="w-4 h-4" style={{ color: c }} /> {label}
            </button>
          ))}
          <div className="text-[10.5px] font-semibold text-white/35 px-2 mt-4 mb-1.5">Tags</div>
          <button onClick={() => setSel("taxbuddy")} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 text-left">
            <span className="w-2.5 h-2.5 rounded-full bg-[#30D158]" /> Active
          </button>
          <div className="flex items-center gap-2 px-2 py-1.5 text-white/60">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0A84FF]" /> Shipped
          </div>
        </aside>
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-11 flex-shrink-0 flex items-center gap-3 px-4 border-b border-white/[0.07]">
          <ChevronLeft className="w-4 h-4 text-white/25" />
          <ChevronRight className="w-4 h-4 text-white/25" />
          <span className="font-semibold text-[13px]">projects</span>
          <span className="text-[11px] text-white/35 ml-auto">{projects.length} items</span>
        </div>
        <div className="flex-1 overflow-auto os-scroll p-3 grid gap-2 content-start grid-cols-[repeat(auto-fill,minmax(132px,1fr))]">
          {projects.map((x, i) => (
            <button
              key={x.id}
              onClick={() => (compact ? go(`/project/${x.id}`) : setSel(x.id))}
              onDoubleClick={() => go(`/project/${x.id}`)}
              className={`text-left rounded-xl p-2 transition-colors ${
                sel === x.id && !compact ? "bg-[#0A84FF]/25 ring-1 ring-[#0A84FF]/60" : "hover:bg-white/[0.06]"
              }`}
            >
              <div className="aspect-[4/3] rounded-lg overflow-hidden ring-1 ring-white/10 relative bg-black/40">
                <Thumb p={x} i={i} />
                {x.id === "taxbuddy" && (
                  <span className="absolute top-1.5 left-1.5 flex items-center gap-1 text-[9.5px] font-semibold bg-black/70 backdrop-blur px-1.5 py-0.5 rounded-full">
                    <LiveDot /> LIVE
                  </span>
                )}
              </div>
              <div className="mt-1.5 text-[12.5px] font-medium truncate">{x.title}</div>
              <div className="text-[10.5px] text-white/40 truncate">{x.technologies.slice(0, 2).join(" · ")}</div>
            </button>
          ))}
        </div>
      </div>
      {!compact && (
        <aside className="w-[236px] flex-shrink-0 border-l border-white/[0.07] p-4 overflow-auto os-scroll">
          <motion.div key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <div className="aspect-[4/3] rounded-lg overflow-hidden ring-1 ring-white/10 mb-3 bg-black/40">
              <Thumb p={p} i={projects.indexOf(p)} />
            </div>
            <div className="font-semibold text-[15px] leading-tight">{p.title}</div>
            <p className="text-[12px] text-white/55 leading-relaxed mt-1.5">{p.description}</p>
            <div className="flex flex-wrap gap-1 mt-3">
              {p.technologies.slice(0, 6).map((t) => (
                <Chip key={t}>{t}</Chip>
              ))}
            </div>
            <button
              onClick={() => go(`/project/${p.id}`)}
              className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#0A84FF] hover:bg-[#3395FF] text-[13px] font-medium transition-colors"
            >
              Open project <ArrowUpRight className="w-4 h-4" />
            </button>
            <div className="text-[10.5px] text-white/30 mt-2 text-center">or double-click any file</div>
          </motion.div>
        </aside>
      )}
    </div>
  );
};

/* ─────────────────────────── Experience / Activity Monitor ─────────────────────────── */
const STATUS = {
  scheduled: ["scheduled", "#FFB547"],
  running: ["running", "#30D158"],
  exited: ["exited 0", "rgba(255,255,255,0.38)"],
} as const;

const vibePath = (w: number, h: number) =>
  milestones.map((m, i) => `${i ? "L" : "M"}${((i / (milestones.length - 1)) * w).toFixed(1)},${(h - (m.vibe / 100) * h).toFixed(1)}`).join(" ");

const Experience = () => {
  const { compact } = useOS();
  const [openRow, setOpenRow] = useState<number | null>(0);
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="h-11 flex-shrink-0 flex items-center px-4 gap-3 border-b border-white/[0.07]">
        <span className="font-semibold text-[13px]">All Processes</span>
        <span className="text-[11px] text-white/35">· where I've worked</span>
      </div>
      <div className="flex-1 overflow-auto os-scroll text-[12.5px]">
        {!compact && (
          <div className="grid grid-cols-[52px_1.3fr_1.3fr_150px_92px] px-4 py-2 text-[10.5px] uppercase tracking-wider text-white/35 border-b border-white/[0.07] sticky top-0 bg-[#18181f]/95 backdrop-blur z-10">
            <span>PID</span>
            <span>Process</span>
            <span>Role</span>
            <span>Period</span>
            <span>Status</span>
          </div>
        )}
        {experiences.map((x, i) => {
          const [label, color] = STATUS[periodStatus(x.period)];
          const isOpen = openRow === i;
          return (
            <div key={i} className={`border-b border-white/[0.05] ${i % 2 ? "bg-white/[0.02]" : ""}`}>
              <button
                onClick={() => setOpenRow(isOpen ? null : i)}
                className={`w-full text-left px-4 py-2.5 items-center hover:bg-white/[0.05] ${
                  compact ? "flex gap-3" : "grid grid-cols-[52px_1.3fr_1.3fr_150px_92px]"
                } ${isOpen ? "bg-[#0A84FF]/15" : ""}`}
              >
                {!compact && <span className="os-mono text-white/35">{2027 - i * 113}</span>}
                <span className="flex items-center gap-2 min-w-0">
                  <img src={asset(x.companyIcon)} alt="" className="w-5 h-5 rounded object-contain bg-white flex-shrink-0" />
                  <span className="truncate font-medium">{compact ? x.company : x.company.replace(/,? Inc\.?|\s\(AWS\)/, "")}</span>
                </span>
                {compact ? (
                  <span className="ml-auto text-[10.5px] font-medium flex-shrink-0" style={{ color }}>
                    {label}
                  </span>
                ) : (
                  <>
                    <span className="truncate text-white/75 pr-2">{x.title}</span>
                    <span className="os-mono text-[11px] text-white/45">{x.period}</span>
                    <span className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                      {label}
                    </span>
                  </>
                )}
              </button>
              {isOpen && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                  <div className={`pb-3.5 pt-1 text-white/65 leading-relaxed ${compact ? "px-4" : "pl-[68px] pr-6"}`}>
                    {compact && (
                      <div className="text-white/85 font-medium">
                        {x.title} <span className="os-mono text-[11px] text-white/40 ml-1">{x.period}</span>
                      </div>
                    )}
                    {x.description}
                    {"website" in x && x.website && (
                      <a href={x.website} target="_blank" rel="noopener noreferrer" className="ml-2 text-[#64D2FF] hover:underline">
                        website ↗
                      </a>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex-shrink-0 border-t border-white/[0.07] px-4 py-3 flex items-center gap-5 bg-black/20">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-white/35">Vibe load</div>
          <div className="text-[18px] font-semibold tabular-nums text-[#30D158]">{milestones[milestones.length - 1].vibe}%</div>
        </div>
        <svg viewBox="0 0 300 40" preserveAspectRatio="none" className="flex-1 h-10">
          <path d={`${vibePath(300, 40)} L300,40 L0,40 Z`} fill="rgba(48,209,88,0.15)" />
          <path d={vibePath(300, 40)} fill="none" stroke="#30D158" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
        {!compact && (
          <div className="text-[11px] text-white/45 leading-snug">
            Processes: {experiences.length}
            <br />
            Scheduled: {experiences.filter((x) => periodStatus(x.period) === "scheduled").length}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────── Journey / Stocks ($JNTN) ─────────────────────────── */
const WEEK = 7 * 24 * 3600 * 1000;
const weeksOf = (d: string) => Math.round((new Date(d).getTime() - new Date(JOURNEY_START).getTime()) / WEEK);
const TOTAL_WEEKS = weeksOf(milestones[milestones.length - 1].date) || 1;
const pts = milestones.map((m) => ({ x: (weeksOf(m.date) / TOTAL_WEEKS) * 100, y: 8 + (1 - m.vibe / 100) * 84 }));
// Catmull-Rom → cubic Bézier so the line reads like a price chart, not a zigzag
const smooth = pts
  .map((p, i) => {
    if (!i) return `M${p.x},${p.y}`;
    const a = pts[i - 2] ?? pts[i - 1];
    const b = pts[i - 1];
    const c = pts[i + 1] ?? p;
    return `C${b.x + (p.x - a.x) / 6},${b.y + (p.y - a.y) / 6} ${p.x - (c.x - b.x) / 6},${p.y - (c.y - b.y) / 6} ${p.x},${p.y}`;
  })
  .join(" ");
const fmtDate = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const Journey = () => {
  const { compact } = useOS();
  const [sel, setSel] = useState(milestones.length - 1);
  const m = milestones[sel];
  const first = milestones[0].vibe;
  const last = milestones[milestones.length - 1].vibe;
  return (
    <div className={`flex flex-col ${compact ? "" : "h-full min-h-0"}`}>
      <div className="px-5 pt-4 flex-shrink-0">
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-[18px] tracking-tight">JNTN</span>
          <span className="text-[12px] text-white/40">Jonathan Inc. · finance major → engineer</span>
        </div>
        <div className="flex items-baseline gap-3 mt-0.5">
          <span className="text-[30px] font-semibold tabular-nums tracking-tight">{m.vibe.toFixed(2)}</span>
          <span className="text-[13px] font-medium text-[#30D158] tabular-nums">
            ▲ +{(last - first).toFixed(2)} (+{(((last - first) / first) * 100).toFixed(0)}%) since week 0
          </span>
        </div>
      </div>
      <div className="relative mx-5 mt-2 h-[170px] flex-shrink-0">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible">
          <defs>
            <linearGradient id="os-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#30D158" stopOpacity="0.35" />
              <stop offset="1" stopColor="#30D158" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[25, 50, 75].map((y) => (
            <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="1 1.5" vectorEffect="non-scaling-stroke" />
          ))}
          <motion.path d={`${smooth} L100,100 L0,100 Z`} fill="url(#os-area)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }} />
          <motion.path
            d={smooth}
            fill="none"
            stroke="#30D158"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.3, ease: "easeInOut" }}
          />
          <line x1={pts[sel].x} x2={pts[sel].x} y1="0" y2="100" stroke="rgba(255,255,255,0.25)" vectorEffect="non-scaling-stroke" />
        </svg>
        {pts.map((p, i) => (
          <button
            key={i}
            onClick={() => setSel(i)}
            title={milestones[i].short}
            className="absolute -translate-x-1/2 -translate-y-1/2 grid place-items-center group"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: 26, height: 26 }}
          >
            <span
              className={`rounded-full transition-all ${
                i === sel ? "w-3.5 h-3.5 bg-white ring-4 ring-[#30D158]/40" : "w-2 h-2 bg-[#30D158] group-hover:w-3 group-hover:h-3"
              }`}
            />
          </button>
        ))}
      </div>
      <div className={`flex-1 min-h-0 flex gap-4 px-5 pt-4 pb-4 ${compact ? "flex-col" : ""}`}>
        <motion.div
          key={sel}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl bg-white/[0.05] border border-white/[0.08] p-4 ${compact ? "" : "flex-1 overflow-auto os-scroll"}`}
        >
          <div className="flex items-center gap-3">
            <span className="text-[30px] leading-none">{m.emoji}</span>
            <div className="os-mono text-[11px] text-white/40">
              {fmtDate(m.date)} · week {weeksOf(m.date)}
              <br />
              vibe {m.vibe}/100
            </div>
          </div>
          <div className="font-semibold text-[15px] mt-3 leading-snug">{m.title}</div>
          <p className="text-[13px] text-white/60 leading-relaxed mt-1.5">{m.body}</p>
        </motion.div>
        <div className={`${compact ? "" : "w-[230px] overflow-auto os-scroll"} flex-shrink-0`}>
          <div className="text-[10.5px] uppercase tracking-wider text-white/35 mb-1.5">Headlines</div>
          {milestones
            .map((x, i) => ({ x, i }))
            .reverse()
            .map(({ x, i }) => (
              <button
                key={i}
                onClick={() => setSel(i)}
                className={`w-full flex items-center gap-2.5 text-left px-2 py-1.5 rounded-md text-[12px] ${i === sel ? "bg-white/10" : "hover:bg-white/5"}`}
              >
                <span className="w-5 text-center">{x.emoji}</span>
                <span className="flex-1 truncate text-white/75">{x.short}</span>
                <span className={`tabular-nums text-[11px] ${x.dip ? "text-[#FF453A]" : "text-[#30D158]"}`}>{x.vibe}</span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────── School / Preview transcript ─────────────────────────── */
const School = () => {
  const uiuc = education.find((e) => e.gpa) ?? education[0];
  const others = education.filter((e) => e !== uiuc);
  const [gpa, scale] = (uiuc.gpa ?? "").split("/");
  return (
    <div className="p-4 sm:p-6 bg-[#2a2a31]/60 min-h-full">
      <div className="bg-[#FBFBF9] text-zinc-900 rounded-sm shadow-2xl p-6 sm:p-8 max-w-[480px] mx-auto">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-200">
          <img src={uiuc.image} alt="" className="w-11 h-11 rounded-lg object-contain" />
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Academic record</div>
            <div className="font-semibold leading-tight text-[14px]">{uiuc.school}</div>
          </div>
        </div>
        <div className="flex items-end justify-between gap-4 pt-5">
          <div>
            <div className="font-semibold text-[15px] leading-snug">{uiuc.degree}</div>
            <div className="text-[12px] text-zinc-500">{uiuc.period}</div>
          </div>
          <div className="relative px-3 py-1 flex-shrink-0">
            <span className="text-[38px] font-bold text-[#C8102E] tracking-tight tabular-nums">{gpa}</span>
            <span className="text-[13px] text-zinc-400">/{scale}</span>
            <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
              <motion.path
                d="M8,28 C6,8 90,4 94,24 C98,44 14,50 6,30 C4,22 20,12 34,10"
                stroke="#C8102E"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </svg>
          </div>
        </div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 mt-6 mb-2">Relevant coursework</div>
        <div className="divide-y divide-zinc-200 border-y border-zinc-200">
          {uiuc.relevantCourses?.map((c) => (
            <div key={c} className="flex justify-between py-1.5 text-[13px]">
              <span>{c}</span>
              <span className="text-[#0A7A3B] text-[12px] font-medium">✓</span>
            </div>
          ))}
        </div>
        {others.map((e) => {
          const link = e.description?.includes("http") ? e.description.slice(e.description.indexOf("http")) : null;
          return (
            <div key={e.school} className="mt-5 flex items-center gap-3 rounded-lg bg-[#FFF4EC] border border-[#FFD8BF] p-3">
              <img src={e.image} alt="" className="w-9 h-9 rounded-md object-contain flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-[13px] leading-tight">{e.degree}</div>
                <div className="text-[11.5px] text-zinc-500">
                  {e.school} · {e.period}
                </div>
              </div>
              {link && (
                <a href={link} target="_blank" rel="noopener noreferrer" className="text-[12px] font-medium text-[#F26522] hover:underline flex-shrink-0">
                  details ↗
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────────────── Guides / Notes ─────────────────────────── */
const excerpt = (md: string) =>
  md
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 80 && !/^[#!`\-*>|]/.test(l))
    ?.replace(/\*\*|`/g, "")
    .slice(0, 320) ?? "";

const Guides = () => {
  const { go, compact } = useOS();
  const [sel, setSel] = useState(0);
  const g = guides[sel];
  return (
    <div className="flex h-full min-h-0">
      <div className={`${compact ? "flex-1" : "w-[230px] border-r border-white/[0.07]"} flex-shrink-0 overflow-auto os-scroll p-2`}>
        {guides.map((x, i) => (
          <button
            key={x.id}
            onClick={() => (compact ? go(`/guide/${x.id}`) : setSel(i))}
            className={`w-full text-left rounded-lg px-3 py-2.5 mb-1 ${i === sel && !compact ? "bg-[#FFD60A]/90 text-black" : "hover:bg-white/5"}`}
          >
            <div className="font-semibold text-[13px] leading-snug">{x.title}</div>
            <div className={`text-[11px] mt-0.5 truncate ${i === sel && !compact ? "text-black/60" : "text-white/40"}`}>
              {x.publishDate} · {x.description}
            </div>
          </button>
        ))}
      </div>
      {!compact && (
        <motion.div key={g.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 overflow-auto os-scroll px-7 py-6">
          <div className="text-[11px] text-white/35 text-center mb-4">{g.publishDate}</div>
          <span className="text-[10.5px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#FFD60A]/15 text-[#FFD60A]">{g.category}</span>
          <h2 className="text-[22px] font-semibold tracking-tight leading-tight mt-2.5">{g.title}</h2>
          <p className="text-[13.5px] text-white/60 mt-2 leading-relaxed">{g.description}</p>
          <p className="text-[13px] text-white/45 mt-4 leading-relaxed border-l-2 border-white/10 pl-3">{excerpt(g.content)}…</p>
          <button
            onClick={() => go(`/guide/${g.id}`)}
            className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FFD60A] text-black text-[13px] font-semibold hover:bg-[#FFE04D] transition-colors"
          >
            Read the guide <ArrowUpRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
};

/* ─────────────────────────── Involvement / Stickies ─────────────────────────── */
const STICKY = [
  ["#FFE680", -1.6],
  ["#FFB8CF", 1.2],
  ["#A8EBC6", -0.6],
] as const;

const Involvement = () => (
  <div className="p-5 grid gap-5 sm:grid-cols-2 content-start">
    {involvements.map((x, i) => (
      <motion.div
        key={x.organization}
        initial={{ opacity: 0, y: 14, rotate: 0 }}
        animate={{ opacity: 1, y: 0, rotate: STICKY[i % 3][1] }}
        whileHover={{ rotate: 0, scale: 1.02 }}
        transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 260, damping: 20 }}
        className="rounded-sm p-4 text-zinc-900 shadow-[0_12px_28px_-8px_rgba(0,0,0,0.6)]"
        style={{ background: STICKY[i % 3][0] }}
      >
        <div className="flex items-center gap-2.5 mb-2">
          <img src={asset(x.image)} alt="" className="w-8 h-8 rounded-md object-contain bg-white/70" />
          <div className="min-w-0">
            <div className="font-semibold text-[13.5px] leading-tight">{x.role}</div>
            <div className="text-[11px] text-black/55 truncate">{x.organization}</div>
          </div>
        </div>
        <div className="os-mono text-[10.5px] text-black/50 mb-1.5">{x.period}</div>
        <p className="text-[12.5px] leading-relaxed text-black/75">{x.description}</p>
      </motion.div>
    ))}
  </div>
);

/* ─────────────────────────── Contact / Mail ─────────────────────────── */
const Contact = () => {
  const [subject, setSubject] = useState("Hey Jonathan 👋");
  const [body, setBody] = useState("");
  const send = () => window.open(`mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  return (
    <div className="flex flex-col h-full min-h-0 text-[13px]">
      <div className="h-11 flex-shrink-0 flex items-center px-4 border-b border-white/[0.07]">
        <span className="font-semibold">New Message</span>
        <button onClick={send} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0A84FF] hover:bg-[#3395FF] font-medium transition-colors">
          <Send className="w-3.5 h-3.5" /> Send
        </button>
      </div>
      <div className="px-4 py-2.5 border-b border-white/[0.07] flex items-center gap-2">
        <span className="text-white/40 w-14">To:</span>
        <span className="px-2 py-0.5 rounded-full bg-[#0A84FF]/20 text-[#64B5FF]">Jonathan &lt;{EMAIL}&gt;</span>
      </div>
      <div className="px-4 py-2.5 border-b border-white/[0.07] flex items-center gap-2">
        <span className="text-white/40 w-14">Subject:</span>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} className="flex-1 bg-transparent outline-none min-w-0" />
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Say hi, pitch an idea, or just tell me which variant of this site you liked…"
        className="flex-1 min-h-[120px] bg-transparent outline-none resize-none px-4 py-3 text-white/85 placeholder:text-white/25 leading-relaxed"
      />
      <div className="px-4 py-3 border-t border-white/[0.07] flex flex-wrap items-center gap-2 bg-black/20">
        <span className="text-white/40 text-[12px] mr-1">Elsewhere:</span>
        <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.07] hover:bg-white/[0.12] transition-colors">
          <Github className="w-4 h-4" /> github.com/jbw9
        </a>
        <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.07] hover:bg-white/[0.12] transition-colors">
          <Linkedin className="w-4 h-4" /> LinkedIn
        </a>
      </div>
    </div>
  );
};

export const APPS: Record<AppId, AppDef> = {
  about: { name: "README", title: "README.md — About Jonathan", icon: FileText, bg: "linear-gradient(160deg,#ffffff,#d7d9e0)", fg: "#1c1c28", w: 520, h: 548, Body: About },
  projects: { name: "Projects", title: "Projects", icon: Folder, bg: "linear-gradient(160deg,#6CC4FF,#0A6CFF)", fg: "#fff", w: 860, h: 540, Body: Projects },
  experience: { name: "Experience", title: "Activity Monitor — Experience", icon: Activity, bg: "linear-gradient(160deg,#3a3a40,#121216)", fg: "#30D158", w: 780, h: 470, Body: Experience },
  journey: { name: "Journey", title: "Stocks — $JNTN", icon: TrendingUp, bg: "linear-gradient(160deg,#1f2a22,#050806)", fg: "#30D158", w: 780, h: 560, Body: Journey },
  school: { name: "School", title: "transcript.pdf", icon: GraduationCap, bg: "linear-gradient(160deg,#FF7A2E,#C2410C)", fg: "#fff", w: 560, h: 600, Body: School },
  guides: { name: "Guides", title: "Notes — Development Guides", icon: BookOpen, bg: "linear-gradient(160deg,#FFE45C,#FFAA00)", fg: "#fff", w: 720, h: 440, Body: Guides },
  involvement: { name: "Involvement", title: "Stickies — Involvement", icon: StickyNote, bg: "linear-gradient(160deg,#FF8CC0,#D6336C)", fg: "#fff", w: 640, h: 500, Body: Involvement },
  terminal: { name: "Terminal", title: "guest — zsh — 80×24", icon: TerminalIcon, bg: "linear-gradient(160deg,#2b2b30,#0b0b0d)", fg: "#30D158", w: 554, h: 420, Body: Terminal },
  contact: { name: "Contact", title: "New Message", icon: Mail, bg: "linear-gradient(160deg,#5EC3FF,#1A6CF0)", fg: "#fff", w: 520, h: 460, Body: Contact },
};

export const APP_ORDER: AppId[] = ["about", "projects", "experience", "journey", "school", "guides", "involvement", "terminal", "contact"];

// Fills its parent when no size is given, so the dock can drive size with a spring
export const AppIcon = ({ id, size }: { id: AppId; size?: number }) => {
  const a = APPS[id];
  const Icon = a.icon;
  return (
    <div
      className="grid place-items-center relative overflow-hidden"
      style={{
        width: size ?? "100%",
        height: size ?? "100%",
        borderRadius: "24%",
        background: a.bg,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.25), 0 6px 16px -4px rgba(0,0,0,0.55)",
      }}
    >
      <Icon style={{ width: "50%", height: "50%", color: a.fg }} strokeWidth={id === "terminal" ? 2.4 : 1.9} />
    </div>
  );
};
