import { KeyboardEvent, ReactNode, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AskTerminalProps, projectPath } from "../contracts";
import { projects } from "../../data/projects";
import { answer } from "./answer";
import { KB, CONTACT } from "./knowledge";
import "./ask.css";

type Entry =
  | { kind: "user"; text: string }
  | { kind: "tool"; name: string; arg: string; result: string }
  | { kind: "answer"; text: string; shown: number; known: boolean; project?: string }
  | { kind: "note"; body: ReactNode };
type Item = Entry & { id: number };

const COMMANDS = [
  { name: "/help", desc: "Show commands and example questions" },
  { name: "/contact", desc: "How to reach Jonathan" },
  { name: "/clear", desc: "Clear the conversation" },
  { name: "/exit", desc: "Close the terminal (or press Esc)" },
];

const SUGGESTIONS = [
  "What does he do for fun?",
  "What's TaxBuddy?",
  "Is he open to opportunities?",
  "Where did he intern?",
  "What does he do at AWS?",
  "Tell me about his bowling",
  "What's his tech stack?",
  "What's his GPA?",
  "How do I contact him?",
  "sudo hire jonathan",
];

const GLYPHS = ["·", "✢", "✳", "✶", "✻", "✽", "✻", "✶", "✳", "✢"];
const VERBS = ["Pondering", "Rummaging", "Cogitating", "Percolating", "Noodling", "Skimming", "Mulling", "Spelunking", "Ruminating", "Sleuthing"];

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const Spinner = ({ verb }: { verb: string }) => {
  const [ms, setMs] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const id = window.setInterval(() => setMs(Date.now() - start), 120);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="mt-3 flex gap-2 ask-accent">
      <span className="w-[1ch] shrink-0">{reduced() ? "✻" : GLYPHS[Math.floor(ms / 120) % GLYPHS.length]}</span>
      <span>
        {verb}… <span className="ask-faint">({Math.floor(ms / 1000)}s)</span>
      </span>
    </div>
  );
};

const TOKEN = /(\*\*[^*]+\*\*|https?:\/\/[^\s)]*[^\s).,]|[\w.+-]+@[\w-]+(?:\.[a-z]+)+)/g;
const EMAIL = /^[\w.+-]+@[\w-]+(?:\.[a-z]+)+$/;

// Just enough markdown for the answers: **bold**, links, emails and hanging "- " bullets
const rich = (text: string) =>
  text.split("\n").map((line, i) => (
    <div key={i} className={line.startsWith("- ") ? "pl-[2ch] -indent-[2ch]" : undefined}>
      {line === ""
        ? " "
        : line.split(TOKEN).map((part, j) =>
            part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
              <span key={j} className="ask-bright font-semibold">
                {part.slice(2, -2)}
              </span>
            ) : /^https?:/.test(part) ? (
              <a key={j} href={part} target="_blank" rel="noreferrer">
                {part.replace(/^https?:\/\/(www\.)?/, "")}
              </a>
            ) : EMAIL.test(part) ? (
              <a key={j} href={`mailto:${part}`}>
                {part}
              </a>
            ) : (
              part
            )
          )}
    </div>
  ));

const HIRE_MAIL = `mailto:${CONTACT.email}?subject=${encodeURIComponent("Let's talk about a role")}`;

