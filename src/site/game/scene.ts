import * as THREE from "three";
import { land } from "../engine";
import { Milestone } from "../../data/journey";
import { GATES, LEGS, START, Mark } from "./chapters";

export type GameEvent =
  | { kind: "gate"; i: number; m: Milestone; place?: string }
  | { kind: "stop"; m: Milestone; dip: boolean }
  | { kind: "finale"; secs: number; rings: number; ringsTotal: number };

// HUD elements the loop writes to directly every frame, so React never re-renders at 60fps
export interface Hud {
  marker: HTMLElement;
  markerLabel: HTMLElement;
  boost: HTMLElement;
}
export interface Input {
  x: number; // -1 left … 1 right
  y: number; // -1 dive … 1 climb
  boost: boolean;
}

const V = THREE.Vector3;
type V3 = THREE.Vector3;
const R = 60;
const RAD = Math.PI / 180;
const KM = 6371 / R;
const MIN_ALT = 2.6;
const MAX_ALT = 24;
const ISLAND_ALT = 4;
const GATE_ALT = 13;
const RING_ALT = 12.5;
const SPEED = 16;
const BOOST = 28;

const dir = (lat: number, lon: number) => {
  const a = lat * RAD;
  const b = lon * RAD;
  return new V(Math.cos(a) * Math.cos(b), Math.sin(a), -Math.cos(a) * Math.sin(b));
};
const slerp = (a: V3, b: V3, t: number) => {
  const th = Math.acos(Math.min(1, Math.max(-1, a.dot(b))));
  if (th < 1e-4) return a.clone();
  return a
    .clone()
    .multiplyScalar(Math.sin((1 - t) * th) / Math.sin(th))
    .addScaledVector(b, Math.sin(t * th) / Math.sin(th));
};
// tangent at b, pointing away from a along the great circle a → b
const arrival = (a: V3, b: V3) => {
  const t = slerp(a, b, 1).sub(slerp(a, b, 0.98));
  return t.addScaledVector(b, -t.dot(b)).normalize();
};
const q3 = (x: number) => Math.round(x * 1000) / 1000;
const hash = (x: number, y: number, z: number) => {
  const s = Math.sin(q3(x) * 12.9898 + q3(y) * 78.233 + q3(z) * 37.719) * 43758.5453;
  return s - Math.floor(s);
};
const latLon = (n: V3) => [Math.asin(Math.max(-1, Math.min(1, n.y))) / RAD, Math.atan2(-n.z, n.x) / RAD];
// terrain height above sea level; quantised so the same corner shared by two faces gets the same value
const ground = (n: V3) => {
  const [la, lo] = latLon(new V(q3(n.x), q3(n.y), q3(n.z)));
  return land(la, lo) ? 0.5 + hash(n.x * R, n.y * R, n.z * R) * 0.75 : 0;
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

const emojiSprite = (emoji: string, size: number) => {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const x = c.getContext("2d") as CanvasRenderingContext2D;
  x.font = "96px serif";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.fillText(emoji, 64, 72);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthWrite: false }));
  s.scale.set(size, size, 1);
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

