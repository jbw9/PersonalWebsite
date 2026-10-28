// Past versions of the site. scripts/wayback.sh rebuilds each `commit` into public/snapshots/<id>/ at deploy;
// the previews in public/wayback-previews/ were captured from those builds.
export interface Era {
  id: string;
  from: string;
  to: string;
  taken: string; // date of the commit the snapshot is built from
  commit: string;
  look: string;
  // Facts the old copy got wrong, shown in the viewer so nobody takes an old date as the current one
  since: string[];
}

const TULIP = "Tulip: software engineer intern Jan – May 2024, then co-founder & CTO May 2024 – May 2025.";
const IVENTURE = "iVenture Founder in Residence started May 2024, not Jan 2024.";
const DEGREE = "The degree is Computer Science + Economics, graduating Dec 2026 (not May 2027).";

export const ERAS: Era[] = [
  {
    id: "2024",
    from: "Sep 2024",
    to: "Jun 2025",
    taken: "Jan 9, 2025",
    commit: "dbb9cb4",
    look: "The first one: dark, a loader, one long timeline",
    since: ["Tulip: joined as a software engineer intern in Jan 2024; co-founder & CTO from May 2024 until it wound down in May 2025.", "iVenture's non-dilutive funding was $10k, not $20,000."],
  },
  {
    id: "2025",
    from: "Jun 2025",
    to: "Apr 2026",
    taken: "Feb 16, 2026",
    commit: "3cef60f",
    look: "Rebuilt from scratch: navy, project cards, guides",
    since: [TULIP, IVENTURE, DEGREE],
  },
  {
    id: "2026",
    from: "Apr 2026",
    to: "Oct 2026",
    taken: "Aug 2, 2026",
    commit: "fcbd5de",
    look: "Warm paper and serif type",
    since: [TULIP, IVENTURE, DEGREE, "The AWS internship ran Jun – Aug 2026; returning full-time Feb 2027."],
  },
];

export const NOW = { from: "Oct 2026", look: "This one: particles, a story, Alfred" };
