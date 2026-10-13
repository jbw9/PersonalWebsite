# STATUS

## Now
Director's Cut is the live site at `/` (`src/site/`); old versions at `/archive/<slug>`
(`src/archive/`). Hero is a particle globe: green Champaign dot, dashed arc to Seattle. demo.sh green.

## Left
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
