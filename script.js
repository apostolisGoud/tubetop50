// --- THEME TOGGLE ---
const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
const currentTheme = localStorage.getItem('theme');

if (currentTheme) {
    document.body.className = currentTheme;
    if (currentTheme === 'dark-mode') toggleSwitch.checked = true;
}

toggleSwitch.addEventListener('change', (e) => {
    const theme = e.target.checked ? 'dark-mode' : 'light-mode';
    document.body.className = theme;
    localStorage.setItem('theme', theme);
});

// --- NAVIGATION (RESET & SCROLL) ---

// Hard Reset on Logo Click
document.getElementById('homeBtn').onclick = () => {
    window.location.reload(); 
};

// Reusable Scroll Function for Settings
function scrollToSettings() {
    const searchArea = document.getElementById('searchZone');
    window.scrollTo({
        top: searchArea.offsetTop - 20,
        behavior: 'smooth'
    });
}

document.getElementById('scrollTrigger').onclick = scrollToSettings;
document.getElementById('scrollTop').onclick = scrollToSettings;

// Jump to Top 10 Button
document.getElementById('jumpToElite').onclick = () => {
    const eliteSection = document.getElementById('insightsSection');
    if (eliteSection.style.display === 'none') {
        alert("Please SCAN for trends first to unlock the Top 10!");
    } else {
        eliteSection.scrollIntoView({ behavior: 'smooth' });
    }
};

// --- MAIN SCANNER ---
async function startScanning() {
    const list = document.getElementById('videoList');
    const insights = document.getElementById('insightsSection');
    
    list.innerHTML = '<div style="width:100%; text-align:center;"><h2 style="opacity:0.5;">SCANNING NETWORK...</h2></div>';
    insights.style.display = 'none';

    const region = document.getElementById('country').value;
    const cat = document.getElementById('category').value;

    // ΝΕΟ URL: Χτυπάμε το δικό μας κρυφό αρχείο στο Netlify, ΟΧΙ το YouTube απευθείας!
    let url = `/.netlify/functions/get-videos?region=${region}`;
    if (cat) url += `&cat=${cat}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (!data.items) throw new Error("No data found");

        renderVideos(data.items);
        renderEliteSuggestions(data.items);
        
        // Return to settings view after scan
        setTimeout(scrollToSettings, 400);

    } catch (e) {
        list.innerHTML = '<h2 style="color:var(--yt-red); text-align:center; width:100%;">API LIMIT REACHED OR ERROR.</h2>';
        console.error(e);
    }
}

function renderVideos(videos) {
    const list = document.getElementById('videoList');
    list.innerHTML = videos.map((v, index) => `
        <div class="video-card">
            <div class="rank-badge">#${index + 1}</div>
            <img src="${v.snippet.thumbnails.high.url}" alt="${v.snippet.title}">
            <div class="card-body">
                <h4 style="margin:0 0 10px 0; font-size:1rem; height:45px; overflow:hidden; color:var(--text-color);">
                    ${v.snippet.title}
                </h4>
                <p style="color:var(--text-color); opacity:0.6; font-size:0.8rem; margin-bottom:15px;">
                    Creator: ${v.snippet.channelTitle}
                </p>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="color:var(--yt-red); font-weight:900;">🔥 ${Number(v.statistics.viewCount).toLocaleString()}</span>
                        <a href="https://youtube.com/watch?v=${v.id}" target="_blank" class="watch-btn">
                            <i class="fas fa-play"></i> WATCH
                        </a>
                    </div>
                    <a href="https://youtube.com/channel/${v.snippet.channelId}" target="_blank" class="watch-btn" style="border-color:var(--text-color); color:var(--text-color); text-align:center;">
                        <i class="fas fa-user"></i> CHANNEL
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

function renderEliteSuggestions(videos) {
    const section = document.getElementById('insightsSection');
    const content = document.getElementById('insightsContent');
    section.style.display = 'block';

    const elite = [...videos].sort((a, b) => {
        const scoreA = (Number(a.statistics.likeCount || 0) + Number(a.statistics.commentCount || 0)) / Number(a.statistics.viewCount || 1);
        const scoreB = (Number(b.statistics.likeCount || 0) + Number(b.statistics.commentCount || 0)) / Number(b.statistics.viewCount || 1);
        return scoreB - scoreA;
    }).slice(0, 10);

    content.innerHTML = elite.map((v, i) => `
        <div style="padding:20px; border-bottom:1px solid var(--border-color); display:flex; align-items:center; flex-wrap:wrap; gap:25px; text-align:left;">
            <span style="font-size:2.5rem; font-family:'Space Grotesk'; color:var(--yt-red); min-width:50px;">#${i+1}</span>
            <img src="${v.snippet.thumbnails.default.url}" style="width:120px; border-radius:12px; border:1px solid var(--border-color);">
            <div style="flex:1; min-width:200px;">
                <span style="color:var(--text-color); font-weight:800; font-size:1.1rem; display:block;">
                    ${v.snippet.title}
                </span>
                <p style="margin:5px 0 0 0; opacity:0.6; font-size:0.9rem;">Creator: ${v.snippet.channelTitle}</p>
            </div>
            <div style="display:flex; gap:12px;">
                <a href="https://youtube.com/watch?v=${v.id}" target="_blank" class="watch-btn" style="background:var(--yt-red); color:white; border:none; padding:12px 25px;">PLAY</a>
                <a href="https://youtube.com/channel/${v.snippet.channelId}" target="_blank" class="watch-btn" style="border-color:var(--text-color); color:var(--text-color); padding:12px 25px;">VISIT</a>
            </div>
        </div>
    `).join('');
}

document.getElementById('fetchBtn').onclick = startScanning;

window.onscroll = () => {
    const btn = document.getElementById('scrollTop');
    if (window.scrollY > 500) btn.style.display = "block";
    else btn.style.display = "none";
};