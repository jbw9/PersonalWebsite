import { KB, KBEntry, EXTRA_FACTS, CONTACT } from "./knowledge";

export interface Answer {
  reads: string[]; // KB paths consulted, shown as Read(...) tool lines
  text: string;
  known: boolean;
}

// Matched against the raw (unstemmed) word
const STOP = new Set(
  (
    "a an the is are was were be been being am do does did done doing what whats which who whom where when " +
    "why how he him his himself she her they them their it its i me my you your we our us of in on at to " +
    "for from with by about as into and or but if so than then that this these those there here any some " +
    "much many more most very really just also can could would should will shall may might must have has " +
    "had get got tell know knows show give please jonathan jonathans jbw kind sort type thing things stuff " +
    "good great well ever up out all other else etc go went use used using describe explain list share mean " +
    "say want need look see find info information detail details question questions ask anything something " +
    "someone hey hi hello yo take takes taken took achieve achieved accomplish accomplished"
  ).split(" ")
);

// Folds a query word onto the word the data uses
const ALIAS: Record<string, string> = {
  internship: "intern",
  built: "build",
  economic: "econs",
  econ: "econs",
  current: "now",
  currently: "now",
  today: "now",
  recent: "now",
  favourite: "favorite",
  uni: "university",
  involv: "involvement",
  written: "wrote",
  write: "wrote",
  experienc: "experience",
};

// Personal-life words: data like "favorite food trucks" (GoBites) must not answer "favorite food?",
// so these only count when a hand-written EXTRA_FACTS entry contains them. Stemmed forms.
const PERSONAL = new Set(
  ("favorite like hobby fun live liv born age old marry married girlfriend boyfriend wife husband salary " +
    "religion pet height weight nationality citizen citizenship sponsor sponsorship hometown personality").split(" ")
);

const stem = (w: string) => {
  if (w.length > 4 && /(ies|ied)$/.test(w)) w = w.slice(0, -3) + "y";
  else if (w.length > 5 && w.endsWith("ing")) w = w.slice(0, -3);
  else if (w.length > 4 && w.endsWith("ed")) w = w.slice(0, -2);
  else if (w.length > 3 && w.endsWith("s") && !/(ss|us)$/.test(w)) w = w.slice(0, -1);
  return ALIAS[w] || w;
};

