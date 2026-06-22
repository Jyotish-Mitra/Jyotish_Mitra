// netlify/functions/get-chart.js
//
// Yeh function browser se birth details leta hai, Prokerala API se
// OAuth2 token leta hai, fir kundli/planet-position/dasha-periods data
// fetch karke wapas browser ko bhejta hai.
//
// Client Secret yahan environment variable se aata hai - kabhi bhi
// code mein hardcode nahi karna.

let cachedToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  // Token cache karte hain taaki har request pe naya token na maangna pade
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) {
    return cachedToken;
  }

  const response = await fetch("https://api.prokerala.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.PROKERALA_CLIENT_ID,
      client_secret: process.env.PROKERALA_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Token fetch failed: ${response.status} ${errText}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  // expires_in seconds mein aata hai, 60 sec buffer rakhte hain
  tokenExpiry = now + (data.expires_in - 60) * 1000;
  return cachedToken;
}

async function callProkerala(endpoint, params, token) {
  const url = new URL(`https://api.prokerala.com/v2/astrology/${endpoint}`);
  Object.keys(params).forEach((key) => url.searchParams.set(key, params[key]));

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`${endpoint} failed: ${response.status} ${errText}`);
  }

  return response.json();
}

exports.handler = async (event) => {
  // CORS headers - apne Netlify domain se hi request allow karenge
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { datetime, latitude, longitude, ayanamsa } = body;

    if (!datetime || latitude === undefined || longitude === undefined) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "datetime, latitude, longitude zaroori hai",
        }),
      };
    }

    const token = await getAccessToken();
    const coordinates = `${latitude},${longitude}`;
    const ayanamsaValue = ayanamsa || 1; // 1 = Lahiri (sabse common Vedic standard)

    const commonParams = {
      ayanamsa: ayanamsaValue,
      coordinates,
      datetime,
      la: "en",
    };

    // Parallel mein sab calculations fetch karte hain
    const [kundli, planetPosition, dashaPeriods, birthDetails] =
      await Promise.all([
        callProkerala("kundli", { ...commonParams, chart_type: "rasi" }, token),
        callProkerala("planet-position", commonParams, token),
        callProkerala("dasha-periods", commonParams, token),
        callProkerala("birth-details", commonParams, token),
      ]);

    return {
      statusCode: 200,
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        kundli,
        planetPosition,
        dashaPeriods,
        birthDetails,
      }),
    };
  } catch (error) {
    console.error("Chart fetch error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
