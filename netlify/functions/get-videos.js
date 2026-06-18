exports.handler = async function(event, context) {
    // Παίρνουμε το API key από το Netlify (εκεί που το έβαλες στα Environment Variables)
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    // Διαβάζουμε τις παραμέτρους (χώρα και κατηγορία) που στέλνει το frontend
    const region = event.queryStringParameters.region || 'GLOBAL';
    const cat = event.queryStringParameters.cat || '';

    // Χτίζουμε το URL του YouTube API
    let url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&maxResults=50&key=${apiKey}`;
    
    if (region !== 'GLOBAL') url += `&regionCode=${region}`;
    if (cat) url += `&videoCategoryId=${cat}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // Στέλνουμε τα δεδομένα πίσω στο site σου
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed fetching data' })
        };
    }
}