import * as THREE from "three";
import { land } from "../engine";
import { Milestone } from "../../data/journey";
import { GATES, NODES, START, Mark, geo } from "./chapters";

export type GameEvent =
  | { kind: "gate"; i: number; m: Milestone }
  | { kind: "stop"; m: Milestone; dip: boolean }
  | { kind: "finale"; secs: number; rings: number; ringsTotal: number };

// HUD elements the loop writes to directly every frame, so React never re-renders at 60fps
export interface Hud {
  marker: HTMLElement;
  dist: HTMLElement;
  boost: HTMLElement;
  vibe: HTMLElement;
}
export interface Input {
  x: number; // -1 left … 1 right
  y: number; // -1 dive … 1 climb
  boost: boolean;
}

const V = THREE.Vector3;
type V3 = THREE.Vector3;
const R = 80;
const RAD = Math.PI / 180;
const KM = 6371 / R;
const MIN_ALT = 2.6;
const MAX_ALT = 26;
const SPEED = 16;
const BOOST = 28;
const LOOP_R = 12;

const dir = (lat: number, lon: number) => {
  const a = lat * RAD;
  const b = lon * RAD;
  return new V(Math.cos(a) * Math.cos(b), Math.sin(a), -Math.cos(a) * Math.sin(b));
};
const dirAt = (seg: number, t: number) => {
  const g = geo(seg, t);
  return dir(g.lat, g.lon);
};
const smooth = (t: number) => t * t * (3 - 2 * t);
const flat = (v: V3, up: V3) => v.addScaledVector(up, -v.dot(up)).normalize();
const q3 = (x: number) => Math.round(x * 1000) / 1000;
const hash = (x: number, y: number, z: number) => {
  const s = Math.sin(q3(x) * 12.9898 + q3(y) * 78.233 + q3(z) * 37.719) * 43758.5453;
  return s - Math.floor(s);
};
const latLon = (n: V3) => [Math.asin(Math.max(-1, Math.min(1, n.y))) / RAD, Math.atan2(-n.z, n.x) / RAD];
// terrain height above sea level; quantised so the same corner shared by two faces gets the same value
const ground = (n: V3) => {
  const [la, lo] = latLon(new V(q3(n.x), q3(n.y), q3(n.z)));
  return land(la, lo) ? 0.5 + hash(n.x * R, n.y * R, n.z * R) * 0.9 : 0;
};

const m4 = new THREE.Matrix4();
// point an object's +Y along `up` and its nose (-Z) along `fwd`
const orient = (o: THREE.Object3D, up: V3, fwd: V3) => {
  const back = fwd.clone().addScaledVector(up, -fwd.dot(up)).normalize().negate();
  const right = new V().crossVectors(up, back);
  o.quaternion.setFromRotationMatrix(m4.makeBasis(right, up, back));
};
const anyFwd = (up: V3) => (Math.abs(up.y) < 0.9 ? new V(0, 1, 0) : new V(1, 0, 0));

const std = (color: string, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85, ...extra });
const add = (g: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  g.add(m);
  return m;
};
const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (a: number, b: number, h: number, s = 8) => new THREE.CylinderGeometry(a, b, h, s);
const ball = (r: number, s = 8) => new THREE.SphereGeometry(r, s, Math.max(4, s - 2));

const canvasSprite = (size: number, draw: (x: CanvasRenderingContext2D) => void) => {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  draw(c.getContext("2d") as CanvasRenderingContext2D);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false }));
  s.scale.set(size, size, 1);
  return s;
};
const emojiSprite = (emoji: string, size: number) =>
  canvasSprite(size, (x) => {
    x.font = "96px serif";
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillText(emoji, 64, 72);
  });
// a company logo on a rounded tile, loaded from /public
const logoSprite = (src: string, size: number) => {
  const s = canvasSprite(size, () => {});
  const tex = s.material.map as THREE.CanvasTexture;
  const img = new Image();
  img.onload = () => {
    const x = (tex.image as HTMLCanvasElement).getContext("2d") as CanvasRenderingContext2D;
    x.beginPath();
    x.moveTo(30, 4);
    x.arcTo(124, 4, 124, 124, 26);
    x.arcTo(124, 124, 4, 124, 26);
    x.arcTo(4, 124, 4, 4, 26);
    x.arcTo(4, 4, 124, 4, 26);
    x.clip();
    x.drawImage(img, 4, 4, 120, 120);
    tex.needsUpdate = true;
  };
  img.src = src;
  return s;
};
const glowTex = (() => {
  let t: THREE.Texture | null = null;
  return () => {
    if (t) return t;
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const x = c.getContext("2d") as CanvasRenderingContext2D;
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 64);
    return (t = new THREE.CanvasTexture(c));
  };
})();
const halo = (color: string, size: number) => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  s.scale.set(size, size, 1);
  return s;
};
const extrude = (shape: THREE.Shape, depth: number) => {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  g.translate(0, 0, -depth / 2);
  return g;
};

// things that move every frame: the flag waves, the heart turns
type Tick = (t: number) => void;

