// netlify/functions/astro-proxy.js
// Ye function frontend se request leta hai aur Prokerala API ko securely call karta hai.
// Token bhi yahi internally fetch hota hai - frontend ko kabhi access token nahi dikhta.

let cachedToken = null;
let tokenExpiry = 0;

async function getToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) return cachedToken;

  const clientId = process.env.PROKERALA_CLIENT_ID;
  const clientSecret = process.env.PROKERALA_CLIENT_SECRET;

  const tokenRes = await fetch("https://api.prokerala.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
  });

  if (!tokenRes.ok) {
    throw new Error("Prokerala authentication fail hui. Client ID/Secret check karo Netlify env vars me.");
  }

  const tokenData = await tokenRes.json();
  cachedToken = tokenData.access_token;
  // refresh 60 sec pehle expiry se
  tokenExpiry = now + (tokenData.expires_in - 60) * 1000;
  return cachedToken;
}

// Allowed Prokerala endpoints - security ke liye whitelist
const ENDPOINT_MAP = {
  "birth-details": "https://api.prokerala.com/v2/astrology/birth-details",
  chart: "https://api.prokerala.com/v2/astrology/chart",
  "planet-position": "https://api.prokerala.com/v2/astrology/planet-position",
  "dasha-periods": "https://api.prokerala.com/v2/astrology/dasha-periods",
  panchang: "https://api.prokerala.com/v2/astrology/panchang",
  "kundli-matching": "https://api.prokerala.com/v2/astrology/kundli-matching",
  numerology: "https://api.prokerala.com/v2/astrology/numerology",
};

exports.handler = async function (event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const params = event.queryStringParameters || {};
    const endpointKey = params.endpoint;

    if (!endpointKey || !ENDPOINT_MAP[endpointKey]) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid ya missing 'endpoint' parameter.", allowed: Object.keys(ENDPOINT_MAP) }),
      };
    }

    const token = await getToken();
    const baseUrl = ENDPOINT_MAP[endpointKey];

    // baaki sare query params (endpoint ko chhodkar) forward kar do Prokerala ko
    const forwardParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (key !== "endpoint") forwardParams.append(key, params[key]);
    });

    const fullUrl = `${baseUrl}?${forwardParams.toString()}`;

    const apiRes = await fetch(fullUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await apiRes.json();

    return {
      statusCode: apiRes.status,
      headers,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
