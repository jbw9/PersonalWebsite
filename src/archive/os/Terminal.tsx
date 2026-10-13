import { useEffect, useRef, useState, ReactNode } from "react";
import { experiences, education } from "../../data";
import { projects } from "../../data/projects";
import { guides } from "../../data/guides";
import { milestones, JOURNEY_START } from "../../data/journey";
import { AppId, useOS, periodStatus, EMAIL, GITHUB, LINKEDIN } from "./shared";

const COMMANDS = [
  "help", "ls", "cat", "open", "projects", "journey", "experience", "school", "guides",
  "whoami", "contact", "neofetch", "sudo", "echo", "date", "clear", "exit",
];
const FILES = ["about.md", "contact.txt", "journey.log"];
const APP_IDS: AppId[] = ["about", "projects", "experience", "journey", "school", "guides", "involvement", "terminal", "contact"];
const LINKS: Record<string, string> = { github: GITHUB, linkedin: LINKEDIN, email: `mailto:${EMAIL}` };

const argsFor = (cmd: string): string[] => {
  if (cmd === "open") return [...projects.map((p) => p.id.toLowerCase()), ...guides.map((g) => g.id), ...APP_IDS, ...Object.keys(LINKS)];
  if (cmd === "cat") return FILES;
  if (cmd === "ls") return ["projects", "guides"];
  if (cmd === "sudo") return ["hire jonathan"];
  return [];
};

const commonPrefix = (xs: string[]) => xs.reduce((a, b) => {
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  return a.slice(0, i);
});

const C = {
  g: "text-[#30D158]",
  b: "text-[#64D2FF]",
  y: "text-[#FFD60A]",
  o: "text-[#FF9F0A]",
  p: "text-[#FF6FB5]",
  r: "text-[#FF453A]",
  d: "text-white/40",
};