// ── Monuments: small dioramas built from primitives, ~4–9 units tall, front facing +Z ──
const monument = (mark: Mark, ticks: Tick[]) => {
  const g = new THREE.Group();
  if (mark === "flag") {
    add(g, cyl(0.09, 0.12, 8, 6), std("#c9d1de", { metalness: 0.5, roughness: 0.4 }), 0, 4, 0);
    add(g, ball(0.18), std("#e8c15a"), 0, 8.1, 0);
    const cloth = new THREE.PlaneGeometry(3.4, 2.2, 16, 1);
    cloth.translate(1.7, 0, 0);
    const c = document.createElement("canvas");
    c.width = 4;
    c.height = 2;
    const x = c.getContext("2d") as CanvasRenderingContext2D;
    x.fillStyle = "#e8112d";
    x.fillRect(0, 0, 4, 1);
    x.fillStyle = "#ffffff";
    x.fillRect(0, 1, 4, 1);
    const tex = new THREE.CanvasTexture(c);
    tex.magFilter = THREE.NearestFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    const f = add(g, cloth, new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.8 }), 0.1, 6.8, 0);
    const p = cloth.getAttribute("position") as THREE.BufferAttribute;
    const base = Float32Array.from(p.array as Float32Array);
    ticks.push((t) => {
      for (let i = 0; i < p.count; i++) {
        const u = base[i * 3];
        p.setZ(i, Math.sin(u * 1.6 - t * 4) * 0.22 * (u / 3.4));
      }
      p.needsUpdate = true;
      f.geometry.computeVertexNormals();
    });
  } else if (mark === "gedungsate") {
    // Bandung's Gedung Sate: long white hall, tiered roof, and the six-"sate" spire
    const white = std("#f2efe6");
    const dark = std("#4a4650");
    add(g, box(6.4, 1.9, 2.2), white, 0, 0.95, 0);
    for (let i = -5; i <= 5; i++) if (Math.abs(i) > 1) add(g, box(0.32, 0.6, 0.05), dark, i * 0.55, 1.05, 1.12);
    add(g, box(2.2, 1.4, 2), white, 0, 2.6, 0);
    const t1 = add(g, cyl(0.95, 1.6, 0.7, 4), dark, 0, 3.65, 0);
    t1.rotation.y = Math.PI / 4;
    const t2 = add(g, cyl(0.45, 0.95, 0.6, 4), dark, 0, 4.3, 0);
    t2.rotation.y = Math.PI / 4;
    add(g, cyl(0.05, 0.05, 2, 4), dark, 0, 5.5, 0);
    for (let k = 0; k < 6; k++) add(g, ball(0.15, 6), std("#c9a24a"), 0, 4.8 + k * 0.26, 0);
  } else if (mark === "blocki") {
    // the UIUC Block I: orange, outlined in navy
    const s = new THREE.Shape();
    ([[-1.5, 0], [1.5, 0], [1.5, 0.9], [0.62, 0.9], [0.62, 3.1], [1.5, 3.1], [1.5, 4], [-1.5, 4], [-1.5, 3.1], [-0.62, 3.1], [-0.62, 0.9], [-1.5, 0.9]] as const).forEach(
      ([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))
    );
    s.closePath();
    add(g, extrude(s, 0.6), std("#ff5f05", { emissive: "#ff5f05", emissiveIntensity: 0.15 }), 0, 0.5, 0);
    const back = add(g, extrude(s, 0.5), std("#13294b"), 0, 0.2, -0.15);
    back.scale.set(1.16, 1.15, 1);
  } else if (mark === "bank") {
    const stone = std("#e9e4d6");
    add(g, box(3.6, 0.35, 2.6), stone, 0, 0.18, 0);
    for (let i = 0; i < 5; i++) [0.85, -0.85].forEach((z) => add(g, cyl(0.17, 0.17, 2, 7), stone, -1.4 + i * 0.7, 1.35, z));
    add(g, box(3.8, 0.3, 2.8), stone, 0, 2.5, 0);
    const roof = add(g, cyl(1, 1, 2.8, 3), stone, 0, 3.03, 0);
    roof.rotation.x = -Math.PI / 2;
    roof.scale.set(2.2, 1, 0.75);
  } else if (mark === "tulip") {
    const green = std("#3f8f5a");
    const petal = std("#f07a2c", { emissive: "#7a2a00", emissiveIntensity: 0.25 });
    add(g, cyl(0.09, 0.11, 2.6, 6), green, 0, 1.3, 0);
    const leaf = add(g, ball(1), green, 0.4, 0.9, 0);
    leaf.scale.set(0.25, 0.9, 0.08);
    leaf.rotation.z = -0.6;
    add(g, ball(0.55), petal, 0, 2.8, 0);
    ([[-0.36, 0.38], [0.36, -0.38], [0, 0]] as const).forEach(([x, r], k) => {
      const p = add(g, ball(1), petal, x, 3.1 + (k === 2 ? 0.12 : 0), k === 2 ? 0.18 : 0);
      p.scale.set(0.42, 0.85, 0.36);
      p.rotation.z = r;
    });
    g.scale.setScalar(1.4);
  } else if (mark === "hand") {
    // ASL "I love you": thumb, index and pinky out
    const skin = std("#f1c27d");
    add(g, box(1.1, 1, 0.5), skin, 0, 0.5, 0);
    add(g, box(1.6, 1.6, 0.55), skin, 0, 1.75, 0);
    add(g, box(0.38, 1.7, 0.44), skin, -0.58, 3.4, 0);
    add(g, box(0.36, 0.5, 0.62), skin, -0.18, 2.62, 0.12);
    add(g, box(0.36, 0.5, 0.62), skin, 0.2, 2.62, 0.12);
    add(g, box(0.3, 1.3, 0.38), skin, 0.62, 3.2, 0);
    const thumb = add(g, box(0.38, 1.3, 0.46), skin, -1.15, 2.05, 0);
    thumb.rotation.z = 0.9;
    g.scale.setScalar(1.4);
  } else if (mark === "mbs") {
    // Singapore's Marina Bay Sands: three towers, the SkyPark laid across the top
    const tower = std("#dfe3e8", { roughness: 0.4, metalness: 0.3 });
    for (const x of [-1.6, 0, 1.6]) add(g, box(0.9, 6.5, 1.1), tower, x, 3.25, 0);
    const park = add(g, box(5.2, 0.4, 1.3), std("#f2efe6"), 0.4, 6.7, 0);
    park.rotation.z = 0.03;
    add(g, box(1.6, 0.12, 0.9), std("#5ec8e8", { emissive: "#2a9fc4", emissiveIntensity: 0.5 }), 1.6, 6.95, 0);
  } else if (mark === "card") {
    const card = new THREE.Group();
    card.position.y = 1.8;
    card.rotation.set(0, 0.4, 0.12);
    g.add(card);
    add(card, box(3.2, 2, 0.12), std("#2d7ff9", { roughness: 0.35, metalness: 0.2 }));
    add(card, box(0.55, 0.42, 0.14), std("#e8c15a", { metalness: 0.6, roughness: 0.3 }), -0.95, 0.2, 0);
    const dots = new THREE.MeshBasicMaterial({ color: "#dbe8ff" });
    for (let k = 0; k < 4; k++) add(card, box(0.5, 0.1, 0.14), dots, -1.05 + k * 0.7, -0.4, 0);
  } else if (mark === "guitar") {
    const gt = new THREE.Group();
    gt.rotation.z = 0.3;
    gt.position.y = 0.4;
    g.add(gt);
    const wood = std("#c2622d", { roughness: 0.5 });
    const neck = std("#5a3a22");
    const lo = add(gt, ball(1, 14), wood, 0, 1.2, 0);
    lo.scale.set(1, 1, 0.35);
    const hi = add(gt, ball(0.75, 14), wood, 0, 2.3, 0);
    hi.scale.set(1, 1, 0.35);
    const hole = add(gt, cyl(0.28, 0.28, 0.1, 16), new THREE.MeshBasicMaterial({ color: "#1a0f08" }), 0, 1.75, 0.3);
    hole.rotation.x = Math.PI / 2;
    add(gt, box(0.3, 2.5, 0.16), neck, 0, 4.1, 0);
    add(gt, box(0.48, 0.65, 0.18), neck, 0, 5.6, 0);
  } else {
    // Seattle: the Space Needle, and the AWS cloud with its smile
    const white = std("#dfe6f0", { roughness: 0.5 });
    add(g, cyl(0.12, 0.38, 3.6, 8), white, 0, 1.8, 0);
    add(g, cyl(1.1, 0.7, 0.35, 16), white, 0, 3.7, 0);
    add(g, cyl(0.7, 0.9, 0.22, 16), std("#ffb347", { emissive: "#ff9900", emissiveIntensity: 0.5 }), 0, 3.98, 0);
    add(g, cyl(0.04, 0.04, 0.9, 4), white, 0, 4.5, 0);
    const puff = std("#ffffff", { emissive: "#ff9900", emissiveIntensity: 0.12 });
    ([[2.2, 3, 0.7], [2.9, 3.2, 0.85], [3.6, 3, 0.6]] as const).forEach(([x, y, r]) => add(g, ball(r), puff, x, y, 0));
    const smile = add(g, new THREE.TorusGeometry(1.1, 0.13, 8, 24, Math.PI * 0.75), std("#ff9900", { emissive: "#ff9900", emissiveIntensity: 0.5 }), 2.9, 2.2, 0.3);
    smile.rotation.z = Math.PI * 1.125;
    g.scale.setScalar(1.3);
  }
  return g;
};

