import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, animate, motion, MotionValue, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight, Github, Linkedin, Mail, X } from "lucide-react";
import { experiences, education, involvements } from "../../data";
import { projects } from "../../data/projects";
import { milestones } from "../../data/journey";
import { guides } from "../../data/guides";
import "./bigbang.css";

// ── types ────────────────────────────────────────────────────────────────
type Detail = { kind: "milestone" | "exp" | "inv" | "edu"; i: number };
type Phase = "charge" | "boom" | "done" | "implode";

interface Spec {
  id: string;
  x: number;
  y: number;
  w?: number; // omitted = shrink-wrap the content
  rot: number;
  node: ReactNode;
  onOpen?: () => void;
  drag?: boolean; // false = not draggable on touch (big cards would eat page scroll)
  star?: boolean;
}

interface Ctl {
  spec: Spec;
  el: HTMLDivElement | null;
  x: MotionValue<number>;
  y: MotionValue<number>;
  r: MotionValue<number>;
  s: MotionValue<number>;
  o: MotionValue<number>;
  nx: MotionValue<number>;
  ny: MotionValue<number>;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
// Stable per-index jitter so the collage looks hand-placed but never reshuffles on resize
const jit = (i: number, amp: number) => Math.sin(i * 12.9898 + 4.1) * amp;

const EMAIL = "mailto:jbw7@illinois.edu";
const GITHUB = "https://github.com/jbw9";
const LINKEDIN = "https://www.linkedin.com/in/jwidjajakusuma/";
const STOCK = ["#f4efe6", "#ffd6a5", "#c8efff", "#e6d7ff", "#d5f5c8", "#ffcfe1", "#fff2a8"];
// Syne ExtraBold advance widths (em), measured; slightly tightened when laid out
const ADV: Record<string, number> = { J: 1.0, O: 1.33, N: 1.3, A: 1.16, T: 1.1, H: 1.28 };

// ── pieces ───────────────────────────────────────────────────────────────
const Label = ({ n, title }: { n: string; title: string }) => (
  <div className="select-none">
    <div className="bb-mono text-[11px] tracking-[0.25em] uppercase text-[#ffb36b]">{n}</div>
    <div className="bb-display font-bold text-white text-[26px] md:text-[34px] leading-tight whitespace-nowrap">{title}</div>
  </div>
);

const Pill = ({ href, icon, text }: { href: string; icon: ReactNode; text: string }) => (
  <a
    href={href}
    target={href.startsWith("mailto") ? undefined : "_blank"}
    rel="noreferrer"
    draggable={false}
    className="flex items-center gap-2 rounded-full bg-white text-[#0b0a12] px-4 py-2.5 text-sm font-semibold shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:bg-[#ffe3c4] transition-colors whitespace-nowrap"
  >
    {icon}
    {text}
  </a>
);

const StarNode = ({ i, mobile }: { i: number; mobile: boolean }) => {
  const m = milestones[i];
  const hot = m.vibe / 100;
  return (
    <div className="relative cursor-pointer select-none" style={{ width: 56, height: 56 }}>
      <div
        className="absolute inset-0 rounded-full flex items-center justify-center text-[26px] transition-transform hover:scale-110"
        style={{
          background: "radial-gradient(circle at 35% 30%, #2a2140, #0b0914 70%)",
          boxShadow: `0 0 0 2px rgba(255,255,255,${0.15 + hot * 0.4}), 0 0 ${10 + hot * 30}px ${hot * 8}px rgba(255,${150 + hot * 60},${90 + (1 - hot) * 140},${0.25 + hot * 0.45})`,
        }}
      >
        {m.emoji}
      </div>
      <div
        className={`bb-mono bb-star-label absolute whitespace-nowrap text-[10.5px] text-white/75 ${
          mobile ? "left-[66px] top-1/2 -translate-y-1/2" : `left-1/2 -translate-x-1/2 ${m.dip || i === 0 ? "top-[64px]" : "bottom-[64px]"}`
        }`}
      >
        {m.short}
      </div>
    </div>
  );
};

const ExpCard = ({ i, h }: { i: number; h: number }) => {
  const e = experiences[i];
  return (
    <div
      className="rounded-xl p-4 text-[#14121c] shadow-[0_18px_40px_rgba(0,0,0,0.55)] cursor-pointer flex flex-col"
      style={{ background: STOCK[i % STOCK.length], height: h }}
    >
      <div className="flex items-center gap-3">
        <img src={e.companyIcon.startsWith("/") ? e.companyIcon : `/${e.companyIcon}`} alt="" draggable={false} className="w-10 h-10 rounded-lg object-contain bg-white p-1 shrink-0" />
        <div className="min-w-0">
          <div className="bb-display font-bold text-[15px] leading-tight line-clamp-2">{e.title}</div>
          <div className="text-[13px] text-black/60 truncate">{e.company}</div>
        </div>
      </div>
      <div className="bb-mono text-[10.5px] uppercase tracking-wider mt-3 text-black/55">{e.period}</div>
      <p className="text-[13px] leading-snug mt-1.5 text-black/75 line-clamp-3">{e.description}</p>
    </div>
  );
};

const UiucCard = () => {
  const e = education[0];
  return (
    <div className="rounded-2xl bg-[#13294b] text-white p-5 shadow-[0_18px_40px_rgba(0,0,0,0.6)] cursor-pointer border-[3px] border-[#ff5f05]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="bb-mono text-[10.5px] tracking-[0.2em] uppercase text-[#ff9a5c]">{e.period}</div>
          <div className="bb-display font-bold text-[19px] leading-tight mt-1">{e.school}</div>
          <div className="text-[13px] text-white/70 mt-1">{e.degree}</div>
        </div>
        <img src={e.image} alt="" draggable={false} className="w-12 h-12 rounded-lg shrink-0" />
      </div>
      <div className="flex items-end gap-2 mt-3">
        <span className="bb-display font-extrabold text-[56px] leading-none text-[#ff7a2e]">{e.gpa?.split("/")[0]}</span>
        <span className="bb-mono text-xs text-white/60 mb-2">GPA / 4.0</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {e.relevantCourses?.map((c) => (
          <span key={c} className="text-[11px] rounded-full bg-white/10 px-2 py-0.5">{c}</span>
        ))}
      </div>
    </div>
  );
};

const YcCard = () => {
  const e = education[1];
  return (
    <div className="rounded-xl bg-[#f26522] text-white p-4 shadow-[0_18px_40px_rgba(0,0,0,0.6)] cursor-pointer">
      <div className="flex items-center gap-3">
        <img src={e.image} alt="" draggable={false} className="w-10 h-10 rounded-md" />
        <div>
          <div className="bb-display font-bold text-[17px] leading-tight">{e.degree}</div>
          <div className="bb-mono text-[10.5px] uppercase tracking-wider text-white/80 mt-0.5">{e.school} · {e.period}</div>
        </div>
      </div>
    </div>
  );
};

const Sticker = ({ i, d }: { i: number; d: number }) => {
  const v = involvements[i];
  return (
    <div
      className="rounded-full bg-[#fffaf0] text-[#14121c] flex flex-col items-center justify-center text-center cursor-pointer shadow-[0_14px_36px_rgba(0,0,0,0.6)] border-[5px] border-white"
      style={{ width: d, height: d, padding: d * 0.12 }}
    >
      <img src={v.image} alt="" draggable={false} className="rounded-full object-contain bg-white" style={{ width: d * 0.3, height: d * 0.3 }} />
      <div className="bb-display font-bold leading-tight mt-1.5" style={{ fontSize: d * 0.075 }}>{v.role}</div>
      <div className="leading-tight text-black/55 mt-0.5" style={{ fontSize: d * 0.062 }}>{v.organization}</div>
    </div>
  );
};

const Polaroid = ({ i, h }: { i: number; h: number }) => {
  const p = projects[i];
  const img = p.image || p.screenshots?.[0];
  return (
    <div className="bg-[#f7f4ee] p-2.5 pb-3 rounded-[4px] shadow-[0_20px_44px_rgba(0,0,0,0.6)] cursor-pointer flex flex-col" style={{ height: h }}>
      <div className="relative rounded-[2px] overflow-hidden bg-[#1b1726] shrink-0" style={{ height: h * 0.48 }}>
        {img ? (
          <img src={img} alt="" draggable={false} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bb-display font-extrabold text-[54px] text-[#ffb36b]" style={{ background: `radial-gradient(circle at 30% 30%, ${STOCK[(i + 3) % STOCK.length]}55, #1b1726 70%)` }}>
            {p.title.charAt(0)}
          </div>
        )}
        {p.id === "taxbuddy" && (
          <span className="absolute top-2 left-2 bb-mono text-[10px] font-bold uppercase tracking-wider bg-[#c6ff3d] text-black px-2 py-0.5 rounded-full">active</span>
        )}
      </div>
      <div className="flex items-center justify-between mt-2.5 gap-2">
        <div className="bb-display font-bold text-[16px] text-[#14121c] leading-tight truncate">{p.title}</div>
        <ArrowUpRight className="w-4 h-4 text-black/40 shrink-0" />
      </div>
      <p className="text-[12px] leading-snug text-black/65 mt-1 line-clamp-3">{p.description}</p>
      <div className="mt-auto flex flex-wrap gap-1 overflow-hidden max-h-[22px]">
        {p.technologies.slice(0, 3).map((t) => (
          <span key={t} className="bb-mono text-[9.5px] text-black/60 border border-black/15 rounded px-1.5 py-[1px] whitespace-nowrap">{t}</span>
        ))}
      </div>
    </div>
  );
};

const GuideCard = ({ i, h }: { i: number; h: number }) => {
  const g = guides[i];
  return (
    <div className="bb-lined rounded-[3px] text-[#1d2433] pl-11 pr-4 pt-3 pb-3 shadow-[0_16px_36px_rgba(0,0,0,0.55)] cursor-pointer" style={{ height: h }}>
      <div className="flex items-center justify-between">
        <span className="bb-mono text-[10px] uppercase tracking-[0.2em] text-[#d6453d] border border-[#d6453d] rounded px-1.5 py-[1px] rotate-[-3deg]">guide · {g.category}</span>
        <span className="bb-mono text-[10px] text-black/45">{g.publishDate}</span>
      </div>
      <div className="bb-display font-bold text-[16px] leading-tight mt-2.5">{g.title}</div>
      <p className="text-[12.5px] leading-[22px] text-black/65 line-clamp-2">{g.description}</p>
    </div>
  );
};

// ── layout: the settled collage, in desk coordinates ─────────────────────
function buildLayout(W: number, open: (d: Detail) => void, go: (p: string) => void) {
  const mobile = W < 760;
  const specs: Spec[] = [];
  const add = (s: Spec) => specs.push(s);
  const DW = Math.min(W, 1360);
  const ox = (W - DW) / 2;
  const X = (f: number) => ox + f * DW;

  // Desktop: one line. Phone: JONA / THAN on two lines so it can stay huge.
  const lines = mobile ? ["JONA", "THAN"] : ["JONATHAN"];
  const nameSize = mobile ? Math.min((W - 36) / 4.7, 82) : Math.min(DW * 0.094, 136);
  const nameLeft = mobile ? 16 : X(0.055);
  const nameTop = mobile ? 104 : 136;
  let li = 0;
  lines.forEach((word, row) => {
    let cx = nameLeft;
    word.split("").forEach((ch) => {
      const i = li++;
      add({
        id: `l${i}`,
        x: cx,
        y: nameTop + row * nameSize * 0.95 + jit(i, mobile ? 5 : 10),
        w: ADV[ch] * nameSize,
        rot: jit(i + 7, mobile ? 5 : 6),
        node: (
          <div className="bb-letter text-center" style={{ fontSize: nameSize, margin: "0 -0.08em", padding: "0 0.08em" }}>
            {ch}
          </div>
        ),
      });
      cx += ADV[ch] * nameSize * 0.97;
    });
  });
  const nameBottom = nameTop + lines.length * nameSize * 0.95;

  const hello = (
    <div className="bb-mono text-[12px] md:text-[13px] tracking-[0.3em] uppercase text-[#ffb36b] select-none whitespace-nowrap">hey there, i'm —</div>
  );
  const tagline = (
    <p className="text-[18px] md:text-[23px] leading-snug text-white/80 select-none">
      <span className="text-white font-semibold">CS & Econs @ UIUC</span> — building software that solves real problems.
    </p>
  );
  const aws = (
    <div className="rounded-2xl bg-[#ff9900] text-[#111] px-4 md:px-5 py-3 shadow-[0_14px_40px_rgba(255,153,0,0.35)] select-none cursor-default">
      <div className="bb-mono text-[10px] uppercase tracking-[0.2em] text-black/60">incoming · feb 2027</div>
      <div className="bb-display font-extrabold text-[17px] md:text-[21px] leading-tight whitespace-nowrap">☁ SDE @ AWS</div>
      <div className="text-[11.5px] text-black/70 whitespace-nowrap">Managed Streaming for Kafka</div>
    </div>
  );
  const taxbuddy = (
    <div className="rounded-2xl bg-[#c6ff3d] text-[#111] px-4 md:px-5 py-3 shadow-[0_14px_40px_rgba(198,255,61,0.3)] select-none cursor-pointer">
      <div className="flex items-center gap-1.5 bb-mono text-[10px] uppercase tracking-[0.2em] text-black/60">
        <span className="relative flex w-2 h-2">
          <span className="bb-ping absolute inset-0 rounded-full bg-[#1a8f2e]" />
          <span className="relative w-2 h-2 rounded-full bg-[#1a8f2e]" />
        </span>
        active project
      </div>
      <div className="bb-display font-extrabold text-[17px] md:text-[21px] leading-tight flex items-center gap-1 whitespace-nowrap">
        TaxBuddy <ArrowUpRight className="w-5 h-5" />
      </div>
    </div>
  );
  const hint = (
    <div className="bb-mono text-[11px] text-white/45 leading-relaxed select-none whitespace-nowrap">
      ↖ everything here is debris.
      <br />
      drag it. fling it. click it.
    </div>
  );
  const contacts: [string, ReactNode, string][] = [
    [EMAIL, <Mail key="m" className="w-4 h-4" />, "Email"],
    [GITHUB, <Github key="g" className="w-4 h-4" />, "GitHub"],
    [LINKEDIN, <Linkedin key="l" className="w-4 h-4" />, "LinkedIn"],
  ];

  let y = 0;
  if (!mobile) {
    add({ id: "hello", x: X(0.06), y: 98, rot: -2, node: hello });
    add({ id: "tag", x: X(0.06), y: nameBottom + 40, w: 470, rot: 0.5, node: tagline });
    contacts.forEach(([href, icon, text], i) =>
      add({ id: `c${i}`, x: X(0.06) + [0, 112, 234][i], y: nameBottom + 148 + jit(i, 6), rot: jit(i + 3, 4), node: <Pill href={href} icon={icon} text={text} /> })
    );
    add({ id: "aws", x: X(0.58), y: nameBottom + 50, rot: -4, node: aws });
    add({ id: "tb", x: X(0.79), y: nameBottom + 90, rot: 5, node: taxbuddy, onOpen: () => go("/project/taxbuddy") });
    add({ id: "hint", x: X(0.062), y: nameBottom + 228, rot: -1.5, node: hint });

    y = 590;
    add({ id: "s-j", x: X(0.06), y, w: 520, rot: -1, node: <Label n="01 / the journey" title="Finance major → AWS" /> });
    milestones.forEach((m, i) =>
      add({
        id: `m${i}`,
        x: X(0.07 + (i / (milestones.length - 1)) * 0.84) - 28,
        y: y + 290 - m.vibe * 1.9,
        w: 56,
        rot: 0,
        star: true,
        node: <StarNode i={i} mobile={false} />,
        onOpen: () => open({ kind: "milestone", i }),
      })
    );

    y = 960;
    add({ id: "s-e", x: X(0.06), y, w: 520, rot: 1, node: <Label n="02 / experience" title="Where I've worked" /> });
    const eh = 196;
    const ew = Math.min(290, DW * 0.215);
    experiences.forEach((_, i) => {
      const row = i < 4 ? 0 : 1;
      const col = row ? i - 4 : i;
      const fx = row ? 0.13 + col * 0.25 : 0.04 + col * 0.24;
      add({ id: `e${i}`, x: X(fx) + jit(i, 18), y: y + 90 + row * 235 + jit(i + 2, 26), w: ew, rot: jit(i + 5, 4.5), node: <ExpCard i={i} h={eh} />, onOpen: () => open({ kind: "exp", i }) });
    });

    y = 1550;
    add({ id: "s-s", x: X(0.06), y, w: 520, rot: -1, node: <Label n="03 / school & clubs" title="UIUC, '27" /> });
    add({ id: "edu0", x: X(0.05), y: y + 90, w: 340, rot: -2.5, node: <UiucCard />, onOpen: () => open({ kind: "edu", i: 0 }) });
    add({ id: "edu1", x: X(0.33), y: y + 120, w: 270, rot: 3, node: <YcCard />, onOpen: () => open({ kind: "edu", i: 1 }) });
    [
      [0.55, 40],
      [0.69, 140],
      [0.83, 30],
    ].forEach(([fx, dy], i) =>
      add({ id: `inv${i}`, x: X(fx), y: y + dy + 30, w: 178, rot: jit(i + 9, 10), node: <Sticker i={i} d={178} />, onOpen: () => open({ kind: "inv", i }) })
    );

    y = 1985;
    add({ id: "s-p", x: X(0.06), y, w: 600, rot: 1, node: <Label n="04 / projects · click to open" title="Things I've built" /> });
    const ph = 318;
    const pw = Math.min(260, DW * 0.2);
    projects.forEach((p, i) => {
      const row = Math.floor(i / 4);
      const col = i % 4;
      const fx = (row === 2 ? 0.14 : 0.04) + col * 0.24;
      add({ id: `p${i}`, x: X(fx) + jit(i, 26), y: y + 95 + row * 350 + jit(i + 4, 34), w: pw, rot: jit(i + 1, 6.5), node: <Polaroid i={i} h={ph} />, onOpen: () => go(`/project/${p.id}`) });
    });

    y = 3170;
    add({ id: "s-g", x: X(0.06), y, w: 520, rot: -1, node: <Label n="05 / writing" title="Guides I wrote" /> });
    guides.forEach((g, i) =>
      add({ id: `g${i}`, x: X(0.06 + i * 0.3) + jit(i, 12), y: y + 95 + jit(i + 6, 24), w: Math.min(330, DW * 0.26), rot: jit(i + 2, 3), node: <GuideCard i={i} h={170} />, onOpen: () => go(`/guide/${g.id}`) })
    );
    y += 420;
  } else {
    const cw = W - 36;
    add({ id: "hello", x: 18, y: 72, rot: -2, node: hello });
    y = nameBottom + 22;
    add({ id: "tag", x: 18, y, w: cw, rot: 0, node: tagline });
    y += 92;
    contacts.forEach(([href, icon, text], i) =>
      add({ id: `c${i}`, x: 18 + [0, 108, 226][i], y: y + jit(i, 5), rot: jit(i + 3, 4), node: <Pill href={href} icon={icon} text={text} /> })
    );
    y += 70;
    add({ id: "aws", x: 14, y, rot: -4, node: aws });
    add({ id: "tb", x: W - 190, y: y + 70, rot: 5, node: taxbuddy, onOpen: () => go("/project/taxbuddy") });
    y += 180;
    add({ id: "hint", x: 18, y, rot: -1.5, node: hint });

    y += 80;
    add({ id: "s-j", x: 18, y, w: cw, rot: -1, node: <Label n="01 / the journey" title="Finance major → AWS" /> });
    y += 90;
    milestones.forEach((m, i) =>
      add({
        id: `m${i}`,
        x: 18 + (m.vibe / 100) * (cw * 0.42),
        y: y + i * 58,
        w: 56,
        rot: 0,
        star: true,
        node: <StarNode i={i} mobile />,
        onOpen: () => open({ kind: "milestone", i }),
      })
    );
    y += milestones.length * 58 + 40;

    add({ id: "s-e", x: 18, y, w: cw, rot: 1, node: <Label n="02 / experience" title="Where I've worked" /> });
    y += 90;
    experiences.forEach((_, i) => add({ id: `e${i}`, x: 18 + 6 + jit(i, 6), y: y + i * 172, w: cw - 14, rot: jit(i + 5, 2), node: <ExpCard i={i} h={156} />, drag: false, onOpen: () => open({ kind: "exp", i }) }));
    y += experiences.length * 172 + 20;

    add({ id: "s-s", x: 18, y, w: cw, rot: -1, node: <Label n="03 / school & clubs" title="UIUC, '27" /> });
    y += 90;
    add({ id: "edu0", x: 20, y, w: cw - 8, rot: -1.5, node: <UiucCard />, drag: false, onOpen: () => open({ kind: "edu", i: 0 }) });
    y += 312;
    add({ id: "edu1", x: 26, y, w: cw - 30, rot: 2, node: <YcCard />, onOpen: () => open({ kind: "edu", i: 1 }) });
    y += 110;
    const sd = Math.min(158, cw / 2.3);
    [
      [8, 0],
      [cw - sd + 8, 50],
      [cw / 2 - sd / 2 + 10, 170],
    ].forEach(([sx, dy], i) => add({ id: `inv${i}`, x: sx, y: y + dy, w: sd, rot: jit(i + 9, 10), node: <Sticker i={i} d={sd} />, onOpen: () => open({ kind: "inv", i }) }));
    y += 170 + sd + 50;

    add({ id: "s-p", x: 18, y, w: cw, rot: 1, node: <Label n="04 / projects" title="Things I've built" /> });
    y += 90;
    const pw = (cw - 14) / 2;
    projects.forEach((p, i) =>
      add({ id: `p${i}`, x: 18 + (i % 2) * (pw + 14) + jit(i, 4), y: y + Math.floor(i / 2) * 300 + (i % 2) * 24, w: pw, rot: jit(i + 1, 3), node: <Polaroid i={i} h={280} />, drag: false, onOpen: () => go(`/project/${p.id}`) })
    );
    y += Math.ceil(projects.length / 2) * 300 + 40;

    add({ id: "s-g", x: 18, y, w: cw, rot: -1, node: <Label n="05 / writing" title="Guides I wrote" /> });
    y += 90;
    guides.forEach((g, i) => add({ id: `g${i}`, x: 18 + jit(i, 6), y: y + i * 190, w: cw - 8, rot: jit(i + 2, 2), node: <GuideCard i={i} h={170} />, drag: false, onOpen: () => go(`/guide/${g.id}`) }));
    y += guides.length * 190 + 30;
  }

  add({
    id: "fin",
    x: mobile ? 18 : X(0.06),
    y,
    w: mobile ? W - 36 : 560,
    rot: -1,
    node: (
      <div className="select-none">
        <div className="bb-display font-extrabold text-white text-[34px] md:text-[48px] leading-none">Say hi.</div>
        <div className="bb-mono text-[12px] md:text-[13px] text-white/50 mt-2 mb-4">jbw7@illinois.edu · or hit 💥 to do it all again</div>
        <div className="flex flex-wrap gap-3">
          {contacts.map(([href, icon, text]) => (
            <Pill key={text} href={href} icon={icon} text={text} />
          ))}
        </div>
      </div>
    ),
  });
  return { specs, height: y + (mobile ? 220 : 240), mobile };
}

// ── one flying piece ─────────────────────────────────────────────────────
let topZ = 10;

const Piece = ({ spec, ctls, mobile, live, deskRef }: { spec: Spec; ctls: Map<string, Ctl>; mobile: boolean; live: boolean; deskRef: React.RefObject<HTMLDivElement> }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const r = useMotionValue(spec.rot);
  const s = useMotionValue(0);
  const o = useMotionValue(0);
  const nx = useSpring(0, { stiffness: 170, damping: 16 });
  const ny = useSpring(0, { stiffness: 170, damping: 16 });
  const ref = useRef<HTMLDivElement>(null);
  const moved = useRef(false);

  useLayoutEffect(() => {
    ctls.set(spec.id, { spec, el: ref.current, x, y, r, s, o, nx, ny });
  });
  useEffect(() => () => void ctls.delete(spec.id), [ctls, spec.id]);

  const canDrag = live && !(mobile && spec.drag === false);
  return (
    <motion.div
      ref={ref}
      drag={canDrag}
      dragConstraints={deskRef}
      dragElastic={0.25}
      dragTransition={{ power: 0.4, timeConstant: 340, bounceStiffness: 260, bounceDamping: 18 }}
      onPointerDown={(e) => {
        moved.current = false;
        e.currentTarget.style.zIndex = String(++topZ);
      }}
      onDrag={(_, info) => {
        if (Math.abs(info.offset.x) + Math.abs(info.offset.y) > 6) moved.current = true;
      }}
      onClickCapture={(e) => {
        if (moved.current) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      onClick={() => !moved.current && live && spec.onOpen?.()}
      onHoverStart={() => live && !spec.star && animate(r, 0, { type: "spring", stiffness: 300, damping: 20 })}
      onHoverEnd={() => live && !spec.star && animate(r, spec.rot, { type: "spring", stiffness: 200, damping: 14 })}
      whileHover={live && !spec.star ? { scale: 1.035 } : undefined}
      className={canDrag ? "cursor-grab active:cursor-grabbing" : ""}
      style={{ position: "absolute", left: spec.x, top: spec.y, width: spec.w ?? "max-content", x, y, rotate: r, scale: s, opacity: o, zIndex: spec.star ? 6 : 5, touchAction: canDrag ? "none" : "auto" }}
    >
      <motion.div style={{ x: nx, y: ny }}>{spec.node}</motion.div>
    </motion.div>
  );
};

// Thin line threading the journey stars together; follows them as they're dragged
const Constellation = ({ ctls, visible }: { ctls: Map<string, Ctl>; visible: boolean }) => {
  const path = useRef<SVGPathElement>(null);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const pts: string[] = [];
      milestones.forEach((_, i) => {
        const c = ctls.get(`m${i}`);
        if (c) pts.push(`${c.spec.x + 28 + c.x.get() + c.nx.get()},${c.spec.y + 28 + c.y.get() + c.ny.get()}`);
      });
      if (path.current && pts.length > 1) path.current.setAttribute("d", `M${pts.join("L")}`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ctls]);
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 4, opacity: visible ? 1 : 0, transition: "opacity 0.8s" }}>
      <defs>
        <linearGradient id="bb-line" x1="0" x2="1">
          <stop offset="0" stopColor="#7cc7ff" />
          <stop offset="0.5" stopColor="#ffb36b" />
          <stop offset="1" stopColor="#c6ff3d" />
        </linearGradient>
      </defs>
      <path ref={path} fill="none" stroke="url(#bb-line)" strokeWidth={1.5} strokeDasharray="2 6" strokeLinecap="round" opacity={0.85} />
    </svg>
  );
};

// ── starfield + charge streaks + blast sparks on one fixed canvas ────────
interface Fx {
  charging: boolean;
  burst: () => void;
}

const useStarfield = (canvas: React.RefObject<HTMLCanvasElement>, fx: React.MutableRefObject<Fx>) => {
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      c.width = W * dpr;
      c.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    const n = W < 760 ? 140 : 320;
    const stars = Array.from({ length: n }, () => ({ x: Math.random(), y: Math.random(), z: rand(0.1, 1), t: rand(0, 6.28) }));
    const streaks: { a: number; r: number; v: number }[] = [];
    let sparks: { x: number; y: number; vx: number; vy: number; life: number; col: string; w: number }[] = [];
    const cols = ["#ffffff", "#ffd9a8", "#ff8a3d", "#7cc7ff", "#c6ff3d", "#ff6fa8"];
    fx.current.burst = () => {
      const count = W < 760 ? 160 : 340;
      for (let i = 0; i < count; i++) {
        const a = rand(0, Math.PI * 2);
        const sp = rand(3, 24) * (Math.random() < 0.15 ? 1.6 : 1);
        sparks.push({ x: W / 2, y: H / 2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, col: cols[i % cols.length], w: rand(1, 2.6) });
      }
    };
    let raf = 0;
    let frame = 0;
    const tick = () => {
      frame++;
      ctx.clearRect(0, 0, W, H);
      const sy = window.scrollY;
      stars.forEach((s) => {
        const yy = (((s.y * H - sy * s.z * 0.25) % H) + H) % H;
        const a = 0.35 + 0.65 * Math.abs(Math.sin(s.t + frame * 0.02 * s.z));
        ctx.globalAlpha = a * (0.3 + s.z * 0.7);
        ctx.fillStyle = "#fff";
        ctx.fillRect(s.x * W, yy, s.z * 1.8, s.z * 1.8);
      });
      if (fx.current.charging) for (let i = 0; i < 3; i++) streaks.push({ a: rand(0, Math.PI * 2), r: rand(Math.max(W, H) * 0.35, Math.max(W, H) * 0.7), v: rand(2, 5) });
      ctx.lineCap = "round";
      for (let i = streaks.length - 1; i >= 0; i--) {
        const s = streaks[i];
        s.v *= 1.07;
        s.r -= s.v;
        if (s.r < 8) {
          streaks.splice(i, 1);
          continue;
        }
        const cx = Math.cos(s.a);
        const cy = Math.sin(s.a);
        ctx.globalAlpha = Math.min(1, 220 / s.r) * 0.8;
        ctx.strokeStyle = "#ffd9a8";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(W / 2 + cx * s.r, H / 2 + cy * s.r);
        ctx.lineTo(W / 2 + cx * (s.r + s.v * 4), H / 2 + cy * (s.r + s.v * 4));
        ctx.stroke();
      }
      sparks = sparks.filter((p) => p.life > 0.02);
      sparks.forEach((p) => {
        ctx.globalAlpha = p.life;
        ctx.strokeStyle = p.col;
        ctx.lineWidth = p.w;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        p.x += p.vx;
        p.y += p.vy;
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        p.vx *= 0.955;
        p.vy *= 0.955;
        p.life *= 0.968;
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [canvas, fx]);
};

// ── detail modal ─────────────────────────────────────────────────────────
const DetailBody = ({ d }: { d: Detail }) => {
  if (d.kind === "milestone") {
    const m = milestones[d.i];
    return (
      <>
        <div className="text-[56px] leading-none">{m.emoji}</div>
        <div className="bb-mono text-[11px] uppercase tracking-[0.2em] text-[#ffb36b] mt-4">
          {new Date(m.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" })} · vibe {m.vibe}/100
        </div>
        <h3 className="bb-display font-bold text-[26px] leading-tight mt-1">{m.title}</h3>
        <p className="text-white/75 mt-3 leading-relaxed">{m.body}</p>
        <div className="h-1.5 rounded-full bg-white/10 mt-5 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-[#7cc7ff] via-[#ffb36b] to-[#c6ff3d]" style={{ width: `${m.vibe}%` }} />
        </div>
      </>
    );
  }
  if (d.kind === "exp") {
    const e = experiences[d.i];
    return (
      <>
        <img src={e.companyIcon.startsWith("/") ? e.companyIcon : `/${e.companyIcon}`} alt="" className="w-14 h-14 rounded-xl bg-white p-1.5 object-contain" />
        <div className="bb-mono text-[11px] uppercase tracking-[0.2em] text-[#ffb36b] mt-4">{e.period}</div>
        <h3 className="bb-display font-bold text-[26px] leading-tight mt-1">{e.title}</h3>
        <div className="text-white/60">{e.company}</div>
        <p className="text-white/80 mt-3 leading-relaxed">{e.description}</p>
        {e.website && (
          <a href={e.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-4 text-[#c6ff3d] text-sm">
            {e.website.replace(/^https?:\/\//, "")} <ArrowUpRight className="w-4 h-4" />
          </a>
        )}
      </>
    );
  }
  if (d.kind === "edu") {
    const e = education[d.i];
    return (
      <>
        <img src={e.image} alt="" className="w-14 h-14 rounded-xl" />
        <div className="bb-mono text-[11px] uppercase tracking-[0.2em] text-[#ffb36b] mt-4">{e.period}</div>
        <h3 className="bb-display font-bold text-[26px] leading-tight mt-1">{e.degree}</h3>
        <div className="text-white/60">{e.school}</div>
        {e.gpa && <div className="bb-display font-extrabold text-[40px] text-[#ff7a2e] mt-2">GPA {e.gpa}</div>}
        {e.relevantCourses && <p className="text-white/75 mt-2">{e.relevantCourses.join(" · ")}</p>}
        {e.description && <p className="text-white/75 mt-2">{e.description}</p>}
      </>
    );
  }
  const v = involvements[d.i];
  return (
    <>
      <img src={v.image} alt="" className="w-14 h-14 rounded-full bg-white object-contain" />
      <div className="bb-mono text-[11px] uppercase tracking-[0.2em] text-[#ffb36b] mt-4">{v.period}</div>
      <h3 className="bb-display font-bold text-[26px] leading-tight mt-1">{v.role}</h3>
      <div className="text-white/60">{v.organization}</div>
      <p className="text-white/80 mt-3 leading-relaxed">{v.description}</p>
    </>
  );
};

// ── the variant ──────────────────────────────────────────────────────────
const BigBang = () => {
  const navigate = useNavigate();
  const [W, setW] = useState(() => window.innerWidth);
  const [phase, setPhase] = useState<Phase>("charge");
  const [detail, setDetail] = useState<Detail | null>(null);
  const phaseRef = useRef<Phase>("charge");
  const ctls = useRef(new Map<string, Ctl>()).current;
  const deskRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fx = useRef<Fx>({ charging: true, burst: () => {} });
  const timers = useRef<number[]>([]);
  const anims = useRef<{ stop: () => void }[]>([]);
  const shakeX = useMotionValue(0);
  const shakeY = useMotionValue(0);

  const { specs, height, mobile } = buildLayout(W, setDetail, (p) => navigate(p));
  useStarfield(canvasRef, fx);

  const go = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };
  const later = (ms: number, f: () => void) => timers.current.push(window.setTimeout(f, ms));
  const stopAll = () => {
    anims.current.forEach((a) => a.stop());
    anims.current = [];
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const settle = () => {
    stopAll();
    fx.current.charging = false;
    shakeX.set(0);
    shakeY.set(0);
    Array.from(ctls.values()).forEach((c) => {
      c.x.set(0);
      c.y.set(0);
      c.r.set(c.spec.rot);
      c.s.set(1);
      c.o.set(1);
    });
    go("done");
  };

  const detonate = () => {
    fx.current.charging = false;
    fx.current.burst();
    go("boom");
    anims.current.push(
      animate(shakeX, [0, -14, 12, -9, 6, -3, 0], { duration: 0.45 }),
      animate(shakeY, [0, 9, -10, 6, -4, 2, 0], { duration: 0.45 })
    );
    const ox = window.innerWidth / 2;
    const oy = window.scrollY + window.innerHeight / 2;
    Array.from(ctls.values()).forEach((c) => {
      const w = c.el ? c.el.offsetWidth : 100;
      const h = c.el ? c.el.offsetHeight : 40;
      const sx = ox - (c.spec.x + w / 2);
      const sy = oy - (c.spec.y + h / 2);
      const near = Math.hypot(sx, sy) < window.innerHeight * 1.2;
      const d = rand(0, 0.06);
      const k = rand(2.2, 3.4);
      c.x.set(sx);
      c.y.set(sy);
      c.s.set(0.15);
      c.o.set(1);
      c.r.set(rand(-540, 540));
      anims.current.push(
        animate(c.x, 0, { type: "spring", stiffness: near ? 70 : 40, damping: near ? 9 : 12, velocity: -sx * k, delay: d }),
        animate(c.y, 0, { type: "spring", stiffness: near ? 70 : 40, damping: near ? 9 : 12, velocity: -sy * k, delay: d }),
        animate(c.r, c.spec.rot, { type: "spring", stiffness: 38, damping: 8, delay: d }),
        animate(c.s, 1, { type: "spring", stiffness: 160, damping: 11, delay: d })
      );
    });
    later(2000, () => go("done"));
  };

  const charge = (ms: number) => {
    fx.current.charging = true;
    go("charge");
    later(ms, detonate);
  };

  const again = () => {
    if (phaseRef.current !== "done") return;
    setDetail(null);
    go("implode");
    const ox = window.innerWidth / 2;
    const oy = window.scrollY + window.innerHeight / 2;
    Array.from(ctls.values()).forEach((c) => {
      const w = c.el ? c.el.offsetWidth : 100;
      const h = c.el ? c.el.offsetHeight : 40;
      const sx = ox - (c.spec.x + w / 2);
      const sy = oy - (c.spec.y + h / 2);
      const dur = rand(0.45, 0.75);
      const ease = [0.6, 0, 1, 0.5] as [number, number, number, number];
      anims.current.push(
        animate(c.x, sx, { duration: dur, ease }),
        animate(c.y, sy, { duration: dur, ease }),
        animate(c.r, c.r.get() + rand(-400, 400), { duration: dur, ease }),
        animate(c.s, 0.1, { duration: dur, ease }),
        animate(c.o, 0, { duration: 0.15, delay: dur - 0.1 })
      );
    });
    later(850, () => {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      charge(900);
    });
  };

  // Intro: charge → shudder → boom. Any click/key before it settles skips to the end state.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) settle();
    else charge(1750);
    const onKey = (e: KeyboardEvent) => {
      if (phaseRef.current === "charge" || phaseRef.current === "boom") settle();
      else if (e.key === "Escape") setDetail(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      stopAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener("resize", onResize);
    const prevBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#05040a";
    return () => {
      window.removeEventListener("resize", onResize);
      document.body.style.backgroundColor = prevBg;
    };
  }, []);

  // Cards shy away from an approaching cursor, then hold still once you're on them
  useEffect(() => {
    let raf = 0;
    let px = -1e4;
    let py = -1e4;
    const run = () => {
      raf = 0;
      if (phaseRef.current !== "done") return;
      Array.from(ctls.values()).forEach((c) => {
        if (!c.el) return;
        const b = c.el.getBoundingClientRect();
        const l = b.left - c.nx.get();
        const t = b.top - c.ny.get();
        const dx = Math.max(l - px, 0, px - (l + b.width));
        const dy = Math.max(t - py, 0, py - (t + b.height));
        const d = Math.hypot(dx, dy);
        if (d === 0 || d > 110) {
          c.nx.set(0);
          c.ny.set(0);
          return;
        }
        const ax = l + b.width / 2 - px;
        const ay = t + b.height / 2 - py;
        const len = Math.hypot(ax, ay) || 1;
        const f = (1 - d / 110) * 16;
        c.nx.set((ax / len) * f);
        c.ny.set((ay / len) * f);
      });
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.buttons) return;
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(run);
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [ctls]);

  const live = phase === "done";
  const intro = phase === "charge" || phase === "boom";

  return (
    <div className="v-bigbang relative min-h-screen overflow-x-hidden bg-[#05040a] text-white">
      {/* nebula */}
      <div
        className="fixed inset-0 pointer-events-none transition-opacity duration-[1500ms]"
        style={{
          opacity: phase === "charge" ? 0.15 : 1,
          background:
            "radial-gradient(60% 50% at 15% 20%, rgba(91,44,160,0.35), transparent 70%), radial-gradient(50% 45% at 85% 70%, rgba(14,110,130,0.28), transparent 70%), radial-gradient(40% 35% at 70% 10%, rgba(190,80,30,0.22), transparent 70%)",
        }}
      />
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none" />

      <motion.div ref={deskRef} className="relative" style={{ height, x: shakeX, y: shakeY }}>
        <Constellation ctls={ctls} visible={phase !== "charge" && phase !== "implode"} />
        {specs.map((s) => (
          <Piece key={s.id} spec={s} ctls={ctls} mobile={mobile} live={live} deskRef={deskRef} />
        ))}
      </motion.div>

      {/* singularity */}
      <AnimatePresence>
        {phase === "charge" && (
          <motion.div
            key="dot"
            className="fixed left-1/2 top-1/2 z-[60] pointer-events-none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 4, opacity: 0, transition: { duration: 0.18 } }}
          >
            <motion.div
              className="bb-dot w-4 h-4 -ml-2 -mt-2 rounded-full bg-white"
              animate={{ scale: [0.6, 1.1, 0.8, 1.4, 1, 1.9, 1.3, 2.4], x: [0, 0, 0, 0, -2, 3, -3, 2, -4, 4, 0], y: [0, 0, 0, 0, 2, -3, 3, -2, 4, -4, 0] }}
              transition={{ duration: 1.7, ease: "easeIn" }}
            />
            <div className="bb-mono absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] tracking-[0.4em] uppercase text-white/40">
              singularity · charging
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {phase === "boom" && (
          <motion.div key="boom" className="fixed inset-0 z-[55] pointer-events-none" exit={{ opacity: 0 }}>
            <motion.div className="absolute inset-0 bg-white" initial={{ opacity: 0.95 }} animate={{ opacity: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} />
            <motion.div
              className="absolute left-1/2 top-1/2 w-24 h-24 -ml-12 -mt-12 rounded-full border-[3px] border-white"
              initial={{ scale: 0.1, opacity: 1 }}
              animate={{ scale: 26, opacity: 0 }}
              transition={{ duration: 1.1, ease: [0.1, 0.7, 0.3, 1] }}
            />
            <motion.div
              className="absolute left-1/2 top-1/2 w-24 h-24 -ml-12 -mt-12 rounded-full border-[10px] border-[#ff8a3d]"
              initial={{ scale: 0.1, opacity: 0.8 }}
              animate={{ scale: 16, opacity: 0 }}
              transition={{ duration: 1.3, delay: 0.05, ease: [0.1, 0.7, 0.3, 1] }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* during the intro, any click skips to the settled desk */}
      {intro && <div className="fixed inset-0 z-[70] cursor-pointer" onClick={settle} />}

      <AnimatePresence>
        {live && (
          <motion.button
            key="again"
            onClick={again}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            whileHover={{ scale: 1.06, rotate: -3 }}
            whileTap={{ scale: 0.92 }}
            className="fixed top-4 right-4 z-[80] flex items-center gap-2 rounded-full bg-white text-[#0b0a12] pl-3 pr-4 py-2 text-sm font-bold shadow-[0_0_30px_rgba(255,170,90,0.5)] bb-display"
          >
            <span className="text-lg leading-none">💥</span> again
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {detail && (
          <motion.div key="detail" className="fixed inset-0 z-[90] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-[#05040a]/75 backdrop-blur-sm" onClick={() => setDetail(null)} />
            <motion.div
              className="relative w-full max-w-[480px] max-h-[80vh] overflow-y-auto rounded-3xl border border-white/15 bg-[#120f1d] p-7 shadow-[0_0_80px_rgba(255,140,60,0.25)]"
              initial={{ scale: 0.3, rotate: -12, y: 40 }}
              animate={{ scale: 1, rotate: 0, y: 0 }}
              exit={{ scale: 0.5, rotate: 8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
            >
              <button onClick={() => setDetail(null)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
              <DetailBody d={detail} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BigBang;
