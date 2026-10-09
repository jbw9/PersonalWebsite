# PLAN — Website variant lab

## Goal
Jonathan's portfolio (`/`, `src/App.tsx`) looks good but nothing *happens* when it opens, and
the layout is a fixed vertical stack (hero → journey → experience → projects …). Build **8
radically different versions** of the site, each with a wow-factor intro/splash and a
non-linear, interactive layout. He taps through them with a floating switcher and picks one.

`/` (the live site) is **not touched** — the variants are previews at `/v/<slug>`.

## Stack
CRA (react-scripts 5) + React 18 + TypeScript 4.9 (`target: es5`) + Tailwind 3 +
framer-motion 11 + lucide-react + @tabler/icons-react. React Router 7. **No new dependencies.**
Canvas 2D, SVG, CSS 3D transforms and hand-rolled physics are all fair game.

## Contracts (frozen — written in main thread, do not edit)
- `src/variants/registry.ts` — list of variants: `{ slug, name, pitch, Component }`, lazy-loaded
  from `./<slug>` (i.e. `src/variants/<slug>/index.tsx` default export).
- `src/variants/VariantPage.tsx` — route `/v/:slug`; mounts the variant with `key={location.key}`,
  so the switcher's **replay** button remounts it. Scrolls to top on every mount.
- `src/variants/VariantSwitcher.tsx` — floating pill fixed bottom-center (~280×56px, z-index
  2147483000). `[` / `]` keys switch variants (ignored while typing in inputs).
- `src/index.tsx` — route + switcher wiring.
- **Data (read-only)**: `src/data.ts` (`experiences`, `education`, `involvements`),
  `src/data/projects.ts` (`projects`), `src/data/journey.ts` (`milestones`, `JOURNEY_START`),
  `src/data/guides.ts` (`guides`). Import them; never copy content into a variant.

### Every variant must
1. Live entirely in `src/variants/<slug>/` with `index.tsx` default-exporting a no-props component.
2. Play its intro on **every mount** (no "seen it" storage) — replay is how Jonathan compares them.
   Intro hands control to the user within ~4s; any click/key during the intro skips to the end
   state. `prefers-reduced-motion` → skip straight to the end state.
