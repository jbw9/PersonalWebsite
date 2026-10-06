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
