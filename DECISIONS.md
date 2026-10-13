# Decisions

## 2026-10-06 — Variants as lazy routes at `/v/:slug`, switcher mounted in `index.tsx`
- **Chose:** each variant is a self-contained folder `src/variants/<slug>/`, lazy-loaded via a
  registry and rendered at `/v/:slug`; one floating switcher rendered outside `<Routes>`.
- **Beat:** (a) replacing `App.tsx` per variant on git branches — can't tap through them side by
  side; (b) a `?v=` query param inside `App.tsx` — `App.tsx` has uncommitted in-progress work and
  every variant would bloat the live bundle.
- **Cost:** `src/index.tsx` gains two imports and a route; the switcher also shows on `/` in
  production until the lab is removed. Replay works by remounting on `location.key`.
- **Breaks at scale:** fine to ~20 variants; past that the menu needs search. When one is picked,
  promote its folder into `App.tsx` and delete `src/variants/` + the two lines in `index.tsx`.

## 2026-10-06 — 3 builders, 2–3 variants each, Opus `builder`
- **Chose:** WS1 physical (bigbang, gravity, deck), WS2 spatial (os, canvas), WS3 cinematic
  (cinema, particles, kinetic) on `builder` (Opus).
- **Beat:** 8 one-variant builders (over the 3-builder cap) and `builder-fast` (these are taste
  calls — splash timing, layout — not mechanical work).
- **Cost:** each builder does its variants serially, so wall-clock ≈ the slowest 3-variant builder.

## 2026-10-06 — WS1 readback (bigbang, gravity, deck)
- **bigbang uses hand-placed absolute positions** (desktop + phone tables), not CSS layout — makes
  explode/implode an offset from the dot to 0. Cost: card text is clamped to fixed heights; letter
  widths of the Syne font are hardcoded, so a font load failure misspaces the name.
- **gravity hand-rolls a circle-only physics solver** (3 substeps, direct DOM transforms) for the
  toy box only; the bento tiles' fall is keyframed and triggers on scroll-into-view. Rejected
  box collisions as too much code for the visual gain.
- **deck is `position: fixed`, no page scroll** — a table, not a page; detail text scrolls inside
  the card. Zoomed card is a separate element animated from its hand slot.
- bigbang and gravity set `document.body.style.backgroundColor` and restore it on unmount.
- Unverified headless: real pointer drag/fling/swipe. Needs a human hand.

## 2026-10-06 — WS3 readback (cinema, particles, kinetic)
- **cinema attaches experience/education/involvement cards to the nearest milestone by parsed
  `period` date**, not a hand-written mapping — stays right when `data.ts` changes. Cost: YC AI
  Startup School lands in the Kredivo scene. Horizontal run is window scroll + spring with JS-computed
  panel widths (rejected framer `useScroll({target})`) so parallax and the vibe line align.
- **particles plots the journey curve evenly spaced, not by date** — by-date made fall 2023 a spike.
  Particle count scales with screen area (1.6k–5.2k), paused when tab hidden.
- Intros lock `html.style.overflow` only while playing; wheel/touch also skip.
- `data.ts` has two `companyIcon`s without a leading slash (`kredivoLogo.png`, `wehearyouLogo.png`):
  fine at `/`, broken under `/v/...`. WS3 normalises locally; other variants must too (fan-in check).

## 2026-10-06 — WS2 readback (os, canvas)
- **os dock is vertical on the left, icons right** — keeps bottom-centre clear for the switcher.
  Windows clamp ~90px above the bottom. "Genie" is faked with split X/Y springs from the icon origin
  (true mesh warp rejected). Terminal doesn't steal focus on auto-open so `[`/`]` still switch.
