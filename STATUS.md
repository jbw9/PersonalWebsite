# STATUS

## Now
Round 8 done: experience rows redesigned, per-company particles (We Hear You signs "hello"), and the
hidden game v2 (flick the globe 3×): one eastward route, height = vibe, U-turn loops at dips, chapter
pauses, monuments + logos, autopilot. demo.sh green.

## Left
- Jonathan checks the drafted experience `summary`/`tags`/`details` in `data.ts` (tech tags are guesses).
- Rerun `alfred/deploy.sh` so Alfred knows the new experience details.
- Drop the YC AI Startup School photo at `public/yc-ai-sus.jpg` (hover peek appears once it exists).
- Jonathan tries it by hand (drag-scrub on the strip, touch, real fonts on his machine).
- Fill `EXTRA_FACTS` in `src/variants/remix/ask/knowledge.ts` with facts about himself.
- After editing data files or `EXTRA_FACTS`: rerun `alfred/deploy.sh` (KB is baked into the Lambda).
- Fix the two slash-less companyIcons in `data.ts`.

## Bit us
- Port 3000 is the TaxBuddy app; this site's dev server is on `127.0.0.1:3001`.
- `data.ts` companyIcons `kredivoLogo.png` / `wehearyouLogo.png` lack a leading `/`.
- Shared gstack browse tab races between parallel builders — each builder used its own Playwright.
- Builders testing against each other's mid-edit code report phantom bugs; re-verify at fan-in.
