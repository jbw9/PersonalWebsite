import { milestones, JOURNEY_START } from "../data/journey";

// ── Dates ──

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const DAY = 864e5;
const parseMonth = (s: string) => {
  const m = s.match(/([A-Za-z]{3})[a-z]*\.?\s+(\d{4})/);
  return m ? new Date(+m[2], MONTHS.indexOf(m[1].toLowerCase()), 1).getTime() : 0;
};
// "May 2025 - Jul 2025" → [start of May, end of Jul]; a single month spans that month
export const periodRange = (period: string): [number, number] => {
  const [a, b] = period.split(" - ");
  const start = parseMonth(a);
  const endStart = b ? parseMonth(b) : start;
  const e = new Date(endStart);
  return [start, new Date(e.getFullYear(), e.getMonth() + 1, 1).getTime()];
};
// Milestone dates are approximate, so they're shown as the semester they fell in (spring runs to mid-May)
export const fmtTerm = (iso: string) => {
  const m = Number(iso.slice(5, 7)) + (Number(iso.slice(8, 10)) > 15 ? 0.5 : 0);
  return `${m <= 5 ? "Spring" : m <= 7.5 ? "Summer" : "Fall"} ${iso.slice(0, 4)}`;
};
export const pad = (n: number) => String(n).padStart(2, "0");

// ── Story ──

const t0 = new Date(JOURNEY_START).getTime();
export const scenes = milestones.map((m, i) => ({
  ...m,
  n: i + 1,
  time: new Date(m.date).getTime(),
  week: Math.round((new Date(m.date).getTime() - t0) / (7 * DAY)),
  year: new Date(m.date).getFullYear(),
}));
export type Scene = (typeof scenes)[number];

// Piecewise-linear lookup: xs[i] at keys[i]
export const lerpAt = (keys: number[], xs: number[], k: number) => {
  if (k <= keys[0]) return xs[0];
  for (let i = 1; i < keys.length; i++) {
    if (k <= keys[i]) return xs[i - 1] + ((xs[i] - xs[i - 1]) * (k - keys[i - 1])) / (keys[i] - keys[i - 1] || 1);
  }
  return xs[xs.length - 1];
};

// Smooth curve through points with horizontal tangents, so y at any x is solvable
export const curveY = (pts: { x: number; y: number }[], x: number) => {
  if (x <= pts[0].x) return pts[0].y;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    if (x <= b.x) {
      const u = (x - a.x) / (b.x - a.x);
      let t = u;
      for (let k = 0; k < 6; k++) {
        const f = 1.5 * t - 1.5 * t * t + t * t * t - u;
        t -= f / (1.5 - 3 * t + 3 * t * t);
      }
      return a.y + (b.y - a.y) * (3 * t * t - 2 * t * t * t);
    }
  }
  return pts[pts.length - 1].y;
};

export const curvePath = (pts: { x: number; y: number }[]) => {
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const mx = (a.x + b.x) / 2;
    d += ` C ${mx} ${a.y} ${mx} ${b.y} ${b.x} ${b.y}`;
  }
  return d;
};

export const CONTACT = [
  { label: "Email", href: "mailto:jbw7@illinois.edu" },
  { label: "GitHub", href: "https://github.com/jbw9" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/jwidjajakusuma/" },
  { label: "Calendly", href: "https://calendly.com/jonathanbernard265/30min" },
];