- **canvas camera is a single rAF loop writing transforms to the DOM**, not React state or
  framer-motion (which can't do zoom-around-cursor + momentum cleanly); `will-change` rejected
  (blurry text after zoom). Fit/tour exclude the layers panel and minimap, so default zoom is ~19%.
- WS2 verified with the Playwright bundled inside gstack (shared browse tab was unreliable with 3
  builders) — nothing added to the project.

## 2026-10-09 — Version 9 split into shell (WS4) + Ask terminal (WS5) behind `contracts.ts`
- **Chose:** two builders on one variant, with a frozen `AskTerminalProps`/`AchievementId` contract
  and a temporary `ask-preview` route so WS5 can see its terminal before WS4 embeds it.
- **Beat:** one builder doing everything (serial, slower), and importing from cinema/particles
  (those folders get deleted when a winner is promoted, so remix copies what it needs).
- **Cost:** duplicated cinema/particles code inside `remix/`; a throwaway registry entry.
- **Ask = local retrieval for now, behind one `answer()` seam.** It answers only from KB text and
  says "I don't know" below a threshold. Rejected calling the Claude API from the browser: the site
  is static GitHub Pages, so a key in the bundle would be public. The real version needs a small
  backend (e.g. a Lambda) — out of scope until Jonathan asks.

## 2026-10-09 — WS5 readback (Ask terminal)
- **Retrieval: IDF-weighted token overlap** (title/tags ×2, coverage multiplier, journey ×0.55 so
  the experience file ranks first). Rejected TF-IDF vectors as overkill at ~50 entries.
- **"Unknown" = any meaningful question word absent from the whole KB**, not a score threshold —
  otherwise GoBites' "favorite food trucks" answered "what's his favourite food?". Cost: typos get
  an honest refusal. Personal-life words (favorite, hobby, live, salary…) only match hand-written
  `EXTRA_FACTS`, never generated data.
- KB excludes projects' `howItWorks` and full guide content (noisy, widens the vocabulary and so
  weakens the unknown rule). `about.md`/`contact.md` reuse the live hero copy — the one
  non-generated source.
- Terminal ships its own `esc ✕` title bar (phones have no Esc), so the shell must not add a close.
- **Env trap:** `localhost:3000` can resolve to the TaxBuddy Next.js server on IPv6; this site's dev
  server is `127.0.0.1:3000`.

## 2026-10-09 — WS4 readback (remix shell)
- **The letterbox bars are the chrome**: the top bar becomes the nav, the bottom bar the vibe strip;
  mode switches are both bars closing to a slate and reopening. Rejected a separate overlay.
- **The vibe strip owns the curve** (cinema's in-run vibe line removed so it isn't drawn twice).
  Milestones evenly spaced with piecewise time interpolation (true-date axis crowds late 2023).
- **Story mode unmounts Sections** and pauses the particle loop; Sections scroll position is saved
  and restored. Story progress is one MotionValue (-1 title … n end) driving playhead + HUD.
- **Particle name waits for the Cormorant font** (polls up to 1.5s; `document.fonts.load()` resolves
  empty while the Google stylesheet is in flight) and re-samples if it arrives late.
- Files renamed (`story.ts`→`timeline.ts`, `Story.tsx`→`StoryMode.tsx`) after a case-insensitive
  filename clash confused webpack's cache.
- WS4 reported "Off Script" not unlocking for an unknown question; fan-in re-ran it against the final
  `answer.ts` in the real drawer: refusal shown, unknown + ask + story unlocked (3/7). Stale code
  mid-build, not a bug.

## 2026-10-11 — WS6 readback (remix revision: embedded graph, blue)
- **Bottom vibe strip removed.** Story mode gets cinema's in-scene curve back verbatim; Sections
  mode gets a new borderless `HeroCurve` (full-bleed, edge-faded, draws in after the intro, click a
  node → Story at that scene). Rejected keeping a persistent strip in any form — Jonathan read it as
  a bolted-on widget.
- Hero curve labels are hover-only (always-on labels overlap at ~77px node spacing); on phones the
  curve swipes sideways instead of squeezing 15 nodes into 390px. Story-mode drag-scrub dropped;
  clicking a node replaces it.
