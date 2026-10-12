// Shared between the remix page shell, the particle engine, the Ask terminal and the detail pages.

export interface AskTerminalProps {
  // The drawer holding the terminal is open; focus the prompt each time this flips to true
  active: boolean;
  // Esc, `/exit` or `exit` inside the terminal
  onClose: () => void;
}

// ── Particle formations ──
// "title" is the name centred during the intro; "name" is where it rests in the hero.
// cloud = experience (AWS), frames = projects, gpa = school, people = involvement, book = guides.
// "frames": particles trace the perimeters of every element matching FRAME_SELECTOR, following
// them live as the page scrolls; the attribute's value is that element's corner radius in px.
export type ShapeKey = "title" | "name" | "cloud" | "frames" | "gpa" | "people" | "book";
export const FRAME_SELECTOR = ".v-remix [data-frame]";

export type NameBox = { cy: number; h: number };
export interface FieldOptions {
  reduce: boolean;
  // Coming back from a detail page: no intro, the particles gather straight into shape
  resume: boolean;
  onNameBox: (b: NameBox) => void;
  onIntroDone: () => void;
}

// ── Detail pages ──
export const HOME = "/v/remix";
export const projectPath = (id: string) => `${HOME}/project/${id}`;
export const guidePath = (id: string) => `${HOME}/guide/${id}`;
// Router location state the remix reads on mount: skip the intro and land where the visitor left
// off (y) or on a section (one of SECTIONS' ids)
export type Resume = { resume: { y?: number; section?: string } };
