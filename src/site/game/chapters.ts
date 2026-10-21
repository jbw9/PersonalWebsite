import { milestones, Milestone } from "../../data/journey";

export type Mark = "flag" | "gedungsate" | "blocki" | "bank" | "laptop" | "heart" | "tulip" | "hand" | "mbs" | "card" | "guitar" | "seattle";
export type GateInfo = { short: string; name: string; place?: string; logo?: string; marks: Mark[] };

// The big chapters: each is a gate you fly through, with its monuments beside the path
export const GATES: GateInfo[] = [
  { short: "finance major", name: "UIUC, as a finance major", place: "Champaign, IL", marks: ["blocki", "bank"] },
  { short: "fell in love", name: "Falling for CS", place: "Champaign, IL", marks: ["laptop", "heart"] },
  { short: "iVenture + Tulip", name: "Tulip × iVenture", logo: "/tulip.png", marks: ["tulip"] },
  { short: "We Hear You", name: "We Hear You", logo: "/wehearyouLogo.png", marks: ["hand"] },
  { short: "Kredivo", name: "Kredivo", logo: "/kredivoLogo.png", place: "Singapore", marks: ["mbs", "card"] },
  { short: "Massive", name: "Massive", logo: "/massiveLogo.png", marks: ["guitar"] },
  { short: "AWS", name: "Amazon Web Services", place: "Seattle, WA", logo: "/awsLogo.png", marks: ["seattle"] },
];
export const START = { name: "Bandung, Indonesia", marks: ["flag", "gedungsate"] as Mark[] };
export const NOW = milestones[milestones.length - 1];

// ── The route: always east, the long way round ──
// Three stretches between real places, in eastward-unwrapped longitude: Bandung → Champaign over the
// South Pacific, Champaign → Singapore over the Atlantic and Asia, Singapore → Seattle over the North
// Pacific. `bow` bends each stretch north or south so the two Pacific crossings never overlap.
const SEGS = [
  { lon: [107.6, 271.8], lat: [-6.9, 40.1], bow: -22, ends: "finance major" },
  { lon: [271.8, 463.8], lat: [40.1, 1.35], bow: 12, ends: "Kredivo" },
  { lon: [463.8, 597.7], lat: [1.35, 47.6], bow: 20, ends: "AWS" },
];
const smooth = (t: number) => t * t * (3 - 2 * t);
export const geo = (seg: number, t: number) => {
  const s = SEGS[seg];
  return {
    lon: s.lon[0] + (s.lon[1] - s.lon[0]) * t,
    lat: s.lat[0] + (s.lat[1] - s.lat[0]) * smooth(t) + s.bow * Math.sin(Math.PI * t),
  };
};

// Height is the vibe: good stretches fly high, rough ones dip
export const altOf = (vibe: number) => 5 + (vibe / 100) * 17;

export type Node = { seg: number; t: number; alt: number; kind: "start" | "gate" | "win" | "dip"; m?: Milestone; gate?: number };

// Every milestone up to AWS sits on the route in order, evenly spaced within its stretch
export const NODES: Node[] = (() => {
  const out: Node[] = [{ seg: 0, t: 0, alt: 9, kind: "start" }];
  const list = milestones.slice(0, -1);
  let from = 0;
  SEGS.forEach((s, seg) => {
    const end = list.findIndex((m) => m.short === s.ends);
    const chunk = list.slice(from, end + 1);
    chunk.forEach((m, j) => {
      const gate = GATES.findIndex((g) => g.short === m.short);
      out.push({ seg, t: (j + 1) / chunk.length, alt: altOf(m.vibe), kind: gate >= 0 ? "gate" : m.dip ? "dip" : "win", m, gate: gate >= 0 ? gate : undefined });
    });
    from = end + 1;
  });
  return out;
})();