// ── Landmarks: one small diorama per chapter, built from primitives, ~4 units tall ──
const landmark = (mark: Mark) => {
  const g = new THREE.Group();
  if (mark === "bank") {
    const stone = std("#e9e4d6");
    add(g, box(3.6, 0.35, 2.6), stone, 0, 0.18, 0);
    for (let i = 0; i < 5; i++) [0.85, -0.85].forEach((z) => add(g, cyl(0.17, 0.17, 2, 7), stone, -1.4 + i * 0.7, 1.35, z));
    add(g, box(3.8, 0.3, 2.8), stone, 0, 2.5, 0);
    const roof = add(g, cyl(1, 1, 2.8, 3), stone, 0, 3.03, 0);
    roof.rotation.x = -Math.PI / 2;
    roof.scale.set(2.2, 1, 0.75);
  } else if (mark === "laptop") {
    const shell = std("#c9d1de", { roughness: 0.4, metalness: 0.3 });
    add(g, box(3, 0.18, 2), shell, 0, 0.09, 0);
    const lid = new THREE.Group();
    lid.position.set(0, 0.18, -1);
    lid.rotation.x = -0.25;
    g.add(lid);
    add(lid, box(3, 2, 0.12), shell, 0, 1, 0);
    add(lid, new THREE.PlaneGeometry(2.7, 1.7), new THREE.MeshBasicMaterial({ color: "#1b3d78" }), 0, 1, 0.07);
    const code = new THREE.MeshBasicMaterial({ color: "#8ab8ff" });
    [1.4, 0.9, 1.8, 1.1, 0.6].forEach((w, k) => add(lid, box(w, 0.09, 0.01), code, -1.2 + w / 2 + (k % 2) * 0.25, 1.6 - k * 0.28, 0.08));
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
  } else if (mark === "card") {
    const card = new THREE.Group();
    card.position.y = 1.8;
    card.rotation.set(0, 0.5, 0.12);
    g.add(card);
    add(card, box(3.2, 2, 0.12), std("#2d7ff9", { roughness: 0.35, metalness: 0.2 }));
    add(card, box(0.55, 0.42, 0.14), std("#e8c15a", { metalness: 0.6, roughness: 0.3 }), -0.95, 0.2, 0);
    const dots = new THREE.MeshBasicMaterial({ color: "#dbe8ff" });
    for (let k = 0; k < 4; k++) add(card, box(0.5, 0.1, 0.14), dots, -1.05 + k * 0.7, -0.4, 0);
  } else if (mark === "guitar") {
    const gt = new THREE.Group();
    gt.rotation.z = 0.3;
    gt.scale.setScalar(0.72);
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
    // Seattle: the Space Needle, and the AWS cloud beside it
    const white = std("#dfe6f0", { roughness: 0.5 });
    add(g, cyl(0.12, 0.38, 3.6, 8), white, 0, 1.8, 0);
    add(g, cyl(1.1, 0.7, 0.35, 16), white, 0, 3.7, 0);
    add(g, cyl(0.7, 0.9, 0.22, 16), std("#ffb347", { emissive: "#ff9900", emissiveIntensity: 0.5 }), 0, 3.98, 0);
    add(g, cyl(0.04, 0.04, 0.9, 4), white, 0, 4.5, 0);
    const puff = std("#ffffff", { emissive: "#ff9900", emissiveIntensity: 0.12 });
    ([[1.9, 2.7, 0.7], [2.6, 2.9, 0.85], [3.3, 2.7, 0.6]] as const).forEach(([x, y, r]) => add(g, ball(r), puff, x, y, 0));
  }
  return g;
};

const island = () => {
  const g = new THREE.Group();
  add(g, cyl(3.6, 3.3, 0.5, 8), std("#4f9a5e"), 0, -0.25, 0);
  const rock = add(g, new THREE.ConeGeometry(3.3, 3.2, 8), std("#6b5a4a"), 0, -2.1, 0);
  rock.rotation.x = Math.PI;
  return g;
};

const paperPlane = () => {
  const P = {
    nose: [0, 0, -1.6],
    l: [-1.2, 0.18, 1],
    r: [1.2, 0.18, 1],
    c: [0, 0, 1],
    k: [0, -0.38, 1],
  };
  const tris = [P.nose, P.l, P.c, P.nose, P.c, P.r, P.nose, P.k, P.c].flat();
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(tris, 3));
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, std("#f4f7fc", { side: THREE.DoubleSide, emissive: "#3a4a6a", emissiveIntensity: 0.35 }));
};

