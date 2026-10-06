import { ReactNode } from "react";
import { Mail, Github, Linkedin, ArrowUpRight } from "lucide-react";
import { experiences, education, involvements } from "../../data";
import { projects } from "../../data/projects";
import { guides } from "../../data/guides";
import { milestones } from "../../data/journey";

export const EMAIL = "jbw7@illinois.edu";
export const GITHUB = "https://github.com/jbw9";
export const LINKEDIN = "https://www.linkedin.com/in/jwidjajakusuma/";

// Some data paths are relative ("kredivoLogo.png"), which would resolve under /v/canvas/
const asset = (p: string) => (/^(https?:|data:|\/)/.test(p) ? p : "/" + p);

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
export type IslandId = "hero" | "experience" | "projects" | "journey" | "school" | "guides" | "involvement";
export interface Island extends Box {
  label: string;
  emoji: string;
  color: string;
  tint: string;
}

// World coordinates (px at zoom 1). Hero sits around the origin; everything else orbits it.
export const ISLANDS: Record<IslandId, Island> = {
  hero: { x: -560, y: -340, w: 1220, h: 680, label: "Hi", emoji: "👋", color: "#1e1e24", tint: "transparent" },
  school: { x: -1820, y: -1180, w: 720, h: 560, label: "School", emoji: "🎓", color: "#F24E1E", tint: "#FFF6F2" },
  guides: { x: -520, y: -1100, w: 1060, h: 560, label: "Guides", emoji: "📝", color: "#E8A100", tint: "#FFFBEF" },
  involvement: { x: 780, y: -1180, w: 1060, h: 520, label: "Involvement", emoji: "🤝", color: "#14AE5C", tint: "#F2FBF5" },
  experience: { x: -1820, y: -470, w: 1060, h: 880, label: "Experience", emoji: "💼", color: "#0D99FF", tint: "#F2F8FF" },
  projects: { x: 780, y: -560, w: 1380, h: 1080, label: "Projects", emoji: "🛠", color: "#7B61FF", tint: "#F6F4FF" },
  journey: { x: -1820, y: 640, w: 4260, h: 1080, label: "Journey — finance major → AWS", emoji: "🧭", color: "#E5398F", tint: "#FFF5FA" },
};
export const ISLAND_ORDER: IslandId[] = ["hero", "experience", "projects", "journey", "school", "guides", "involvement"];

export const WORLD: Box = { x: -1820, y: -1180, w: 4260, h: 2900 };

/* ── Journey layout: x is time order, height is the "vibe" ── */
const STICKY_W = 216;
const past = milestones.slice(0, -1);
export const NOW = milestones[milestones.length - 1];
export const STOPS = past.map((m, i) => ({ m, x: -1760 + i * 282, y: 1580 - m.vibe * 8.6 }));
// The intro starts zoomed all the way in on this dot: the end of the path, i.e. today
export const HERE = { x: -1760 + past.length * 282 + 108, y: 1580 - NOW.vibe * 8.6 + 40 };

const STICKY_COLORS = ["#FFE58F", "#B8F0C8", "#BCE3FF", "#FFD3A8", "#DCCBFF"];
const DIP_COLOR = "#FFC8DD";

const roadPts = [...STOPS.map((s) => ({ x: s.x + STICKY_W / 2, y: s.y + 110 })), HERE];
const smooth = (pts: { x: number; y: number }[]) =>
  pts
    .map((p, i) => {
      if (!i) return `M${p.x},${p.y}`;
      const a = pts[i - 2] ?? pts[i - 1];
      const b = pts[i - 1];
      const c = pts[i + 1] ?? p;
      return `C${b.x + (p.x - a.x) / 6},${b.y + (p.y - a.y) / 6} ${p.x - (c.x - b.x) / 6},${p.y - (c.y - b.y) / 6} ${p.x},${p.y}`;
    })
    .join(" ");
export const ROAD = smooth(roadPts);

// Points the fake multiplayer cursors wander between, with what each one says there ([recruiter, Jonathan])
export const POI: { x: number; y: number; say: [string, string] }[] = [
  { x: 470, y: -230, say: ["AWS 👀", ""] },
  { x: 1000, y: -330, say: ["TaxBuddy is slick", "shipping this rn"] },
  { x: -1400, y: -900, say: ["3.90?!", ""] },
  { x: 520, y: 80, say: ["", "click me →"] },
  { x: -1200, y: -300, say: ["MSK team, nice", "Feb 2027 🙌"] },
  { x: -1080, y: 1170, say: ["relatable 💀", "never again"] },
  { x: 1500, y: -150, say: ["", "open one!"] },
  { x: -100, y: -800, say: ["bookmarking this", ""] },
  { x: 2296, y: 830, say: ["hi Jonathan 👋", "that's me"] },
];

