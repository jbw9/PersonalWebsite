import { createContext, useContext } from "react";

export type AppId =
  | "about"
  | "projects"
  | "experience"
  | "journey"
  | "school"
  | "guides"
  | "involvement"
  | "terminal"
  | "contact";

export interface OSApi {
  open: (id: AppId, from?: DOMRect | null) => void;
  close: (id: AppId) => void;
  go: (path: string) => void;
  compact: boolean;
}

export const OSContext = createContext<OSApi>({
  open: () => {},
  close: () => {},
  go: () => {},
  compact: false,
});
export const useOS = () => useContext(OSContext);

export const EMAIL = "jbw7@illinois.edu";
export const GITHUB = "https://github.com/jbw9";
export const LINKEDIN = "https://www.linkedin.com/in/jwidjajakusuma/";

// Some data paths are relative ("kredivoLogo.png"), which would resolve under /v/os/
export const asset = (p: string) => (/^(https?:|data:|\/)/.test(p) ? p : "/" + p);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const parseMonth = (s: string) => {
  const [m, y] = s.trim().split(/\s+/);
  return new Date(Number(y), Math.max(0, MONTHS.indexOf(m.slice(0, 3))), 1);
};

// "Feb 2027" → scheduled, "Jun 2026 - Aug 2026" → exited, open-ended → running
export const periodStatus = (period: string): "scheduled" | "running" | "exited" => {
  const [start, end] = period.split(" - ");
  const now = new Date();
  if (parseMonth(start) > now) return "scheduled";
  if (end && !/present/i.test(end) && parseMonth(end) < now) return "exited";
  return "running";
};
