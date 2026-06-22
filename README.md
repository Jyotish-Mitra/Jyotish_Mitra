# Jyotish Mitra — Phase 1

Vedic astrology platform: Prokerala API (exact calculations) + Gemini API (Hindi interpretation) + Firebase (login + saved kundlis).

## Phase 1 Mein Kya Hai

- Email/Password aur Google login
- Birth details form
- Visual kundli chart (North Indian / South Indian, Prokerala se SVG)
- Graha sthiti (planet positions)
- Vimshottari Dasha timeline (current dasha highlighted)
- Hindi prediction (Gemini se)
- "Meri Kundliyan" — saved kundlis dekhna, kholna, delete karna

## Files

```
public/
  index.html          → Login page
  app.html            → Main app (form + results + saved kundlis)
  firebase-config.js  → Firebase setup (Auth + Firestore)
netlify/functions/
  get-chart.js        → Prokerala API se kundli, planets, dasha, chart SVG
  get-prediction.js   → Gemini API se Hindi prediction
```

## Setup Steps

### 1. Netlify Environment Variables
Site settings → Environment variables mein ye daalo:

| Key | Value |
|---|---|
| `PROKERALA_CLIENT_ID` | Prokerala Client ID |
| `PROKERALA_CLIENT_SECRET` | Prokerala Client Secret (regenerated wala) |
| `GEMINI_API_KEY` | Google AI Studio se mili key |

### 2. Firestore Security Rules
Firebase Console → Firestore Database → Rules tab mein jaake, repo ki `firestore.rules` file ka content paste karke **Publish** karo. Isse koi aur user kisi doosre ka data nahi padh sakta.

### 3. Deploy
Netlify build settings:
- Publish directory: `public`
- Functions directory: `netlify/functions`

## Important Notes

- Login zaroori hai — bina login app.html access nahi hoga (auto redirect ho jayega login page pe)
- Har kundli Firestore mein `kundlis` collection mein save hoti hai, user ke `uid` ke saath linked
- North/South chart switch karne par Prokerala se naya SVG fetch hota hai (chart_style parameter)
- Timezone abhi +05:30 (India) hardcoded hai

## Phase 2 (Aage Ka Plan)

- KP System (chart + dasha + predictions) — Prokerala ka KP endpoint use karna hai
- Navamsa (D9) aur baaki divisional charts
- Match Making (Kundli Milan)

## Phase 3

- Daily/Monthly Rashifal
- Nadi aur Lal Kitab (prompt-engineering based, kyunki deterministic API nahi milta)
- "Unified Prediction" — sab systems ka combined view