const A = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target={href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer" className="underline decoration-white/30 underline-offset-2 hover:decoration-current text-[#64D2FF]">
    {children}
  </a>
);

const Prompt = () => (
  <span>
    <span className={C.g}>guest@jonathanos</span> <span className={C.b}>~</span> <span className={C.d}>%</span>{" "}
  </span>
);

const LOGO = ["      ██████████", "          ████  ", "          ████  ", "          ████  ", "  ████    ████  ", "  ████    ████  ", "   ██████████   "];
const LOGO_COLORS = ["#FF5F05", "#FF4030", "#F5245A", "#E11D74", "#B81F9E", "#8B24C4", "#6D28D9"];

const weeksSince = () => Math.floor((Date.now() - new Date(JOURNEY_START).getTime()) / (7 * 24 * 3600 * 1000));

const neofetch = () => {
  const uiuc = education.find((e) => e.gpa);
  const info: [string, string][] = [
    ["OS", "JonathanOS 26.10 (Champaign)"],
    ["Host", "University of Illinois Urbana-Champaign"],
    ["Kernel", "cs-econs-2027"],
    ["Uptime", `${weeksSince()} weeks (since finance major)`],
    ["Packages", `${projects.length} projects, ${guides.length} guides`],
    ["Shell", "zsh (caffeinated)"],
    ["Next", `SDE @ AWS (Amazon MSK) · ${experiences[0].period}`],
    ["Active", "taxbuddy.service ● running"],
    ["GPA", uiuc?.gpa ?? ""],
  ];
  return (
    <div className="flex gap-6 my-1 flex-wrap">
      <pre className="leading-[1.15] font-[inherit] hidden sm:block">
        {LOGO.map((l, i) => (
          <div key={i} style={{ color: LOGO_COLORS[i] }}>{l}</div>
        ))}
      </pre>
      <div>
        <div><span className={C.g}>guest</span>@<span className={C.g}>jonathanos</span></div>
        <div className={C.d}>-----------------------</div>
        {info.map(([k, v]) => (
          <div key={k}><span className={C.o}>{k}</span>: {v}</div>
        ))}
        <div className="flex gap-0 mt-1.5">
          {["#FF453A", "#FF9F0A", "#FFD60A", "#30D158", "#64D2FF", "#0A84FF", "#BF5AF2", "#E5E5EA"].map((c) => (
            <span key={c} className="w-4 h-3" style={{ background: c }} />
          ))}
        </div>
      </div>
    </div>
  );
};

const HELP: [string, string][] = [
  ["whoami", "who is this guy"],
  ["ls / cat <file>", "look around"],
  ["projects", "list projects"],
  ["open <name>", "open a project, guide, app or link"],
  ["journey", "finance major → engineer, in weeks"],
  ["experience", "where I've worked"],
  ["school / guides", "the rest of it"],
  ["contact", "how to reach me"],
  ["neofetch", "system info, obviously"],
  ["sudo hire jonathan", "you know you want to"],
  ["clear", "clean slate"],
];

interface Line { id: number; node: ReactNode }

let nextId = 0;

const Terminal = ({ autorun }: { autorun?: string }) => {
  const { open, close, go, compact } = useOS();
  const [lines, setLines] = useState<Line[]>(() => [
    { id: nextId++, node: <span className={C.d}>Last login: {new Date().toDateString()} on ttys001</span> },
    { id: nextId++, node: <span>Welcome to <b>JonathanOS</b>. Type <span className={C.y}>help</span> to see what this machine can do.</span> },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const history = useRef<string[]>([]);
  const histIdx = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  const print = (...nodes: ReactNode[]) => setLines((ls) => [...ls, ...nodes.map((node) => ({ id: nextId++, node }))]);

  const exec = (raw: string): ReactNode[] => {
    const [cmd = "", ...rest] = raw.trim().split(/\s+/);
    const arg = rest.join(" ").toLowerCase();
    switch (cmd.toLowerCase()) {
      case "":
        return [];
      case "help":
        return [
          <span className={C.d}>Available commands (tab completes):</span>,
          ...HELP.map(([c, d]) => (
            <span>
              {"  "}<span className={C.y}>{c.padEnd(20)}</span><span className={C.d}>{d}</span>
            </span>
          )),
        ];
      case "ls":
        if (arg === "projects") return [<span className="flex flex-wrap gap-x-5">{projects.map((p) => <span key={p.id} className={C.b}>{p.id.toLowerCase()}</span>)}</span>];
        if (arg === "guides") return [<span className="flex flex-wrap gap-x-5">{guides.map((g) => <span key={g.id} className={C.b}>{g.id}</span>)}</span>];
        return [
          <span className="flex flex-wrap gap-x-5">
            {FILES.map((f) => <span key={f}>{f}</span>)}
            {["projects/", "guides/"].map((f) => <span key={f} className={`${C.b} font-semibold`}>{f}</span>)}
          </span>,
        ];
      case "cat":
        if (arg.startsWith("about")) return exec("whoami");
        if (arg.startsWith("contact")) return exec("contact");
        if (arg.startsWith("journey")) return exec("journey");
        return [<span className={C.r}>cat: {arg || "(nothing)"}: No such file or directory</span>];
      case "whoami":
        return [
          <span><span className={C.g}>guest</span> <span className={C.d}>— but this is</span> <b>Jonathan</b><span className={C.d}>'s machine.</span></span>,
          <span>CS &amp; Econs @ UIUC. Incoming SDE @ <span className={C.o}>AWS</span> (Amazon MSK). Building <span className={C.g}>TaxBuddy</span>.</span>,
          <span className={C.d}>Showed up as a finance major. Took CS124 "for fun". Never left.</span>,
        ];
      case "projects":
        return [
          ...projects.map((p) => (
            <span>
              <span className={p.id === "taxbuddy" ? C.g : C.b}>{p.id.toLowerCase().padEnd(22)}</span>
              <span className="text-white/80">{p.title}</span>
              {p.id === "taxbuddy" && <span className={C.g}> ● active</span>}
            </span>
          )),
          <span className={C.d}>→ open &lt;name&gt; to view one</span>,
        ];
      case "journey":
        return milestones.map((m) => (
          <span>
            <span className={C.d}>{m.date}</span> {m.emoji} <span className={m.dip ? C.r : C.g}>{"▇".repeat(Math.round(m.vibe / 10)).padEnd(10, "·")}</span> {m.short}
          </span>
        ));
      case "experience":
        return experiences.map((x) => {
          const s = periodStatus(x.period);
          return (
            <span>
              <span className={s === "scheduled" ? C.o : s === "running" ? C.g : C.d}>{(s === "exited" ? "exited" : s).padEnd(10)}</span>
              <span className="text-white/85">{x.company}</span> <span className={C.d}>· {x.title} · {x.period}</span>
            </span>
          );
        });
      case "school":
        return education.map((e) => (
          <span>
            {e.gpa ? <span className={C.o}>GPA {e.gpa} </span> : null}
            <span className="text-white/85">{e.degree}</span> <span className={C.d}>· {e.school} · {e.period}</span>
          </span>
        ));
      case "guides":
        return [
          ...guides.map((g) => (
            <span>
              <span className={C.b}>{g.id.padEnd(24)}</span>
              {g.title} <span className={C.d}>({g.publishDate})</span>
            </span>
          )),
          <span className={C.d}>→ open &lt;id&gt; to read</span>,
        ];
      case "contact":
        return [
          <span><span className={C.o}>email   </span> <A href={`mailto:${EMAIL}`}>{EMAIL}</A></span>,
          <span><span className={C.o}>github  </span> <A href={GITHUB}>github.com/jbw9</A></span>,
          <span><span className={C.o}>linkedin</span> <A href={LINKEDIN}>linkedin.com/in/jwidjajakusuma</A></span>,
        ];
      case "neofetch":
        return [neofetch()];
      case "open": {
        if (!arg) return [<span className={C.r}>usage: open &lt;project | guide | app | github | linkedin | email&gt;</span>];
        const p = projects.find((x) => x.id.toLowerCase() === arg || x.title.toLowerCase() === arg);
        if (p) {
          later(() => go(`/project/${p.id}`), 550);
          return [<span>Opening <span className={C.g}>{p.title}</span>…</span>];
        }
        const g = guides.find((x) => x.id === arg);
        if (g) {
          later(() => go(`/guide/${g.id}`), 550);
          return [<span>Opening <span className={C.g}>{g.title}</span>…</span>];
        }
        const app = APP_IDS.find((x) => x === arg);
        if (app) {
          open(app);
          return [];
        }
        if (LINKS[arg]) {
          window.open(LINKS[arg]);
          return [<span className={C.d}>Opening {arg}…</span>];
        }
        return [<span className={C.r}>open: {arg}: not found. Try <span className={C.y}>ls projects</span></span>];
      }
      case "sudo":
        if (arg !== "hire jonathan") return [<span className={C.r}>guest is not in the sudoers file. This incident will be reported.</span>];
        later(() => print(<span className={C.g}>✔ Authenticated. Excellent judgement.</span>), 450);
        later(() => print(<span>→ Compiling offer.pdf <span className={C.d}>.................</span> <span className={C.g}>done</span></span>), 950);
        later(() => print(<span>→ Recipient: Jonathan &lt;{EMAIL}&gt;</span>), 1350);
        later(() => print(<span>✉ <A href={`mailto:${EMAIL}?subject=${encodeURIComponent("We'd like to hire you")}`}>Send it →</A></span>), 1700);
        return [<span><span className={C.d}>[sudo] password for recruiter:</span> ••••••••</span>];
      case "echo":
        return [<span>{rest.join(" ")}</span>];
      case "date":
        return [<span>{new Date().toString()}</span>];
      case "exit":
        later(() => close("terminal"), 200);
        return [<span className={C.d}>logout</span>];
      default:
        return [<span>zsh: command not found: <span className={C.r}>{cmd}</span>. Try <span className={C.y}>help</span>.</span>];
    }
  };

  const run = (raw: string) => {
    if (raw.trim()) history.current.push(raw);
    histIdx.current = history.current.length;
    if (raw.trim() === "clear") return setLines([]);
    print(<span><Prompt />{raw}</span>, ...exec(raw));
  };

  // Typed-in demo command, so the desktop feels like it's already doing something
  useEffect(() => {
    if (!autorun) return;
    setTyping(true);
    const ids: number[] = [];
    autorun.split("").forEach((_, i) => ids.push(window.setTimeout(() => setInput(autorun.slice(0, i + 1)), 500 + i * 75)));
    ids.push(
      window.setTimeout(() => {
        setInput("");
        setTyping(false);
        run(autorun);
      }, 500 + autorun.length * 75 + 250)
    );
    return () => ids.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autorun]);

  const complete = () => {
    const parts = input.split(" ");
    if (parts.length === 1) {
      const m = COMMANDS.filter((c) => c.startsWith(parts[0].toLowerCase()));
      if (m.length === 1) setInput(m[0] + " ");
      else if (m.length > 1) {
        setInput(commonPrefix(m));
        print(<span><Prompt />{input}</span>, <span className={`${C.d} flex flex-wrap gap-x-4`}>{m.map((x) => <span key={x}>{x}</span>)}</span>);
      }
      return;
    }
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(" ").toLowerCase();
    const m = argsFor(cmd).filter((a) => a.startsWith(arg));
    if (m.length === 1) setInput(`${cmd} ${m[0]}`);
    else if (m.length > 1) {
      setInput(`${cmd} ${commonPrefix(m)}`);
      print(<span><Prompt />{input}</span>, <span className={`${C.b} flex flex-wrap gap-x-4`}>{m.map((x) => <span key={x}>{x}</span>)}</span>);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      complete();
    } else if (e.key === "Enter") {
      run(input);
      setInput("");
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const h = history.current;
      histIdx.current = Math.max(0, Math.min(h.length, histIdx.current + (e.key === "ArrowUp" ? -1 : 1)));
      setInput(h[histIdx.current] ?? "");
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <div
      className="os-mono text-[12.5px] leading-[1.55] h-full flex flex-col bg-[#0c0c10]/70"
      onMouseUp={() => !window.getSelection()?.toString() && inputRef.current?.focus()}
    >
      <div ref={scrollRef} className="flex-1 overflow-auto os-scroll px-4 pt-3 pb-1 os-selectable">
        {lines.map((l) => (
          <div key={l.id} className="whitespace-pre-wrap break-words">{l.node}</div>
        ))}
        <div className="flex items-center">
          <Prompt />
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => !typing && setInput(e.target.value)}
            onKeyDown={onKey}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            aria-label="Terminal input"
            className="flex-1 min-w-0 bg-transparent outline-none text-white caret-[#30D158] ml-1"
          />
        </div>
      </div>
      {compact && (
        <div className="flex gap-2 overflow-x-auto px-3 py-2.5 border-t border-white/10 flex-shrink-0">
          {["help", "whoami", "neofetch", "projects", "journey", "sudo hire jonathan", "clear"].map((c) => (
            <button key={c} onClick={() => run(c)} className="px-2.5 py-1 rounded-md bg-white/10 whitespace-nowrap text-[12px]">
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Terminal;
