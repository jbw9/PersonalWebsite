import { FieldOptions, FRAME_SELECTOR, GlobeBox, ShapeKey } from "./contracts";
import { LAND } from "./world";
export type { GlobeBox, ShapeKey };

const FONT = '"Cormorant Garamond"';
const WEIGHT = 500;

// How bright each formation sits beside the content; mobile dims further since text overlaps it
const DIM: Record<ShapeKey, number> = { globe: 1, cloud: 0.62, frames: 0.3, gpa: 0.6, people: 0.62, book: 0.6, chart: 0.62, card: 0.62, guitar: 0.62, tulip: 0.66, hand: 0.62 };
// Share of the particles each formation uses (the globe needs them all for small islands); the rest
// drift as faint dust, so the side formations stay airy
const USE: Record<ShapeKey, number> = { globe: 1, cloud: 0.4, frames: 0.3, gpa: 0.5, people: 0.5, book: 0.55, chart: 0.5, card: 0.45, guitar: 0.5, tulip: 0.45, hand: 0.5 };
// px of slow drift per particle, so a formation breathes instead of sitting rigid
const SWAY: Record<ShapeKey, number> = { globe: 0, cloud: 5, frames: 1, gpa: 2.2, people: 2.2, book: 2, chart: 1.6, card: 1.6, guitar: 2, tulip: 2.2, hand: 2 };

// ── Globe ──
const RAD = Math.PI / 180;
const HOME_AT = { lat: 40.1164, lon: -88.2434 }; // Champaign, IL
const NEXT_AT = { lat: 47.6062, lon: -122.3321 }; // Seattle, WA
const BORN_AT = { lat: -6.9175, lon: 107.6191 }; // Bandung, Indonesia
const TILT = 24 * RAD; // northern hemisphere leans toward the viewer
export const land = (lat: number, lon: number) => {
  const row = LAND[Math.min(179, Math.max(0, Math.floor(90 - lat)))];
  const col = Math.min(359, Math.max(0, Math.floor(lon + 180)));
  return (parseInt(row[col >> 2], 16) >> (3 - (col & 3))) & 1;
};
// Unit-sphere point → screen, for a globe turned so `lon0` faces the viewer; z < 0 is the far side
const project = (lat: number, lon: number, lon0: number, g: GlobeBox, lift = 1) => {
  const cl = Math.cos(lat);
  const px = cl * Math.sin(lon - lon0);
  const py = Math.sin(lat);
  const pz = cl * Math.cos(lon - lon0);
  return {
    x: g.cx + g.r * lift * px,
    y: g.cy - g.r * lift * (py * Math.cos(TILT) - pz * Math.sin(TILT)),
    z: py * Math.sin(TILT) + pz * Math.cos(TILT),
  };
};

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

const fitText = (c: CanvasRenderingContext2D, text: string, maxW: number, maxH: number, track: number) => {
  c.font = `${WEIGHT} 100px ${FONT}, Georgia, serif`;
  const w100 = Array.from(text).reduce((s, ch) => s + c.measureText(ch).width, 0) + track * 100 * (text.length - 1);
  return Math.min((maxW / w100) * 100, maxH);
};

const drawTracked = (c: CanvasRenderingContext2D, text: string, cx: number, cy: number, size: number, track: number) => {
  c.font = `${WEIGHT} ${size}px ${FONT}, Georgia, serif`;
  c.textBaseline = "middle";
  const chars = Array.from(text);
  const total = chars.reduce((s, ch) => s + c.measureText(ch).width, 0) + track * size * (chars.length - 1);
  let x = cx - total / 2;
  chars.forEach((ch) => {
    c.fillText(ch, x, cy);
    x += c.measureText(ch).width + track * size;
  });
};

// Overlapping parts drawn as one silhouette: a bright rim around the union, a faint fill, no seams
// where parts overlap. A part strokes its path at width w (round caps) and fills it when closed.
type Part = { d: (c: CanvasRenderingContext2D) => void; w: number; fill?: boolean };
const blob = (c: CanvasRenderingContext2D, parts: Part[], rim = 3.5) => {
  c.lineCap = c.lineJoin = "round";
  const pass = (grow: number) =>
    parts.forEach((p) => {
      c.beginPath();
      p.d(c);
      if (p.fill) c.fill();
      if (p.w + grow > 0) {
        c.lineWidth = p.w + grow;
        c.stroke();
      }
    });
  c.globalAlpha = 1;
  pass(rim * 2);
  c.globalCompositeOperation = "destination-out";
  pass(0);
  c.globalCompositeOperation = "source-over";
  c.globalAlpha = 0.07;
  pass(0);
  c.globalAlpha = 1;
};

const rrect = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
};

