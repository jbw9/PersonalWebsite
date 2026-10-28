// Shared between the remix page shell, the particle engine, the Ask terminal and the detail pages.

export interface AskTerminalProps {
  // The drawer holding the terminal is open; focus the prompt each time this flips to true
  active: boolean;
  // Esc, `/exit` or `exit` inside the terminal
  onClose: () => void;
}

// ── Particle formations ──
// globe = hero (Champaign now, Seattle next), cloud = experience (AWS), frames = projects,
// gpa = school, people = involvement, book = guides.
// "frames": particles trace the perimeters of every element matching FRAME_SELECTOR, following
// them live as the page scrolls; the attribute's value is that element's corner radius in px.
// Experience rows pick a formation per company: chart (Tulip), card (Kredivo), guitar (Massive),
// tulip (iVenture, Tulip's logo), hand (We Hear You, waving hello in 3D)
export type ShapeKey = "globe" | "cloud" | "frames" | "gpa" | "people" | "book" | "chart" | "card" | "guitar" | "tulip" | "hand";
export const FRAME_SELECTOR = ".v-remix [data-frame]";

// Where the globe sits in the viewport, so the hero text can lay out around it
export type GlobeBox = { cx: number; cy: number; r: number };
export interface FieldOptions {
  reduce: boolean;
  // No intro: particles start in place on the globe
  resume: boolean;
  onGlobe: (b: GlobeBox) => void;
  onIntroDone: () => void;
  // A hard flick of the globe. Three in a row opens the hidden game.
  onFlick: () => void;
}

// ── Easter egg: the journey game (src/site/bowling/, lazy) ──
// Full-screen overlay; the particle field is paused while it is open.
export interface GameProps {
  onExit: () => void;
}

// ── Detail pages ──
export const HOME = "/";
export const projectPath = (id: string) => `/project/${id}`;
export const guidePath = (id: string) => `/guide/${id}`;
export const WAYBACK = "/wayback";
// Router location state the remix reads on mount: skip the intro and land where the visitor left
// off (y) or on a section (one of SECTIONS' ids)
export type Resume = { resume: { y?: number; section?: string } };
