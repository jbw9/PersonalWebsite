import { milestones } from "../../data/journey";
import { experiences, involvements } from "../../data";
import { projects } from "../../data/projects";

export type ShapeKey = "name" | "cloud" | "curve" | "gantt" | "grid" | "gpa" | "sphere";
export type NameBox = { cy: number; h: number };

const FONT = "Sora";
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const monthOf = (s: string) => {
  const m = s.match(/([A-Za-z]{3})[a-z]*\s+(\d{4})/);
  return m ? +m[2] * 12 + MONTHS.indexOf(m[1].toLowerCase()) : 0;
};

// How bright each formation sits behind the content (mobile dims further since text overlaps it)
const DIM: Record<ShapeKey, number> = { name: 1, cloud: 0.9, curve: 0.85, gantt: 0.9, grid: 0.2, gpa: 0.85, sphere: 0.85 };

// Draw a formation onto an offscreen canvas, then sample N points with density ∝ pixel alpha
const sample = (vw: number, vh: number, n: number, draw: (c: CanvasRenderingContext2D) => void) => {
  const cv = document.createElement("canvas");
  cv.width = Math.ceil(vw);
  cv.height = Math.ceil(vh);
  const c = cv.getContext("2d") as CanvasRenderingContext2D;
  c.fillStyle = c.strokeStyle = "#fff";
  draw(c);
  const data = c.getImageData(0, 0, cv.width, cv.height).data;
  const xs: number[] = [];
  const ws: number[] = [];
  for (let y = 0; y < cv.height; y += 2)
    for (let x = 0; x < cv.width; x += 2) {
      const a = data[(y * cv.width + x) * 4 + 3];
      if (a > 8) {
        xs.push(x, y);
        ws.push(a / 255);
      }
    }
  const out = new Float32Array(n * 2);
  if (!ws.length) return out;
  for (let i = 0; i < n; i++) {
    let k = 0;
    for (let tries = 0; tries < 30; tries++) {
      k = (Math.random() * ws.length) | 0;
      if (Math.random() < ws[k]) break;
    }
    out[i * 2] = xs[k * 2] + Math.random() * 2;
    out[i * 2 + 1] = xs[k * 2 + 1] + Math.random() * 2;
  }
  return out;
};

const fitText = (c: CanvasRenderingContext2D, text: string, maxW: number, maxH: number, weight: number, track: number) => {
  c.font = `${weight} 100px ${FONT}, sans-serif`;
  const w100 = Array.from(text).reduce((s, ch) => s + c.measureText(ch).width, 0) + track * 100 * (text.length - 1);
  return Math.min((maxW / w100) * 100, maxH);
};

const drawTracked = (c: CanvasRenderingContext2D, text: string, cx: number, cy: number, size: number, weight: number, track: number) => {
  c.font = `${weight} ${size}px ${FONT}, sans-serif`;
  c.textBaseline = "middle";
  const chars = Array.from(text);
  const total = chars.reduce((s, ch) => s + c.measureText(ch).width, 0) + track * size * (chars.length - 1);
  let x = cx - total / 2;
  chars.forEach((ch) => {
    c.fillText(ch, x, cy);
    x += c.measureText(ch).width + track * size;
  });
};