// a floating island carrying one or two monuments, with their logo floating above
const island = (marks: Mark[], logo: string | undefined, ticks: Tick[]) => {
  const g = new THREE.Group();
  const k = marks.length > 1 ? 1.7 : 1.25;
  const top = add(g, cyl(3.6, 3.3, 0.5, 8), std("#4f9a5e"), 0, -0.25, 0);
  top.scale.set(k, 1, k);
  const rock = add(g, new THREE.ConeGeometry(3.3, 3.2, 8), std("#6b5a4a"), 0, -2.1, 0);
  rock.rotation.x = Math.PI;
  rock.scale.set(k, 1, k);
  marks.forEach((m, i) => {
    const o = monument(m, ticks);
    o.position.x = (i - (marks.length - 1) / 2) * 4.6;
    g.add(o);
  });
  if (logo) {
    const s = logoSprite(logo, 4.2);
    s.position.y = 12;
    g.add(s);
  }
  return g;
};

const paperPlane = () => {
  const P = { nose: [0, 0, -1.6], l: [-1.2, 0.18, 1], r: [1.2, 0.18, 1], c: [0, 0, 1], k: [0, -0.38, 1] };
  const tris = [P.nose, P.l, P.c, P.nose, P.c, P.r, P.nose, P.k, P.c].flat();
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(tris, 3));
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, std("#f4f7fc", { side: THREE.DoubleSide, emissive: "#3a4a6a", emissiveIntensity: 0.35 }));
};

