// netlify/functions/search-location.js
//
// Shahar ka naam se lat/lon dhoondhne ke liye OpenStreetMap Nominatim
// use karta hai. Free hai, lekin policy ke hisaab se proper User-Agent
// header zaroori hai aur client-side se directly call nahi karna chahiye
// isliye backend (yahan) se proxy kar rahe hain.

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const queryText = event.queryStringParameters?.q;

  if (!queryText || queryText.trim().length < 3) {
    return {
      statusCode: 200,
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ results: [] }),
    };
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", queryText);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "6");
    url.searchParams.set("addressdetails", "1");
    // India ke results ko priority dene ke liye (zyada users India se honge)
    url.searchParams.set("countrycodes", "in");

    const response = await fetch(url.toString(), {
      headers: {
        // Nominatim usage policy ke hisaab se proper identification zaroori hai
        "User-Agent": "JyotishMitra/1.0 (astrology app)",
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim error: ${response.status}`);
    }

    const data = await response.json();

    const results = data.map((item) => ({
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    }));

    return {
      statusCode: 200,
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ results }),
    };
  } catch (error) {
    console.error("Location search error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
