// netlify/functions/get-token.js
// Ye function Prokerala access token securely fetch karta hai.
// CLIENT_ID aur CLIENT_SECRET Netlify dashboard ke environment variables se aate hain,
// kabhi bhi frontend code me nahi likhe jaate.

exports.handler = async function (event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    const clientId = process.env.PROKERALA_CLIENT_ID;
    const clientSecret = process.env.PROKERALA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Server me Prokerala keys set nahi hain. Netlify environment variables check karo." }),
      };
    }

    const tokenRes = await fetch("https://api.prokerala.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      return {
        statusCode: tokenRes.status,
        headers,
        body: JSON.stringify({ error: "Prokerala authentication fail hui", detail: errText }),
      };
    }

    const tokenData = await tokenRes.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ access_token: tokenData.access_token, expires_in: tokenData.expires_in }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