const AskTerminal = ({ active, onClose }: AskTerminalProps) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [input, setInput] = useState("");
  const [verb, setVerb] = useState<string | null>(null); // spinner shows while set
  const [asked, setAsked] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true); // follow new output unless the reader scrolled up
  const history = useRef<string[]>([]);
  const histPos = useRef(-1);
  const timers = useRef<number[]>([]);
  const gen = useRef(0); // bumped by /clear and unmount so in-flight turns stop writing
  const working = useRef(false);
  const nextId = useRef(0);

  useEffect(
    () => () => {
      gen.current++;
      timers.current.forEach((t) => window.clearTimeout(t));
    },
    []
  );

  useEffect(() => {
    if (active) inputRef.current?.focus({ preventScroll: true });
  }, [active]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [items, verb]);

  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      timers.current.push(window.setTimeout(resolve, ms));
    });

  const push = (e: Entry) => {
    const id = nextId.current++;
    setItems((xs) => xs.concat({ ...e, id } as Item));
    return id;
  };

  const run = async (fn: (alive: () => boolean) => Promise<void>) => {
    const g = gen.current;
    working.current = true;
    await fn(() => gen.current === g);
    if (gen.current === g) {
      working.current = false;
      setVerb(null);
    }
  };

  const ask = (q: string) =>
    run(async (alive) => {
      setVerb(VERBS[Math.floor(Math.random() * VERBS.length)]);
      const [res] = await Promise.all([answer(q), wait(650 + Math.random() * 400)]);
      if (!alive()) return;
      const n = res.reads.length;
      push({ kind: "tool", name: "Search", arg: `pattern: "${q.length > 40 ? q.slice(0, 39) + "…" : q}", path: "kb/"`, result: `Found ${n} file${n === 1 ? "" : "s"}` });
      for (const path of res.reads) {
        await wait(300);
        if (!alive()) return;
        const lines = (KB.find((e) => e.path === path)?.text.split("\n").length) || 0;
        push({ kind: "tool", name: "Read", arg: path, result: `Read ${lines} line${lines === 1 ? "" : "s"}` });
      }
      await wait(450);
      if (!alive()) return;
      setVerb(null);
      const project = projects.find((p) => res.reads[0] === `kb/projects/${p.id.toLowerCase()}.md`);
      const id = push({ kind: "answer", text: res.text, shown: reduced() ? res.text.length : 0, known: res.known, project: project && project.id });
      const step = Math.max(3, Math.ceil(res.text.length / 80));
      for (let shown = 0; shown < res.text.length && !reduced(); ) {
        await wait(16);
        if (!alive()) return;
        shown += step;
        const s = shown;
        setItems((xs) => xs.map((x) => (x.id === id && x.kind === "answer" ? { ...x, shown: s } : x)));
      }
    });

  const hire = () =>
    run(async (alive) => {
      push({ kind: "note", body: <span className="ask-dim">[sudo] password for recruiter: ••••••••</span> });
      setVerb("Escalating privileges");
      const steps: [string, string, string][] = [
        ["Bash", "whoami", "recruiter (sudo granted)"],
        ["Read", "kb/contact.md", `Read ${KB.find((e) => e.path === "kb/contact.md")!.text.split("\n").length} lines`],
        ["Write", "offer_letter.md", "Drafted · awaiting your signature"],
      ];
      for (const [name, arg, result] of steps) {
        await wait(650);
        if (!alive()) return;
        push({ kind: "tool", name, arg, result });
      }
      await wait(500);
      if (!alive()) return;
      setVerb(null);
      push({
        kind: "note",
        body: (
          <div className="mt-1 flex gap-2">
            <span className="ask-bright">⏺</span>
            <div>
              Permission granted. The last step needs a human:
              <div className="mt-2">
                <a href={HIRE_MAIL} className="ask-accent">
                  ✉ Send the offer to {CONTACT.email}
                </a>
              </div>
              <div>
                <a href={CONTACT.calendly} target="_blank" rel="noreferrer" className="ask-accent">
                  📅 Or book a 30-minute call
                </a>
              </div>
            </div>
          </div>
        ),
      });
    });

  const clear = () => {
    gen.current++;
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    working.current = false;
    setVerb(null);
    setItems([]);
  };

  const help = (
    <div className="mt-1">
      <div className="ask-dim">Alfred answers questions about Jonathan from a small knowledge base built from his site.</div>
      <div className="mt-3 ask-bright">Commands</div>
      {COMMANDS.map((c) => (
        <div key={c.name} className="flex gap-3">
          <span className="w-[10ch] shrink-0 ask-accent">{c.name}</span>
          <span className="ask-dim">{c.desc}</span>
        </div>
      ))}
      <div className="flex gap-3">
        <span className="w-[10ch] shrink-0 ask-accent">↑ / ↓</span>
        <span className="ask-dim">Browse your earlier questions</span>
      </div>
      <div className="mt-3 ask-bright">Try asking</div>
      {SUGGESTIONS.slice(0, 5).map((s) => (
        <button key={s} type="button" onClick={() => submit(s)} className="block text-left ask-dim hover:underline">
          › {s}
        </button>
      ))}
    </div>
  );

  const contact = (
    <div className="mt-1">
      {[
        ["Email", `mailto:${CONTACT.email}`, CONTACT.email],
        ["GitHub", CONTACT.github, CONTACT.github.replace("https://", "")],
        ["LinkedIn", CONTACT.linkedin, CONTACT.linkedin.replace("https://www.", "")],
        ["Calendly", CONTACT.calendly, CONTACT.calendly.replace("https://", "")],
      ].map(([label, href, text]) => (
        <div key={label} className="flex gap-3">
          <span className="w-[9ch] shrink-0 ask-dim">{label}</span>
          <a href={href} target="_blank" rel="noreferrer" className="min-w-0 break-all">
            {text}
          </a>
        </div>
      ))}
    </div>
  );

  function submit(raw: string) {
    const q = raw.trim();
    if (!q) return;
    const cmd = q.toLowerCase().replace(/\s+/g, " ");
    const slash = cmd.startsWith("/") ? COMMANDS.filter((c) => c.name.startsWith(cmd)) : [];
    const name = slash.length === 1 ? slash[0].name : cmd;
    setInput("");
    histPos.current = -1;
    if (name === "/clear" || name === "clear") return clear();
    if (name === "/exit" || name === "exit") return onClose();
    if (working.current) return;
    history.current.push(q);
    stick.current = true;
    setAsked((a) => a.concat(q.toLowerCase()));
    push({ kind: "user", text: q });
    if (name === "/help" || name === "help") return void push({ kind: "note", body: help });
    if (name === "/contact" || name === "contact") return void push({ kind: "note", body: contact });
    if (name.startsWith("/"))
      return void push({ kind: "note", body: <span className="ask-dim">Unknown command {q}. Try /help.</span> });
    if (/^sudo hire jonathan\b/.test(cmd)) return void hire();
    if (/^hire jonathan\b/.test(cmd))
      return void push({ kind: "note", body: <span className="ask-dim">hire: permission denied. Try sudo.</span> });
    if (cmd.startsWith("sudo "))
      return void push({
        kind: "note",
        body: <span className="ask-dim">recruiter is not in the sudoers file. This incident will be reported. (Psst: sudo hire jonathan)</span>,
      });
    void ask(q);
  }

  const menu = input.startsWith("/") && !input.includes(" ") ? COMMANDS.filter((c) => c.name.startsWith(input.toLowerCase())) : [];
  const chips = SUGGESTIONS.filter((s) => asked.indexOf(s.toLowerCase()) < 0).slice(0, 4);

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const h = history.current;
    if (e.key === "Enter") {
      e.preventDefault();
      submit(input);
    } else if (e.key === "Tab" && menu.length) {
      e.preventDefault();
      setInput(menu[0].name);
    } else if (e.key === "ArrowUp" && h.length) {
      e.preventDefault();
      histPos.current = histPos.current < 0 ? h.length - 1 : Math.max(0, histPos.current - 1);
      setInput(h[histPos.current]);
    } else if (e.key === "ArrowDown" && histPos.current >= 0) {
      e.preventDefault();
      histPos.current = histPos.current + 1 < h.length ? histPos.current + 1 : -1;
      setInput(histPos.current < 0 ? "" : h[histPos.current]);
    }
  };

  return (
    <div
      className="v-remix-ask h-full w-full flex flex-col overflow-hidden"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      onMouseUp={(e) => {
        // Clicking empty terminal space focuses the prompt, as in a real terminal
        const t = e.target as HTMLElement;
        if (active && !t.closest("a,button,input") && !String(window.getSelection() || "")) inputRef.current?.focus({ preventScroll: true });
      }}
    >
      <div className="flex items-center justify-between gap-3 px-5 h-12 shrink-0 border-b ask-line">
        <div className="flex items-center gap-2 text-xs min-w-0 truncate">
          <span className="ask-accent">✻</span>
          <span className="ask-bright">alfred</span>
          <span className="ask-faint">~/jonathan</span>
        </div>
        <button type="button" onClick={onClose} className="flex items-center gap-2 text-xs ask-dim hover:text-[color:var(--ask-bright)]" aria-label="Close">
          <span className="hidden sm:inline border ask-line rounded-full px-2 leading-5">esc</span>
          <span className="text-base leading-none">✕</span>
        </button>
      </div>

      <div
        ref={scrollRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
        }}
        className="ask-scroll flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-3"
      >
        <div className="ask-welcome border rounded-2xl px-4 py-3 max-w-[30rem]">
          <div>
            <span className="ask-accent">✻</span> Welcome to Jonathan's website! I'm <span className="ask-bright font-semibold">Alfred</span>, his assistant.
          </div>
          <div className="mt-2">Ask me whatever you want to learn about Jonathan.</div>
          <div className="mt-3 ask-dim italic">/help for help, /contact to reach him</div>
          <div className="mt-3 ask-dim">cwd: ~/jonathan</div>
        </div>
        <div className="mt-4 ask-dim">
          <div>Tips for getting started:</div>
          <div>1. Ask about his work, projects, school or journey</div>
          <div>2. Answers come only from his knowledge base; if it's not there, I'll say so</div>
          <div>
            3. Tap a suggestion below, or try <span className="ask-bright">sudo hire jonathan</span>
          </div>
        </div>

        {items.map((it) =>
          it.kind === "user" ? (
            <div key={it.id} className="ask-user mt-5 -mx-2 px-3 py-1.5 rounded-xl flex gap-2 ask-dim">
              <span className="shrink-0">&gt;</span>
              <span className="min-w-0 break-words">{it.text}</span>
            </div>
          ) : it.kind === "tool" ? (
            <div key={it.id} className="mt-3">
              <div className="flex gap-2">
                <span className="ask-ok shrink-0">⏺</span>
                <span className="min-w-0 [overflow-wrap:anywhere]">
                  <span className="ask-bright font-semibold">{it.name}</span>({it.arg})
                </span>
              </div>
              <div className="flex gap-2 pl-[1ch] ask-dim">
                <span className="shrink-0">⎿</span>
                <span>{it.result}</span>
              </div>
            </div>
          ) : it.kind === "answer" ? (
            <div key={it.id} className="mt-3 flex gap-2">
              <span className={`shrink-0 ${it.known ? "ask-bright" : "ask-accent"}`}>⏺</span>
              <div className="min-w-0 flex-1 break-words">
                {rich(it.shown >= it.text.length ? it.text : it.text.slice(0, it.shown).replace(/\*\*([^*]*)$/, "$1"))}
                {it.project && it.shown >= it.text.length && (
                  <button type="button" onClick={() => navigate(projectPath(it.project as string))} className="mt-2 ask-accent hover:underline">
                    ⎿ Open the project page →
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div key={it.id} className="mt-3">
              {it.body}
            </div>
          )
        )}
        {verb && <Spinner verb={verb} />}
      </div>

      <div className="ask-foot shrink-0 px-4 pb-3">
        {chips.length > 0 && (
          <div className="ask-chips flex gap-2 overflow-x-auto sm:flex-wrap pb-2">
            {chips.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => submit(s)}
                className={`ask-chip shrink-0 border rounded-full px-3 py-0.5 text-xs whitespace-nowrap ${s.startsWith("sudo") ? "ask-accent" : ""}`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <label className="ask-prompt flex items-center gap-2 border rounded-full px-4 py-2.5 cursor-text">
          <span className="ask-dim shrink-0">&gt;</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              histPos.current = -1;
            }}
            onKeyDown={onKey}
            placeholder={`Try "${chips[0] || "what's TaxBuddy?"}"`}
            aria-label="Ask a question about Jonathan"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="flex-1 min-w-0 bg-transparent outline-none ask-bright"
          />
        </label>
        {menu.length > 0 ? (
          <div className="mt-1 px-3">
            {menu.map((c, i) => (
              <button key={c.name} type="button" onClick={() => submit(c.name)} className="flex w-full gap-3 text-left text-xs leading-6">
                <span className={`w-[10ch] shrink-0 ${i === 0 ? "ask-accent" : "ask-dim"}`}>{c.name}</span>
                <span className="ask-faint truncate">{c.desc}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-1.5 px-1 flex flex-wrap justify-between gap-x-4 text-[11px] ask-faint">
            <span className="hidden sm:inline">/help for commands · ↑↓ history</span>
            <span>
              <span className="ask-ok">●</span> {process.env.REACT_APP_ALFRED_URL ? "Claude Haiku on AWS Bedrock" : "offline demo"} · answers only from Jonathan's knowledge base
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AskTerminal;
