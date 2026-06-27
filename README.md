# Kundli Pro - Setup Guide (AstroSage jaisa app)

## Project Structure
```
astrosage-clone/
├── index.html                      ← Frontend (UI)
├── netlify.toml                    ← Netlify config
└── netlify/
    └── functions/
        ├── get-token.js            ← (optional, standalone token fetch)
        └── astro-proxy.js          ← Main backend - Prokerala calls yahan se hoti hain
```

## Kaise Deploy Karein (Netlify pe)

### Step 1: Prokerala API credentials lo
1. https://api.prokerala.com pe account banao (agar nahi hai)
2. Dashboard se apna **Client ID** aur **Client Secret** copy karo

### Step 2: Netlify pe deploy karo
1. Is poore `astrosage-clone` folder ko GitHub repo me push karo (ya Netlify drag-drop deploy use karo)
2. Netlify dashboard me jao → **Site settings → Environment variables**
3. Ye 2 variables add karo:
   - `PROKERALA_CLIENT_ID` = tumhari client id
   - `PROKERALA_CLIENT_SECRET` = tumhara client secret
4. Site ko deploy/redeploy karo

**IMPORTANT:** Keys sirf Netlify environment variables me jaati hain — kabhi `index.html` ya kisi frontend file me nahi likhni. Ye hi security ka core point hai.

### Step 3: Test karo
- Apni site URL kholo (jaise `https://tumhara-app.netlify.app`)
- Birth details daalo aur "कुंडली बनाएं" dabao
- Agar error aaye "Server me Prokerala keys set nahi hain" — matlab env variables sahi se set nahi hue, Step 2 dobara check karo

## Local Testing (optional, advanced)
Agar tum local machine pe test karna chahte ho Netlify CLI se:
```bash
npm install -g netlify-cli
netlify dev
```
Ye local server start karega jisme functions bhi kaam karenge (`.env` file me keys daalni padengi local testing ke liye).

## Next Phases (jo baad me banayenge)
- Phase 2: Panchang + Daily Horoscope
- Phase 3: Divisional charts (Navamsa D-9) + Numerology
- Phase 4: Kundli Milan (matchmaking)
- Phase 5: Firebase (user accounts, saved kundlis)
- Phase 6: PWA setup (manifest.json + service worker) for "Add to Home Screen"
