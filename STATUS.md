# STATUS

## Now
Round 2 fan-in done, green: demo.sh passes; `/v/remix` ("Director's Cut", 9th variant) verified at
1280x800 and 390x844 — intro, sections, story toggle, Ask drawer (known + unknown answers),
achievements — no console errors, no horizontal overflow. Temporary `ask-preview` route removed.
Waiting on Jonathan's reaction.

## Left
- Jonathan tries it by hand (drag-scrub on the strip, touch, real fonts on his machine).
- Fill `EXTRA_FACTS` in `src/variants/remix/ask/knowledge.ts` with facts about himself.
- Real Claude answers: swap `answer()` in `remix/ask/answer.ts` for a backend call (needs a small
  server/Lambda to hold the API key — GitHub Pages is static).
- Promote the winner into `App.tsx`; delete `src/variants/` + the 2 lines in `index.tsx`; fix the two
  slash-less companyIcons in `data.ts`.

## Bit us
- `localhost:3000` can hit the TaxBuddy Next.js server (IPv6); this site is `127.0.0.1:3000`.
- `data.ts` companyIcons `kredivoLogo.png` / `wehearyouLogo.png` lack a leading `/`.
- Shared gstack browse tab races between parallel builders — each builder used its own Playwright.
- Builders testing against each other's mid-edit code report phantom bugs; re-verify at fan-in.
