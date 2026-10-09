# STATUS

## Now
Round 2 fan-out: WS4 (remix shell) + WS5 (Ask terminal) building version 9 "Director's Cut" at
`/v/remix` from Jonathan's feedback (cinematic + particles, sections-first with Story toggle,
achievements, Claude-Code-style Ask terminal). Round 1's 8 variants are green.

## Left
- Fan-in round 2: demo.sh, screenshots, readback, remove the temporary `ask-preview` registry entry.
- Real answers: swap `remix/ask/answer.ts` for a Claude API call (needs a backend for the key —
  GitHub Pages is static). Jonathan fills `EXTRA_FACTS`.
- Promote the winner into `App.tsx`; delete `src/variants/` + the 2 lines in `index.tsx`.

## Bit us
- `data.ts` companyIcons `kredivoLogo.png` / `wehearyouLogo.png` lack a leading `/` -> break under
  nested routes. Variants normalise; fix data.ts at promotion time.
- Shared gstack browse tab races between parallel builders - give each builder its own browser.
- Dev-server Tailwind lags after new files appear; fresh screenshots can look unstyled.
