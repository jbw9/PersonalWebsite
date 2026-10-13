import { lazy, ComponentType, LazyExoticComponent } from "react";

export interface Variant {
  slug: string;
  name: string;
  pitch: string;
  Component: LazyExoticComponent<ComponentType>;
}

// Earlier versions of the site, kept at /archive/<slug>. Lazy, so the live site never downloads them
export const variants: Variant[] = [
  { slug: "original", name: "Original", pitch: "The warm paper site that was live before the redesign", Component: lazy(() => import("./original")) },
  { slug: "bigbang", name: "Big Bang", pitch: "Everything explodes out of one dot, then you can fling it around", Component: lazy(() => import("./bigbang")) },
  { slug: "gravity", name: "Gravity", pitch: "Your name drops in, the page falls into place, the toys have physics", Component: lazy(() => import("./gravity")) },
  { slug: "deck", name: "Card Deck", pitch: "A deck shuffles and deals your life out as cards to flip and swipe", Component: lazy(() => import("./deck")) },
  { slug: "os", name: "JonathanOS", pitch: "Boots like a computer; the site is a desktop of draggable windows", Component: lazy(() => import("./os")) },
  { slug: "canvas", name: "Infinite Canvas", pitch: "Zoom out from one dot into a pannable map of islands", Component: lazy(() => import("./canvas")) },
  { slug: "cinema", name: "Cinematic", pitch: "A film-title intro, then scrolling drives a sideways journey", Component: lazy(() => import("./cinema")) },
  { slug: "particles", name: "Particles", pitch: "Thousands of particles swarm into your name and follow the cursor", Component: lazy(() => import("./particles")) },
  { slug: "kinetic", name: "Kinetic Type", pitch: "Loud, brutalist, giant type that slams in and scrambles", Component: lazy(() => import("./kinetic")) },
];
