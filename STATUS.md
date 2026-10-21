# STATUS

## Now
Fact-check interview with Jonathan done for story + knowledge base. `journey.ts` rewritten from his own
account (28 stops, semesters not months, vibes confirmed); experience/education/TaxBuddy facts corrected;
`EXTRA_FACTS` filled (hobbies, bowling, open to opportunities + Calendly). Alfred redeployed and verified
live. demo.sh green. Frontend NOT redeployed yet.

## Left
- Redeploy the site so the frontend changes go live (new story, semesters, Calendly, Alfred welcome + chips).
- Globe pass (Jonathan deferred it): Rilla (Aug 2026) sits between AWS and Now, so the game skips it;
  eyeball the new Singapore / Marina Bay Sands model; check 4 hero contact icons at 390px.
- Drop the YC AI Startup School photo at `public/yc-ai-sus.jpg` (Jonathan has pics).
- Fix the two slash-less companyIcons in `data.ts` (`kredivoLogo.png`, `wehearyouLogo.png`).
- After editing data files or `EXTRA_FACTS`: rerun `alfred/deploy.sh` (KB is baked into the Lambda).

## Bit us
- Port 3000 is the TaxBuddy app; this site's dev server is on `127.0.0.1:3001`.
- Game route keys on milestone `short` labels ("finance major", "fell in love", "iVenture + Tulip",
  "We Hear You", "Kredivo", "Massive", "AWS") — renaming one breaks a gate/segment.
- Shared gstack browse tab races between parallel builders — each builder used its own Playwright.
- Builders testing against each other's mid-edit code report phantom bugs; re-verify at fan-in.