3. Show **all** the content somewhere: name ("Jonathan"), tagline (CS & Econs @ UIUC), contact
   (mailto:jbw7@illinois.edu, https://github.com/jbw9, https://www.linkedin.com/in/jwidjajakusuma/),
   the two headline facts (incoming SDE @ AWS; TaxBuddy is the active project), journey
   milestones, experiences, education (UIUC GPA), projects, guides, involvements.
   Project click → `navigate(\`/project/${id}\`)`; guide click → `navigate(\`/guide/${id}\`)`.
4. Clean up **every** global side effect on unmount (body/html styles, overflow, cursor,
   listeners, rAF loops, timers, injected `<link>`s). Variants are switched without reload.
5. Keep the bottom-center ~300×72px clear of essential controls (switcher lives there).
6. Work at 390px wide (phone) without horizontal page overflow — simplified is fine, broken isn't.
   Desktop 1280×800 is the primary showcase.
7. Scope any CSS: Tailwind classes, inline styles, or a co-located `.css` file whose every
   selector sits under the variant's root class (`.v-<slug> …`). CSS chunks persist after
   switching, so unscoped CSS leaks into other variants. Extra Google Fonts via `@import` in that
   scoped CSS file are allowed.
8. TS gotcha: `target: es5` without `downlevelIteration` — `for…of` over Map/Set and spreading
   Sets/Maps fail `tsc`. Use `Array.from`.
9. Feel distinct from every other variant (aesthetic, palette, typography, layout, intro).
   Avoid generic "AI-template" looks. The current site's warm paper/bullet-journal style is
   one option among many — at least half the variants should look nothing like it.

### Verifying your work
- Typecheck: `npx tsc --noEmit -p . 2>&1 | grep 'src/variants/<slug>'` must print nothing
  (other builders are mid-edit; ignore errors outside your folders). **Do not run `npm run build`.**
- A CRA dev server is already running at http://localhost:3000 with hot reload. Don't start another.
- Look at what you built. Headless browser: `B=~/.claude/skills/gstack/browse/dist/browse`.
  The daemon is **shared with other builders**, so use your own tab: `$B newtab <url> --json`
  → note `tabId`, then pass `--tab-id <N>` to commands, or run atomic sequences via
  `echo '[["goto","…"],["wait","1500"],["screenshot","/path.png"]]' | $B chain`.
  Check intro mid-flight (e.g. 500ms, 1500ms) and settled; check 390px width; check `$B console`
  for errors. Read the PNGs. Iterate until it genuinely looks great — this is a taste task.

## Workstreams

### WS1 — Physical: bigbang, gravity, deck  (builder)
owns: `src/variants/bigbang/**`, `src/variants/gravity/**`, `src/variants/deck/**`
done-when: tsc clean for owned folders; each route renders intro → settled state with no
console errors at 1280×800 and 390×844.

- **bigbang — "Big Bang"** (Jonathan literally asked for "explosive"). Dark space-ish start: a
  single bright dot pulses (charging), shudders, then **detonates** — a flash + shockwave ring,
  and every piece of content (name letters, tags, project cards, experience cards, journey
  emoji, school, involvement stickers) blasts outward from the center with spring physics,
  spinning, overshooting, then settles into a scattered-but-readable **desk/collage** layout
  (not a vertical stack). Everything is draggable and flick-able with momentum (framer
  `drag` + inertia), cards straighten on hover, click opens detail. A "💥 again" button
  re-implodes everything into the dot and re-explodes it. Maybe cursor proximity nudges cards.
- **gravity — "Gravity / Fall into place"** (his other ask: "just fall into place"). Light,
  playful, bold color. Letters of JONATHAN drop from above one by one with real gravity,
  bounce and squash on landing, then the rest of the page **rains down and stacks** into a
  bento grid (cards land with weight, slight bounce, settle). Hero has a **toy box**: skill /
  fact chips (AWS, TaxBuddy, UIUC, languages, emojis from the journey) are real 2D physics
  bodies (hand-roll a small circle/box solver with gravity, collisions, walls) you can grab,
  throw, and that react to the cursor. A "tilt" or "shake" button / device motion is a bonus.
- **deck — "Card Deck"**. Tabletop/card-game aesthetic (felt or rich color, crisp card faces,
  great typography). Intro: a deck materialises, **riffle-shuffles**, then **deals** cards
  into a fanned hand / spread. Each card = a chapter (About, Journey, Experience, each
  project, School, Involvement, Guides). Hover lifts a card from the fan, click **3D-flips**
  and zooms it to read the back with details; swipe/drag cards Tinder-style to cycle the
  deck; keyboard arrows also work. Layout is the table, not a scroll page.

### WS2 — Spatial: os, canvas  (builder)
owns: `src/variants/os/**`, `src/variants/canvas/**`
done-when: as WS1.

- **os — "JonathanOS"**. Intro: a convincing **boot sequence** — power-on, logo, fast scrolling
  boot log with Jonathan-flavoured lines (`[ OK ] Mounted /uiuc/cs`, `Loading aws-msk.ko`,
  `Starting taxbuddy.service`), progress bar, then the desktop fades in with a wallpaper. A
  desktop with icons (Projects folder, Experience, Journey, School, Guides, Terminal,
  About/Readme, Contact), a menu bar with clock, a **dock with macOS-style magnification**.
  Windows open with a genie/scale animation, are **draggable**, focusable (z-order), closable,
  minimisable to the dock. On load an "About Jonathan" window auto-opens. **Terminal app**
  actually works: `help`, `ls`, `cat about`, `projects`, `open taxbuddy`, `journey`, `whoami`,
  `contact`, `sudo hire jonathan`, `clear` — with tab-completion. Mobile: a phone home-screen
  of app icons, each opening full-screen. Leave the bottom-center clear (put the dock
  bottom-left/right on desktop, or vertical on the left).
- **canvas — "Infinite Canvas"**. Figma/Miro-like whiteboard. Intro: the screen is a single
  dot labelled "you are here"; the camera **zooms out** smoothly revealing a huge canvas with
  islands/clusters (Hero, Journey as a winding hand-drawn path of milestone stickies with
  arrows, Experience, Projects as pinned frames with screenshots `project.image`, School,
  Guides, Involvement). Pan by drag (with inertia), zoom with wheel/pinch around the cursor,
  zoom buttons, a **minimap** (top-right) and a **"Take the tour"** button that flies the camera
  between islands with a caption per stop. Multiplayer-style fake cursors labelled "recruiter"
  / "you" drifting around is a fun touch. Mobile: touch pan + pinch, or fall back to a
  stacked list of islands.

### WS3 — Cinematic: cinema, particles, kinetic  (builder)
owns: `src/variants/cinema/**`, `src/variants/particles/**`, `src/variants/kinetic/**`
done-when: as WS1.

- **cinema — "Cinematic"**. Film-title-sequence intro: letterbox bars, black, "JONATHAN"
  revealed through a mask / light sweep with letter-spaced serif, film grain, a counter or
  slate. Then the bars open and the page becomes a **scroll-driven horizontal journey**:
  vertical scroll scrubs sideways through chapters (Finance major → CS124 → Tulip → internships
  → AWS → now) built from `milestones`, with **parallax layers**, big chapter numbers, the vibe
  line drawn as you go, experience and projects appearing as you reach their dates.
  Ends on a vertical section (projects grid, guides, contact) after the horizontal run.
  Mobile: vertical version of the same story.
- **particles — "Particles"**. Dark, minimal, premium. Intro: thousands of canvas particles
  swirl in from the edges like a galaxy and **coalesce into "JONATHAN"**; the cursor repels
  them (they spring back), clicking sends a shockwave. On scroll the particles **morph** into
  other shapes: a cloud (AWS), the journey vibe curve, a grid (projects)… behind sections of
  content. Rest of the page: elegant, sparse, glassy cards, a custom cursor, magnetic buttons.
  Keep it 60fps (typed arrays, cap particle count on mobile, pause when tab hidden).
- **kinetic — "Kinetic Type"**. Loud brutalist/editorial look: one or two bold colours (e.g.
  acid/electric on black, or red on cream), huge condensed display type (Google Font).
  Intro: words **slam** onto the screen one at a time with impact (screen shake, oversize →
  settle) "HEY. I'M JONATHAN. I BUILD THINGS." then crunch into the hero. Text **scrambles**
  (decode effect) on hover, infinite **marquee** bands (AWS · TAXBUDDY · UIUC …) whose speed
  follows scroll velocity, sticky **stacking cards** for experience, projects as a giant
  hover-list where a preview image follows the cursor, journey as oversized numbered lines.
  The layout is the opposite of a polite stack: overlapping, rotated bands, asymmetric grid.

## Fan-in
Main thread: `./demo.sh` (typecheck + production build), screenshot every route intro +
settled + mobile, read back each builder's diff, log surprises to `DECISIONS.md`.

---

# Round 2 — Version 9: "Director's Cut" (`/v/remix`)

## Jonathan's feedback on round 1 (2026-10-09)
- **Cinematic** is the favourite: the look, and above all the **vibe graph strip along the bottom**.
  But a timeline-first layout is wrong for a portfolio: "most people who go to personal websites
  want to go directly to the relevant section". Wants a **toggle between story time and normal**.
- **Particles**: loves how it flows from one place to another, changing shape as you go.
- **Card Deck**: loves the gamified fun, but not poker. → light, clean gamification instead.
- **JonathanOS**: too nerdy, and hard to use on mobile.
- New: a **Claude Code emulator** where visitors ask about him. It answers from a knowledge base
  and says it doesn't know when the answer isn't there. **UI only for now** (no API calls yet).
- "Keep it clean and nice." Desktop is the priority; mobile-friendly if possible.

## Round-2 contracts (frozen — main thread)
- `src/variants/remix/contracts.ts` — `AchievementId`, `AskTerminalProps`.
- `src/variants/remix/ask/AskTerminal.tsx` default export implements `AskTerminalProps` and
  **fills its parent** (`h-full w-full`). The shell owns the drawer around it.
- Registry has `remix` and a temporary `ask-preview` (→ `remix/ask/Preview.tsx`), removed at fan-in.
- All round-1 "Every variant must" rules still apply.
- **Self-contained:** `remix` will likely be promoted to the live site and the other variants deleted,
  so **copy** what you need from `src/variants/cinema/**` and `src/variants/particles/**` into
  your folder. Never import from another variant's folder. Read those folders; never edit them.

### WS4 — remix shell  (builder)
owns: `src/variants/remix/**` except `src/variants/remix/ask/**` and `src/variants/remix/contracts.ts`
done-when: tsc clean for `src/variants/remix`; /v/remix plays intro → Sections mode; the Story
toggle works both ways; the Ask drawer opens with the (stub or real) terminal; no console errors and
no horizontal overflow at 1280×800 and 390×844.

- **Look:** cinema's palette and type (warm black, Cormorant Garamond + IBM Plex Mono, amber
  accent, subtle grain). Restraint: clean and premium, not busy.
