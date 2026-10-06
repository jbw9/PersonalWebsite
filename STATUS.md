# STATUS

## Now
Round 1 fan-out: WS1 (bigbang, gravity, deck), WS2 (os, canvas), WS3 (cinema, particles,
kinetic) building in parallel. Spine is green: `/v/:slug` routes + switcher render stubs.

## Left
- Fan-in: demo.sh, screenshot all 8 routes (intro, settled, mobile), read back diffs.
- Jonathan picks a favourite → promote it into `App.tsx`, delete `src/variants/`.

## Bit us
- `App.tsx` / `data.ts` / journey components have uncommitted in-progress work — variants
  import data read-only and never touch them.
