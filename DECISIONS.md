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
