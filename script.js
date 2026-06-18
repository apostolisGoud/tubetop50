// --- MAIN SCANNER ---
async function startScanning() {
    const list = document.getElementById('videoList');
    const insights = document.getElementById('insightsSection');
    
    list.innerHTML = '<div style="width:100%; text-align:center;"><h2 style="opacity:0.5;">SCANNING NETWORK...</h2></div>';
    insights.style.display = 'none';

    const region = document.getElementById('country').value;
    const cat = document.getElementById('category').value;

    let url = `/.netlify/functions/get-videos?region=${region}`;
    if (cat) url += `&cat=${cat}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // Αν το backend μας στείλει σφάλμα (π.χ. λάθος κλειδί)
        if (data.error) {
            console.error("Λεπτομέρειες Σφάλματος:", data);
            throw new Error(data.error);
        }
        
        if (!data.items) throw new Error("Δεν βρέθηκαν βίντεο.");

        renderVideos(data.items);
        renderEliteSuggestions(data.items);
        
        setTimeout(scrollToSettings, 400);

    } catch (e) {
        list.innerHTML = '<h2 style="color:var(--yt-red); text-align:center; width:100%;">ΣΦΑΛΜΑ ΣΥΝΔΕΣΗΣ Ή ΟΡΙΟ API. (Δες την κονσόλα με F12)</h2>';
        console.error("Το εργαλείο σταμάτησε λόγω:", e.message);
    }
}