- **Intro (≤3s, skippable):** letterbox bars plus cinema's title feel, but the name **forms from
  warm amber/cream particles** (from particles' engine). Then the bars open into the page.
- **Nav (sticky, minimal):** a J mark; section links (Experience, Projects, School, Involvement,
  Guides); a segmented **Sections | 🎬 Story** toggle; the achievements counter (🏆 n/7); an
  **Ask Claude** button.
- **Sections mode (default)** — direct and scannable, and the order puts what recruiters want first:
  - Hero: particle name, tagline, the AWS + TaxBuddy chips, contact, and a CTA "Ask Claude about me".
  - **Experience** (cards with logo, role, dates; upcoming/current highlighted).
  - **Projects** (cinema's "Now playing" grid style; TaxBuddy featured).
  - School (GPA), Involvement, Guides, contact footer.
  - A fixed particle canvas behind the page **morphs per active section** (name → AWS cloud →
    project grid → "3.90" → globe …), as the particles variant does. It sits on the right on
    desktop and is dimmed behind content on mobile. Keep it subtle enough that text stays readable.
- **Vibe graph strip pinned at the bottom in both modes** (his favourite part):
  - In Sections mode, hovering a dot shows emoji, title and date.
  - Hovering an experience card highlights that period on the strip.
  - Clicking a dot switches to Story mode at that scene.
  - In Story mode the strip is the scrubber with a playhead, as in cinema.
  - The temporary switcher pill may overlap the strip's centre; just don't put buttons at
    bottom-centre.
- **Story mode:** cinema's scroll-driven horizontal run of scenes, essentially as-is (vertical on
  mobile). Switching modes is cinematic (bars close, then reopen). Leaving Story returns you to
  your Sections scroll position.
- **Achievements** (the gamification, replacing poker):
  - A small toast top-right: "🏆 Unlocked · Director — watched Story mode".
  - The nav counter opens a panel listing all 7; locked ones show a hint.
  - The shell awards `story`, `explorer`, `vibe` and `shockwave`; the terminal fires `ask`,
    `unknown` and `hire` through `onUnlock`.
  - Kept in memory only (resets on replay). Subtle; never blocks content.
- **Ask drawer:** mount `<AskTerminal>` **once** and keep it mounted, so history persists between
  openings. It's a right-side drawer on desktop (~540px wide) and a full-screen sheet on mobile.
  Open it from the nav button, the hero CTA, or `/` (when not typing). Esc closes it via `onClose`.

### WS5 — Ask terminal  (builder)
owns: `src/variants/remix/ask/**`
done-when: tsc clean for `src/variants/remix/ask`; /v/ask-preview shows the terminal. In it:
answering a known question, an unknown question, `/help`, `/clear` and `sudo hire jonathan` all
work with no console errors at 1280×800 and 390×844.

- **Emulate the Claude Code CLI's feel** (no Anthropic logo; its own name, e.g. "Ask Jonathan"):
  - A welcome box with "✻ Welcome to …", cwd `~/jonathan` and a couple of tips.
  - A bordered `>` prompt box; the user's message echoed back.
  - A spinner line with cycling glyphs (· ✢ ✳ ✶ ✻ ✽), whimsical verbs ("Pondering…") and elapsed
    seconds.
  - Tool-call lines: `⏺ Read(kb/experience/aws.md)` followed by `⎿  Read 6 lines`.
  - The answer streams in after a `⏺` bullet.
  - Slash commands `/help`, `/clear`, `/contact`, `/exit`; ↑/↓ history; Esc → `onClose`.
  - Clickable suggested-question chips (essential on mobile).
  - Palette: warm black, cream text, a Claude-Code-like terracotta accent; monospace (IBM Plex Mono
    via `@import` in a CSS file scoped under `.v-remix-ask`).
  - A status line stating honestly that it's an offline demo answering only from Jonathan's
    knowledge base.
- **Knowledge base** `ask/knowledge.ts`:
  - `KBEntry { path; title; text; tags }`, generated from `data.ts`, `projects`, `milestones` and
    `guides`, with fake file paths like `kb/projects/taxbuddy.md`.
  - Plus an exported `EXTRA_FACTS: KBEntry[]` that Jonathan fills by hand. Leave it empty with one
    commented example.
  - **Never invent facts.**
- **The seam** `ask/answer.ts`:
  - `export async function answer(question: string): Promise<Answer>`, with
    `Answer = { reads: string[]; text: string; known: boolean }`.
  - This is the only function to swap for a real Claude API call later; say so in one comment.
  - For now: keyword/token-overlap retrieval with a threshold. Compose the answer only from
    retrieved text.
  - Below the threshold, return `known: false` with "I don't know — that's not in Jonathan's
    knowledge base", plus a suggestion to email him.
- Fire `onUnlock("ask")` on the first known answer, `"unknown"` on the first unknown, and `"hire"` on
  `sudo hire jonathan` (a small playful sequence ending in a mailto).
- Don't steal focus when `active` is false. Focus the prompt when `active` flips to true.
