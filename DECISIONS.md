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
