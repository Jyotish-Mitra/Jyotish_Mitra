// netlify/functions/get-prediction.js
//
// Yeh function Prokerala se mile exact chart data ko Gemini API ko
// bhejta hai, jisse jyotish principles ke aadhar par Hindi prediction
// text generate hota hai.
//
// NOTE: Abhi Gemini (free tier) use ho raha hai. Baad mein Claude API
// pe shift karna ho to sirf yahi function badalna padega - frontend
// aur Prokerala wala part bilkul same rahega.

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
    const { chartData, name, question } = JSON.parse(event.body);

    if (!chartData) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "chartData zaroori hai" }),
      };
    }

    const systemPrompt = `Tum ek anubhavi Vedic jyotish (astrologer) ho jo Parashari aur Bhrigu paddhati ke classical niyamon ka palan karte ho.

Tumhe neeche diya gaya EXACT calculated data milega (planets, houses, nakshatra, dasha) — ye Swiss Ephemeris-based calculations hain, ise mano aur badlo mat.

Tumhara kaam:
1. Diye gaye data ke base par hi interpretation karo — koi naya planetary position mat banao
2. Classical Vedic jyotish principles use karo (graha-bhav sambandh, drishti/aspects, dasha effects)
3. Jawab Hindi mein do, samajhne layak bhasha mein, lekin jyotish terminology (rashi, bhav, graha names) Sanskrit/Hindi mein hi rakho
4. Specific aur balanced raho — sirf positive ya sirf negative mat bolo, jo data se nikal raha hai wahi batao
5. Agar koi specific sawaal pucha gaya hai to usi par focus karo, nahi to general jeevan ka overview do (career, health, relationships, finance)
6. Bilkul end mein ek chhota disclaimer line do ki ye AI-assisted reading hai aur important decisions ke liye qualified astrologer se consult karein

Zaroori: Kabhi bhi koi medical, legal ya financial guarantee mat do. Doom-prediction (jaise exact death date) kabhi mat batao.`;

    const userMessage = `Birth chart data:
${JSON.stringify(chartData, null, 2)}

${name ? `Vyakti ka naam: ${name}` : ""}
${question ? `Specific sawaal: ${question}` : "Koi specific sawaal nahi - general jeevan prediction chahiye"}

Is data ke aadhar par Hindi mein vistrit jyotish prediction do.`;

    // Gemini 2.5 Flash - free tier, stable model
    const GEMINI_MODEL = "gemini-2.5-flash";
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: userMessage }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${errText}`);
    }

    const data = await response.json();

    // Gemini quota/safety block hone par candidates empty aa sakta hai
    if (!data.candidates || data.candidates.length === 0) {
      const blockReason = data.promptFeedback?.blockReason || "unknown";
      throw new Error(`Gemini ne response nahi diya (reason: ${blockReason})`);
    }

    const predictionText = data.candidates[0].content.parts
      .map((part) => part.text || "")
      .join("\n");

    return {
      statusCode: 200,
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ prediction: predictionText }),
    };
  } catch (error) {
    console.error("Prediction error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