- **Palette → blue:** bg #070b14, text #e6ecf5, accent #5b9cff, glow #bcd7ff; terminal accent
  #6aa8ff. Green only on TaxBuddy's live dot.
- Fixed a round-2 bug: mobile Story jumps landed ~1 screen early (scene offsets were measured
  relative to the list, now page-relative).

## 2026-10-12 — Achievements removed; Ask renamed "Alfred"; film-jargon kickers dropped
- Jonathan asked to remove achievements. `AchievementId` and `onUnlock` are gone from
  `contracts.ts` (main thread changed the contract — no builders in flight); `Achievements.tsx`
  deleted; the shell's trophy button, toasts, panel and every `unlock()` call site removed.
- The assistant is now "Alfred" (button, drawer label, terminal title `alfred`, welcome line).
  The Claude-Code-style UI stays. `answer()` seam comment now says "LLM API", not Claude.
- Sections headers keep their 01–05 numbers but lose the film kickers ("the cast", "now playing",
  "on location", "supporting roles", "director's commentary"); TaxBuddy's label is just
  "active project". Story mode keeps its film framing — that's the concept.

## 2026-10-12 — Alfred calls Claude Haiku 4.5 on Bedrock via a Lambda Function URL
- **Chose:** `alfred/handler.mjs` on Lambda (nodejs22.x, arm64) behind a public Function URL,
  calling `InvokeModel` with the Anthropic messages body exactly like VisuLearn's `src/lib/bedrock.ts`.
  Model `global.anthropic.claude-haiku-4-5-20251001-v1:0` in account 010438509327 (the CLI's
  `amplify-dev` user; VisuLearn lives in 891376942131). Haiku 5.5 is listed but AccessDenied.
- **Beat:** API Gateway (more pieces; throttling is per-second, not a daily budget), CDK/SAM (new
  deps), calling Bedrock from the browser (credentials would be public on GitHub Pages).
- **Grounding:** the KB is compiled from the same `knowledge.ts` the terminal uses
  (`alfred/build.mjs`) and shipped inside the Lambda — the client sends only the question, so the
  endpoint can't be used as a general LLM proxy with a custom prompt. Structured output via a forced
  `reply` tool (`known`, `reads`, `text`); `reads` filtered to real KB paths. System prompt cached.
  Today's date is in the prompt so tenses are right.