export const createField = (
  canvas: HTMLCanvasElement,
  opts: { reduce: boolean; onNameBox: (b: NameBox) => void; onIntroDone: () => void }
) => {
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  let vw = window.innerWidth;
  let vh = window.innerHeight;
  let wide = vw >= 768;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const N = Math.round(Math.min(5200, Math.max(1600, (vw * vh) / 200)));

  const x = new Float32Array(N);
  const y = new Float32Array(N);
  const vx = new Float32Array(N);
  const vy = new Float32Array(N);
  let tx = new Float32Array(N * 2);
  const kmul = new Float32Array(N);
  const bucket = new Uint8Array(N);
  const z = new Float32Array(N).fill(1);
  const phase = new Float32Array(N);
  // galaxy phase: polar coords on three spiral arms, wound in by differential rotation
  const rad = new Float32Array(N);
  const ang = new Float32Array(N);
  const diag = Math.hypot(vw, vh);

  for (let i = 0; i < N; i++) {
    rad[i] = diag * (0.12 + 0.6 * Math.pow(Math.random(), 0.6));
    ang[i] = ((i % 3) * Math.PI * 2) / 3 + Math.log(rad[i]) * 2.4 + (Math.random() - 0.5) * 0.7;
    x[i] = vw / 2 + Math.cos(ang[i]) * rad[i];
    y[i] = vh / 2 + Math.sin(ang[i]) * rad[i] * 0.55;
    kmul[i] = 0.55 + Math.random() * 0.9;
    const roll = Math.random();
    bucket[i] = roll < 0.8 ? 0 : roll < 0.93 ? 1 : 2;
    phase[i] = Math.random() * Math.PI * 2;
  }

  let shape: ShapeKey = "name";
  let ready = false;
  let cache: Partial<Record<ShapeKey, Float32Array>> = {};
  let curvePts: { x: number; y: number }[] = [];
  let sphere = new Float32Array(0);
  let dim = 1;
  let focus = -1;
  const ring = { x: 0, y: 0, a: 0 };
  const mouse = { x: -9999, y: -9999, on: false };
  const shocks: { x: number; y: number; t: number }[] = [];
  const t0 = performance.now();
  let introEnd = opts.reduce ? 0 : 3.0;
  let galaxyEnd = opts.reduce ? 0 : 1.25;
  let introDone = false;

  const region = () =>
    wide ? { x: vw * 0.52, y: vh * 0.16, w: vw * 0.43, h: vh * 0.68 } : { x: vw * 0.06, y: vh * 0.2, w: vw * 0.88, h: vh * 0.46 };

  const build = (k: ShapeKey): Float32Array => {
    const R = region();
    const cx = R.x + R.w / 2;
    const cy = R.y + R.h / 2;
    if (k === "name") {
      const nameCy = vh * (wide ? 0.4 : 0.36);
      return sample(vw, vh, N, (c) => {
        const size = fitText(c, "JONATHAN", vw * (wide ? 0.84 : 0.9), vh * 0.26, 800, 0.02);
        drawTracked(c, "JONATHAN", vw / 2, nameCy, size, 800, 0.02);
        opts.onNameBox({ cy: nameCy, h: size * 0.74 });
      });
    }
    if (k === "gpa")
      return sample(vw, vh, N, (c) => {
        const size = fitText(c, "3.90", R.w * 0.95, R.h * 0.7, 700, 0.02);
        drawTracked(c, "3.90", cx, cy, size, 700, 0.02);
      });
    if (k === "cloud")
      return sample(vw, vh, N, (c) => {
        const u = Math.min(R.w / 4.4, R.h / 2.6);
        const blob = () => {
          c.beginPath();
          c.arc(cx - 1.15 * u, cy + 0.25 * u, 0.78 * u, 0, Math.PI * 2);
          c.arc(cx - 0.15 * u, cy - 0.32 * u, 1.12 * u, 0, Math.PI * 2);
          c.arc(cx + 0.95 * u, cy + 0.12 * u, 0.9 * u, 0, Math.PI * 2);
          c.rect(cx - 1.15 * u, cy + 0.2 * u, 2.1 * u, 0.83 * u);
          c.arc(cx - 1.15 * u, cy + 0.25 * u, 0.78 * u, 0, Math.PI * 2);
        };
        c.globalAlpha = 0.16;
        blob();
        c.fill();
        // bright rim: the outer edge of the three puffs plus a flat base
        c.globalAlpha = 1;
        const arcs: [number, number, number][] = [
          [-1.15, 0.25, 0.78],
          [-0.15, -0.32, 1.12],
          [0.95, 0.12, 0.9],
        ];
        arcs.forEach(([ax, ay, ar]) => {
          for (let a = 0; a < Math.PI * 2; a += 0.01) {
            const px = cx + ax * u + Math.cos(a) * ar * u;
            const py = cy + ay * u + Math.sin(a) * ar * u;
            const inside = arcs.some(([bx, by, br]) => (bx !== ax || by !== ay) && Math.hypot(px - cx - bx * u, py - cy - by * u) < br * u - 1);
            if (!inside && py < cy + 1.03 * u) c.fillRect(px - 1.5, py - 1.5, 3, 3);
          }
        });
        c.fillRect(cx - 1.15 * u, cy + 1.03 * u - 1.5, 2.1 * u, 3);
      });
    if (k === "curve")
      return sample(vw, vh, N, (c) => {
        // evenly spaced rather than by date: the first semester is too dense to read otherwise
        curvePts = milestones.map((m, i) => ({
          x: R.x + (i / (milestones.length - 1)) * R.w,
          y: R.y + R.h * 0.85 - (m.vibe / 100) * R.h * 0.7,
        }));
        const path = () => {
          c.beginPath();
          c.moveTo(curvePts[0].x, curvePts[0].y);
          for (let i = 1; i < curvePts.length; i++) {
            const p = curvePts[i - 1];
            const q = curvePts[i];
            const mx = (p.x + q.x) / 2;
            c.bezierCurveTo(mx, p.y, mx, q.y, q.x, q.y);
          }
        };
        path();
        c.lineTo(curvePts[curvePts.length - 1].x, R.y + R.h);
        c.lineTo(curvePts[0].x, R.y + R.h);
        const g = c.createLinearGradient(0, R.y, 0, R.y + R.h);
        g.addColorStop(0, "rgba(255,255,255,0.07)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        c.fillStyle = g;
        c.fill();
        c.fillStyle = "#fff";
        path();
        c.lineWidth = 5;
        c.stroke();
        curvePts.forEach((p) => {
          c.beginPath();
          c.arc(p.x, p.y, 6, 0, Math.PI * 2);
          c.fill();
        });
        c.globalAlpha = 0.5;
        c.fillRect(R.x, R.y + R.h, R.w, 2);
      });
    if (k === "gantt")
      return sample(vw, vh, N, (c) => {
        const rows = [
          ...experiences.map((e) => ({ p: e.period, a: 1 })),
          ...involvements.map((v) => ({ p: v.period, a: 0.45 })),
        ];
        const now = new Date();
        const nowM = now.getFullYear() * 12 + now.getMonth();
        const spans = rows.map((r) => {
          const [s, e] = r.p.split("-");
          const sm = monthOf(s);
          const em = e ? monthOf(e) : sm + 3;
          return { sm, em: Math.min(Math.max(em, sm + 1), Math.max(nowM, sm + 3)), a: r.a };
        });
        const lo = Math.min(...spans.map((s) => s.sm));
        const hi = Math.max(...spans.map((s) => s.em));
        const rh = R.h / rows.length;
        spans.forEach((s, i) => {
          c.globalAlpha = s.a;
          const bx = R.x + ((s.sm - lo) / (hi - lo)) * R.w;
          const bw = Math.max(rh * 0.9, ((s.em - s.sm) / (hi - lo)) * R.w);
          c.beginPath();
          const by = R.y + i * rh + rh * 0.22;
          const bh = rh * 0.56;
          c.moveTo(bx + bh / 2, by);
          c.arcTo(bx + bw, by, bx + bw, by + bh, bh / 2);
          c.arcTo(bx + bw, by + bh, bx, by + bh, bh / 2);
          c.arcTo(bx, by + bh, bx, by, bh / 2);
          c.arcTo(bx, by, bx + bw, by, bh / 2);
          c.fill();
        });
        c.globalAlpha = 0.12;
        for (let yr = Math.ceil(lo / 12); yr * 12 <= hi; yr++) {
          const gx = R.x + ((yr * 12 - lo) / (hi - lo)) * R.w;
          c.fillRect(gx, R.y - 10, 1.5, R.h + 20);
        }
      });
    if (k === "grid")
      return sample(vw, vh, N, (c) => {
        const cols = wide ? 5 : 2;
        const rows = Math.ceil(projects.length / cols);
        const gx = vw * 0.06;
        const gw = (vw - gx * 2) / cols;
        const gh = Math.min((vh * 0.8) / rows, gw * 0.75);
        const gy = (vh - gh * rows) / 2;
        projects.forEach((_, i) => {
          const px = gx + (i % cols) * gw + 10;
          const py = gy + Math.floor(i / cols) * gh + 10;
          c.globalAlpha = 0.07;
          c.fillRect(px, py, gw - 20, gh - 20);
          c.globalAlpha = 1;
          c.lineWidth = 2.5;
          c.strokeRect(px, py, gw - 20, gh - 20);
        });
      });
    // sphere: unit points; positions are projected per frame in the loop
    sphere = new Float32Array(N * 3);
    const off = 2 / N;
    const inc = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const yy = i * off - 1 + off / 2;
      const r = Math.sqrt(1 - yy * yy);
      sphere[i * 3] = Math.cos(i * inc) * r;
      sphere[i * 3 + 1] = yy;
      sphere[i * 3 + 2] = Math.sin(i * inc) * r;
    }
    return new Float32Array(N * 2);
  };

  const target = (k: ShapeKey) => {
    if (!cache[k]) cache[k] = build(k);
    return cache[k] as Float32Array;
  };

  const resize = () => {
    vw = window.innerWidth;
    vh = window.innerHeight;
    wide = vw >= 768;
    canvas.width = vw * dpr;
    canvas.height = vh * dpr;
    canvas.style.width = vw + "px";
    canvas.style.height = vh + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!ready) return;
    cache = {};
    tx = target(shape);
    target("name"); // keeps the hero layout box in sync
  };
  resize();

  const COLORS = ["rgba(226,232,255,", "rgba(150,205,255,", "rgba(190,160,255,"];
  let raf = 0;

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const t = (now - t0) / 1000;
    const intro = t < introEnd;
    if (!intro && !introDone) {
      introDone = true;
      opts.onIntroDone();
    }
    const galaxy = t < galaxyEnd || !ready;
    const p = Math.min(1, Math.max(0, (t - galaxyEnd) / Math.max(0.1, introEnd - galaxyEnd - 0.2)));
    const ease = p * p * (3 - 2 * p);
    const k = galaxy ? 0 : intro ? 0.004 + 0.03 * ease : 0.034;
    const swirl = galaxy ? 0 : intro ? 0.5 * (1 - ease) : 0;
    const damp = intro ? 0.9 : 0.86;

    if (shape === "sphere") {
      const R = region();
      const rad = Math.min(R.w, R.h) * 0.42;
      const cx = R.x + R.w / 2;
      const cy = R.y + R.h / 2;
      const ry = t * 0.25;
      const cr = Math.cos(ry);
      const sr = Math.sin(ry);
      const tilt = 0.35;
      const ct = Math.cos(tilt);
      const st = Math.sin(tilt);
      for (let i = 0; i < N; i++) {
        const px = sphere[i * 3];
        const py = sphere[i * 3 + 1];
        const pz = sphere[i * 3 + 2];
        const x1 = px * cr + pz * sr;
        const z1 = -px * sr + pz * cr;
        const y1 = py * ct - z1 * st;
        const z2 = py * st + z1 * ct;
        tx[i * 2] = cx + x1 * rad;
        tx[i * 2 + 1] = cy + y1 * rad;
        z[i] = z2;
      }
    }

    const wantDim = (shape === "name" || wide ? 1 : 0.3) * DIM[shape];
    dim += (wantDim - dim) * 0.06;

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = `rgba(5,6,10,${intro ? 0.2 : 0.38})`;
    ctx.fillRect(0, 0, vw, vh);

    const R2 = 120 * 120;
    const cxs = vw / 2;
    const cys = vh / 2;
    const paths = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
    for (let i = 0; i < N; i++) {
      if (galaxy) {
        // spiral inward; velocity is kept so the hand-off to the springs is seamless
        rad[i] *= 0.982;
        ang[i] += 0.9 / (8 + rad[i] / 14);
        const nx = cxs + Math.cos(ang[i]) * rad[i];
        const ny = cys + Math.sin(ang[i]) * rad[i] * 0.55;
        vx[i] = nx - x[i];
        vy[i] = ny - y[i];
        x[i] = nx;
        y[i] = ny;
        const b = Math.abs(vx[i]) + Math.abs(vy[i]) > 5 ? 1 : bucket[i];
        paths[b].rect(x[i], y[i], 1.5, 1.5);
        continue;
      }
      let ax = 0;
      let ay = 0;
      if (ready) {
        const breathe = Math.sin(t * 1.3 + phase[i]) * 1.2;
        ax = (tx[i * 2] + breathe - x[i]) * k * kmul[i];
        ay = (tx[i * 2 + 1] + Math.cos(t * 1.1 + phase[i]) * 1.2 - y[i]) * k * kmul[i];
      }
      if (swirl > 0) {
        const dx = x[i] - cxs;
        const dy = y[i] - cys;
        const d = Math.sqrt(dx * dx + dy * dy) + 1;
        const f = (swirl * 260) / (d + 160);
        ax += (-dy / d) * f - (dx / d) * f * 0.18;
        ay += (dx / d) * f - (dy / d) * f * 0.18;
      }
      if (mouse.on) {
        const dx = x[i] - mouse.x;
        const dy = y[i] - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < R2) {
          const d = Math.sqrt(d2) + 0.01;
          const f = (1 - d / 120) * 2.4;
          ax += (dx / d) * f;
          ay += (dy / d) * f;
        }
      }
      vx[i] = (vx[i] + ax) * damp;
      vy[i] = (vy[i] + ay) * damp;
      x[i] += vx[i];
      y[i] += vy[i];
      // speed lights a particle up, so swarms and shockwaves flare
      const sp = vx[i] * vx[i] + vy[i] * vy[i];
      const b = shape === "sphere" && z[i] < 0 ? 3 : sp > 6 ? 1 : bucket[i];
      const s = sp > 6 ? 2 : 1.5;
      paths[b].rect(x[i], y[i], s, s);
    }
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = COLORS[0] + 0.85 * dim + ")";
    ctx.fill(paths[0]);
    ctx.fillStyle = COLORS[1] + 0.95 * dim + ")";
    ctx.fill(paths[1]);
    ctx.fillStyle = COLORS[2] + 0.9 * dim + ")";
    ctx.fill(paths[2]);
    ctx.fillStyle = COLORS[0] + 0.28 * dim + ")";
    ctx.fill(paths[3]);
    ctx.globalCompositeOperation = "source-over";

    for (let j = shocks.length - 1; j >= 0; j--) {
      const sh = shocks[j];
      const age = t - sh.t;
      if (age > 0.9) {
        shocks.splice(j, 1);
        continue;
      }
      ctx.strokeStyle = `rgba(160,210,255,${0.5 * (1 - age / 0.9)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(sh.x, sh.y, 20 + age * 520, 0, Math.PI * 2);
      ctx.stroke();
    }

    const showRing = shape === "curve" && focus >= 0 && curvePts[focus];
    ring.a += ((showRing ? 1 : 0) - ring.a) * 0.12;
    if (showRing) {
      ring.x += (curvePts[focus].x - ring.x) * 0.15;
      ring.y += (curvePts[focus].y - ring.y) * 0.15;
    }
    if (ring.a > 0.02) {
      ctx.strokeStyle = `rgba(150,205,255,${ring.a * 0.9})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, 16 + Math.sin(t * 4) * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = ring.a;
      ctx.font = "22px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(milestones[Math.max(0, focus)].emoji, ring.x, ring.y - 38);
      ctx.globalAlpha = 1;
    }
  };

  const start = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(frame);
  };
  const onVis = () => (document.hidden ? cancelAnimationFrame(raf) : start());
  const onMove = (e: PointerEvent) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.on = true;
  };
  const onLeave = () => (mouse.on = false);

  let resizeTimer: ReturnType<typeof setTimeout>;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  };

  window.addEventListener("pointermove", onMove);
  document.documentElement.addEventListener("pointerleave", onLeave);
  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", onVis);

  // the name can only be sampled once the display font has arrived
  let alive = true;
  const fontReady = Promise.race([
    (document as any).fonts ? (document as any).fonts.load(`800 100px ${FONT}`) : Promise.resolve(),
    new Promise((r) => setTimeout(r, 1200)),
  ]);
  fontReady.then(() => {
    if (!alive) return;
    ready = true;
    tx = target(shape);
    if (opts.reduce) {
      for (let i = 0; i < N; i++) {
        x[i] = tx[i * 2];
        y[i] = tx[i * 2 + 1];
        vx[i] = vy[i] = 0;
      }
    }
  });
  start();

  return {
    setShape(k: ShapeKey) {
      if (k === shape) return;
      shape = k;
      if (ready) tx = target(k);
      if (k !== "sphere") z.fill(1);
    },
    setFocus(i: number) {
      focus = i;
    },
    shock(sx: number, sy: number) {
      shocks.push({ x: sx, y: sy, t: (performance.now() - t0) / 1000 });
      for (let i = 0; i < N; i++) {
        const dx = x[i] - sx;
        const dy = y[i] - sy;
        const d = Math.sqrt(dx * dx + dy * dy) + 0.01;
        if (d < 420) {
          const f = (1 - d / 420) * 26;
          vx[i] += (dx / d) * f;
          vy[i] += (dy / d) * f;
        }
      }
    },
    skipIntro() {
      introEnd = Math.min(introEnd, (performance.now() - t0) / 1000);
      galaxyEnd = Math.min(galaxyEnd, introEnd);
    },
    destroy() {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    },
  };
};

export type Field = ReturnType<typeof createField>;
