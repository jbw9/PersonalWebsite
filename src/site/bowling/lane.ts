import { BALL_R, GUT, L, W, Sim, createSim, rack, launch, launchScripted, step, settled, fallen } from "./sim";

// What the next ball does once it's released: `script` fixes the pins it takes (version A, and life's ball in C)
export type Arm = { script?: number[]; life?: boolean };
export type LaneApi = {
  rack: (standing: number[]) => void;
  arm: (a: Arm) => void;
  auto: (a: Arm) => void;
  sign: (text: string) => void;
  destroy: () => void;
};

const H = 2.1; // camera height
const BACK = 4.6; // camera distance behind the ball
const NEAR = L - 5.2; // as close as it gets to the pins
const SPEED = 8.5;

export const createLane = (canvas: HTMLCanvasElement, onSettled: (fallen: number[]) => void): LaneApi => {
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const sim: Sim = createSim();
  let wpx = 0;
  let hpx = 0;
  let dpr = 1;
  let camY = -BACK;
  let armed: Arm | null = null;
  let rolling: Arm | null = null;
  let aimX = 0;
  let sign = "";
  let drag: { pts: { x: number; y: number; t: number }[] } | null = null;
  let raf = 0;
  let last = performance.now();
  let reported = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    wpx = canvas.clientWidth;
    hpx = canvas.clientHeight;
    canvas.width = wpx * dpr;
    canvas.height = hpx * dpr;
  };
  resize();
  window.addEventListener("resize", resize);

  const F = () => Math.min(wpx * 1.5, hpx * 1.7);
  const horizon = () => hpx * 0.14;
  // lane metres → screen px; null when it's behind the camera
  const proj = (x: number, y: number, z = 0) => {
    const d = y - camY;
    if (d < 0.5) return null;
    const f = F() / d;
    return { x: wpx / 2 + x * f, y: horizon() + (H - z) * f, s: f };
  };

  const quad = (pts: [number, number, number?][], fill: string | CanvasGradient) => {
    const ps = pts.map(([x, y, z]) => proj(x, y, z));
    if (ps.some((p) => !p)) return;
    ctx.beginPath();
    ps.forEach((p, i) => (i ? ctx.lineTo(p!.x, p!.y) : ctx.moveTo(p!.x, p!.y)));
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  };

  const drawLane = () => {
    const y0 = camY + 0.6;
    const end = L + 1.4;
    const far = proj(0, end)!;
    const near = proj(0, y0)!;
    const wood = ctx.createLinearGradient(0, near.y, 0, far.y);
    wood.addColorStop(0, "#3a2a1c");
    wood.addColorStop(0.7, "#8a6440");
    wood.addColorStop(1, "#c79a64");
    quad([[-W - GUT - 0.05, y0], [W + GUT + 0.05, y0], [W + GUT + 0.05, end], [-W - GUT - 0.05, end]], "#0d1320");
    quad([[-W, y0], [W, y0], [W, end], [-W, end]], wood);
    // gutters
    for (const sd of [-1, 1]) quad([[sd * W, y0], [sd * (W + GUT), y0], [sd * (W + GUT), end], [sd * W, end]], "#151c2b");
    // boards
    ctx.strokeStyle = "rgba(40,24,12,0.35)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 12; i++) {
      const x = -W + (2 * W * i) / 12;
      const a = proj(x, y0);
      const b = proj(x, end);
      if (!a || !b) continue;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    // foul line and the aiming arrows
    quad([[-W, 0], [W, 0], [W, 0.03], [-W, 0.03]], "rgba(20,10,4,0.8)");
    for (let i = -3; i <= 3; i++) {
      const x = i * 0.13;
      const y = 4.6 + (3 - Math.abs(i)) * 0.25;
      quad([[x - 0.025, y], [x + 0.025, y], [x, y + 0.22]], "rgba(60,20,10,0.55)");
    }
    // pin deck and pit
    quad([[-W, L - 0.4], [W, L - 0.4], [W, L + 1.1], [-W, L + 1.1]], "rgba(255,240,215,0.18)");
    quad([[-W - GUT, L + 1.1], [W + GUT, L + 1.1], [W + GUT, end + 0.6], [-W - GUT, end + 0.6]], "#05080f");
    // masking unit over the pit, with the chapter on it
    quad([[-W - GUT, end, 0.75], [W + GUT, end, 0.75], [W + GUT, end, 1.5], [-W - GUT, end, 1.5]], "#0b111e");
    quad([[-W - GUT, end, 0.72], [W + GUT, end, 0.72], [W + GUT, end, 0.76], [-W - GUT, end, 0.76]], "#5b9cff");
    const c = proj(0, end, 1.12);
    if (c && sign) {
      ctx.fillStyle = "#e6ecf5";
      ctx.font = `italic 300 ${Math.max(10, c.s * 0.2)}px Georgia, serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(sign, c.x, c.y, (2 * (W + GUT) - 0.2) * c.s);
    }
  };

  const drawPin = (x: number, y: number, fall: number, ang: number, gone: boolean) => {
    const base = proj(x, y);
    if (!base) return;
    ctx.globalAlpha = gone ? 0.25 : 1;
    if (fall === 0) {
      const s = base.s;
      const top = base.y - 0.38 * s;
      const w = 0.06 * s;
      ctx.beginPath();
      ctx.moveTo(base.x - w * 0.55, base.y);
      ctx.bezierCurveTo(base.x - w * 1.25, base.y - 0.12 * s, base.x - w * 0.9, base.y - 0.2 * s, base.x - w * 0.42, base.y - 0.26 * s);
      ctx.bezierCurveTo(base.x - w * 0.55, base.y - 0.32 * s, base.x - w * 0.75, top + 0.03 * s, base.x, top);
      ctx.bezierCurveTo(base.x + w * 0.75, top + 0.03 * s, base.x + w * 0.55, base.y - 0.32 * s, base.x + w * 0.42, base.y - 0.26 * s);
      ctx.bezierCurveTo(base.x + w * 0.9, base.y - 0.2 * s, base.x + w * 1.25, base.y - 0.12 * s, base.x + w * 0.55, base.y);
      ctx.closePath();
      const g = ctx.createLinearGradient(base.x - w, 0, base.x + w, 0);
      g.addColorStop(0, "#c9ced8");
      g.addColorStop(0.45, "#ffffff");
      g.addColorStop(1, "#aab1bf");
      ctx.fillStyle = g;
      ctx.fill();
      ctx.fillStyle = "#e0484d";
      ctx.fillRect(base.x - w * 0.46, base.y - 0.285 * s, w * 0.92, 0.012 * s);
      ctx.fillRect(base.x - w * 0.5, base.y - 0.255 * s, w * 1.0, 0.012 * s);
    } else {
      // tipping over: the head swings from straight up to lying along `ang`
      const k = Math.sin((fall * Math.PI) / 2);
      const hx = x + Math.cos(ang) * 0.36 * k;
      const hy = y + Math.sin(ang) * 0.36 * k;
      const hz = 0.36 * Math.cos((fall * Math.PI) / 2) + 0.05;
      const head = proj(hx, hy, hz);
      const foot = proj(x, y, 0.05);
      if (head && foot) {
        ctx.lineCap = "round";
        ctx.strokeStyle = "#e9ecf2";
        ctx.lineWidth = Math.max(1, 0.1 * foot.s);
        ctx.beginPath();
        ctx.moveTo(foot.x, foot.y);
        ctx.lineTo((foot.x * 2 + head.x) / 3, (foot.y * 2 + head.y) / 3);
        ctx.stroke();
        ctx.lineWidth = Math.max(1, 0.055 * head.s);
        ctx.beginPath();
        ctx.moveTo((foot.x * 2 + head.x) / 3, (foot.y * 2 + head.y) / 3);
        ctx.lineTo(head.x, head.y);
        ctx.stroke();
        ctx.strokeStyle = "#e0484d";
        ctx.lineWidth = Math.max(1, 0.06 * head.s);
        ctx.beginPath();
        ctx.moveTo(foot.x + (head.x - foot.x) * 0.66, foot.y + (head.y - foot.y) * 0.66);
        ctx.lineTo(foot.x + (head.x - foot.x) * 0.72, foot.y + (head.y - foot.y) * 0.72);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  };

  const drawBall = (x: number, y: number, life: boolean, ghost = false) => {
    const sh = proj(x, y);
    const c = proj(x, y, BALL_R);
    if (!sh || !c) return;
    const r = BALL_R * c.s;
    ctx.globalAlpha = ghost ? 0.55 : 1;
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(sh.x, sh.y, r * 1.05, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    const g = ctx.createRadialGradient(c.x - r * 0.35, c.y - r * 0.4, r * 0.1, c.x, c.y, r);
    g.addColorStop(0, life ? "#ffc2c2" : "#bcd7ff");
    g.addColorStop(0.45, life ? "#d94a4a" : "#3d7be0");
    g.addColorStop(1, life ? "#4a0f14" : "#0d1d45");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  };

  // the dotted line a drag would send the ball down
  const drawAim = () => {
    if (!drag || drag.pts.length < 2 || armed?.script) return;
    const a = drag.pts[0];
    const b = drag.pts[drag.pts.length - 1];
    if (a.y - b.y < 10) return;
    const ang = aimAngle(b.x - a.x, a.y - b.y);
    ctx.fillStyle = "rgba(188,215,255,0.8)";
    for (let y = 0.6; y < 9; y += 0.45) {
      const p = proj(aimX + Math.tan(ang) * y, y, 0.01);
      if (!p) continue;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(1.5, 0.02 * p.s), 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const draw = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const bg = ctx.createLinearGradient(0, 0, 0, hpx);
    bg.addColorStop(0, "#070b14");
    bg.addColorStop(1, "#0b111e");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, wpx, hpx);
    drawLane();
    drawAim();
    // far to near so closer things cover farther ones
    const things: { y: number; draw: () => void }[] = sim.pins.map((p) => ({ y: p.y, draw: () => drawPin(p.x, p.y, p.fall, p.ang, p.gone) }));
    if (sim.ball && sim.ball.y < L + 1.3) {
      const b = sim.ball;
      things.push({ y: b.y, draw: () => drawBall(b.x, b.y, !!rolling?.life) });
    } else if (armed) things.push({ y: 0, draw: () => drawBall(aimX, 0, !!armed?.life, false) });
    things.sort((a, b) => b.y - a.y).forEach((t) => t.draw());
  };

  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (sim.ball) {
      for (let i = 0; i < 8; i++) step(sim, dt / 8);
      camY += (Math.min(NEAR, sim.ball.y - BACK) - camY) * Math.min(1, dt * 6);
      if (!reported && settled(sim)) {
        reported = true;
        const down = fallen(sim);
        // give the last pins a beat to finish falling before the result lands
        timer = setTimeout(() => onSettled(down), 700);
      }
    } else camY += (-BACK - camY) * Math.min(1, dt * 3);
    draw();
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  // a straight-ish swipe barely moves the ball off line: real throws are within a few degrees
  const aimAngle = (dx: number, up: number) => Math.max(-0.035, Math.min(0.035, (dx / up) * 0.04));

  const go = (x: number, angle: number, speed: number, hook: number) => {
    const a = armed as Arm;
    armed = null;
    rolling = a;
    reported = false;
    if (a.script) launchScripted(sim, a.script, speed);
    else launch(sim, x, angle, speed, hook);
  };

  const laneX = (px: number) => Math.max(-W + 0.15, Math.min(W - 0.15, ((px - wpx / 2) * (0 - camY)) / F()));

  const down = (e: PointerEvent) => {
    if (!armed || sim.ball) return;
    canvas.setPointerCapture(e.pointerId);
    if (!armed.script) aimX = laneX(e.clientX - canvas.getBoundingClientRect().left);
    drag = { pts: [{ x: e.clientX, y: e.clientY, t: performance.now() }] };
  };
  const move = (e: PointerEvent) => {
    if (drag) drag.pts.push({ x: e.clientX, y: e.clientY, t: performance.now() });
  };
  const up = () => {
    if (!drag) return;
    const pts = drag.pts;
    drag = null;
    const a = pts[0];
    const b = pts[pts.length - 1];
    const recent = pts.filter((p) => b.t - p.t < 140);
    const r0 = recent[0];
    const vy = (r0.y - b.y) / Math.max(16, b.t - r0.t); // px per ms, upwards
    if (a.y - b.y < 40 || vy < 0.25) return;
    // the swipe bowing sideways puts spin on the ball, which hooks late on the dry back end
    const mid = pts[Math.floor(pts.length / 2)];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const bow = ((mid.x - (a.x + b.x) / 2) * (a.y - b.y) - (mid.y - (a.y + b.y) / 2) * (b.x - a.x)) / (len * len);
    const speed = Math.max(5.5, Math.min(10.5, 4 + vy * 2.6));
    go(aimX, aimAngle(b.x - a.x, a.y - b.y), speed, Math.max(-0.6, Math.min(0.6, -bow * 6)));
  };
  const key = (e: KeyboardEvent) => {
    if (!armed || sim.ball) return;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      if (!armed.script) aimX = Math.max(-W + 0.15, Math.min(W - 0.15, aimX + (e.key === "ArrowLeft" ? -0.03 : 0.03)));
      e.preventDefault();
    } else if (e.key === "ArrowUp" || e.key === " ") {
      e.preventDefault();
      go(aimX, 0, SPEED, 0);
    }
  };
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  window.addEventListener("keydown", key);

  return {
    rack: (standing) => rack(sim, standing),
    arm: (a) => {
      armed = a;
      if (a.script) aimX = 0;
    },
    // life's ball rolls itself
    auto: (a) => {
      armed = a;
      aimX = 0;
      timer = setTimeout(() => go(0, 0, SPEED, 0), 900);
    },
    sign: (t) => (sign = t),
    destroy: () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", key);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
    },
  };
};