export const createField = (
  canvas: HTMLCanvasElement,
  opts: FieldOptions
) => {
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  let vw = window.innerWidth;
  let vh = window.innerHeight;
  let wide = vw >= 768;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const N = Math.round(Math.min(9000, Math.max(2600, (vw * vh) / 115)));

  const x = new Float32Array(N);
  const y = new Float32Array(N);
  const vx = new Float32Array(N);
  const vy = new Float32Array(N);
  let tx = new Float32Array(N * 2);
  const kmul = new Float32Array(N);
  const bucket = new Uint8Array(N);
  const phase = new Float32Array(N);
  const pick = new Float32Array(N);
  const dustX = new Float32Array(N);
  const dustY = new Float32Array(N);
  // galaxy phase: polar coords on three spiral arms, wound in by differential rotation
  const rad = new Float32Array(N);
  const ang = new Float32Array(N);
  const diag = Math.hypot(vw, vh);
  // frames: particle i rides element fe[i], ff[i] of the way round its perimeter, fo[i] px outside it
  const fbuf = new Float32Array(N * 2);
  const fe = new Uint16Array(N);
  const ff = new Float32Array(N);
  const fo = new Float32Array(N);
  let fCount = -1;
  let fTotal = 0;
  // globe: each particle is a land dot (lat/lon) or, with glat = NaN, a rim dot at angle glon
  const glat = new Float32Array(N);
  const glon = new Float32Array(N);
  const back = new Uint8Array(N);
  {
    const pts: number[] = [];
    const M = 24000;
    const inc = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < M; i++) {
      const la = Math.asin(1 - (2 * (i + 0.5)) / M) / RAD;
      const lo = ((((i * inc) / RAD) % 360) + 360) % 360 - 180;
      if (land(la, lo)) pts.push(la * RAD, lo * RAD);
    }
    const nLand = Math.round(N * 0.9);
    for (let i = 0; i < N; i++) {
      if (i < nLand) {
        const k = ((Math.random() * pts.length) / 2) | 0;
        glat[i] = pts[k * 2] + (Math.random() - 0.5) * 0.012;
        glon[i] = pts[k * 2 + 1] + (Math.random() - 0.5) * 0.012;
      } else {
        glat[i] = NaN;
        glon[i] = Math.random() * Math.PI * 2;
      }
    }
  }

  for (let i = 0; i < N; i++) {
    rad[i] = diag * (0.12 + 0.6 * Math.pow(Math.random(), 0.6));
    ang[i] = ((i % 3) * Math.PI * 2) / 3 + Math.log(rad[i]) * 2.4 + (Math.random() - 0.5) * 0.7;
    x[i] = vw / 2 + Math.cos(ang[i]) * rad[i];
    y[i] = vh / 2 + Math.sin(ang[i]) * rad[i] * 0.55;
    kmul[i] = 0.55 + Math.random() * 0.9;
    const roll = Math.random();
    bucket[i] = roll < 0.8 ? 0 : roll < 0.94 ? 1 : 2;
    phase[i] = Math.random() * Math.PI * 2;
    pick[i] = Math.random();
    dustX[i] = Math.random();
    dustY[i] = Math.random();
    fo[i] = Math.random() < 0.75 ? Math.random() * 2.5 : 2.5 + Math.pow(Math.random(), 2) * 7;
    if (opts.resume) {
      x[i] = Math.random() * vw;
      y[i] = Math.random() * vh;
    }
  }

  let shape: ShapeKey = "globe";
  let ready = false;
  let running = true;
  let cache: Partial<Record<ShapeKey, Float32Array>> = {};
  let dim = 1;
  const mouse = { x: -9999, y: -9999, on: false };
  const shocks: { x: number; y: number; t: number }[] = [];
  const t0 = performance.now();
  let introEnd = opts.reduce || opts.resume ? 0 : 2.3;
  let galaxyEnd = opts.reduce || opts.resume ? 0 : 0.95;
  let introDone = false;
  let globeVis = 0;
  let globeHold = 0;
  // resume: the first projected frame places every particle straight on its target
  let snap = opts.resume;

  const region = () =>
    wide ? { x: vw * 0.6, y: vh * 0.2, w: vw * 0.34, h: vh * 0.56 } : { x: vw * 0.08, y: vh * 0.22, w: vw * 0.84, h: vh * 0.42 };
  // desktop: right of the hero text; phone: above it
  const globeBox = (): GlobeBox =>
    wide ? { cx: vw * 0.68, cy: vh * 0.43, r: Math.min(vh * 0.3, vw * 0.23) } : { cx: vw / 2, cy: vh * 0.27, r: Math.min(vw * 0.38, vh * 0.19) };
  // Spins west→east on its own; grab it to turn it, and a flick keeps its momentum before easing back
  const SPIN = opts.reduce ? 0 : -0.1 * RAD; // per frame, ~6°/s
  let rot = 0;
  let spin = SPIN;
  let drag: { x: number; v: number } | null = null;
  const lon0 = () => -100 * RAD + rot;
  const overGlobe = (px: number, py: number) => {
    const g = globeBox();
    return shape === "globe" && ready && Math.hypot(px - g.cx, py - g.cy) < g.r * 1.05;
  };

  // Tulip's logo as an alpha mask cropped to its strokes: orange → opaque, the white page → clear
  let logo: HTMLCanvasElement | null = null;
  {
    const img = new Image();
    img.onload = () => {
      const src = document.createElement("canvas");
      src.width = img.width;
      src.height = img.height;
      const sc = src.getContext("2d") as CanvasRenderingContext2D;
      sc.drawImage(img, 0, 0);
      const px = sc.getImageData(0, 0, img.width, img.height);
      let [x0, y0, x1, y1] = [img.width, img.height, 0, 0];
      for (let i = 0; i < px.data.length; i += 4) {
        const a = ((255 - px.data[i + 2]) * px.data[i + 3]) / 255; // orange has almost no blue; white is all blue
        px.data[i] = px.data[i + 1] = px.data[i + 2] = 255;
        px.data[i + 3] = a;
        if (a > 128) {
          const x = (i / 4) % img.width;
          const y = Math.floor(i / 4 / img.width);
          x0 = Math.min(x0, x);
          y0 = Math.min(y0, y);
          x1 = Math.max(x1, x);
          y1 = Math.max(y1, y);
        }
      }
      sc.putImageData(px, 0, 0);
      const m = document.createElement("canvas");
      m.width = x1 - x0 + 3;
      m.height = y1 - y0 + 3;
      (m.getContext("2d") as CanvasRenderingContext2D).drawImage(src, 1 - x0, 1 - y0);
      logo = m;
      delete cache.tulip;
      if (shape === "tulip" && ready) aim();
    };
    img.src = "/tulip.png";
  }
  // the waving hand is a 3D point cloud (hand3, hand-local units, wrist at the origin), posed and
  // projected every frame; (cx, cy) is where the hand's middle lands and s is px per unit
  const hand3 = new Float32Array(N * 3);
  const hz = new Float32Array(N);
  let hello = { cx: 0, cy: 0, s: 1 };
  const pose = (i: number, t: number) => {
    // rocks side to side about the wrist, turned partway to the side so it reads as solid
    const az = Math.sin(t * 4.6) * 0.36;
    const ay = -0.35 - Math.sin(t * 0.6) * 0.2; // thumb side toward the viewer
    const px = hand3[i * 3];
    const py = hand3[i * 3 + 1];
    const pz = hand3[i * 3 + 2];
    const rx = px * Math.cos(az) - py * Math.sin(az);
    const ry = px * Math.sin(az) + py * Math.cos(az);
    const qx = rx * Math.cos(ay) + pz * Math.sin(ay);
    const qz = -rx * Math.sin(ay) + pz * Math.cos(ay);
    const f = 8 / (8 - qz);
    return { x: hello.cx + qx * f * hello.s, y: hello.cy - (ry - 1.0) * f * hello.s, z: qz };
  };
  {
    // tapered capsule surface from (x0, y0) to (x1, y1), radius r0 → r1, rounded tip, nudged to depth z
    const capsule = (i: number, x0: number, y0: number, x1: number, y1: number, r0: number, r1: number, z = 0) => {
      const L = Math.hypot(x1 - x0, y1 - y0);
      const ux = (x1 - x0) / L;
      const uy = (y1 - y0) / L;
      const u = Math.random() * L;
      const r = r0 + (r1 - r0) * (u / L);
      const rr = u > L - r1 ? r * Math.sqrt(Math.max(0, 1 - ((u - L + r1) / r1) ** 2)) : r;
      const a = Math.random() * Math.PI * 2;
      hand3[i * 3] = x0 + ux * u - uy * Math.cos(a) * rr;
      hand3[i * 3 + 1] = y0 + uy * u + ux * Math.cos(a) * rr;
      hand3[i * 3 + 2] = z + Math.sin(a) * rr;
    };
    // pinky → index: base x, base y, length, lean, radius; the pinky sits lower, the middle is longest
    const fingers: [number, number, number, number, number][] = [
      [-0.4, 0.88, 0.62, -0.2, 0.1],
      [-0.14, 0.97, 0.86, -0.07, 0.115],
      [0.13, 1.0, 0.95, 0.03, 0.12],
      [0.38, 0.95, 0.82, 0.14, 0.115],
    ];
    const lens = fingers.reduce((sum, f) => sum + f[2], 0);
    for (let i = 0; i < N; i++) {
      const r = Math.random();
      if (r < 0.4) {
        // palm: a rounded slab, narrower at the wrist than across the knuckles, thin in z
        const a = Math.random() * Math.PI * 2;
        const b = Math.acos(2 * Math.random() - 1);
        const sq = (v: number) => Math.sign(v) * Math.pow(Math.abs(v), 0.55);
        const v = sq(Math.sin(b) * Math.sin(a));
        hand3[i * 3] = sq(Math.sin(b) * Math.cos(a)) * (0.5 + v * 0.06);
        hand3[i * 3 + 1] = 0.55 + v * 0.5;
        hand3[i * 3 + 2] = Math.cos(b) * 0.16;
      } else if (r < 0.86) {
        let pick = Math.random() * lens;
        const f = fingers.find((g) => (pick -= g[2]) < 0) || fingers[3];
        const [fx, fy, len, lean, fr] = f;
        capsule(i, fx, fy, fx + Math.sin(lean) * len, fy + Math.cos(lean) * len, fr, fr * 0.82);
      } else if (r < 0.93) capsule(i, 0.32, 0.2, 0.68, 0.55, 0.17, 0.15, 0.06);
      else capsule(i, 0.68, 0.55, 0.9, 0.92, 0.15, 0.12, 0.1);
    }
  }
  const build = (k: ShapeKey): Float32Array => {
    const R = region();
    const cx = R.x + R.w / 2;
    const cy = R.y + R.h / 2;
    if (k === "gpa")
      return sample(vw, vh, N, (c) => {
        const size = fitText(c, "3.88", R.w * 0.9, R.h * 0.62, 0.04);
        drawTracked(c, "3.88", cx, cy, size, 0.04);
      });
    if (k === "cloud")
      return sample(vw, vh, N, (c) => {
        const u = Math.min(R.w / 4.4, R.h / 2.6);
        const arcs: [number, number, number][] = [
          [-1.15, 0.25, 0.78],
          [-0.15, -0.32, 1.12],
          [0.95, 0.12, 0.9],
        ];
        c.globalAlpha = 0.14;
        c.beginPath();
        arcs.forEach(([ax, ay, ar]) => {
          c.moveTo(cx + ax * u + ar * u, cy + ay * u);
          c.arc(cx + ax * u, cy + ay * u, ar * u, 0, Math.PI * 2);
        });
        c.rect(cx - 1.15 * u, cy + 0.2 * u, 2.1 * u, 0.83 * u);
        c.fill();
        // bright rim: the outer edge of the three puffs plus a flat base
        c.globalAlpha = 1;
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
    // Tulip: an investing app, so a candlestick chart climbing to the right
    if (k === "chart")
      return sample(vw, vh, N, (c) => {
        const W = Math.min(R.w * 0.92, R.h * 1.1);
        const H = W * 0.78;
        const x0 = cx - W / 2;
        const y0 = cy + H / 2;
        const closes = [0.3, 0.37, 0.33, 0.44, 0.4, 0.52, 0.48, 0.6, 0.68, 0.63, 0.76, 0.86];
        const step = W / (closes.length + 0.5);
        const at = (v: number) => y0 - v * H;
        c.lineCap = "round";
        c.lineWidth = 3;
        c.globalAlpha = 0.8;
        c.beginPath();
        c.moveTo(x0, y0 - H * 1.02);
        c.lineTo(x0, y0);
        c.lineTo(x0 + W, y0);
        c.stroke();
        c.globalAlpha = 0.35;
        c.lineWidth = 1.5;
        [0.33, 0.66].forEach((v) => {
          for (let gx = x0 + 10; gx < x0 + W; gx += 14) c.fillRect(gx, at(v), 5, 1.5);
        });
        closes.forEach((v, i) => {
          if (!i) return;
          const o = closes[i - 1];
          const mx = x0 + step * (i + 0.25);
          const bw = step * 0.56;
          const hi = Math.max(o, v) + 0.05;
          const lo = Math.min(o, v) - 0.04;
          c.globalAlpha = 0.9;
          c.lineWidth = 2.5;
          c.beginPath();
          c.moveTo(mx, at(hi));
          c.lineTo(mx, at(Math.max(o, v)));
          c.moveTo(mx, at(Math.min(o, v)));
          c.lineTo(mx, at(lo));
          c.stroke();
          c.beginPath();
          rrect(c, mx - bw / 2, at(Math.max(o, v)), bw, Math.max(4, Math.abs(v - o) * H), 3);
          // up days are solid, down days hollow
          c.globalAlpha = v > o ? 0.45 : 0.04;
          c.fill();
          c.globalAlpha = 1;
          c.lineWidth = 3;
          c.stroke();
        });
      });
    // Kredivo: fintech, so a credit card, tilted a little
    if (k === "card")
      return sample(vw, vh, N, (c) => {
        const W = Math.min(R.w * 0.9, R.h * 1.25);
        const H = W / 1.586;
        c.translate(cx, cy);
        c.rotate(-0.12);
        c.translate(-W / 2, -H / 2);
        c.beginPath();
        rrect(c, 0, 0, W, H, W * 0.06);
        c.globalAlpha = 0.02;
        c.fill();
        c.globalAlpha = 1;
        c.lineWidth = 3.5;
        c.stroke();
        // chip with its contact lines, then the contactless waves beside it
        c.lineWidth = 2.5;
        c.beginPath();
        rrect(c, W * 0.1, H * 0.3, W * 0.15, H * 0.22, 6);
        c.globalAlpha = 0.3;
        c.fill();
        c.globalAlpha = 1;
        c.lineWidth = 3.5;
        c.stroke();
        c.beginPath();
        c.moveTo(W * 0.1, H * 0.41);
        c.lineTo(W * 0.25, H * 0.41);
        c.moveTo(W * 0.175, H * 0.3);
        c.lineTo(W * 0.175, H * 0.52);
        c.stroke();
        [0.04, 0.07, 0.1].forEach((r) => {
          c.beginPath();
          c.arc(W * 0.29, H * 0.41, r * W, -0.7, 0.7);
          c.stroke();
        });
        // number: four groups of four dots, then the name and expiry bars
        for (let g = 0; g < 4; g++)
          for (let d = 0; d < 4; d++) {
            c.beginPath();
            c.arc(W * (0.1 + g * 0.2 + d * 0.035), H * 0.68, Math.max(2.5, W * 0.009), 0, Math.PI * 2);
            c.fill();
          }
        c.lineWidth = 4;
        c.globalAlpha = 0.6;
        c.beginPath();
        c.moveTo(W * 0.1, H * 0.84);
        c.lineTo(W * 0.42, H * 0.84);
        c.moveTo(W * 0.72, H * 0.84);
        c.lineTo(W * 0.86, H * 0.84);
        c.stroke();
        c.setTransform(1, 0, 0, 1, 0, 0);
      });
    // Massive: music, so a guitar on a slant with a couple of notes beside it
    if (k === "guitar")
      return sample(vw, vh, N, (c) => {
        const u = Math.min(R.w, R.h) / 5.4;
        c.translate(cx - 0.4 * u, cy + 0.2 * u);
        c.rotate(0.62);
        c.translate(0, 1.2 * u);
        const disc = (y: number, r: number): Part => ({ d: (q) => q.arc(0, y * u, r * u, 0, Math.PI * 2), w: 0, fill: true });
        const bar = (y0: number, y1: number, w: number): Part => ({
          d: (q) => {
            q.moveTo(0, y0 * u);
            q.lineTo(0, y1 * u);
          },
          w: w * u,
        });
        blob(c, [disc(0.55, 0.78), disc(-0.5, 0.6), bar(-0.5, 0.6, 1.05), bar(-0.9, -3.0, 0.26), bar(-3.0, -3.55, 0.42)]);
        c.lineWidth = 2.5;
        c.beginPath();
        c.arc(0, -0.15 * u, 0.24 * u, 0, Math.PI * 2);
        c.stroke();
        c.fillRect(-0.28 * u, 0.82 * u, 0.56 * u, 0.1 * u);
        c.globalAlpha = 0.55;
        c.lineWidth = 1.2;
        [-0.09, -0.03, 0.03, 0.09].forEach((sx) => {
          c.beginPath();
          c.moveTo(sx * u, 0.85 * u);
          c.lineTo(sx * u, -3.45 * u);
          c.stroke();
        });
        for (let f = -1.05; f > -3; f -= 0.3) c.fillRect(-0.13 * u, f * u, 0.26 * u, 2);
        c.setTransform(1, 0, 0, 1, 0, 0);
        // a beamed pair of eighth notes, upper right
        c.globalAlpha = 0.85;
        const nx = cx + 1.25 * u;
        const ny = cy - 0.7 * u;
        [0, 0.7].forEach((dx, j) => {
          c.beginPath();
          c.ellipse(nx + dx * u, ny + (0.9 - j * 0.15) * u, 0.2 * u, 0.14 * u, -0.4, 0, Math.PI * 2);
          c.fill();
          c.fillRect(nx + (dx + 0.17) * u, ny - j * 0.15 * u - 0.05 * u, 3.5, 0.9 * u);
        });
        c.lineWidth = 0.13 * u;
        c.beginPath();
        c.moveTo(nx + 0.17 * u, ny - 0.02 * u);
        c.lineTo(nx + 0.87 * u, ny - 0.17 * u);
        c.stroke();
      });
    // iVenture: where Tulip was built, so Tulip's logo, traced from the real PNG (see `logo`)
    if (k === "tulip") {
      const m = logo;
      if (!m) return build("cloud");
      return sample(vw, vh, N, (c) => {
        const u = (Math.min(R.w, R.h) * 0.9) / Math.max(m.width, m.height);
        const w = m.width * u;
        const h = m.height * u;
        c.drawImage(m, cx - w / 2, cy - h / 2, w, h);
        // the source is tiny, so upscaling blurs it: snap alpha back to crisp strokes
        const x0 = Math.floor(cx - w / 2);
        const y0 = Math.floor(cy - h / 2);
        const img = c.getImageData(x0, y0, Math.ceil(w) + 1, Math.ceil(h) + 1);
        for (let i = 3; i < img.data.length; i += 4) img.data[i] = img.data[i] > 128 ? 255 : 0;
        c.putImageData(img, x0, y0);
      });
    }
    // We Hear You: a hand waving hello, in 3D; the frame loop poses it (see `pose`)
    if (k === "hand") {
      hello = { cx, cy, s: Math.min(R.w / 2.4, R.h / 2.5) };
      const out = new Float32Array(N * 2);
      for (let i = 0; i < N; i++) {
        const p = pose(i, 0);
        out[i * 2] = p.x;
        out[i * 2 + 1] = p.y;
      }
      return out;
    }
    if (k === "people")
      return sample(vw, vh, N, (c) => {
        // three busts, the middle one larger and in front; each erases what it covers so the rims occlude
        const s = Math.min(R.w / 5.2, R.h / 3.1);
        const base = cy + 1.45 * s;
        const bust = (px: number, u: number) => {
          const w = 1.15 * u;
          const top = base - 1.5 * u;
          const rr = 0.8 * u;
          const body = new Path2D();
          body.moveTo(px - w, base);
          body.lineTo(px - w, top + rr);
          body.quadraticCurveTo(px - w, top, px - w + rr, top);
          body.lineTo(px + w - rr, top);
          body.quadraticCurveTo(px + w, top, px + w, top + rr);
          body.lineTo(px + w, base);
          const head = new Path2D();
          head.arc(px, base - 2.28 * u, 0.62 * u, 0, Math.PI * 2);
          c.globalAlpha = 1;
          c.globalCompositeOperation = "destination-out";
          c.lineWidth = 0.24 * u;
          [body, head].forEach((pth) => {
            c.fill(pth);
            c.stroke(pth);
          });
          c.globalCompositeOperation = "source-over";
          c.globalAlpha = 0.07;
          c.fill(body);
          c.fill(head);
          c.globalAlpha = 1;
          c.lineWidth = 3.5;
          c.stroke(body);
          c.stroke(head);
        };
        bust(cx - 1.55 * s, 0.78 * s);
        bust(cx + 1.55 * s, 0.78 * s);
        bust(cx, s);
      });
    // book: open, both pages bowing down into the spine, a few lines of text on each
    return sample(vw, vh, N, (c) => {
      const W = Math.min(R.w * 0.47, (R.h * 0.84) / 1.25);
      const H = W * 1.2;
      const d = H * 0.2;
      const top = cy - H / 2;
      // t runs spine → outer edge along a quadratic curve; v runs top → bottom of the page
      const pt = (side: number, t: number, v: number): [number, number] => [
        cx + side * W * (0.7 * t * (1 - t) + t * t),
        top + d * (1 - t) * (1 - t) + v * (H - d),
      ];
      const line = (side: number, t0: number, t1: number, v: number) => {
        c.beginPath();
        for (let t = t0; t <= t1 + 1e-6; t += 0.02) c.lineTo(...pt(side, t, v));
        c.stroke();
      };
      [-1, 1].forEach((side) => {
        c.beginPath();
        for (let t = 0; t <= 1.0001; t += 0.02) c.lineTo(...pt(side, t, 0));
        for (let t = 1; t >= -0.0001; t -= 0.02) c.lineTo(...pt(side, t, 1));
        c.closePath();
        c.globalAlpha = 0.05;
        c.fill();
        c.globalAlpha = 1;
        c.lineWidth = 3.5;
        c.stroke();
        // page-stack edge under the leaves
        c.lineWidth = 2.5;
        c.globalAlpha = 0.8;
        line(side, 0, 1, 1.06);
        c.globalAlpha = 0.75;
        // phones have a third of the particles, so fewer, bolder lines
        (wide ? [0.16, 0.27, 0.38, 0.49, 0.62, 0.73, 0.84] : [0.2, 0.4, 0.6, 0.8]).forEach((v, j, vs) =>
          line(side, 0.14, j === vs.length - 1 || (wide && j === 3) ? 0.55 : 0.86, v)
        );
      });
    });
  };

  const target = (k: ShapeKey) => {
    if (!cache[k]) cache[k] = build(k);
    return cache[k] as Float32Array;
  };
  // frames has no cached shape: it starts from the previous targets, so a page without frames holds still
  // frames and globe are projected per frame instead
  const live = new Float32Array(N * 2);
  const aim = () => {
    if (shape === "globe") {
      live.set(tx);
      return void (tx = live);
    }
    if (shape !== "frames") return void (tx = target(shape));
    fbuf.set(tx);
    tx = fbuf;
    fCount = -1;
  };

  const DX = [1, 0, -1, 0];
  const DY = [0, 1, 0, -1];
  const trace = () => {
    const boxes = Array.from(document.querySelectorAll<HTMLElement>(FRAME_SELECTOR)).map((el) => {
      const b = el.getBoundingClientRect();
      const r = Math.min(+(el.dataset.frame || 0), b.width / 2, b.height / 2);
      const l = b.left + r;
      const t = b.top + r;
      const rr = b.right - r;
      const bb = b.bottom - r;
      return { w: b.width - 2 * r, h: b.height - 2 * r, r, cx: [l, rr, rr, l], cy: [t, t, bb, bb], per: 2 * (b.width + b.height) + (2 * Math.PI - 8) * r };
    });
    const total = boxes.reduce((s, b) => s + b.per, 0);
    if (!total) return;
    if (boxes.length !== fCount || Math.abs(total - fTotal) > fTotal * 0.2) {
      // spread evenly over the combined perimeter, then each particle keeps its element and place on it
      fCount = boxes.length;
      fTotal = total;
      let e = 0;
      let acc = 0;
      for (let i = 0; i < N; i++) {
        const g = ((i + 0.5) / N) * total;
        while (e < fCount - 1 && g > acc + boxes[e].per) acc += boxes[e++].per;
        fe[i] = e;
        ff[i] = boxes[e].per ? Math.min(1, (g - acc) / boxes[e].per) : 0;
      }
    }
    // phones have fewer particles for as much border, so they hug the line instead of haloing
    const spread = wide ? 0.5 : 0.35;
    for (let i = 0; i < N; i++) {
      const b = boxes[fe[i]];
      let s = ff[i] * b.per;
      let px = b.cx[0];
      let py = b.cy[0] - b.r;
      let nx = 0;
      let ny = -1;
      // walk the four sides, each a straight run then a quarter-arc round the next corner
      for (let q = 0; q < 4; q++) {
        const len = q % 2 ? b.h : b.w;
        if (s < len) {
          nx = DY[q];
          ny = -DX[q];
          px = b.cx[q] + b.r * nx + DX[q] * s;
          py = b.cy[q] + b.r * ny + DY[q] * s;
          break;
        }
        s -= len;
        const arc = (Math.PI / 2) * b.r;
        if (s < arc) {
          const a = ((q - 1) * Math.PI) / 2 + s / b.r;
          nx = Math.cos(a);
          ny = Math.sin(a);
          px = b.cx[(q + 1) % 4] + b.r * nx;
          py = b.cy[(q + 1) % 4] + b.r * ny;
          break;
        }
        s -= arc;
      }
      fbuf[i * 2] = px + nx * fo[i] * spread;
      fbuf[i * 2 + 1] = py + ny * fo[i] * spread;
    }
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
    aim();
    opts.onGlobe(globeBox());
  };
  resize();

  // ice-white, ice-blue, blue
  const COLORS = ["rgba(226,236,255,", "rgba(150,198,255,", "rgba(91,140,255,"];
  let raf = 0;

  // Champaign glows green; an unlit dashed arc lifts off the surface toward Seattle
  const drawRoute = (t: number, g: GlobeBox, l0: number) => {
    const a = { lat: HOME_AT.lat * RAD, lon: HOME_AT.lon * RAD };
    const b = { lat: NEXT_AT.lat * RAD, lon: NEXT_AT.lon * RAD };
    const v = (p: { lat: number; lon: number }) => [Math.cos(p.lat) * Math.cos(p.lon), Math.cos(p.lat) * Math.sin(p.lon), Math.sin(p.lat)];
    const va = v(a);
    const vb = v(b);
    ctx.save();
    ctx.setLineDash([3, 5]);
    ctx.lineDashOffset = -t * 8;
    ctx.lineWidth = 1.6;
    ctx.lineCap = "round";
    ctx.strokeStyle = `rgba(188,215,255,${0.85 * globeVis})`;
    ctx.beginPath();
    for (let s = 0; s <= 1.0001; s += 1 / 40) {
      const p = [0, 1, 2].map((j) => va[j] * (1 - s) + vb[j] * s);
      const len = Math.hypot(p[0], p[1], p[2]);
      const q = project(Math.asin(p[2] / len), Math.atan2(p[1], p[0]), l0, g, 1 + 0.38 * Math.sin(Math.PI * s));
      if (s === 0) ctx.moveTo(q.x, q.y);
      else ctx.lineTo(q.x, q.y);
    }
    ctx.stroke();
    ctx.restore();

    const sea = project(b.lat, b.lon, l0, g);
    const fade = (z: number) => globeVis * Math.max(0, Math.min(1, z * 6));
    ctx.font = '500 10px "IBM Plex Mono", ui-monospace, monospace';
    ctx.textBaseline = "middle";
    // a dark backing keeps the labels readable over the land dots
    const tag = (text: string, x: number, y: number, align: CanvasTextAlign, color: string, a: number) => {
      const w = ctx.measureText(text).width;
      const left = align === "right" ? x - w : x;
      ctx.fillStyle = `rgba(7,11,20,${0.75 * a})`;
      ctx.fillRect(left - 6, y - 9, w + 12, 18);
      ctx.fillStyle = color;
      ctx.textAlign = align;
      ctx.fillText(text, x, y);
    };
    if (fade(sea.z) > 0) {
      ctx.strokeStyle = `rgba(188,215,255,${0.6 * fade(sea.z)})`;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(sea.x, sea.y, 4, 0, Math.PI * 2);
      ctx.stroke();
      tag("SEATTLE · NEXT", sea.x - 10, sea.y, "right", `rgba(163,173,191,${0.8 * fade(sea.z)})`, fade(sea.z));
    }
    const born = project(BORN_AT.lat * RAD, BORN_AT.lon * RAD, l0, g);
    const fb = fade(born.z);
    if (fb > 0) {
      // 🇮🇩 on a pole planted in Bandung: it leans out with the globe's curve and waves
      const ox = (born.x - g.cx) / g.r;
      const lean = Math.atan2(ox * 0.5, 1);
      const len = 34;
      const topX = born.x + Math.sin(lean) * len;
      const topY = born.y - Math.cos(lean) * len;
      ctx.save();
      ctx.globalAlpha = fb;
      ctx.strokeStyle = "rgba(226,236,255,0.9)";
      ctx.lineWidth = 1.8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(born.x, born.y);
      ctx.lineTo(topX, topY);
      ctx.stroke();
      const fw = 21;
      const fh = 14;
      const wave = (u: number) => Math.sin(t * 4 - u * 5) * 1.4 * u;
      const band = (y0: number, y1: number, color: string) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let u = 0; u <= 1.0001; u += 0.1) ctx.lineTo(topX + u * fw, topY + y0 + wave(u));
        for (let u = 1; u >= -0.0001; u -= 0.1) ctx.lineTo(topX + u * fw, topY + y1 + wave(u));
        ctx.closePath();
        ctx.fill();
      };
      band(0, fh / 2, "#e8112d");
      band(fh / 2, fh, "#f4f6fa");
      ctx.fillStyle = "rgba(226,236,255,0.9)";
      ctx.beginPath();
      ctx.arc(born.x, born.y, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      tag("BANDUNG · HOMETOWN", topX + fw + 12, topY + fh / 2, "left", `rgba(226,236,255,${0.85 * fb})`, fb);
    }
    const home = project(a.lat, a.lon, l0, g);
    const f = fade(home.z);
    if (f > 0) {
      const glow = ctx.createRadialGradient(home.x, home.y, 0, home.x, home.y, 18);
      glow.addColorStop(0, `rgba(123,216,143,${0.55 * f})`);
      glow.addColorStop(1, "rgba(123,216,143,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(home.x - 18, home.y - 18, 36, 36);
      const ping = (t % 2) / 2;
      ctx.strokeStyle = `rgba(123,216,143,${0.7 * (1 - ping) * f})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(home.x, home.y, 4 + ping * 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `rgba(160,240,175,${f})`;
      ctx.beginPath();
      ctx.arc(home.x, home.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      tag("CHAMPAIGN · NOW", home.x + 12, home.y, "left", `rgba(200,240,210,${0.9 * f})`, f);
    }
  };

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const t = (now - t0) / 1000;
    const intro = t < introEnd;
    if (!intro && !introDone) {
      introDone = true;
      opts.onIntroDone();
    }
    const galaxy = !opts.resume && (t < galaxyEnd || !ready);
    const p = Math.min(1, Math.max(0, (t - galaxyEnd) / Math.max(0.1, introEnd - galaxyEnd - 0.2)));
    const ease = p * p * (3 - 2 * p);
    const k = galaxy ? 0 : intro ? 0.006 + 0.034 * ease : 0.034;
    const swirl = galaxy ? 0 : intro ? 0.5 * (1 - ease) : 0;
    const damp = intro ? 0.9 : 0.86;

    if (shape === "frames" && ready) trace();
    const g = globeBox();
    if (!drag) {
      spin += (SPIN - spin) * 0.04;
      rot += spin;
    }
    const l0 = lon0();
    if (shape === "globe") {
      for (let i = 0; i < N; i++) {
        if (glat[i] !== glat[i]) {
          live[i * 2] = g.cx + Math.cos(glon[i] + t * 0.05) * (g.r + 2);
          live[i * 2 + 1] = g.cy + Math.sin(glon[i] + t * 0.05) * (g.r + 2);
          back[i] = 0;
          continue;
        }
        const q = project(glat[i], glon[i], l0, g);
        live[i * 2] = q.x;
        live[i * 2 + 1] = q.y;
        back[i] = q.z < 0 ? 1 : 0;
      }
    }
    if (snap && ready && shape === "globe") {
      snap = false;
      for (let i = 0; i < N; i++) {
        x[i] = live[i * 2];
        y[i] = live[i * 2 + 1];
      }
    }
    globeVis += ((shape === "globe" && ready && t > introEnd - 0.3 ? 1 : 0) - globeVis) * 0.05;

    const wantDim = (shape === "globe" || shape === "frames" || wide ? 1 : 0.4) * DIM[shape];
    dim += (wantDim - dim) * 0.06;

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = `rgba(7,11,20,${intro ? 0.2 : 0.38})`;
    ctx.fillRect(0, 0, vw, vh);

    const R2 = 80 * 80;
    // once formed, the globe's dots ride the surface exactly instead of springing after it
    globeHold = shape === "globe" && !intro ? Math.min(1, globeHold + 0.02) : 0;
    const cxs = vw / 2;
    const cys = vh / 2;
    const paths = [new Path2D(), new Path2D(), new Path2D(), new Path2D(), new Path2D()];
    const waving = shape === "hand" && ready;
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
        if (pick[i] < USE[shape]) {
          const sw = SWAY[shape] + 1.1;
          let gx = tx[i * 2];
          let gy = tx[i * 2 + 1];
          if (waving) {
            const p = pose(i, t);
            gx = p.x;
            gy = p.y;
            hz[i] = p.z;
          }
          // frames ride cards as the page scrolls; a stiff spring keeps them on the card instead of trailing
          const kk = waving ? k * 2.2 : shape === "frames" ? k * 3 : k;
          ax = (gx + Math.sin(t * 0.7 + phase[i]) * sw - x[i]) * kk * kmul[i];
          ay = (gy + Math.cos(t * 0.55 + phase[i]) * sw - y[i]) * kk * kmul[i];
        } else {
          // dust: a slow wander around a home spot anywhere on screen
          const hx = dustX[i] * vw + Math.sin(t * 0.15 + phase[i]) * 30;
          const hy = dustY[i] * vh + Math.cos(t * 0.12 + phase[i]) * 30;
          ax = (hx - x[i]) * k * 0.25;
          ay = (hy - y[i]) * k * 0.25;
        }
      }
      if (swirl > 0) {
        const dx = x[i] - cxs;
        const dy = y[i] - cys;
        const d = Math.sqrt(dx * dx + dy * dy) + 1;
        const f = (swirl * 260) / (d + 160);
        ax += (-dy / d) * f - (dx / d) * f * 0.18;
        ay += (dx / d) * f - (dy / d) * f * 0.18;
      }
      if (mouse.on && shape !== "globe" && shape !== "frames") {
        const dx = x[i] - mouse.x;
        const dy = y[i] - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < R2) {
          const d = Math.sqrt(d2) + 0.01;
          const f = (1 - d / 80) * 1.1;
          ax += (dx / d) * f;
          ay += (dy / d) * f;
        }
      }
      vx[i] = (vx[i] + ax) * damp;
      vy[i] = (vy[i] + ay) * damp;
      x[i] += vx[i];
      y[i] += vy[i];
      if (globeHold > 0) {
        x[i] += (tx[i * 2] - x[i]) * globeHold * 0.6;
        y[i] += (tx[i * 2 + 1] - y[i]) * globeHold * 0.6;
        vx[i] *= 1 - globeHold;
        vy[i] *= 1 - globeHold;
      }
      // speed lights a particle up, so swarms and shockwaves flare blue
      const sp = vx[i] * vx[i] + vy[i] * vy[i];
      const b = pick[i] >= USE[shape] ? 4 : (shape === "globe" && back[i]) || (waving && hz[i] < -0.08) ? 3 : sp > 6 ? 1 : bucket[i];
      const s = sp > 6 || (shape === "frames" && !wide) ? 2 : 1.5;
      paths[b].rect(x[i], y[i], s, s);
    }
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = COLORS[0] + 0.8 * dim + ")";
    ctx.fill(paths[0]);
    ctx.fillStyle = COLORS[1] + 0.9 * dim + ")";
    ctx.fill(paths[1]);
    ctx.fillStyle = COLORS[2] + 0.85 * dim + ")";
    ctx.fill(paths[2]);
    ctx.fillStyle = COLORS[0] + 0.13 * dim + ")";
    ctx.fill(paths[3]);
    ctx.fillStyle = COLORS[0] + 0.055 * dim + ")";
    ctx.fill(paths[4]);
    ctx.globalCompositeOperation = "source-over";
    if (globeVis > 0.01) drawRoute(t, g, l0);

    for (let j = shocks.length - 1; j >= 0; j--) {
      const sh = shocks[j];
      const age = t - sh.t;
      if (age > 0.9) {
        shocks.splice(j, 1);
        continue;
      }
      ctx.strokeStyle = `rgba(150,198,255,${0.5 * (1 - age / 0.9)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(sh.x, sh.y, 20 + age * 520, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const start = () => {
    cancelAnimationFrame(raf);
    if (running && !document.hidden) raf = requestAnimationFrame(frame);
  };
  const onVis = () => start();
  const onMove = (e: PointerEvent) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (drag) {
      // the surface under the cursor follows it
      const d = (e.clientX - drag.x) / globeBox().r;
      rot -= d;
      drag.v = -d;
      drag.x = e.clientX;
    }
    mouse.on = !drag;
    document.documentElement.style.cursor = drag ? "grabbing" : overGlobe(e.clientX, e.clientY) ? "grab" : "";
  };
  const onDown = (e: PointerEvent) => {
    if (!overGlobe(e.clientX, e.clientY) || (e.target as HTMLElement).closest("a,button,input,textarea,[data-chrome]")) return;
    drag = { x: e.clientX, v: 0 };
    mouse.on = false;
    document.documentElement.style.cursor = "grabbing";
  };
  const onUp = () => {
    if (!drag) return;
    if (Math.abs(drag.v) > 0.028) opts.onFlick();
    spin = Math.max(-0.035, Math.min(0.035, drag.v));
    drag = null;
    document.documentElement.style.cursor = "";
  };
  const onLeave = () => (mouse.on = false);

  let resizeTimer: ReturnType<typeof setTimeout>;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  };

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerdown", onDown);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);
  document.documentElement.addEventListener("pointerleave", onLeave);
  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", onVis);

  // The name can only be sampled once the display font has arrived. fonts.load() resolves at once
  // (with nothing) while the Google Fonts stylesheet is still in flight, so wait for the face to exist.
  let alive = true;
  let pollTimer: ReturnType<typeof setTimeout>;
  const fonts = (document as any).fonts;
  const fontLoaded = new Promise<void>((resolve) => {
    if (!fonts) return resolve();
    const poll = () => {
      const face = Array.from(fonts as Iterable<FontFace>).some((f) => f.family.replace(/"/g, "") === "Cormorant Garamond");
      if (face) fonts.load(`${WEIGHT} 100px ${FONT}`, "3.88").then(() => resolve(), () => resolve());
      else pollTimer = setTimeout(poll, 60);
    };
    poll();
  });
  const settle = () => {
    for (let i = 0; i < N; i++) {
      x[i] = tx[i * 2];
      y[i] = tx[i * 2 + 1];
      vx[i] = vy[i] = 0;
    }
  };
  Promise.race([fontLoaded, new Promise((r) => setTimeout(r, opts.resume ? 0 : 1500))]).then(() => {
    if (!alive) return;
    ready = true;
    opts.onGlobe(globeBox());
    aim();
    if (opts.reduce) settle();
  });
  // a font that arrives after the timeout still gets the shapes re-sampled in it
  fontLoaded.then(() => {
    if (!alive || !ready) return;
    cache = {};
    aim();
  });
  start();

  return {
    setShape(k: ShapeKey) {
      if (k === shape) return;
      shape = k;
      if (ready) aim();
    },
    // a press that grabs the globe shouldn't also fire a shockwave
    overGlobe,
    setRunning(on: boolean) {
      running = on;
      start();
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
      clearTimeout(pollTimer);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.documentElement.style.cursor = "";
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    },
  };
};

export type Field = ReturnType<typeof createField>;
