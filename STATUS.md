# STATUS

## Now
Round 3 (Director's Cut revision) green: graph embedded in hero + Story, blue palette, demo.sh passes,
no console errors at 1280x800 / 390x844. Dev server is now 127.0.0.1:3001. Waiting on Jonathan.

## Left
- Jonathan tries it by hand (drag-scrub on the strip, touch, real fonts on his machine).
- Fill `EXTRA_FACTS` in `src/variants/remix/ask/knowledge.ts` with facts about himself.
- Real Claude answers: swap `answer()` in `remix/ask/answer.ts` for a backend call (needs a small
  server/Lambda to hold the API key — GitHub Pages is static).
- Promote the winner into `App.tsx`; delete `src/variants/` + the 2 lines in `index.tsx`; fix the two
  slash-less companyIcons in `data.ts`.

## Bit us
- Port 3000 is the TaxBuddy app; this site's dev server is on `127.0.0.1:3001`.
- `data.ts` companyIcons `kredivoLogo.png` / `wehearyouLogo.png` lack a leading `/`.
- Shared gstack browse tab races between parallel builders — each builder used its own Playwright.
- Builders testing against each other's mid-edit code report phantom bugs; re-verify at fan-in.
