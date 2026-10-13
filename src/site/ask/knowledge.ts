import { experiences, education, involvements } from "../../data";
import { projects } from "../../data/projects";
import { milestones } from "../../data/journey";
import { guides } from "../../data/guides";

export interface KBEntry {
  path: string; // fake file path shown in the terminal's Read(...) lines
  title: string;
  text: string; // one fact per line; answers are composed only from these lines
  tags: string[]; // extra search words (synonyms, categories); never shown as facts
}

// Hand-written facts that aren't in the data files. Answers can quote these verbatim, so only
// add things that are true. Words like "favorite", "hobby" or "live" only ever match entries here.
export const EXTRA_FACTS: KBEntry[] = [
  // {
  //   path: "kb/personal/hobbies.md",
  //   title: "Hobbies",
  //   text: "Favorite food: <fill in>\nOutside of code he likes <fill in>",
  //   tags: ["hobby", "fun", "personal", "free time"],
  // },
];

// Shown on the live site's hero and contact buttons, not stored in the data files
export const CONTACT = {
  email: "jbw7@illinois.edu",
  github: "https://github.com/jbw9",
  linkedin: "https://www.linkedin.com/in/jwidjajakusuma/",
};

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthYear = (iso: string) => `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`;

const taxbuddy = projects.find((p) => p.id === "taxbuddy")!;
const incoming = experiences[0];

const about: KBEntry = {
  path: "kb/about.md",
  title: "About Jonathan",
  text: [
    "Jonathan is a CS & Econs student @ UIUC, building software that solves real problems.",
    `Next: ${incoming.title} at ${incoming.company} (${incoming.period}): ${incoming.description}.`,
    `Active project: ${taxbuddy.title}: ${taxbuddy.description}`,
  ].join("\n"),
  tags: ["about", "who", "intro", "summary", "overview", "bio", "profile", "background", "now"],
};

const contact: KBEntry = {
  path: "kb/contact.md",
  title: "Contact",
  text: [`Email: ${CONTACT.email}`, `GitHub: ${CONTACT.github}`, `LinkedIn: ${CONTACT.linkedin}`].join("\n"),
  tags: ["contact", "email", "mail", "reach", "hire", "hiring", "recruit", "message", "connect", "touch", "socials"],
};

// One file per company, so both AWS roles land in kb/experience/aws.md
const companies = Array.from(new Set(experiences.map((e) => e.company)));
const experienceEntries: KBEntry[] = companies.map((company) => {
  const roles = experiences.filter((e) => e.company === company);
  const acronym = company.match(/\(([^)]+)\)/);
  const site = roles.find((r) => r.website)?.website;
  const isIntern = roles.some((r) => /intern/i.test(r.title));
  return {
    path: `kb/experience/${slug(acronym ? acronym[1] : company.replace(/,? (Inc\.?|Group)$/, ""))}.md`,
    title: company,
    text: roles
      .map((r) => `${r.title} (${r.period}): ${r.description}`)
      .concat(site ? [`Website: ${site}`] : [])
      .join("\n"),
    tags: ["experience", "work", "job", "role", "career", "company", "employer", "position"].concat(
      isIntern ? ["intern"] : []
    ),
  };
});

const educationEntries: KBEntry[] = education.map((e) => ({
  path: `kb/education/${/Illinois/.test(e.school) ? "uiuc" : slug(e.degree)}.md`,
  title: e.school,
  text: [`${e.degree}, ${e.school} (${e.period})`]
    .concat(e.gpa ? [`GPA: ${e.gpa}`] : [])
    .concat(e.relevantCourses ? [`Relevant courses: ${e.relevantCourses.join(", ")}`] : [])
    .concat(e.description ? [e.description] : [])
    .join("\n"),
  tags: ["education", "school"]
    .concat(/Illinois/.test(e.school) ? ["uiuc", "illinois", "university", "college", "degree", "major", "study", "student", "graduate"] : [])
    .concat(e.gpa ? ["gpa", "grade"] : [])
    .concat(e.relevantCourses ? ["course", "class", "coursework"] : []),
}));

const involvementEntries: KBEntry[] = involvements.map((i) => ({
  path: `kb/involvement/${slug(i.organization.split(" ")[0])}.md`,
  title: i.organization,
  text: [`${i.role}, ${i.organization} (${i.period})`, i.description].join("\n"),
  tags: ["involvement", "extracurricular", "club", "organization", "activity", "leadership", "campus"].concat(
    /assistant/i.test(i.role) ? ["teaching", "ta"] : []
  ),
}));

const projectEntries: KBEntry[] = projects.map((p) => ({
  path: `kb/projects/${slug(p.id)}.md`,
  title: p.title,
  text: [`${p.title}: ${p.description}`]
    .concat(p.longDescription.split(/\n+/).filter(Boolean))
    .concat(p.features.map((f) => `- ${f}`))
    .concat([`Built with: ${p.technologies.join(", ")}`])
    .concat(p.demo ? [`Link: ${p.demo}`] : [])
    .concat(p.github ? [`Code: ${p.github}`] : [])
    .join("\n"),
  tags: ["project", "build", "made", "app", "portfolio"].concat(p.id === "taxbuddy" ? ["now", "active"] : []),
}));

// Which projects used each technology, counted case-insensitively ("Typescript" = "TypeScript")
const techUse = new Map<string, { name: string; used: string[] }>();
projects.forEach((p) =>
  p.technologies.forEach((t) => {
    const key = t.toLowerCase().replace(/\s+/g, "");
    if (!techUse.has(key)) techUse.set(key, { name: t, used: [] });
    techUse.get(key)!.used.push(p.title);
  })
);
const skills: KBEntry = {
  path: "kb/skills.md",
  title: "Technologies across his projects",
  text: Array.from(techUse.values())
    .sort((a, b) => b.used.length - a.used.length)
    .map((t) => `${t.name}: used in ${t.used.join(", ")}`)
    .join("\n"),
  tags: ["skill", "stack", "tech", "technology", "language", "programming", "tool", "framework", "proficient"],
};

const journeyEntries: KBEntry[] = milestones.map((m, i) => ({
  path: `kb/journey/${m.date}-${slug(m.short)}.md`,
  title: m.title,
  text: `${monthYear(m.date)} · ${m.title}: "${m.body}"`,
  tags: ["journey", "story", "timeline", "milestone", "history", "background"].concat(
    i === milestones.length - 1 ? ["now", "latest"] : []
  ),
}));

const guideEntries: KBEntry[] = guides.map((g) => ({
  path: `kb/guides/${slug(g.id)}.md`,
  title: g.title,
  text: `${g.title} (${g.category}, ${g.publishDate}): ${g.description}`,
  tags: ["guide", "blog", "writing", "article", "tutorial", "wrote", "post"],
}));

export const KB: KBEntry[] = [about, contact]
  .concat(experienceEntries)
  .concat(educationEntries)
  .concat(projectEntries)
  .concat([skills])
  .concat(involvementEntries)
  .concat(journeyEntries)
  .concat(guideEntries)
  .concat(EXTRA_FACTS);