export const createGame = (canvas: HTMLCanvasElement, hud: Hud, emit: (e: GameEvent) => void) => {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#070b14");
  scene.fog = new THREE.Fog("#070b14", 90, 260);
  const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 2000);
  const resize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  };
  resize();

  scene.add(new THREE.HemisphereLight("#bcd7ff", "#0b1a33", 0.9));
  const sun = new THREE.DirectionalLight("#fff4e0", 1.7);
  sun.position.set(120, 80, 60);
  scene.add(sun);

  // ── Planet: low-poly Earth from the same land mask as the hero globe ──
  const geo = new THREE.IcosahedronGeometry(R, 40);
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
  const planet = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 }));
  scene.add(planet);

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
  const trees = new THREE.InstancedMesh(treeGeo, std("#2f6b45"), 900);
  const dummy = new THREE.Object3D();
  let placed = 0;
  for (let tries = 0; placed < 900 && tries < 20000; tries++) {
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

  // drifting clouds at flying height
  const clouds = new THREE.Group();
  const puff = std("#ffffff", { transparent: true, opacity: 0.9, emissive: "#8fa6c8", emissiveIntensity: 0.55 });
  for (let i = 0; i < 42; i++) {
    const up = new V(Math.random() * 2 - 1, Math.random() * 1.6 - 0.8, Math.random() * 2 - 1).normalize();
    const c = new THREE.Group();
    for (let k = 0; k < 4; k++) add(c, new THREE.IcosahedronGeometry(1 + Math.random() * 1.2, 0), puff, (k - 1.5) * 1.4, Math.random() * 0.6, Math.random() - 0.5);
    c.position.copy(up).multiplyScalar(R + 16 + Math.random() * 6);
    orient(c, up, anyFwd(up));
    clouds.add(c);
  }
  scene.add(clouds);

  const starGeo = new THREE.BufferGeometry();
  const sp = new Float32Array(2400 * 3);
  for (let i = 0; i < 2400; i++) new V(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize().multiplyScalar(700 + Math.random() * 300).toArray(sp, i * 3);
  starGeo.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: "#c9d6ee", size: 1.6, sizeAttenuation: false, fog: false })));

  // ── The route: a gate per chapter, a trail of rings and the in-between moments on every leg ──
  const ringGeo = new THREE.TorusGeometry(1.5, 0.14, 8, 28);
  const ringMat = new THREE.MeshBasicMaterial({ color: "#bcd7ff" });
  const stormMat = std("#3a4459", { emissive: "#9fb6ff", emissiveIntensity: 0 });
  type Item = { at: V3; obj: THREE.Object3D; done: boolean };
  const legs = LEGS.map((L, i) => {
    const a = dir(L.from.lat, L.from.lon);
    const b = dir(L.to.lat, L.to.lon);
    const len = Math.acos(Math.min(1, a.dot(b))) * (R + RING_ALT);
    const tan = arrival(a, b);

    const isl = island();
    isl.position.copy(b).multiplyScalar(R + ISLAND_ALT);
    orient(isl, b, tan);
    const lm = landmark(L.to.mark);
    // face the diorama toward the plane arriving
    lm.rotation.y = Math.PI;
    isl.add(lm);
    scene.add(isl);

    const gateMat = new THREE.MeshBasicMaterial({ color: "#5b9cff" });
    const gate = new THREE.Group();
    gate.add(new THREE.Mesh(new THREE.TorusGeometry(4.6, 0.32, 12, 56), gateMat));
    gate.add(halo("#5b9cff", 15));
    gate.position.copy(b).multiplyScalar(R + GATE_ALT);
    orient(gate, b, tan);
    gate.visible = false;
    scene.add(gate);
    const label = emojiSprite(L.to.m.emoji, 4.5);
    label.position.copy(b).multiplyScalar(R + GATE_ALT + 7.5);
    scene.add(label);

    const rings: Item[] = [];
    const count = Math.max(0, Math.floor((len - 22) / 8));
    for (let k = 1; k <= count; k++) {
      const t = (11 + k * ((len - 22) / (count + 1))) / len;
      const p = slerp(a, b, t);
      const m = new THREE.Mesh(ringGeo, ringMat);
      m.position.copy(p).multiplyScalar(R + RING_ALT);
      orient(m, p, slerp(a, b, Math.min(1, t + 0.01)).sub(p));
      m.visible = false;
      scene.add(m);
      rings.push({ at: m.position, obj: m, done: false });
    }
    const stops = L.stops.map((s, k) => {
      const p = slerp(a, b, (k + 1) / (L.stops.length + 1));
      const g = new THREE.Group();
      if (s.dip) {
        for (let j = 0; j < 6; j++) add(g, ball(1.5 + Math.random(), 6), stormMat, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 4);
      } else {
        add(g, ball(0.8, 12), new THREE.MeshBasicMaterial({ color: "#ffd479" }));
        g.add(halo("#ffb347", 6));
      }
      const e = emojiSprite(s.m.emoji, 3);
      e.position.y = s.dip ? 4 : 2.4;
      g.add(e);
      g.position.copy(p).multiplyScalar(R + (s.dip ? GATE_ALT - 1 : RING_ALT));
      orient(g, p, anyFwd(p));
      g.visible = false;
      scene.add(g);
      return { ...s, at: g.position, obj: g, done: false };
    });
    return { a, b, gate, gateMat, rings, stops, i };
  });
  const ringsTotal = legs.reduce((s, L) => s + L.rings.length, 0);

  // the path you flew, drawn in green at the end: the hero's unlit dotted arc, now lit
  const routePts: V3[] = [];
  legs.forEach((L) => {
    for (let k = 0; k <= 40; k++) routePts.push(slerp(L.a, L.b, k / 40).multiplyScalar(R + 2.2));
  });
  const routeGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(routePts), 600, 0.28, 6, false);
  const route = new THREE.Mesh(routeGeo, new THREE.MeshBasicMaterial({ color: "#4ade80" }));
  route.visible = false;
  scene.add(route);
  const routeIdx = (routeGeo.index as THREE.BufferAttribute).count;

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
  type Phase = "title" | "fly" | "landing" | "done";
  let phase: Phase = "title";
  const up = new V();
  const fwd = new V();
  let alt = 0;
  let speed = SPEED;
  let yaw = 0;
  let climb = 0;
  let energy = 1;
  let leg = 0;
  let rings = 0;
  let slow = 0; // seconds of slow-motion left (real time)
  let rough = 0; // storm turbulence left
  let shake = 0;
  let endT = 0;
  let orbit = 0;
  const input: Input = { x: 0, y: 0, boost: false };
  const keys = new Set<string>();

  const showLeg = (i: number) =>
    legs.forEach((L) => {
      L.gate.visible = L.i <= i;
      L.rings.forEach((r) => (r.obj.visible = L.i === i && !r.done));
      L.stops.forEach((s) => (s.obj.visible = L.i === i && !s.done));
    });

  const reset = () => {
    phase = "title";
    up.copy(dir(START.lat, START.lon));
    fwd.copy(arrival(legs[0].b, up).negate());
    alt = RING_ALT;
    speed = SPEED;
    yaw = climb = 0;
    energy = 1;
    leg = rings = 0;
    slow = rough = shake = endT = 0;
    legs.forEach((L) => {
      L.gateMat.color.set("#5b9cff");
      L.rings.forEach((r) => (r.done = false));
      L.stops.forEach((s) => (s.done = false));
    });
    route.visible = false;
    showLeg(0);
    const p = up.clone().multiplyScalar(R + alt);
    for (let i = 0; i < TRAIL; i++) p.toArray(trailPos, i * 3);
    camera.position.copy(up).multiplyScalar(R * 2.8).addScaledVector(fwd, -40);
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

  const near = (at: V3, r: number) => planeRoot.position.distanceToSquared(at) < r * r;
  const target = new V();
  const camPos = new V();
  const look = new V();
  const tmp = new V();
  let raf = 0;
  let last = performance.now();
  let clock = 0;

  const step = (now: number) => {
    raf = requestAnimationFrame(step);
    const real = Math.min(0.05, (now - last) / 1000);
    last = now;
    slow = Math.max(0, slow - real);
    const dt = real * (slow > 0 ? 0.2 : 1);
    clock += real;
    clouds.rotation.y += dt * 0.01;

    // ── controls → heading and altitude on the sphere ──
    const kx = (keys.has("arrowright") || keys.has("d") ? 1 : 0) - (keys.has("arrowleft") || keys.has("a") ? 1 : 0);
    const ky = (keys.has("arrowup") || keys.has("w") ? 1 : 0) - (keys.has("arrowdown") || keys.has("s") ? 1 : 0);
    let ix = kx || input.x;
    let iy = ky || input.y;
    const boosting = (keys.has(" ") || keys.has("shift") || input.boost) && energy > 0.02 && phase === "fly";
    if (phase === "landing") {
      ix = 0.55;
      iy = (6 - alt) / 4;
    }
    if (phase === "title" || phase === "done") ix = iy = 0;
    yaw += (ix * 1.7 - yaw) * Math.min(1, real * 5);
    climb += (iy - climb) * Math.min(1, real * 5);
    energy = Math.min(1, Math.max(0, energy + (boosting ? -0.4 : 0.1) * dt));
    const want = phase === "landing" ? 9 : phase === "fly" ? (boosting ? BOOST : SPEED) * (rough > 0 ? 0.55 : 1) : 0;
    speed += (want - speed) * Math.min(1, real * 2.5);
    rough = Math.max(0, rough - dt);

    if (phase === "fly" || phase === "landing") {
      fwd.applyAxisAngle(up, -yaw * dt);
      alt = Math.min(MAX_ALT, Math.max(MIN_ALT, alt + climb * 10 * dt));
      const dist = speed * dt;
      const axis = new V().crossVectors(up, fwd).normalize();
      const ang = dist / (R + alt);
      up.applyAxisAngle(axis, ang).normalize();
      fwd.applyAxisAngle(axis, ang);
      fwd.addScaledVector(up, -fwd.dot(up)).normalize();
    }
    planeRoot.position.copy(up).multiplyScalar(R + alt);
    orient(planeRoot, up, fwd);
    plane.rotation.z = -yaw * 0.45 + (rough > 0 ? Math.sin(clock * 40) * 0.12 : 0);
    plane.rotation.x = climb * 0.35;
    plane.position.y = Math.sin(clock * 2) * 0.12;

    trailPos.copyWithin(3, 0, (TRAIL - 1) * 3);
    tmp.set(0, 0, 1).applyQuaternion(planeRoot.quaternion).multiplyScalar(1).add(planeRoot.position).toArray(trailPos, 0);
    trailGeo.attributes.position.needsUpdate = true;

    // ── the route ──
    if (phase === "fly") {
      const L = legs[leg];
      L.rings.forEach((r) => {
        if (r.done || !near(r.at, 3.6)) return;
        r.done = true;
        r.obj.visible = false;
        rings++;
        energy = Math.min(1, energy + 0.3);
      });
      L.stops.forEach((s) => {
        if (s.done || !near(s.at, s.dip ? 6.5 : 3.4)) return;
        s.done = true;
        if (s.dip) {
          rough = 1.6;
          shake = 1;
        } else s.obj.visible = false;
        emit({ kind: "stop", m: s.m, dip: s.dip });
      });
      if (near(L.gate.position, 5.4)) {
        L.gateMat.color.set("#4ade80");
        emit({ kind: "gate", i: leg, m: LEGS[leg].to.m, place: LEGS[leg].to.place });
        if (leg === legs.length - 1) {
          phase = "landing";
          endT = clock;
          showLeg(-1);
          legs.forEach((G) => (G.gate.visible = true));
        } else {
          slow = 2.2;
          leg++;
          showLeg(leg);
        }
      }
    }
    if (phase === "landing" && clock - endT > 2.4) {
      phase = "done";
      route.visible = true;
      orbit = 0;
      emit({ kind: "finale", secs: Math.round(endT - startT), rings, ringsTotal });
    }
    if (route.visible) routeGeo.setDrawRange(0, Math.floor((Math.min(1, (clock - endT - 2.4) / 3) * routeIdx) / 3) * 3);
    stormMat.emissiveIntensity = Math.random() < 0.02 ? 1.4 : stormMat.emissiveIntensity * 0.85;
    legs[leg].gate.scale.setScalar(1 + Math.sin(clock * 3) * 0.04);

    // ── camera ──
    if (phase === "done") {
      orbit += real * 0.08;
      const seattle = legs[legs.length - 1].b;
      camPos.copy(seattle).multiplyScalar(R * 2.9).applyAxisAngle(new V(0, 1, 0), orbit - 0.5);
      look.set(0, 0, 0);
      camera.up.lerp(new V(0, 1, 0), Math.min(1, real * 2));
    } else if (phase === "title") {
      orbit += real * 0.05;
      camPos.copy(up).multiplyScalar(R + 30).addScaledVector(fwd, -38).applyAxisAngle(up, Math.sin(orbit) * 0.6);
      look.copy(planeRoot.position);
      camera.up.lerp(up, Math.min(1, real * 3));
    } else {
      camPos.copy(planeRoot.position).addScaledVector(fwd, -13).addScaledVector(up, 5.5 + climb * 1.5);
      look.copy(planeRoot.position).addScaledVector(fwd, 8).addScaledVector(up, 1);
      camera.up.lerp(up, Math.min(1, real * 6));
    }
    camera.position.lerp(camPos, Math.min(1, real * (phase === "fly" ? 4 : 1.6)));
    shake = Math.max(0, shake - real * 1.2);
    if (shake) camera.position.add(tmp.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(shake * 0.8));
    camera.lookAt(look);
    // a ring sweeping through the lens would blank the screen
    legs[leg].rings.forEach((r) => (r.obj.visible = !r.done && (phase === "fly" || phase === "title") && camera.position.distanceToSquared(r.at) > 16));
    camera.fov += ((boosting ? 74 : 62) - camera.fov) * Math.min(1, real * 3);
    camera.updateProjectionMatrix();

    // ── HUD: the next gate, on screen or pinned to the edge pointing at it ──
    if (phase === "fly") {
      target.copy(legs[leg].gate.position);
      const cp = target.clone().applyMatrix4(camera.matrixWorldInverse);
      const e = camera.projectionMatrix.elements;
      const behind = cp.z >= 0;
      let x = behind ? cp.x : (cp.x / -cp.z) * e[0];
      let y = behind ? cp.y : (cp.y / -cp.z) * e[5];
      const off = behind || Math.abs(x) > 0.9 || Math.abs(y) > 0.82;
      if (off) {
        const k = Math.min(0.9 / Math.abs(x || 1e-6), 0.82 / Math.abs(y || 1e-6));
        x *= k;
        y *= k;
      }
      const w = window.innerWidth;
      const h = window.innerHeight;
      hud.marker.style.opacity = "1";
      hud.marker.style.transform = `translate(${((x + 1) / 2) * w}px, ${((1 - y) / 2) * h}px)`;
      hud.marker.dataset.off = off ? "1" : "";
      hud.marker.style.setProperty("--a", `${Math.atan2(-y, x)}rad`);
      const km = Math.round((Math.acos(Math.min(1, up.dot(legs[leg].b))) * R * KM) / 10) * 10;
      hud.markerLabel.textContent = `${LEGS[leg].to.m.emoji} ${km.toLocaleString()} km`;
    } else hud.marker.style.opacity = "0";
    hud.boost.style.transform = `scaleX(${energy})`;

    renderer.render(scene, camera);
  };
  let startT = 0;
  raf = requestAnimationFrame(step);

  return {
    input,
    start() {
      if (phase !== "title") return;
      phase = "fly";
      startT = clock;
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
