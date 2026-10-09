import { experiences, education, involvements } from "../../data";
import { projects } from "../../data/projects";
import { milestones, JOURNEY_START } from "../../data/journey";

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
export const fmtMonth = (iso: string) => {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};
export const pad = (n: number) => String(n).padStart(2, "0");

// ── Story: every experience / school / club / project is attached to the scene it happened in ──

export type Extra = { kind: "work" | "school" | "club" | "project"; title: string; sub: string; period: string; img?: string; id?: string };
const t0 = new Date(JOURNEY_START).getTime();
export const scenes = milestones.map((m, i) => ({
  ...m,
  n: i + 1,
  time: new Date(m.date).getTime(),
  week: Math.round((new Date(m.date).getTime() - t0) / (7 * DAY)),
  year: new Date(m.date).getFullYear(),
  extras: [] as Extra[],
}));
export type Scene = (typeof scenes)[number];
const nearest = (t: number) => scenes.reduce((best, s) => (Math.abs(s.time - t) < Math.abs(best.time - t) ? s : best), scenes[0]);
education.forEach((e) =>
  nearest(periodRange(e.period)[0]).extras.push({ kind: "school", title: e.degree, sub: e.gpa ? `${e.school} · GPA ${e.gpa}` : e.school, period: e.period, img: e.image })
);
experiences.forEach((e) =>
  nearest(periodRange(e.period)[0]).extras.push({ kind: "work", title: e.title, sub: e.company, period: e.period, img: e.companyIcon.replace(/^\/?/, "/") })
);
involvements.forEach((v) => nearest(periodRange(v.period)[0]).extras.push({ kind: "club", title: v.role, sub: v.organization, period: v.period, img: v.image }));
projects.forEach((p) => {
  const hit = scenes.find((s) => `${s.title} ${s.short}`.toLowerCase().includes(p.title.toLowerCase()));
  if (hit) hit.extras.push({ kind: "project", title: p.title, sub: p.description, period: "", img: p.image || p.screenshots?.[0], id: p.id });
});
export const ROMAN = ["I", "II", "III", "IV", "V", "VI"];
export const firstYear = scenes[0].year;

// ── The vibe strip's time axis ──
// Milestones are spaced evenly (the first semester is too dense to read by date) and time between
// them is interpolated, so any period still maps to a band. A short tail past "now" holds the future.

export const FUTURE = new Date(2027, 5, 1).getTime();
export const knotTimes = [...scenes.map((s) => s.time), FUTURE];

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
];