// ── The route as dense samples (~1 unit apart): every milestone in order, height = vibe, and a full
// U-turn loop at every rough patch ──
type Sample = { p: V3; up: V3; alt: number; leg: number };
type Ev = { idx: number; kind: "gate" | "win" | "dip"; m: Milestone; gate?: number };
const buildRoute = () => {
  const S: Sample[] = [];
  const evs: Ev[] = [];
  const push = (up: V3, alt: number, leg: number) => S.push({ up, alt, leg, p: up.clone().multiplyScalar(R + alt) });
  let leg = 0;
  NODES.forEach((n, i) => {
    if (!i) return push(dirAt(0, 0), n.alt, 0);
    const a = NODES[i - 1];
    const t0 = a.seg === n.seg ? a.t : 0;
    let len = 0;
    for (let k = 0; k < 40; k++) len += dirAt(n.seg, t0 + ((n.t - t0) * k) / 40).distanceTo(dirAt(n.seg, t0 + ((n.t - t0) * (k + 1)) / 40));
    const steps = Math.max(2, Math.ceil(len * (R + (a.alt + n.alt) / 2)));
    for (let k = 1; k <= steps; k++) {
      const u = k / steps;
      push(dirAt(n.seg, t0 + (n.t - t0) * u), a.alt + (n.alt - a.alt) * smooth(u), leg);
    }
    const at = S.length - 1;
    const m = n.m as Milestone;
    if (n.kind === "dip") {
      // hit the bump: dip lower, swing left all the way round, and carry on the same way
      const P = S[at].up;
      const T = flat(P.clone().sub(S[at - 1].up), P);
      const L = new V().crossVectors(P, T);
      const steps2 = Math.ceil(2 * Math.PI * LOOP_R);
      for (let k = 1; k <= steps2; k++) {
        const f = (2 * Math.PI * k) / steps2;
        const off = T.clone().multiplyScalar(LOOP_R * Math.sin(f)).addScaledVector(L, LOOP_R * (1 - Math.cos(f)));
        push(P.clone().multiplyScalar(R + n.alt).add(off).normalize(), Math.max(MIN_ALT + 1, n.alt - 3 * Math.sin(f / 2)), leg);
      }
      evs.push({ idx: at + Math.round(steps2 * 0.45), kind: "dip", m });
    } else if (n.kind === "gate") {
      evs.push({ idx: at, kind: "gate", m, gate: n.gate });
      leg++;
    } else evs.push({ idx: at, kind: "win", m });
  });
  return { S, evs };
};

