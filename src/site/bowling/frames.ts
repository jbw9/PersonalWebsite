// Jonathan's real game: ten frames, one chapter each, every ball a milestone from journey.ts.
// `knock` is the pins that ball took down. Rough frames open with a setback; in version C life rolls
// that first ball and the visitor gets the second.
export type Ball = { short: string; knock: number[] };
export type Frame = { balls: Ball[]; rough?: boolean };

const ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const but = (...keep: number[]) => ALL.filter((n) => !keep.includes(n));

export const FRAMES: Frame[] = [
  { rough: true, balls: [{ short: "finance major", knock: [4, 7, 8] }, { short: "CS124 'for fun'", knock: [1, 3, 5, 6] }] },
  { balls: [{ short: "all-in on CS", knock: but(2, 4, 8) }, { short: "Tulip intern", knock: [2, 4, 8] }] },
  { rough: true, balls: [{ short: "CS173", knock: but(6, 7, 10) }, { short: "built akar.study", knock: [6, 7, 10] }] },
  { balls: [{ short: "iVenture + Tulip", knock: ALL }] },
  { balls: [{ short: "We Hear You", knock: but(10) }, { short: "CS + Econ", knock: [10] }] },
  { rough: true, balls: [{ short: "Tulip ends", knock: but(7, 10) }, { short: "Kredivo", knock: [10] }] },
  { balls: [{ short: "YC AI Startup School", knock: ALL }] },
  { rough: true, balls: [{ short: "Figma", knock: [1, 2, 3, 5, 6] }, { short: "Google grind", knock: [4, 7, 8, 9, 10] }] },
  { rough: true, balls: [{ short: "no team match", knock: [] }, { short: "Sigma", knock: [6, 10] }] },
  { balls: [{ short: "Seattle onsite", knock: ALL }, { short: "AWS", knock: ALL }, { short: "Rilla onsite", knock: but(7) }] },
];
export const REAL_ROLLS = FRAMES.map((f) => f.balls.map((b) => b.knock.length));
// the average Jonathan needed just to qualify in Malaysia
export const QUALIFY = 240;

// Is frame `f` finished after these rolls? Frames 1-9 end on a strike or two balls; the 10th earns a third ball with a strike or spare.
export const frameDone = (f: number, rolls: number[]) => {
  if (f < 9) return rolls[0] === 10 || rolls.length === 2;
  if (rolls.length < 2) return false;
  return rolls.length === 3 || rolls[0] + rolls[1] < 10;
};

// Running totals, null while a frame still waits on bonus balls
export const totals = (frames: number[][]): (number | null)[] => {
  const flat = frames.flat();
  let at = 0;
  let sum = 0;
  return frames.map((r, f) => {
    if (f === 9) {
      const done = frameDone(9, r);
      sum += r.reduce((a, b) => a + b, 0);
      return done ? sum : null;
    }
    const strike = r[0] === 10;
    const spare = !strike && r.length === 2 && r[0] + r[1] === 10;
    const need = strike || spare ? 3 : 2;
    const take = flat.slice(at, at + need);
    at += r.length;
    if (take.length < need || (r.length < 2 && !strike)) return null;
    sum += take.reduce((a, b) => a + b, 0);
    return sum;
  });
};

// What the scorecard writes in each ball's box
export const marks = (r: number[]) => {
  let standing = 10;
  return r.map((n) => {
    const fresh = standing === 10;
    const mark = fresh && n === 10 ? "X" : !fresh && n === standing ? "/" : n === 0 ? "–" : String(n);
    standing -= n;
    // only the 10th frame rolls on, and it re-racks after a strike or spare
    if (standing === 0 || !fresh) standing = 10;
    return mark;
  });
};
