export interface Milestone {
  date: string; // ISO yyyy-mm-dd; plotted as weeks since JOURNEY_START
  emoji: string;
  short: string; // handwritten label on the chart
  title: string;
  body: string;
  vibe: number; // 0-100, "how cracked I felt"
  dip?: boolean; // label goes under the dot instead of over it
}

export const JOURNEY_START = "2023-08-21";

export const milestones: Milestone[] = [
  {
    date: "2023-08-21",
    emoji: "💼",
    short: "finance major",
    title: "Week 0: showed up as a finance major",
    body: "Arrived at UIUC with a plan: finance, spreadsheets, maybe a Bloomberg terminal someday. Coding was not on the menu.",
    vibe: 18,
  },
  {
    date: "2023-09-11",
    emoji: "🤓",
    short: "CS124 'for fun'",
    title: "Took CS124 as an elective",
    body: "Signed up for Intro to CS mostly out of curiosity. Printed my first Hello World and felt like a hacker in a movie.",
    vibe: 40,
  },
  {
    date: "2023-10-09",
    emoji: "❤️",
    short: "fell in love",
    title: "Fell in love with it",
    body: "Stayed up way too late on a machine problem, and somehow enjoyed it. Started quietly asking myself why I was studying finance.",
    vibe: 74,
  },
  {
    date: "2023-12-18",
    emoji: "🃏",
    short: "built akar.study",
    title: "Built my first real project: akar.study",
    body: "I loved flashcards but hated Anki's UI, so I built my own, with a Pomodoro timer baked in. The first time I made something because I wanted it to exist.",
    vibe: 64,
  },
  {
    date: "2024-01-15",
    emoji: "🚀",
    short: "iVenture + Tulip",
    title: "Got into iVenture Accelerator, co-founded Tulip",
    body: "Joined iVenture's iV10 cohort as a Founder in Residence and became CTO of Tulip. Went from homework to production code with real users overnight.",
    vibe: 88,
  },
  {
    date: "2024-03-25",
    emoji: "🔥",
    short: "prod is scary",
    title: "Learned production is scary",
    body: "Users click buttons you didn't know existed. Learned to love logs, tests, and not deploying on Fridays.",
    vibe: 54,
    dip: true,
  },
  {
    date: "2024-06-03",
    emoji: "🤟",
    short: "We Hear You",
    title: "First SWE internship at We Hear You",
    body: "Built a real-time American Sign Language to English Android app and tuned the ML behind the translation.",
    vibe: 74,
  },
  {
    date: "2024-10-07",
    emoji: "📨",
    short: "recruiting season",
    title: "Recruiting season",
    body: "Applications, online assessments, LeetCode. A lot of LeetCode. Very humbling.",
    vibe: 46,
    dip: true,
  },
  {
    date: "2025-01-13",
    emoji: "🧑‍🏫",
    short: "CS128 CA",
    title: "Became a CS128 course assistant",
    body: "Went from asking questions in office hours to answering them. Explaining pointers to someone else is the best way to actually understand them.",
    vibe: 70,
  },
  {
    date: "2025-05-19",
    emoji: "🔁",
    short: "Kredivo",
    title: "Kredivo: finance, but make it code",
    body: "Built an MCP server wired into Kredivo's LLM and customer support system. The finance major ended up building for a fintech. Full circle.",
    vibe: 84,
  },
  {
    date: "2025-07-14",
    emoji: "🎵",
    short: "Massive",
    title: "Massive: predicting artist revenue",
    body: "Developed an algorithm to predict an artist's annual revenue from 130+ parameters.",
    vibe: 80,
  },
  {
    date: "2025-12-08",
    emoji: "🫠",
    short: "the more I learn...",
    title: "The more I learn, the less I know",
    body: "Hit the part of the curve where every new thing reveals three things I don't know yet. Turns out that's the fun part.",
    vibe: 58,
    dip: true,
  },
  {
    date: "2026-06-01",
    emoji: "☁️",
    short: "AWS",
    title: "SDE intern at AWS",
    body: "Working on Amazon MSK (Managed Streaming for Apache Kafka), at a scale I'm still wrapping my head around.",
    vibe: 90,
  },
  {
    date: new Date().toISOString().slice(0, 10),
    emoji: "📍",
    short: "you are here",
    title: "Now: building TaxBuddy",
    body: "Still shipping, still learning, still mildly surprised I'm not in finance.",
    vibe: 94,
  },
];
