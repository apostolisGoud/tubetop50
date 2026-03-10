// Αρχείο: netlify/functions/analyze-ad.js

exports.handler = async function(event, context) {
    // 1. Διασφαλίζουμε ότι η κλήση είναι POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    // 2. Παίρνουμε το Gemini API Key από το Netlify
    const apiKey = process.env.GEMINI_API_KEY;

    try {
        // 3. Διαβάζουμε το URL που μας έστειλε το script.js
        const body = JSON.parse(event.body);
        const url = body.url;

        if (!url) {
            return { statusCode: 400, body: JSON.stringify({ error: "URL is required" }) };
        }

        // 4. Εδώ βάζουμε το prompt! Έτσι κανείς δεν μπορεί να το αλλάξει από τον browser.
        const prompt = `Ανάλυσε την αγγελία: ${url}. 
        Εστίασε στην τιμή (αν είναι scam ή ευκαιρία), στα θετικά και αρνητικά.
        Απάντησε ΑΥΣΤΗΡΑ σε μορφή JSON:
        {
          "safe_score": αριθμός 0-100,
          "price_status": "π.χ. ΥΠΟΠΤΑ ΧΑΜΗΛΗ",
          "pros": "κείμενο",
          "cons": "κείμενο",
          "verdict": "πόρισμα για αγορά"
        }`;

        // 5. Κάνουμε την κλήση στο Gemini API
        const fetchUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(fetchUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) throw new Error("Gemini API Error");

        const data = await response.json();

        // 6. Στέλνουμε την απάντηση πίσω στο frontend σου
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed analyzing the ad' })
        };
    }
}