const words = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’']s\b/g, "")
    .split(/[^a-z0-9+#]+/)
    .filter((w) => w.length > 1 || w === "c");

const tokens = (s: string) => words(s).map(stem);

interface Indexed {
  entry: KBEntry;
  lines: string[];
  lineTokens: Set<string>[];
  all: Set<string>;
  strong: Set<string>; // title + tags count double
}

const index: Indexed[] = KB.map((entry) => {
  const lines = entry.text.split("\n");
  const lineTokens = lines.map((l) => new Set(tokens(l)));
  const strong = new Set(tokens(entry.title + " " + entry.tags.join(" ")));
  const all = new Set(Array.from(strong));
  lineTokens.forEach((set) => set.forEach((t) => all.add(t)));
  return { entry, lines, lineTokens, all, strong };
});

const personalVocab = new Set<string>();
index.forEach((d) => {
  if (EXTRA_FACTS.indexOf(d.entry) >= 0) d.all.forEach((t) => personalVocab.add(t));
});

const df = new Map<string, number>();
index.forEach((d) => d.all.forEach((t) => df.set(t, (df.get(t) || 0) + 1)));
const idf = (t: string) => Math.log(1 + index.length / (df.get(t) || 1));

const isKnown = (t: string) => (PERSONAL.has(t) ? personalVocab.has(t) : df.has(t));

const score = (d: Indexed, q: string[]) => {
  let s = 0;
  let hits = 0;
  q.forEach((t) => {
    if (!d.all.has(t) || (PERSONAL.has(t) && EXTRA_FACTS.indexOf(d.entry) < 0)) return;
    s += idf(t) * (d.strong.has(t) ? 2 : 1);
    hits++;
  });
  // Entries covering more of the question win; the journey retells experiences in his own words,
  // so prefer the experience file itself
  return (s * hits) / q.length * (d.entry.path.startsWith("kb/journey/") ? 0.55 : 1);
};

// Lines of an entry that mention a query word
const matching = (d: Indexed, q: string[]) =>
  d.lines.filter((_, i) => q.some((t) => d.lineTokens[i].has(t)));

const isLabel = (l: string) => /^[A-Z][A-Za-z ]{1,20}: /.test(l);

const focused = (d: Indexed, q: string[]) => {
  const hits = matching(d, q).filter((l) => l !== d.lines[0] && !isLabel(l));
  const labels = d.lines.slice(1).filter(isLabel);
  const body = [d.lines[0]].concat(hits.slice(0, 3)).concat(labels.filter((l) => hits.indexOf(l) < 0));
  return [`**${d.entry.title}**`].concat(body.slice(0, 8)).join("\n");
};

const clip = (l: string) => (l.length > 220 ? l.slice(0, 218).replace(/\s+\S*$/, "") + "…" : l).replace(/^- /, "");

const unknown = (missing: string[]): Answer => ({
  reads: [],
  known: false,
  text:
    "I don't know — that's not in Jonathan's knowledge base" +
    (missing.length ? ` (nothing about "${missing.join('", "')}" in kb/).` : ".") +
    `\nYou could ask him directly: ${CONTACT.email}`,
});

// Set by alfred/deploy.sh: the Lambda that answers with Claude Haiku on Bedrock from this same KB
const REMOTE = process.env.REACT_APP_ALFRED_URL;

export async function answer(question: string): Promise<Answer> {
  if (REMOTE) {
    try {
      const r = await fetch(REMOTE, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (r.ok) return await r.json();
      if (r.status === 429)
        return {
          known: false,
          reads: [],
          text: `I've answered all the questions I can for today. You can ask Jonathan directly: ${CONTACT.email}`,
        };
    } catch {}
    // Endpoint unreachable or erroring: fall back to keyword search over the same KB
  }
  return keywordAnswer(question);
}

async function keywordAnswer(question: string): Promise<Answer> {
  const asked = words(question).filter((w) => !STOP.has(w) && !STOP.has(stem(w)));
  const q = Array.from(new Set(asked.map(stem)));
  const missing = asked.filter((w) => !isKnown(stem(w)));
  if (missing.length) return unknown(missing);

  // Nothing specific asked: "who is he?" or "hi" gets the intro, anything else is admitted
  if (!q.length) {
    if (!/\b(who|about|hi|hello|hey|intro|introduce|yourself|summary|overview|tldr)\b/i.test(question)) return unknown([]);
    return { known: true, reads: [index[0].entry.path], text: focused(index[0], []) };
  }

  let ranked = index
    .map((d) => ({ d, s: score(d, q) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s);
  // "now" / "currently" is about the present, so only entries tagged as current qualify
  if (q.indexOf("now") >= 0 && ranked.some((r) => r.d.strong.has("now"))) ranked = ranked.filter((r) => r.d.strong.has("now"));
  if (!ranked.length) return unknown([]);

  const top = ranked[0].s;
  const second = ranked[1] ? ranked[1].s : 0;
  const hedge = /\b(good|great|skilled|expert|strong|best|proficient)\b/i.test(question)
    ? "I can't judge how good he is, but here's what his knowledge base says:\n\n"
    : "";

  if (top >= 1.6 * second) {
    const main = ranked[0].d;
    // Only entries that name the topic in their title or tags, not ones that mention it in passing
    const related = ranked
      .slice(1)
      .filter((r) => r.s >= 0.35 * top && q.some((t) => r.d.strong.has(t)))
      .slice(0, 2);
    const text =
      focused(main, q) +
      (related.length
        ? "\n\nRelated:\n" + related.map((r) => `- ${clip(matching(r.d, q)[0] || r.d.lines[0])}`).join("\n")
        : "");
    return { known: true, reads: [main].concat(related.map((r) => r.d)).map((d) => d.entry.path), text: hedge + text };
  }

  const picked = ranked.filter((r) => r.s >= 0.6 * top).slice(0, 8);
  const text =
    `Found ${picked.length} matches in his knowledge base:\n\n` +
    picked
      .map((r) => {
        const hits = matching(r.d, q);
        // A project's first line says what it is; elsewhere show the lines that matched
        const lines = !hits.length
          ? r.d.lines
          : r.d.entry.path.startsWith("kb/projects/")
          ? [r.d.lines[0]].concat(hits.filter((l) => l !== r.d.lines[0]))
          : hits;
        return `- **${r.d.entry.title}** — ${lines.slice(0, 2).map(clip).join(" · ")}`;
      })
      .join("\n");
  return { known: true, reads: picked.map((r) => r.d.entry.path), text: hedge + text };
}
