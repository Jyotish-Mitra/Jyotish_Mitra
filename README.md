# Jyotish Mitra

Vedic astrology prediction app — Prokerala API (exact calculations) + Claude API (Hindi interpretation).

## Architecture

```
Browser (public/index.html)
    |
    v
Netlify Function: get-chart.js  -->  Prokerala API (OAuth2 token + kundli/planet-position/dasha)
    |
    v
Netlify Function: get-prediction.js  -->  Claude API (Hindi prediction text)
    |
    v
Browser display
```

## Netlify pe Deploy karne ke steps

### 1. Site banao
- Netlify dashboard pe jaake "Add new site" > "Deploy manually" (drag-and-drop folder)
  ya GitHub repo se connect karo.

### 2. Environment Variables set karo
Netlify dashboard > Site settings > Environment variables mein ye 3 add karo:

| Key | Value |
|---|---|
| `PROKERALA_CLIENT_ID` | Aapka Prokerala Client ID |
| `PROKERALA_CLIENT_SECRET` | Aapka NAYA regenerated Client Secret (purana wala kabhi use mat karo) |
| `ANTHROPIC_API_KEY` | Aapki Anthropic API key (console.anthropic.com se) |

**Zaroori**: Inhe kahin bhi code mein hardcode mat karo — sirf Netlify ke environment variables mein.

### 3. Authorized JavaScript Origins update karo
Deploy hone ke baad jo Netlify URL milega (jaise `jyotish-mitra-xyz.netlify.app`),
use Prokerala dashboard ke "Authorized JavaScript Origins" mein add karo.

### 4. Deploy
Netlify khud functions ko detect kar lega `netlify.toml` ke config se.

## Local testing (vaikalpik)

Agar local pe test karna ho to Netlify CLI use karo:

```bash
npm install -g netlify-cli
netlify dev
```

`.env` file banao (ye file kabhi commit mat karna, `.gitignore` mein already hai):

```
PROKERALA_CLIENT_ID=your_id
PROKERALA_CLIENT_SECRET=your_secret
ANTHROPIC_API_KEY=your_key
```

## Important Notes

- Ayanamsa default **Lahiri** (value 1) hai — ye most-used Vedic standard hai
- Prokerala free tier: 5,000 credits/month, 5 requests/min — personal use ke liye kaafi hai
- Claude prediction sirf interpretation karta hai — saare planetary calculations Prokerala (Swiss Ephemeris) se exact aate hain
- App mein clear disclaimer hai ki important decisions ke liye qualified astrologer se consult karein
