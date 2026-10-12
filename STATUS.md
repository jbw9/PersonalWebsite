# STATUS

## Now
Alfred is live: Lambda `alfred` (us-east-1, account 010438509327) answering with Claude Haiku 4.5
on Bedrock from the site KB. Verified with curl + from a browser on 127.0.0.1:3001; prod build bakes
the URL in. Dev server must be restarted to read `.env.local`.

## Left
- Jonathan tries it by hand (drag-scrub on the strip, touch, real fonts on his machine).
- Fill `EXTRA_FACTS` in `src/variants/remix/ask/knowledge.ts` with facts about himself.
- After editing data files or `EXTRA_FACTS`: rerun `alfred/deploy.sh` (KB is baked into the Lambda).
- Promote the winner into `App.tsx`; delete `src/variants/` + the 2 lines in `index.tsx`; fix the two
  slash-less companyIcons in `data.ts`.

## Bit us
- Port 3000 is the TaxBuddy app; this site's dev server is on `127.0.0.1:3001`.
- `data.ts` companyIcons `kredivoLogo.png` / `wehearyouLogo.png` lack a leading `/`.
- Shared gstack browse tab races between parallel builders — each builder used its own Playwright.
- Builders testing against each other's mid-edit code report phantom bugs; re-verify at fan-in.
