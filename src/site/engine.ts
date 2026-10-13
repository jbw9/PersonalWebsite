import { FieldOptions, FRAME_SELECTOR, GlobeBox, ShapeKey } from "./contracts";
import { LAND } from "./world";
export type { GlobeBox, ShapeKey };

const FONT = '"Cormorant Garamond"';
const WEIGHT = 500;

// How bright each formation sits beside the content; mobile dims further since text overlaps it
const DIM: Record<ShapeKey, number> = { globe: 1, cloud: 0.62, frames: 0.5, gpa: 0.6, people: 0.62, book: 0.6 };

// ── Globe ──
const RAD = Math.PI / 180;
const HOME_AT = { lat: 40.1164, lon: -88.2434 }; // Champaign, IL
const NEXT_AT = { lat: 47.6062, lon: -122.3321 }; // Seattle, WA
const TILT = 24 * RAD; // northern hemisphere leans toward the viewer
const land = (lat: number, lon: number) => {
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

export const createField = (
  canvas: HTMLCanvasElement,
  opts: FieldOptions
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
  const phase = new Float32Array(N);
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

  const region = () =>
    wide ? { x: vw * 0.6, y: vh * 0.2, w: vw * 0.34, h: vh * 0.56 } : { x: vw * 0.08, y: vh * 0.22, w: vw * 0.84, h: vh * 0.42 };
  // desktop: right of the hero text; phone: above it
  const globeBox = (): GlobeBox =>
    wide ? { cx: vw * 0.68, cy: vh * 0.43, r: Math.min(vh * 0.3, vw * 0.23) } : { cx: vw / 2, cy: vh * 0.27, r: Math.min(vw * 0.38, vh * 0.19) };
  // sways around North America so both cities stay on the near side
  const lon0 = (t: number) => (-100 + (opts.reduce ? 0 : 50 * Math.sin(t * 0.11))) * RAD;

  const build = (k: ShapeKey): Float32Array => {
    const R = region();
    const cx = R.x + R.w / 2;
    const cy = R.y + R.h / 2;
    if (k === "gpa")
      return sample(vw, vh, N, (c) => {
        const size = fitText(c, "3.90", R.w * 0.9, R.h * 0.62, 0.04);
        drawTracked(c, "3.90", cx, cy, size, 0.04);
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
    const spread = wide ? 1 : 0.35;
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
    const l0 = lon0(t);
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
    globeVis += ((shape === "globe" && ready && t > introEnd - 0.3 ? 1 : 0) - globeVis) * 0.05;

    const wantDim = (shape === "globe" || shape === "frames" || wide ? 1 : 0.4) * DIM[shape];
    dim += (wantDim - dim) * 0.06;

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = `rgba(7,11,20,${intro ? 0.2 : 0.38})`;
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
        ax = (tx[i * 2] + Math.sin(t * 1.3 + phase[i]) * 1.1 - x[i]) * k * kmul[i];
        ay = (tx[i * 2 + 1] + Math.cos(t * 1.1 + phase[i]) * 1.1 - y[i]) * k * kmul[i];
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
      // speed lights a particle up, so swarms and shockwaves flare blue
      const sp = vx[i] * vx[i] + vy[i] * vy[i];
      const b = shape === "globe" && back[i] ? 3 : sp > 6 ? 1 : bucket[i];
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

  // The name can only be sampled once the display font has arrived. fonts.load() resolves at once
  // (with nothing) while the Google Fonts stylesheet is still in flight, so wait for the face to exist.
  let alive = true;
  let pollTimer: ReturnType<typeof setTimeout>;
  const fonts = (document as any).fonts;
  const fontLoaded = new Promise<void>((resolve) => {
    if (!fonts) return resolve();
    const poll = () => {
      const face = Array.from(fonts as Iterable<FontFace>).some((f) => f.family.replace(/"/g, "") === "Cormorant Garamond");
      if (face) fonts.load(`${WEIGHT} 100px ${FONT}`, "3.90").then(() => resolve(), () => resolve());
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
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    },
  };
};

export type Field = ReturnType<typeof createField>;
