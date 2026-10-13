import { milestones, Milestone } from "../../data/journey";

export type Mark = "bank" | "laptop" | "tulip" | "hand" | "card" | "guitar" | "seattle";
export type Gate = { lat: number; lon: number; mark: Mark; place?: string; m: Milestone };
export type Stop = { m: Milestone; dip: boolean };
export type Leg = { from: { lat: number; lon: number }; to: Gate; stops: Stop[] };

const find = (short: string) => milestones.find((x) => x.short === short) as Milestone;

export const START = { lat: -6.9175, lon: 107.6191, place: "Bandung, Indonesia" };

// One gate per big chapter. Places are real where the story has one (Champaign, Seattle); the rest sit
// wherever makes a good flight, including a long hop back over the Pacific toward home for Kredivo.
export const GATES: Gate[] = [
  { lat: 40.1164, lon: -88.2434, mark: "bank", place: "Champaign, IL", m: find("finance major") },
  { lat: 54, lon: -66, mark: "laptop", m: find("fell in love") },
  { lat: 28, lon: -58, mark: "tulip", m: find("iVenture + Tulip") },
  { lat: 18, lon: -98, mark: "hand", m: find("We Hear You") },
  { lat: -4, lon: 112, mark: "card", m: find("Kredivo") },
  { lat: 30, lon: -150, mark: "guitar", m: find("Massive") },
  { lat: 47.6062, lon: -122.3321, mark: "seattle", place: "Seattle, WA", m: find("AWS") },
];

export const NOW = milestones[milestones.length - 1];

// Every milestone between two gates (by date) lands on the leg that leads to the later one: the dips
// become storms you fly through, the small wins become orbs to pick up.
export const LEGS: Leg[] = GATES.map((g, i) => {
  const lo = i ? GATES[i - 1].m.date : "";
  return {
    from: i ? GATES[i - 1] : START,
    to: g,
    stops: milestones.filter((x) => x.date > lo && x.date < g.m.date).map((m) => ({ m, dip: !!m.dip })),
  };
});
