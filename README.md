# TycheTouch

A diagnostic marketing read tool by Tyche Digital Agency + VD Advisory Group. Users submit their birth data, offer details, and marketing reality. The tool calculates their Human Design and astrology chart server-side using Swiss Ephemeris, then generates a personalized strategic read via Claude, and routes them to the right next step based on their budget.

## Stack

- **Next.js 14** (App Router) on Vercel
- **Swiss Ephemeris** (`sweph`) for astrology calculations, server-side
- **Anthropic Claude Sonnet 4.5** for the read generation
- **Tailwind CSS** for styling
- **Nominatim** (OpenStreetMap) for free geocoding
- **tz-lookup** for timezone detection from coordinates

## User Flow

1. Landing page (`/`)
2. Four-step quiz (`/quiz`): birth data → offer → marketing reality → goals + budget
3. Result page (`/result`): runs chart calculation, then AI read, displays diagnostic
4. Routed CTA based on budget input

## Budget-Based Routing

| Budget         | Route                                                       |
|----------------|-------------------------------------------------------------|
| $0 / exploring | Diagnostic Partner at `ai.tychedigitalagency.com` (free)    |
| Up to $500     | Direction Session with Veronica ($500 / 60 min)             |
| $1,000+/mo     | Tyche Marketing Support                                     |
| $2,500+        | GHL Foundational Build                                      |
| $5,000+/mo     | The Residency                                               |

## Local Development

```bash
npm install
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local
npm run dev
```

Open http://localhost:3000

## Deployment to Vercel

### Step 1: Push to GitHub

```bash
cd tychetouch
git init
git add .
git commit -m "Initial TycheTouch build"
git branch -M main
# Create a new repo at github.com/<your-username>/tychetouch, then:
git remote add origin https://github.com/<your-username>/tychetouch.git
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to https://vercel.com/new
2. Import the `tychetouch` GitHub repo
3. Framework preset: **Next.js** (auto-detected)
4. Root directory: leave as `./`
5. Click **Environment Variables** and add:
   - `ANTHROPIC_API_KEY` = your Anthropic API key
6. Click **Deploy**

### Step 3: Connect TycheTouch.com

1. In Vercel project → **Settings** → **Domains**
2. Add `tychetouch.com` and `www.tychetouch.com`
3. Vercel will show you DNS records to add at your domain registrar:
   - For the apex `tychetouch.com`: an **A record** pointing to `76.76.21.21`
   - For `www`: a **CNAME** pointing to `cname.vercel-dns.com`
4. Add those records at your registrar (wherever TycheTouch.com is registered)
5. SSL cert provisions automatically once DNS propagates (can take a few minutes to a few hours)

### Step 4: Update CTA URLs (when ready)

In `src/app/result/page.tsx`, the `routeCTA` function has placeholder URLs. Update these to match your actual booking / offer pages:

- Diagnostic Partner URL
- Direction Session booking URL
- Tyche Marketing Support page URL
- GHL Foundational Build page URL
- Residency page URL

## Voice Customization

The Tyche voice rules live in the system prompt in `src/app/api/read/route.ts` in the constant `TYCHE_SYSTEM_PROMPT`. Edit that to adjust tone, add banned phrases, refine structure.

## Notes on Accuracy

- **Human Design calculations** use the standard 64-gate wheel with gates sequenced from 0° Aries. This matches most HD calculators. Edge cases near gate boundaries may vary by ~0.1° depending on ephemeris precision.
- **Design time** is calculated as 88° of solar arc before birth (the standard HD convention), using iterative refinement with Sun speed.
- **Houses** use the Placidus system. Change the `'P'` flag in `src/lib/astrology.ts` if a different system is preferred.
- Swiss Ephemeris uses Moshier analytical ephemeris as fallback (accuracy within arc-seconds for modern dates — more than enough for HD).

## Files

```
src/
  app/
    page.tsx              # Landing page
    layout.tsx            # Root layout with fonts
    globals.css           # Tyche design tokens + global styles
    quiz/page.tsx         # 4-step quiz
    result/page.tsx       # Result + read display
    api/
      geocode/route.ts    # Nominatim location search
      calculate/route.ts  # Chart calculation via Swiss Ephemeris
      read/route.ts       # AI read generation via Claude
  lib/
    astrology.ts          # Core chart + HD calculation
    hd-wheel.ts           # 64-gate sequence, centers, channels
```
