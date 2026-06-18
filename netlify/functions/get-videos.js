exports.handler = async function(event, context) {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const region = event.queryStringParameters.region || 'GLOBAL';
    const cat = event.queryStringParameters.cat || '';

    // ΠΡΟΣΘΗΚΗ: Βάλαμε το "contentDetails" στο part για να παίρνουμε τη διάρκεια του βίντεο!
    let url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&chart=mostPopular&maxResults=50&key=${apiKey}`;
    
    if (region !== 'GLOBAL') url += `&regionCode=${region}`;
    if (cat) url += `&videoCategoryId=${cat}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        return { statusCode: 200, body: JSON.stringify(data) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed fetching data' }) };
    }
}