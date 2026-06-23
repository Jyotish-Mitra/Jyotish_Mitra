// netlify/functions/get-chart.js
//
// Yeh function browser se birth details leta hai, Prokerala API se
// OAuth2 token leta hai, fir kundli/planet-position/dasha-periods/
// chart data fetch karke wapas browser ko bhejta hai.
//
// Client Secret yahan environment variable se aata hai - kabhi bhi
// code mein hardcode nahi karna.

let cachedToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
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
    const { datetime, latitude, longitude, ayanamsa, chartStyle } = body;

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
    const ayanamsaValue = ayanamsa || 1; // 1 = Lahiri
    const style = chartStyle || "north-indian";

    const commonParams = {
      ayanamsa: ayanamsaValue,
      coordinates,
      datetime,
      la: "en",
    };

    // Parallel mein sab calculations fetch karte hain
    const [
      kundli,
      planetPosition,
      dashaPeriods,
      birthDetails,
      chartSvg,
      kpChart,
      kpPlanetPosition,
      kpHouseSignificator,
      kpPlanetSignificator,
      kpDashaPeriods,
    ] = await Promise.all([
      callProkerala("kundli", { ...commonParams, chart_type: "rasi" }, token),
      callProkerala("planet-position", commonParams, token),
      callProkerala("dasha-periods", commonParams, token),
      callProkerala("birth-details", commonParams, token),
      callProkerala(
        "chart",
        {
          ...commonParams,
          chart_type: "rasi",
          chart_style: style,
          format: "svg",
        },
        token
      ).catch((err) => {
        console.error("Chart SVG fetch failed:", err.message);
        return null;
      }),
      // KP System - ye endpoints fail bhi ho sakte hain agar plan mein include na ho,
      // isliye har ek ko individually catch karte hain taaki baaki data block na ho
      callProkerala(
        "kp-chart",
        { ...commonParams, chart_type: "rasi", chart_style: style, format: "svg" },
        token
      ).catch((err) => {
        console.error("KP chart fetch failed:", err.message);
        return null;
      }),
      callProkerala("kp-planet-position", commonParams, token).catch((err) => {
        console.error("KP planet position fetch failed:", err.message);
        return null;
      }),
      callProkerala("kp-house-significator", commonParams, token).catch((err) => {
        console.error("KP house significator fetch failed:", err.message);
        return null;
      }),
      callProkerala("kp-planet-significator", commonParams, token).catch((err) => {
        console.error("KP planet significator fetch failed:", err.message);
        return null;
      }),
      callProkerala("kp-dasha-periods", commonParams, token).catch((err) => {
        console.error("KP dasha fetch failed:", err.message);
        return null;
      }),
    ]);

    return {
      statusCode: 200,
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        kundli,
        planetPosition,
        dashaPeriods,
        birthDetails,
        chartSvg,
        kp: {
          chart: kpChart,
          planetPosition: kpPlanetPosition,
          houseSignificator: kpHouseSignificator,
          planetSignificator: kpPlanetSignificator,
          dashaPeriods: kpDashaPeriods,
        },
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