- **Abuse caps (Jonathan chose these):** DynamoDB counters — 30/IP/day, 500/day total, reserved
  concurrency 5, 300-char questions, 600 max tokens. Worst case ≈ $5/day. CORS allows only
  jonathanbw.me, www, jbw9.github.io and the local dev origins (CORS doesn't stop curl; caps do).
- **Fallback:** if `REACT_APP_ALFRED_URL` is unset or the call fails, the old keyword search answers.
  429 shows a friendly "asked enough for today" with the email.
- **Breaks at scale:** single-turn (no memory of earlier questions); the KB is ~8k tokens, fine to
  ~50k; the daily cap is global, so a single abuser can exhaust it for everyone (IP cap slows that).
  Redeploy (`alfred/deploy.sh`) after editing data or `EXTRA_FACTS`, since the KB is baked in.

## 2026-10-12 — Round 5: rounder, barless, real detail pages
- **Detail pages are new routes (`/v/remix/project/:id`, `/v/remix/guide/:id`)**, not an in-page
  overlay and not edits to `src/popup/*`. Beat: overlay (no back button, no shareable URL) and
  restyling the old pages (the live `/` still uses them). Cost: the remix remounts on return, so it
  stamps `{resume:{y}}` into its own `history.state.usr` before leaving and skips the intro when it
  finds one (stamp is consumed so a reload still plays the intro). Breaks if React Router stops
  reading `history.state.usr` — it's an internal shape. On promotion these become `/project/:id`.
- **Project particles follow live DOM rects** (`[data-frame]`, read every frame) instead of a
  pre-sampled grid. Beat: re-sampling an offscreen canvas on scroll (too slow per frame). Cost: ~12
  `getBoundingClientRect` calls per frame while Projects is active.
- **No top bar.** Sections/Story toggle + Ask Alfred float as pills top-right; a dot rail on the
  right edge (≥1024px) replaces the section links. Story keeps its letterbox (it's the film).
- **YC logo is an SVG** (`public/ycLogo.svg`) instead of the inline base64 PNG that rendered half
  missing. YC photo is `education[].photo`; the hover peek only exists once the image loads, so a
  missing file just means no peek.
- **Experience is the original site's git-graph timeline**, redrawn dark: one branch, nodes,
  current/upcoming roles glow, the line draws itself with scroll.

## 2026-10-12 — Round 6: globe hero, promotion to `/`
- **Globe land is a baked 1° bitmap** (`src/site/world.ts`, ~17KB, Natural Earth 110m via
  world-atlas, rasterised once in Python) instead of a topojson/d3-geo dependency or fetching at
  runtime. Cost: coastlines are 1° blocky, invisible at particle density. Antimeridian-crossing
  rings had to be unwrapped (and Antarctica closed via the pole) or the far north rasterised empty.
- **The globe sways ±50° around 100°W instead of spinning**, so Champaign and Seattle never go round
  the back. Cost: you never see Asia face-on. The markers/arc are drawn on the canvas, not as
  particles, so the green dot stays crisp and labelled.
- **Archive, don't delete.** Old versions moved to `src/archive/` and stay routable at
  `/archive/<slug>` (lazy chunks; visitors to `/` never download them). Beat: moving them outside
  `src/` (would rot uncompiled). Cost: they still typecheck and build with every change.

## 2026-10-12 — Round 7: no splash, live globe, morphing Story transition
- **No intro.** The page opens on the settled globe (engine `resume` snaps particles onto it on the
  first frame); the letterbox only exists in Story. The galaxy/intro code in the engine is now unused.
- **Globe spins and can be dragged** (horizontal only, flick momentum capped, eases back to a ~6°/s
  spin). Once formed its particles are locked to the surface (no springs, no cursor repulsion),
  because the springy trail read as jitter. Particle cap went 5200 → 9000 so islands show.
- **Per-formation particle budget** (`USE`): side shapes use 40–55% of particles, the rest drift as
  very faint dust. Beat: separate particle counts per shape (would break the morphs between shapes).
- **Into Story = the hero's vibe line morphs into the film's** (`Bridge.tsx`): node positions are
  interpolated from the hero DOM to `storyNodes()` (Story's own geometry, now exported), then hand
  off. Toggle opens at scene 1 (the title card has no nodes on screen). Phones and the way back get
  a plain crossfade. Replaced the bars-close curtain.
- Bandung is drawn as a waving 🇮🇩 flag on a pole, on the canvas with the other markers.

## 2026-10-12 — Experience rows: company-first, per-company particle shapes, detail sheet
- **Chose:** each row leads with logo + company, then one-line `summary`, then `tags`; full `details`
  open in a portal sheet (not a route). Rows carry their own `data-shape`; the scroll picker now takes
  the innermost `[data-shape]` hit, the section's `data-sec` still drives the rail.
- **Beat:** a `/experience/:id` page (too little content), and keeping title-first rows (hard to scan).
- **Cost:** `summary`/`tags`/`details` in `data.ts` are drafts inferred from existing copy; tech tags
  are guesses Jonathan must correct. Five new hand-drawn formations (chart, card, guitar, tulip, hand)
  share a `blob()` union-outline helper.
- **Breaks when:** a company name changes (SHAPE_OF is keyed by name; unknown falls back to cloud).

## 2026-10-12 — We Hear You formation signs ASL "hello" (animated)
- **Chose:** head + flat hand at the temple; the hand's particles sit at the end of the target array and
  the frame loop rotates them about the elbow on a 3.6s salute loop (springs at 2.2× so they keep up).
- **Beat:** a static ILY hand (Jonathan: "just static"), and per-frame rebuilds of the sampled shape (too slow).
- **Cost:** one shape-specific branch in the hot loop (`waving`), cheap: a cos/sin per frame.

## 2026-10-12 — Easter egg: "The long way to Seattle", a paper-plane game on a tiny planet
- **Chose:** three.js 0.162 (TS 4.9-compatible types), lazy chunk loaded only when found; trigger is three
  hard globe flicks within 4s (`FieldOptions.onFlick`), with a "one more spin" hint after two and a console
  hint. Low-poly Earth from the same `land()` mask; a gate per chapter; milestones between gates become
  storms (dips) or orbs; finale lights the flown route in green (the hero's unlit arc, lit).
- **Beat:** a car (Bruno Simon's), a particle comet (Jonathan picked the plane), react-three-fiber (3 deps).
- **Cost:** ~530KB chunk for three (not on the main path); no WebGL → friendly fallback screen.
- **Breaks when:** a milestone's `short` is renamed (gates look them up by `short`).

## 2026-10-12 — Game v2: one eastward route, height = vibe, U-turn loops, pauses, autopilot
- **Chose:** every milestone (not just gates) sits on one route that always heads east: Bandung →
  Champaign (South Pacific) → Jakarta (Atlantic/Asia) → Seattle (North Pacific), latitude bowed so the
  two Pacific crossings don't overlap. Altitude = `vibe`; each `dip` adds a full left loop (a U-turn) with
  a storm. The route is drawn as a tube (done green / current bright / later faint), the next gate gets a
  light pillar, a NEXT pill with path distance, and a vibe altimeter. Letting go of the controls hands
  over to an autopilot that follows the path. Gates pause the flight: the camera circles the chapter's
  monuments while a card waits 10s (skip with space/click). Future islands stay hidden until next.
- **Beat:** v1's real-place gates (Jonathan: "clumped up and going back and forth", hard to follow).
- **Cost:** chapter places are no longer geographic except Bandung, Champaign, Jakarta (Kredivo's
  Monas) and Seattle; the autopilot makes the game easy by design: it's a story first.
- **Breaks when:** milestones grow a lot (each stretch is evenly divided; >15 per stretch gets tight).

## 2026-10-12 — Old /v/* URLs redirect; detail-page back keeps the history pop
- **Chose:** `/v/remix` → `/`, `/v/remix/project|guide/:id` → `/project|guide/:id`, `/v/:slug` →
  `/archive/:slug`, and a `*` catch-all → `/`, all `replace`. The detail page's back stays
  "`history.idx > 0` → `navigate(-1)`, else `/`".
- **Beat:** marking in-site arrivals with router state and only popping history then. That fixes stale
  tabs too, but the archived versions also link into `/project/:id` without the state, so their back
  would jump to `/` instead of returning to the archive.
- **Cost:** popping onto a stale `/v/remix` entry lands on `/` through the redirect, without the
  "resume at Projects" state, so the intro plays.
- **Breaks when:** a route is renamed again without a redirect: the catch-all hides it as a silent
  bounce to `/`.

## 2026-10-12 — We Hear You: a 3D waving hand, posed per frame
- **Chose:** the hand is a point cloud in 3D (capsule forearm/fingers/thumb, slab palm) that swings
  about the elbow, flexes at the wrist and turns partway sideways, perspective-projected every frame;
  back-facing dots draw in the dim bucket for depth. The experience row crossing mid-screen (the one
  the particles are drawing) is lit, the others dim to 75%.
- **Beat:** the 2D ASL-hello figure (head + saluting hand). Jonathan: "weird with the person holding it".
- **Cost:** one `pose()` per hand particle per frame (~4.5k trig-heavy calls) while the hand shows.
- **Breaks when:** the row-highlight rule and index.tsx's shape rule ("crosses the middle") drift apart.
