exports.handler = async function(event, context) {
    // 1. Παίρνουμε το API key από το Netlify
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    // 2. Εκτύπωση για τα Logs του Netlify (για να ξέρουμε αν το βρήκε)
    console.log("Έλεγχος API Key - Υπάρχει;", !!apiKey);

    // Αν δεν υπάρχει κλειδί, σταματάμε αμέσως!
    if (!apiKey) {
        console.error("ΛΕΙΠΕΙ ΤΟ API KEY! Έλεγξε τα Environment Variables.");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Missing API Key" })
        };
    }

    // 3. Διαβάζουμε τις παραμέτρους
    const region = event.queryStringParameters.region || 'GLOBAL';
    const cat = event.queryStringParameters.cat || '';

    // 4. Χτίζουμε το URL του YouTube API
    let url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&maxResults=50&key=${apiKey}`;
    
    if (region !== 'GLOBAL') url += `&regionCode=${region}`;
    if (cat) url += `&videoCategoryId=${cat}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // 5. Έλεγχος αν το YouTube μάς έκοψε (π.χ. λάθος κλειδί, όρια κλπ)
        if (!response.ok) {
            console.error("ΣΦΑΛΜΑ ΑΠΟ YOUTUBE:", data);
            return {
                statusCode: response.status, // Επιστρέφει το 403 ή 400 του YouTube
                body: JSON.stringify({ error: "YouTube API Error", details: data })
            };
        }
        
        // 6. Όλα τέλεια, στέλνουμε τα δεδομένα στη σελίδα
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };

    } catch (error) {
        // 7. Αν σκάσει η ίδια η πλατφόρμα (π.χ. θέμα με την έκδοση Node)
        console.error("ΣΦΑΛΜΑ ΣΥΣΤΗΜΑΤΟΣ:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'System Error, check Netlify Logs' })
        };
    }
}