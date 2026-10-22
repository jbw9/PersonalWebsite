// Top-down lane physics in metres: x across the lane (0 = centre), y from the foul line to the pins.
// A shortened lane, so a throw lasts about two seconds.
export const L = 16;
export const W = 0.53; // half the lane width
export const GUT = 0.24;
export const BALL_R = 0.109;
const PIN_R = 0.06;
// a lying pin is 38cm long, so it sweeps far more than a standing one: that's most of the pin action
const DOWN_R = 0.08;
const ROW = 0.264;
const GAP = 0.3048;
const PIT = L + 3 * ROW + 0.45;

export type Pin = { n: number; hx: number; hy: number; x: number; y: number; vx: number; vy: number; down: boolean; fall: number; ang: number; gone: boolean };
export type Ball = { x: number; y: number; vx: number; vy: number; hook: number; gutter: boolean };
export type Sim = { pins: Pin[]; ball: Ball | null; script: number[] | null; t: number; quiet: number };

// Pin n's spot: 1 at the front, then rows 2-3, 4-6, 7-10, numbered left to right
const SPOTS = [0, 1, 2, 3].flatMap((r) => Array.from({ length: r + 1 }, (_, k) => ({ x: (k - r / 2) * GAP, y: L + r * ROW })));

export const createSim = (): Sim => ({ pins: [], ball: null, script: null, t: 0, quiet: 0 });

// Re-spot the standing pins; the rest were swept away
export const rack = (s: Sim, standing: number[]) => {
  s.pins = standing.map((n) => {
    const p = SPOTS[n - 1];
    return { n, hx: p.x, hy: p.y, x: p.x, y: p.y, vx: 0, vy: 0, down: false, fall: 0, ang: 0, gone: false };
  });
  s.ball = null;
  s.script = null;
};

export const launch = (s: Sim, x: number, angle: number, speed: number, hook: number) => {
  s.ball = { x, y: 0, vx: Math.sin(angle) * speed, vy: Math.cos(angle) * speed, hook, gutter: false };
  s.script = null;
  s.t = 0;
  s.quiet = 0;
};

// A throw whose result is already written: the ball heads for the pins it has to take, steering clear of the
// ones that must stay up, and each target flies off as the ball reaches it. No collisions, so nothing else moves.
export const launchScripted = (s: Sim, targets: number[], speed: number) => {
  const up = s.pins.filter((p) => !targets.includes(p.n));
  const hit = s.pins.filter((p) => targets.includes(p.n));
  let end = 0.9; // nothing to hit: off into the right gutter
  if (hit.length) {
    const c = hit.reduce((a, p) => a + p.hx, 0) / hit.length;
    let best = Infinity;
    for (let x = -0.45; x <= 0.45; x += 0.01) {
      const clash = up.reduce((a, p) => a + Math.max(0, BALL_R + PIN_R + 0.02 - Math.abs(p.hx - x)), 0);
      const cost = Math.abs(x - c) + clash * 20;
      if (cost < best) [best, end] = [cost, x];
    }
  }
  launch(s, 0, Math.atan2(end, L), speed, 0);
  s.script = targets;
};

const bump = (a: { x: number; y: number; vx: number; vy: number }, ra: number, ma: number, b: typeof a, rb: number, mb: number, e: number) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d = Math.hypot(dx, dy);
  if (d >= ra + rb || d === 0) return false;
  const nx = dx / d;
  const ny = dy / d;
  // push apart in proportion to mass, then exchange momentum along the contact normal
  const push = ra + rb - d;
  const ia = 1 / ma;
  const ib = 1 / mb;
  a.x -= (nx * push * ia) / (ia + ib);
  a.y -= (ny * push * ia) / (ia + ib);
  b.x += (nx * push * ib) / (ia + ib);
  b.y += (ny * push * ib) / (ia + ib);
  const rel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
  if (rel <= 0) return true;
  const j = ((1 + e) * rel) / (ia + ib);
  a.vx -= j * ia * nx;
  a.vy -= j * ia * ny;
  b.vx += j * ib * nx;
  b.vy += j * ib * ny;
  return true;
};

const knock = (p: Pin) => {
  if (p.down) return;
  p.down = true;
  p.ang = Math.atan2(p.vy, p.vx);
};

export const step = (s: Sim, dt: number) => {
  s.t += dt;
  const b = s.ball;
  if (b) {
    if (b.y > L * 0.6 && !b.gutter) b.vx += b.hook * dt;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (!b.gutter && Math.abs(b.x) > W - BALL_R * 0.3) {
      b.gutter = true;
      b.x = Math.sign(b.x) * (W + GUT / 2);
      b.vx = 0;
    }
    if (s.script) {
      for (const p of s.pins)
        if (!p.down && s.script.includes(p.n) && b.y > p.hy - 0.2) {
          const dx = p.x - b.x;
          const dy = Math.max(0.15, p.y - b.y);
          const v = 2.4 + Math.random() * 1.6;
          const d = Math.hypot(dx, dy);
          p.vx = (dx / d) * v * 1.4 + (Math.random() - 0.5) * 0.8;
          p.vy = (dy / d) * v * 0.7 + 0.6;
          knock(p);
        }
    } else if (!b.gutter) {
      for (const p of s.pins) if (!p.gone && bump(b, BALL_R, 7, p, p.down ? DOWN_R : PIN_R, 1.6, 0.6) && Math.hypot(p.vx, p.vy) > 0.5) knock(p);
    }
  }

  const live = s.pins.filter((p) => !p.gone);
  if (!s.script)
    for (let i = 0; i < live.length; i++)
      for (let j = i + 1; j < live.length; j++) {
        const p = live[i];
        const q = live[j];
        if (!p.down && !q.down) continue;
        if (bump(p, p.down ? DOWN_R : PIN_R, 1.6, q, q.down ? DOWN_R : PIN_R, 1.6, 0.5))
          for (const r of [p, q]) if (Math.hypot(r.vx, r.vy) > 0.5) knock(r);
      }

  let moving = !!b && b.y < PIT;
  for (const p of live) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    // a nudged pin wobbles and stays up unless it's pushed off its spot
    const f = Math.exp(-(p.down ? 3 : 12) * dt);
    p.vx *= f;
    p.vy *= f;
    if (!p.down && Math.hypot(p.x - p.hx, p.y - p.hy) > 0.06) knock(p);
    if (p.down) p.fall = Math.min(1, p.fall + dt * 5);
    // the kickbacks either side throw pins back onto the deck
    if (Math.abs(p.x) > W + GUT) {
      p.x = Math.sign(p.x) * (W + GUT);
      p.vx *= -0.5;
    }
    if (p.y > PIT) p.gone = true;
    if (Math.hypot(p.vx, p.vy) > 0.05) moving = true;
  }
  s.quiet = moving ? 0 : s.quiet + dt;
};

// Everything has stopped (or a pin is spinning forever in a corner: call it after 5s)
export const settled = (s: Sim) => !!s.ball && (s.quiet > 0.5 || s.t > L / Math.hypot(s.ball.vx, s.ball.vy) + 5);

export const fallen = (s: Sim) => s.pins.filter((p) => p.down || p.gone).map((p) => p.n);