// "you are here" — constant screen size via --s so it reads as a map pin at any zoom.
// Lives outside <World> so the intro can show it alone before the rest fades in.
export const HerePin = () => (
  <div className="absolute" style={{ left: HERE.x, top: HERE.y }}>
    <div style={{ transform: "scale(calc(1 / var(--s, 1)))", transformOrigin: "0 0" }}>
      <div className="absolute -left-[9px] -top-[9px] w-[18px] h-[18px] rounded-full bg-[#0D99FF] border-[3px] border-white cv-pulse cv-pin-in" />
      <div className="absolute left-4 -top-[34px] whitespace-nowrap rounded-full bg-[#0D99FF] text-white text-[13px] font-semibold px-3 py-1 shadow-lg cv-label-in">
        📍 you are here
      </div>
    </div>
  </div>
);

const Label = ({ island, onClick }: { island: Island; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="absolute flex items-center gap-3 rounded-[18px] px-5 py-2 text-white font-semibold text-[40px] leading-none tracking-[-0.02em] cv-hit"
    style={{ left: 32, top: 28, background: island.color }}
  >
    <span>{island.emoji}</span>
    {island.label}
  </button>
);

const Frame = ({ id, onIsland, children }: { id: IslandId; onIsland: (id: IslandId) => void; children: ReactNode }) => {
  const f = ISLANDS[id];
  return (
    <div
      className="absolute rounded-[32px]"
      style={{ left: f.x, top: f.y, width: f.w, height: f.h, background: f.tint, border: `3px solid ${f.color}22` }}
    >
      <Label island={f} onClick={() => onIsland(id)} />
      {children}
    </div>
  );
};

const Pill = ({ href, icon, children, dark }: { href: string; icon: ReactNode; children: ReactNode; dark?: boolean }) => (
  <a
    href={href}
    target={href.startsWith("mailto") ? undefined : "_blank"}
    rel="noopener noreferrer"
    className={`cv-hit flex items-center gap-3 rounded-full px-8 py-4 text-[28px] font-semibold ${dark ? "bg-[#1e1e24] text-white" : "bg-white text-[#1e1e24] border-2 border-[#e2e2e8]"}`}
  >
    {icon}
    {children}
  </a>
);

const Chip = ({ children }: { children: ReactNode }) => (
  <span className="cv-mono text-[15px] px-2.5 py-1 rounded-md bg-[#f1f1f4] text-[#55556a] whitespace-nowrap">{children}</span>
);

const World = ({ onIsland, go }: { onIsland: (id: IslandId) => void; go: (path: string) => void }) => {
  const hero = ISLANDS.hero;
  const uiuc = education.find((e) => e.gpa) ?? education[0];
  const otherEdu = education.filter((e) => e !== uiuc);
  return (
    <>
      {/* ── Journey section (drawn first so it sits underneath) ── */}
      <Frame id="journey" onIsland={onIsland}>
        <div className="absolute text-[24px] text-[#8a6177]" style={{ left: 40, top: 110 }}>
          Week by week since Aug 2023. Higher sticky = more cracked I felt.
        </div>
      </Frame>
      <svg className="absolute overflow-visible pointer-events-none" style={{ left: 0, top: 0, width: 1, height: 1 }}>
        <defs>
          <marker id="cv-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M1,1 L8,5 L1,9" fill="none" stroke="#2b2b33" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>
        <path d={ROAD} fill="none" stroke="#E5398F" strokeOpacity="0.09" strokeWidth="120" strokeLinecap="round" strokeLinejoin="round" />
        <path d={ROAD} fill="none" stroke="#E5398F" strokeOpacity="0.35" strokeWidth="3" strokeDasharray="2 14" strokeLinecap="round" />
        {STOPS.map((s, i) => {
          const n = STOPS[i + 1];
          const ax = s.x + STICKY_W + 10;
          const ay = s.y + 70;
          const bx = n ? n.x - 12 : HERE.x - 26;
          const by = n ? n.y + 70 : HERE.y;
          const bend = (i % 2 ? 1 : -1) * 26;
          return (
            <path
              key={i}
              d={`M${ax},${ay} C${ax + 30},${ay + bend} ${bx - 30},${by + bend} ${bx},${by}`}
              fill="none"
              stroke="#2b2b33"
              strokeWidth="3.2"
              strokeLinecap="round"
              markerEnd="url(#cv-arrow)"
            />
          );
        })}
        <path d={`M${HERE.x},${HERE.y + 30} L${HERE.x},${HERE.y + 180}`} stroke="#0D99FF" strokeWidth="3" strokeDasharray="8 10" strokeLinecap="round" />
      </svg>
      {STOPS.map(({ m, x, y }, i) => (
        <div
          key={m.date}
          className="absolute cv-sticky rounded-[6px] p-5"
          style={{
            left: x,
            top: y,
            width: STICKY_W,
            minHeight: 210,
            background: m.dip ? DIP_COLOR : STICKY_COLORS[i % STICKY_COLORS.length],
            transform: `rotate(${((i * 37) % 7) - 3}deg)`,
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[38px] leading-none">{m.emoji}</span>
            <span className="cv-mono text-[13px] text-black/45">{m.date.slice(0, 7)}</span>
          </div>
          <div className="font-bold text-[19px] leading-[1.15] mt-3 tracking-[-0.01em]">{m.title}</div>
          <div className="text-[14px] leading-snug mt-2 text-black/70">{m.body}</div>
        </div>
      ))}
      <div
        className="absolute cv-sticky rounded-[6px] p-5 cv-hit"
        style={{ left: HERE.x - 120, top: HERE.y + 190, width: 240, background: "#BCE3FF", transform: "rotate(2deg)" }}
        onClick={() => go("/project/taxbuddy")}
      >
        <div className="cv-mono text-[13px] text-black/45">today · vibe {NOW.vibe}</div>
        <div className="font-bold text-[22px] leading-tight mt-2">{NOW.title}</div>
        <div className="text-[14px] leading-snug mt-2 text-black/70">{NOW.body}</div>
      </div>

      {/* ── Hero ── */}
      <div className="absolute" style={{ left: hero.x, top: hero.y, width: hero.w, height: hero.h }}>
        <div className="absolute text-[40px] text-[#6b6b78] font-medium" style={{ left: 0, top: 40 }}>
          Hey there 👋 I'm
        </div>
        <div className="absolute text-[200px] font-extrabold leading-[0.9] tracking-[-0.055em] whitespace-nowrap" style={{ left: -8, top: 100 }}>
          Jonathan
        </div>
        <svg className="absolute overflow-visible" style={{ left: 10, top: 300, width: 760, height: 40 }} viewBox="0 0 760 40" fill="none">
          <path d="M4,26 C140,8 300,10 420,18 C540,26 640,14 756,10" stroke="#7B61FF" strokeWidth="9" strokeLinecap="round" />
        </svg>
        <div className="absolute text-[40px] leading-[1.25] text-[#3a3a46] tracking-[-0.01em]" style={{ left: 0, top: 370, width: 780 }}>
          CS &amp; Econs @ UIUC — building software that solves real problems.
        </div>
        <div className="absolute flex gap-4" style={{ left: 0, top: 520 }}>
          <Pill href={`mailto:${EMAIL}`} icon={<Mail className="w-8 h-8" />} dark>
            Email me
          </Pill>
          <Pill href={GITHUB} icon={<Github className="w-8 h-8" />}>
            GitHub
          </Pill>
          <Pill href={LINKEDIN} icon={<Linkedin className="w-8 h-8" />}>
            LinkedIn
          </Pill>
        </div>
        <div
          className="absolute cv-sticky rounded-[6px] p-6 cv-hit"
          style={{ left: 880, top: 30, width: 320, background: "#FFD3A8", transform: "rotate(3deg)" }}
          onClick={() => onIsland("experience")}
        >
          <div className="cv-mono text-[15px] tracking-wider text-black/50">☁️ INCOMING · {experiences[0].period}</div>
          <div className="text-[46px] font-extrabold leading-none tracking-[-0.03em] mt-3">SDE @ AWS</div>
          <div className="text-[19px] leading-snug text-black/70 mt-3">{experiences[0].description}</div>
        </div>
        <div
          className="absolute cv-sticky rounded-[6px] p-6 cv-hit"
          style={{ left: 900, top: 330, width: 300, background: "#B8F0C8", transform: "rotate(-3deg)" }}
          onClick={() => go("/project/taxbuddy")}
        >
          <div className="cv-mono text-[15px] tracking-wider text-black/50 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#14AE5C] cv-live" /> ACTIVE PROJECT
          </div>
          <div className="text-[46px] font-extrabold leading-none tracking-[-0.03em] mt-3 flex items-center gap-1">
            TaxBuddy <ArrowUpRight className="w-9 h-9" />
          </div>
          <div className="text-[19px] leading-snug text-black/70 mt-3">Taxes for international students, filed in under 10 minutes.</div>
        </div>
      </div>

      {/* ── Experience ── */}
      <Frame id="experience" onIsland={onIsland}>
        {experiences.map((x, i) => {
          const wide = i === 0;
          const col = wide ? 0 : (i - 1) % 2;
          const row = wide ? 0 : 1 + Math.floor((i - 1) / 2);
          return (
            <div
              key={i}
              className="absolute cv-card rounded-[20px] p-6 flex gap-5"
              style={{ left: 40 + col * 510, top: 120 + row * 185, width: wide ? 980 : 470, height: 160 }}
            >
              <img src={asset(x.companyIcon)} alt="" className="w-16 h-16 rounded-xl object-contain border border-[#eee] flex-shrink-0 bg-white" />
              <div className="min-w-0">
                <div className="flex items-baseline gap-3">
                  <span className="font-bold text-[24px] leading-tight truncate">{x.company}</span>
                  {"website" in x && x.website && (
                    <a href={x.website} target="_blank" rel="noopener noreferrer" className="text-[18px] text-[#0D99FF] flex-shrink-0">
                      ↗
                    </a>
                  )}
                </div>
                <div className="text-[18px] text-[#3a3a46]">
                  {x.title} <span className="cv-mono text-[14px] text-[#8a8a98] ml-1">{x.period}</span>
                </div>
                <div className="text-[16px] text-[#6b6b78] leading-snug mt-1.5 line-clamp-2">{x.description}</div>
              </div>
            </div>
          );
        })}
      </Frame>

      {/* ── Projects ── */}
      <Frame id="projects" onIsland={onIsland}>
        {projects.map((p, i) => {
          const src = p.image ?? p.screenshots?.[0];
          const live = p.id === "taxbuddy";
          return (
            <div
              key={p.id}
              className="absolute cv-hit rounded-[14px]"
              style={{ left: 30 + (i % 4) * 340, top: 120 + Math.floor(i / 4) * 310, width: 300 }}
              onClick={() => go(`/project/${p.id}`)}
            >
              <div className="cv-mono text-[13px] text-[#8a8a98] mb-1.5 truncate">{p.id.toLowerCase()}.frame</div>
              <div
                className={`relative h-[190px] rounded-[14px] overflow-hidden bg-white ${live ? "ring-4 ring-[#14AE5C]" : "border border-[#e6e6ea]"}`}
              >
                {src ? (
                  <img src={asset(src)} alt={p.title} draggable={false} className="w-full h-full object-cover object-top" />
                ) : (
                  <div className="w-full h-full grid place-items-center bg-[#1e1e24] text-white">
                    <span className="font-extrabold tracking-[-0.04em]" style={{ fontSize: p.title.split(" ")[0].length > 8 ? 42 : 64 }}>
                      {p.title.split(" ")[0]}
                    </span>
                  </div>
                )}
                {live && (
                  <span className="absolute top-3 left-3 flex items-center gap-2 bg-white/95 rounded-full px-3 py-1 text-[14px] font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#14AE5C] cv-live" /> LIVE
                  </span>
                )}
              </div>
              <div className="font-bold text-[22px] mt-3 leading-tight truncate">{p.title}</div>
              <div className="flex gap-1.5 mt-2 overflow-hidden">
                {p.technologies.slice(0, 3).map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
              </div>
            </div>
          );
        })}
        <a
          href={`mailto:${EMAIL}?subject=${encodeURIComponent("A project idea")}`}
          className="absolute cv-hit rounded-[14px] border-[3px] border-dashed border-[#c9c0ff] grid place-items-center text-center text-[#7B61FF]"
          style={{ left: 30 + (projects.length % 4) * 340, top: 120 + Math.floor(projects.length / 4) * 310 + 22, width: 300, height: 250 }}
        >
          <span>
            <span className="block text-[54px] leading-none">+</span>
            <span className="block text-[22px] font-semibold mt-2">Your idea here</span>
            <span className="block text-[16px] text-[#9a8cff] mt-1">email me →</span>
          </span>
        </a>
      </Frame>

      {/* ── School ── */}
      <Frame id="school" onIsland={onIsland}>
        <div className="absolute cv-card rounded-[22px] p-7" style={{ left: 40, top: 120, width: 640, height: 270 }}>
          <div className="flex items-center gap-4">
            <img src={uiuc.image} alt="" className="w-16 h-16 rounded-xl object-contain" />
            <div className="min-w-0">
              <div className="font-bold text-[24px] leading-tight">{uiuc.school}</div>
              <div className="text-[18px] text-[#55556a]">
                {uiuc.degree} · <span className="cv-mono text-[15px]">{uiuc.period}</span>
              </div>
            </div>
          </div>
          <div className="flex items-end justify-between mt-5">
            <div className="flex flex-wrap gap-2 max-w-[360px]">
              {uiuc.relevantCourses?.map((c) => (
                <Chip key={c}>{c}</Chip>
              ))}
            </div>
            <div className="relative px-4 flex-shrink-0">
              <div className="cv-mono text-[13px] text-[#8a8a98] tracking-widest">GPA</div>
              <span className="text-[76px] font-extrabold leading-none tracking-[-0.04em] text-[#F24E1E]">{uiuc.gpa?.split("/")[0]}</span>
              <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] overflow-visible pointer-events-none">
                <path d="M8,28 C6,8 90,4 94,24 C98,44 14,50 6,30 C4,22 20,12 34,10" stroke="#F24E1E" strokeWidth="4" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
          </div>
        </div>
        {otherEdu.map((e, i) => {
          const link = e.description?.includes("http") ? e.description.slice(e.description.indexOf("http")) : null;
          return (
            <div
              key={e.school}
              className="absolute cv-sticky rounded-[6px] p-5 flex items-center gap-4"
              style={{ left: 60 + i * 30, top: 420 + i * 20, width: 600, background: "#FFD3A8", transform: "rotate(-1.5deg)" }}
            >
              <img src={e.image} alt="" className="w-14 h-14 rounded-lg object-contain" />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-[22px] leading-tight">{e.degree}</div>
                <div className="text-[16px] text-black/60">
                  {e.school} · {e.period}
                </div>
              </div>
              {link && (
                <a href={link} target="_blank" rel="noopener noreferrer" className="cv-hit text-[17px] font-semibold text-[#c2410c]">
                  details ↗
                </a>
              )}
            </div>
          );
        })}
      </Frame>

      {/* ── Guides ── */}
      <Frame id="guides" onIsland={onIsland}>
        {guides.map((g, i) => (
          <div
            key={g.id}
            className="absolute cv-card cv-hit rounded-[20px] p-7 flex flex-col"
            style={{ left: 40 + i * 340, top: 120, width: 300, height: 390 }}
            onClick={() => go(`/guide/${g.id}`)}
          >
            <div className="flex items-center justify-between">
              <span className="cv-mono text-[14px] px-2.5 py-1 rounded-md bg-[#FFF1C2] text-[#8a6400]">{g.category}</span>
              <span className="cv-mono text-[14px] text-[#8a8a98]">{g.publishDate}</span>
            </div>
            <div className="font-bold text-[27px] leading-[1.1] tracking-[-0.02em] mt-5">{g.title}</div>
            <div className="text-[17px] text-[#6b6b78] leading-snug mt-3 line-clamp-4">{g.description}</div>
            <div className="mt-auto text-[18px] font-semibold text-[#E8A100] flex items-center gap-1">
              Read guide <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
        ))}
      </Frame>

      {/* ── Involvement ── */}
      <Frame id="involvement" onIsland={onIsland}>
        {involvements.map((x, i) => (
          <div
            key={x.organization}
            className="absolute cv-sticky rounded-[6px] p-6"
            style={{
              left: 40 + i * 340,
              top: 130 + (i % 2) * 20,
              width: 300,
              minHeight: 320,
              background: ["#FFE58F", "#FFC8DD", "#B8F0C8"][i % 3],
              transform: `rotate(${[-2, 1.5, -1][i % 3]}deg)`,
            }}
          >
            <div className="flex items-center gap-3">
              <img src={asset(x.image)} alt="" className="w-12 h-12 rounded-lg object-contain bg-white/70 flex-shrink-0" />
              <div className="min-w-0">
                <div className="font-bold text-[20px] leading-tight">{x.role}</div>
                <div className="text-[14px] text-black/55 leading-tight mt-0.5">{x.organization}</div>
              </div>
            </div>
            <div className="cv-mono text-[13px] text-black/45 mt-3">{x.period}</div>
            <div className="text-[16px] leading-snug text-black/75 mt-2">{x.description}</div>
          </div>
        ))}
      </Frame>
    </>
  );
};

export default World;