export const createGame = (canvas: HTMLCanvasElement, hud: Hud, emit: (e: GameEvent) => void) => {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#070b14");
  scene.fog = new THREE.Fog("#070b14", 120, 340);
  const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 2500);
  const resize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  };
  resize();
  const ticks: Tick[] = [];

  scene.add(new THREE.HemisphereLight("#bcd7ff", "#0b1a33", 0.9));
  const sun = new THREE.DirectionalLight("#fff4e0", 1.7);
  sun.position.set(120, 80, 60);
  scene.add(sun);

  // ── Planet: low-poly Earth from the same land mask as the hero globe ──
  const geo = new THREE.IcosahedronGeometry(R, 56);
  const pos = geo.getAttribute("position") as THREE.BufferAttribute;
  const col = new Float32Array(pos.count * 3);
  const n = new V();
  const tint = new THREE.Color();
  const palette = {
    deep: ["#0f2b52", "#123360", "#0d264a"],
    shallow: "#2a6aa8",
    grass: ["#3f8f5a", "#4c9f63", "#5aa86b", "#467f4a"],
    sand: "#d9c38c",
    snow: "#e3ebf5",
  };
  for (let f = 0; f < pos.count; f += 3) {
    const hs: number[] = [];
    const c = new V();
    for (let k = 0; k < 3; k++) {
      n.fromBufferAttribute(pos, f + k).normalize();
      c.add(n);
      const h = ground(n);
      hs.push(h);
      pos.setXYZ(f + k, n.x * (R + h), n.y * (R + h), n.z * (R + h));
    }
    c.normalize();
    const [la] = latLon(c);
    const r = hash(c.x * 99, c.y * 99, c.z * 99);
    const lands = hs.filter((h) => h > 0).length;
    if (lands === 3) tint.set(Math.abs(la) > 62 ? palette.snow : palette.grass[(r * 4) | 0]);
    else if (lands) tint.set(lands === 2 ? palette.sand : palette.shallow);
    else tint.set(palette.deep[(r * 3) | 0]);
    for (let k = 0; k < 3; k++) tint.toArray(col, (f + k) * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  geo.computeVertexNormals();
  scene.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 })));

  // atmosphere: a fresnel rim, additive
  scene.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.1, 64, 48),
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `varying vec3 vN; varying vec3 vV;
          void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
        fragmentShader: `varying vec3 vN; varying vec3 vV;
          void main(){ float f = pow(1.0-abs(dot(vN,vV)), 3.0); gl_FragColor = vec4(0.36,0.61,1.0, f*0.75); }`,
      })
    )
  );

  // trees on land
  const treeGeo = new THREE.ConeGeometry(0.32, 1.2, 5);
  treeGeo.translate(0, 0.6, 0);
  const trees = new THREE.InstancedMesh(treeGeo, std("#2f6b45"), 1400);
  const dummy = new THREE.Object3D();
  let placed = 0;
  for (let tries = 0; placed < 1400 && tries < 30000; tries++) {
    const p = new V(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
    if (p.lengthSq() > 1 || p.lengthSq() < 0.01) continue;
    p.normalize();
    const [la, lo] = latLon(p);
    if (!land(la, lo) || Math.abs(la) > 60) continue;
    dummy.position.copy(p).multiplyScalar(R + 0.45);
    orient(dummy, p, anyFwd(p));
    dummy.scale.setScalar(0.7 + Math.random() * 0.8);
    dummy.updateMatrix();
    trees.setMatrixAt(placed++, dummy.matrix);
  }
  trees.count = placed;
  scene.add(trees);

  // drifting clouds above the route
  const clouds = new THREE.Group();
  const puff = std("#ffffff", { transparent: true, opacity: 0.9, emissive: "#8fa6c8", emissiveIntensity: 0.55 });
  for (let i = 0; i < 60; i++) {
    const up = new V(Math.random() * 2 - 1, Math.random() * 1.6 - 0.8, Math.random() * 2 - 1).normalize();
    const c = new THREE.Group();
    for (let k = 0; k < 4; k++) add(c, new THREE.IcosahedronGeometry(1 + Math.random() * 1.2, 0), puff, (k - 1.5) * 1.4, Math.random() * 0.6, Math.random() - 0.5);
    c.position.copy(up).multiplyScalar(R + 28 + Math.random() * 6);
    orient(c, up, anyFwd(up));
    clouds.add(c);
  }
  scene.add(clouds);

  const starGeo = new THREE.BufferGeometry();
  const sp = new Float32Array(2400 * 3);
  for (let i = 0; i < 2400; i++) new V(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize().multiplyScalar(900 + Math.random() * 300).toArray(sp, i * 3);
  starGeo.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: "#c9d6ee", size: 1.6, sizeAttenuation: false, fog: false })));

  // ── The route ──
  const { S, evs } = buildRoute();
  const tangent = (i: number) => flat(S[Math.min(S.length - 1, i + 1)].p.clone().sub(S[Math.max(0, i - 1)].p), S[i].up);
  const gateIdx = evs.filter((e) => e.kind === "gate").map((e) => e.idx);

  // the glowing path itself: done legs green, the current one bright, later ones faint
  const tubeSegs = S.length;
  const tube = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(S.map((s) => s.p)), tubeSegs, 0.24, 5, false);
  const tubeCol = new Float32Array((tube.getAttribute("position") as THREE.BufferAttribute).count * 3);
  tube.setAttribute("color", new THREE.BufferAttribute(tubeCol, 3));
  scene.add(new THREE.Mesh(tube, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })));
  const C = { done: new THREE.Color("#4ade80"), now: new THREE.Color("#8ab8ff"), later: new THREE.Color("#5b9cff").multiplyScalar(0.22) };
  // only what's been reached and the next stop are shown, so the way ahead never looks crowded
  const reveal = (upTo: number) => gates.forEach((g, i) => (g.ring.visible = g.isl.visible = i <= upTo));
  const paint = (leg: number, greenUpTo = -1) => {
    for (let v = 0; v < tubeCol.length / 3; v++) {
      const i = Math.min(S.length - 1, Math.round((Math.floor(v / 6) * (S.length - 1)) / tubeSegs));
      const c = i <= greenUpTo || S[i].leg < leg ? C.done : S[i].leg === leg ? C.now : C.later;
      c.toArray(tubeCol, v * 3);
    }
    tube.getAttribute("color").needsUpdate = true;
  };

  // gates, their islands beside the path, and a light pillar over the next one
  const gates = gateIdx.map((idx, g) => {
    const s = S[idx];
    const T = tangent(idx);
    const ring = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color: "#5b9cff" });
    ring.add(new THREE.Mesh(new THREE.TorusGeometry(4.6, 0.32, 12, 56), mat));
    ring.add(halo("#5b9cff", 9));
    const em = emojiSprite(evs.find((e) => e.idx === idx)?.m.emoji || "", 3.4);
    em.position.y = 6.4;
    ring.add(em);
    ring.position.copy(s.p);
    orient(ring, s.up, T);
    scene.add(ring);
    const side = g % 2 ? 1 : -1;
    const L = new V().crossVectors(s.up, T);
    const isl = island(GATES[g].marks, GATES[g].logo, ticks);
    const iu = s.up.clone().multiplyScalar(R).addScaledVector(L, 13 * side).normalize();
    isl.position.copy(iu).multiplyScalar(R + Math.max(4, s.alt - 3));
    // the monuments' fronts face the path
    orient(isl, iu, L.clone().multiplyScalar(side));
    scene.add(isl);
    return { idx, ring, mat, isl, side, L };
  });
  const startIsl = island(START.marks, undefined, ticks);
  {
    const T = tangent(0);
    const L = new V().crossVectors(S[0].up, T);
    const iu = S[0].up.clone().multiplyScalar(R).addScaledVector(L, -12).addScaledVector(T, 6).normalize();
    startIsl.position.copy(iu).multiplyScalar(R + 4);
    orient(startIsl, iu, L.clone().negate());
    scene.add(startIsl);
  }
  const beacon = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 1.6, 90, 16, 1, true),
    new THREE.MeshBasicMaterial({ color: "#5b9cff", transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
  );
  scene.add(beacon);
  const placeBeacon = (g: number) => {
    const s = S[gates[g].idx];
    beacon.position.copy(s.up).multiplyScalar(R + 45);
    orient(beacon, s.up, anyFwd(s.up));
  };

  // rings along the path, and the moments in between: orbs for wins, storms for rough patches
  const ringGeo = new THREE.TorusGeometry(1.5, 0.14, 8, 28);
  const ringMat = new THREE.MeshBasicMaterial({ color: "#bcd7ff" });
  const stormMat = std("#3a4459", { emissive: "#9fb6ff", emissiveIntensity: 0 });
  type Item = { at: V3; obj: THREE.Object3D; done: boolean; leg: number };
  const rings: Item[] = [];
  for (let i = 10; i < S.length - 10; i += 10) {
    if (evs.some((e) => Math.abs(e.idx - i) < (e.kind === "gate" ? 14 : 6))) continue;
    const m = new THREE.Mesh(ringGeo, ringMat);
    m.position.copy(S[i].p);
    orient(m, S[i].up, tangent(i));
    scene.add(m);
    rings.push({ at: m.position, obj: m, done: false, leg: S[i].leg });
  }
  evs.forEach((e) => {
    if (e.kind === "gate") return;
    const g = new THREE.Group();
    if (e.kind === "dip") {
      for (let j = 0; j < 7; j++) add(g, ball(1.5 + Math.random(), 6), stormMat, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 2 + 2.5, (Math.random() - 0.5) * 5);
    } else {
      add(g, ball(0.8, 12), new THREE.MeshBasicMaterial({ color: "#ffd479" }));
      g.add(halo("#ffb347", 6));
    }
    const em = emojiSprite(e.m.emoji, 3);
    em.position.y = e.kind === "dip" ? 6 : 2.4;
    g.add(em);
    g.position.copy(S[e.idx].p);
    orient(g, S[e.idx].up, anyFwd(S[e.idx].up));
    scene.add(g);
  });
  const ringsTotal = rings.length;

  // ── The plane ──
  const planeRoot = new THREE.Group();
  const plane = paperPlane();
  planeRoot.add(plane);
  scene.add(planeRoot);
  const TRAIL = 60;
  const trailPos = new Float32Array(TRAIL * 3);
  const trailCol = new Float32Array(TRAIL * 3);
  for (let i = 0; i < TRAIL; i++) new THREE.Color("#bcd7ff").multiplyScalar(1 - i / TRAIL).toArray(trailCol, i * 3);
  const trailGeo = new THREE.BufferGeometry();
  trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPos, 3));
  trailGeo.setAttribute("color", new THREE.BufferAttribute(trailCol, 3));
  const trail = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ vertexColors: true, blending: THREE.AdditiveBlending, transparent: true }));
  trail.frustumCulled = false;
  scene.add(trail);

  // ── State ──
  type Phase = "title" | "fly" | "paused" | "landing" | "done";
  let phase: Phase = "title";
  const up = new V();
  const fwd = new V();
  let alt = 0;
  let speed = SPEED;
  let yaw = 0;
  let climb = 0;
  let energy = 1;
  let leg = 0;
  let prog = 0; // furthest route sample reached
  let ev = 0; // next event to fire
  let got = 0;
  let rough = 0;
  let shake = 0;
  let endT = 0;
  let startT = 0;
  let orbit = 0;
  let pausedAt = 0;
  const input: Input = { x: 0, y: 0, boost: false };
  const keys = new Set<string>();

  const reset = () => {
    phase = "title";
    up.copy(S[0].up);
    fwd.copy(tangent(0));
    alt = S[0].alt;
    speed = SPEED;
    yaw = climb = 0;
    energy = 1;
    leg = prog = ev = got = 0;
    rough = shake = endT = 0;
    gates.forEach((g) => g.mat.color.set("#5b9cff"));
    rings.forEach((r) => (r.done = false));
    paint(0);
    reveal(0);
    placeBeacon(0);
    beacon.visible = true;
    const p = up.clone().multiplyScalar(R + alt);
    for (let i = 0; i < TRAIL; i++) p.toArray(trailPos, i * 3);
    camera.position.copy(up).multiplyScalar(R + 60).addScaledVector(fwd, -50);
    camera.up.copy(up);
  };
  reset();

  const onKey = (e: KeyboardEvent, down: boolean) => {
    const k = e.key.toLowerCase();
    if (["arrowleft", "arrowright", "arrowup", "arrowdown", " ", "a", "d", "w", "s", "shift"].includes(k)) {
      e.preventDefault();
      if (down) keys.add(k);
      else keys.delete(k);
    }
  };
  const kd = (e: KeyboardEvent) => onKey(e, true);
  const ku = (e: KeyboardEvent) => onKey(e, false);
  window.addEventListener("keydown", kd);
  window.addEventListener("keyup", ku);
  window.addEventListener("resize", resize);

  const camPos = new V();
  const look = new V();
  const tmp = new V();
  let raf = 0;
  let last = performance.now();
  let clock = 0;

  const step = (now: number) => {
    raf = requestAnimationFrame(step);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    clock += dt;
    clouds.rotation.y += dt * 0.006;
    ticks.forEach((f) => f(clock));

    // ── controls: yours when you steer, a gentle autopilot along the path when you let go ──
    const kx = (keys.has("arrowright") || keys.has("d") ? 1 : 0) - (keys.has("arrowleft") || keys.has("a") ? 1 : 0);
    const ky = (keys.has("arrowup") || keys.has("w") ? 1 : 0) - (keys.has("arrowdown") || keys.has("s") ? 1 : 0);
    let ix = kx || input.x;
    let iy = ky || input.y;
    const flying = phase === "fly" || phase === "landing";
    if (phase === "fly") {
      const ahead = S[Math.min(S.length - 1, prog + 14)];
      const d = flat(ahead.p.clone().sub(planeRoot.position), up);
      const err = Math.atan2(tmp.crossVectors(fwd, d).dot(up), fwd.dot(d));
      if (Math.abs(ix) < 0.1) ix = Math.max(-1, Math.min(1, -err * 2.4));
      if (Math.abs(iy) < 0.1) iy = Math.max(-1, Math.min(1, (ahead.alt - alt) / 3));
    } else if (phase === "landing") {
      ix = 0.5;
      iy = (8 - alt) / 4;
    } else ix = iy = 0;
    const boosting = (keys.has(" ") || keys.has("shift") || input.boost) && energy > 0.02 && phase === "fly";
    yaw += (ix * 1.7 - yaw) * Math.min(1, dt * 5);
    climb += (iy - climb) * Math.min(1, dt * 5);
    if (flying) energy = Math.min(1, Math.max(0, energy + (boosting ? -0.35 : 0.1) * dt));
    const want = phase === "landing" ? 9 : phase === "fly" ? (boosting ? BOOST : SPEED) * (rough > 0 ? 0.55 : 1) : 0;
    speed += (want - speed) * Math.min(1, dt * 2.5);
    rough = Math.max(0, rough - dt);

    if (flying) {
      fwd.applyAxisAngle(up, -yaw * dt);
      alt = Math.min(MAX_ALT, Math.max(MIN_ALT, alt + climb * 10 * dt));
      const dist = speed * dt;
      const axis = new V().crossVectors(up, fwd).normalize();
      const ang = dist / (R + alt);
      up.applyAxisAngle(axis, ang).normalize();
      fwd.applyAxisAngle(axis, ang);
      flat(fwd, up);
    }
    planeRoot.position.copy(up).multiplyScalar(R + alt);
    orient(planeRoot, up, fwd);
    plane.rotation.z = -yaw * 0.45 + (rough > 0 ? Math.sin(clock * 40) * 0.12 : 0);
    plane.rotation.x = climb * 0.35;
    plane.position.y = Math.sin(clock * 2) * 0.12;
    if (flying || phase === "title") {
      trailPos.copyWithin(3, 0, (TRAIL - 1) * 3);
      tmp.set(0, 0, 1).applyQuaternion(planeRoot.quaternion).add(planeRoot.position).toArray(trailPos, 0);
      trailGeo.attributes.position.needsUpdate = true;
    }

    // ── progress along the route; events fire in order as you pass them ──
    if (phase === "fly") {
      let best = prog;
      let bd = Infinity;
      for (let i = Math.max(0, prog - 10); i < Math.min(S.length, prog + 90); i++) {
        const d = S[i].p.distanceToSquared(planeRoot.position);
        if (d < bd) {
          bd = d;
          best = i;
        }
      }
      if (bd < 18 * 18) prog = Math.max(prog, best);
      rings.forEach((r) => {
        if (r.done || r.leg !== leg || r.at.distanceToSquared(planeRoot.position) > 3.6 * 3.6) return;
        r.done = true;
        got++;
        energy = Math.min(1, energy + 0.3);
      });
      while (ev < evs.length && prog >= evs[ev].idx - 1) {
        const e = evs[ev++];
        if (e.kind === "gate") {
          const g = e.gate as number;
          gates[g].mat.color.set("#4ade80");
          leg = g + 1;
          paint(leg);
          reveal(leg);
          emit({ kind: "gate", i: g, m: e.m });
          phase = "paused";
          pausedAt = clock;
          orbit = 0;
          if (g < gates.length - 1) placeBeacon(g + 1);
          else beacon.visible = false;
          break;
        }
        if (e.kind === "dip") {
          rough = 1.6;
          shake = 1;
        }
        emit({ kind: "stop", m: e.m, dip: e.kind === "dip" });
      }
    }
    if (phase === "landing" && clock - endT > 2.4) {
      phase = "done";
      emit({ kind: "finale", secs: Math.round(endT - startT), rings: got, ringsTotal });
    }
    if (phase === "done") paint(gates.length, Math.floor(Math.min(1, (clock - endT - 2.4) / 3) * S.length));
    stormMat.emissiveIntensity = Math.random() < 0.02 ? 1.4 : stormMat.emissiveIntensity * 0.85;
    if (leg < gates.length) gates[leg].ring.scale.setScalar(1 + Math.sin(clock * 3) * 0.06);
    beacon.material.opacity = 0.12 + Math.sin(clock * 2.5) * 0.05;

    // ── camera ──
    if (phase === "paused") {
      // swing slowly around the chapter's monuments from the path side, clear of the gate itself
      const g = gates[leg - 1];
      orbit += dt;
      const iu = tmp.copy(g.isl.position).normalize();
      camPos.copy(g.L).multiplyScalar(-g.side * 26).applyAxisAngle(iu, g.side * (1.35 + Math.sin(orbit * 0.3) * 0.25)).add(g.isl.position).addScaledVector(iu, 9);
      look.copy(g.isl.position).addScaledVector(iu, 1.5);
      camera.up.lerp(iu, Math.min(1, dt * 3));
    } else if (phase === "done") {
      orbit += dt * 0.08;
      const seattle = S[S.length - 1].up;
      camPos.copy(seattle).multiplyScalar(R * 2.9).applyAxisAngle(new V(0, 1, 0), orbit - 0.5);
      look.set(0, 0, 0);
      camera.up.lerp(new V(0, 1, 0), Math.min(1, dt * 2));
    } else if (phase === "title") {
      orbit += dt * 0.12;
      camPos.copy(up).multiplyScalar(R + 22).addScaledVector(fwd, -30).applyAxisAngle(up, Math.sin(orbit) * 0.35);
      look.copy(planeRoot.position).lerp(startIsl.position, 0.4);
      camera.up.lerp(up, Math.min(1, dt * 3));
    } else {
      camPos.copy(planeRoot.position).addScaledVector(fwd, -13).addScaledVector(up, 5.5 + climb * 1.5);
      look.copy(planeRoot.position).addScaledVector(fwd, 8).addScaledVector(up, 1);
      camera.up.lerp(up, Math.min(1, dt * 6));
    }
    camera.position.lerp(camPos, Math.min(1, dt * (phase === "fly" ? 4 : 1.6)));
    shake = Math.max(0, shake - dt * 1.2);
    if (shake) camera.position.add(tmp.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(shake * 0.8));
    camera.lookAt(look);
    camera.fov += ((boosting ? 74 : 62) - camera.fov) * Math.min(1, dt * 3);
    camera.updateProjectionMatrix();
    // a ring sweeping through the lens would blank the screen
    rings.forEach((r) => (r.obj.visible = !r.done && r.leg === leg && phase !== "done" && camera.position.distanceToSquared(r.at) > 16));

    // ── HUD: the next gate, on screen or pinned to the edge pointing at it; the vibe altimeter ──
    if (phase === "fly" && leg < gates.length) {
      const target = gates[leg].ring.position;
      const cp = target.clone().applyMatrix4(camera.matrixWorldInverse);
      const e = camera.projectionMatrix.elements;
      const behind = cp.z >= 0;
      let x = behind ? cp.x : (cp.x / -cp.z) * e[0];
      let y = behind ? cp.y : (cp.y / -cp.z) * e[5];
      const off = behind || Math.abs(x) > 0.9 || Math.abs(y) > 0.75;
      if (off) {
        const k = Math.min(0.9 / Math.abs(x || 1e-6), 0.75 / Math.abs(y || 1e-6));
        x *= k;
        y *= k;
      }
      hud.marker.style.opacity = "1";
      hud.marker.style.transform = `translate(${((x + 1) / 2) * window.innerWidth}px, ${((1 - y) / 2) * window.innerHeight}px)`;
      hud.marker.dataset.off = off ? "1" : "";
      hud.marker.style.setProperty("--a", `${Math.atan2(-y, x)}rad`);
      // distance along the path, not as the crow flies: loops count
      let left = 0;
      for (let i = prog; i < gates[leg].idx; i += 4) left += S[i].p.distanceTo(S[Math.min(S.length - 1, i + 4)].p);
      hud.dist.textContent = `${(Math.round((left * KM * (R / (R + 12))) / 10) * 10).toLocaleString()} km`;
    } else hud.marker.style.opacity = "0";
    hud.boost.style.transform = `scaleX(${energy})`;
    hud.vibe.style.bottom = `${((alt - MIN_ALT) / (MAX_ALT - MIN_ALT)) * 100}%`;

    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(step);

  return {
    input,
    start() {
      if (phase !== "title") return;
      phase = "fly";
      startT = clock;
    },
    // carry on after a chapter card
    resume() {
      if (phase !== "paused") return;
      if (leg === gates.length) {
        phase = "landing";
        endT = clock;
      } else phase = "fly";
      startT += clock - pausedAt;
    },
    restart() {
      reset();
    },
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      window.removeEventListener("resize", resize);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
        mats.forEach((x) => {
          (x as THREE.MeshBasicMaterial).map?.dispose();
          x.dispose();
        });
      });
      renderer.dispose();
    },
  };
};

export type GameApi = ReturnType<typeof createGame>;
