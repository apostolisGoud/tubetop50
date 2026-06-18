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
// Νέα συνάρτηση που μετατρέπει τον περίεργο χρόνο του YouTube (π.χ. PT1M15S) σε δευτερόλεπτα
function parseDurationToSeconds(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (parseInt(match[1]) || 0);
    const minutes = (parseInt(match[2]) || 0);
    const seconds = (parseInt(match[3]) || 0);
    return (hours * 3600) + (minutes * 60) + seconds;
}
// --- SHARE MENU LOGIC ---
window.toggleShareMenu = function(button) {
    // Κλείνουμε όλα τα άλλα μενού πρώτα
    document.querySelectorAll('.share-menu').forEach(menu => {
        if (menu !== button.nextElementSibling) {
            menu.classList.remove('show');
        }
    });
    // Ανοίγουμε ή κλείνουμε αυτό που πατήσαμε
    button.nextElementSibling.classList.toggle('show');
};

// Αν πατήσουμε κάπου αλλού στη σελίδα, κλείνουν όλα τα share menus
document.addEventListener('click', function(event) {
    if (!event.target.closest('.share-container')) {
        document.querySelectorAll('.share-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});





// --- MAIN SCANNER ---
async function startScanning() {
    const list = document.getElementById('videoList');
    const insights = document.getElementById('insightsSection');
    
    list.innerHTML = '<div style="width:100%; text-align:center;"><h2 style="opacity:0.5;">SCANNING NETWORK...</h2></div>';
    insights.style.display = 'none';

    const region = document.getElementById('country').value;
    const cat = document.getElementById('category').value;
    const format = document.getElementById('videoFormat').value; // Παίρνουμε το νέο φίλτρο

    let url = `/.netlify/functions/get-videos?region=${region}`;
    if (cat) url += `&cat=${cat}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (!data.items) throw new Error("No data found");

        // ΦΙΛΤΡΑΡΙΣΜΑ ΓΙΑ SHORTS / REGULAR
        let finalVideos = data.items;
        if (format === 'shorts') {
            finalVideos = finalVideos.filter(v => parseDurationToSeconds(v.contentDetails.duration) <= 61);
        } else if (format === 'regular') {
            finalVideos = finalVideos.filter(v => parseDurationToSeconds(v.contentDetails.duration) > 61);
        }

        if (finalVideos.length === 0) {
            list.innerHTML = '<h2 style="text-align:center; width:100%;">Δεν βρέθηκαν βίντεο για αυτό το Format. Δοκίμασε άλλη κατηγορία.</h2>';
            return;
        }

        renderVideos(finalVideos);
        renderEliteSuggestions(finalVideos);
        
        setTimeout(scrollToSettings, 400);

    } catch (e) {
        list.innerHTML = '<h2 style="color:var(--yt-red); text-align:center; width:100%;">API LIMIT REACHED OR ERROR.</h2>';
        console.error(e);
    }
}




function renderVideos(videos) {
    const list = document.getElementById('videoList');
    list.innerHTML = videos.map((v, index) => {
        const shareText = encodeURIComponent(`Check out this viral hit: "${v.snippet.title}" 🔥\nTracked via @TubeTop50\n`);
        const videoUrl = encodeURIComponent(`https://youtube.com/watch?v=${v.id}`);
        const twitterShare = `https://twitter.com/intent/tweet?text=${shareText}&url=${videoUrl}`;
        const fbShare = `https://www.facebook.com/sharer/sharer.php?u=${videoUrl}`;
        const whatsappShare = `https://api.whatsapp.com/send?text=${shareText} ${videoUrl}`;

        return `
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
                <div style="display:flex; flex-direction:column; gap:15px;">
                    
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="color:var(--yt-red); font-weight:900;">🔥 ${Number(v.statistics.viewCount).toLocaleString()} Views</span>
                    </div>

                    <div style="display:flex; gap:8px; flex-wrap:wrap;">
                        <a href="https://youtube.com/watch?v=${v.id}" target="_blank" class="watch-btn" style="flex:1; padding:10px 5px;">
                            <i class="fas fa-play"></i> WATCH
                        </a>
                        <a href="https://youtube.com/channel/${v.snippet.channelId}" target="_blank" class="watch-btn" style="flex:1; border-color:var(--text-color); color:var(--text-color); padding:10px 5px;">
                            <i class="fas fa-user"></i> CHANNEL
                        </a>
                        
                        <div class="share-container" style="flex:1;">
                            <button onclick="toggleShareMenu(this)" class="watch-btn" style="width:100%; border-color:var(--text-color); color:var(--text-color); background:transparent; cursor:pointer; padding:10px 5px;">
                                <i class="fas fa-share-nodes"></i> SHARE
                            </button>
                            <div class="share-menu">
                                <a href="${twitterShare}" target="_blank" class="social-icon x-tw"><i class="fa-brands fa-x-twitter"></i></a>
                                <a href="${fbShare}" target="_blank" class="social-icon fb"><i class="fa-brands fa-facebook-f"></i></a>
                                <a href="${whatsappShare}" target="_blank" class="social-icon wa"><i class="fa-brands fa-whatsapp"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
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

    content.innerHTML = elite.map((v, i) => {
        const shareText = encodeURIComponent(`The #${i+1} Most Viral Video right now is "${v.snippet.title}"! 🔥\nTracked via @TubeTop50\n`);
        const videoUrl = encodeURIComponent(`https://youtube.com/watch?v=${v.id}`);
        const twitterShare = `https://twitter.com/intent/tweet?text=${shareText}&url=${videoUrl}`;
        const fbShare = `https://www.facebook.com/sharer/sharer.php?u=${videoUrl}`;
        const whatsappShare = `https://api.whatsapp.com/send?text=${shareText} ${videoUrl}`;

        return `
        <div style="padding:20px; border-bottom:1px solid var(--border-color); display:flex; align-items:center; flex-wrap:wrap; gap:25px; text-align:left;">
            <span style="font-size:2.5rem; font-family:'Space Grotesk'; color:var(--yt-red); min-width:50px;">#${i+1}</span>
            <img src="${v.snippet.thumbnails.default.url}" style="width:120px; border-radius:12px; border:1px solid var(--border-color);">
            <div style="flex:1; min-width:200px;">
                <span style="color:var(--text-color); font-weight:800; font-size:1.1rem; display:block;">
                    ${v.snippet.title}
                </span>
                <p style="margin:5px 0 0 0; opacity:0.6; font-size:0.9rem;">Creator: ${v.snippet.channelTitle}</p>
                
                <div style="display:flex; gap:12px; flex-wrap:wrap; align-items:center; margin-top:15px;">
                    <a href="https://youtube.com/watch?v=${v.id}" target="_blank" class="watch-btn" style="background:var(--yt-red); color:white; border:none; padding:10px 20px; flex:none;">
                        <i class="fas fa-play"></i> WATCH
                    </a>
                    <a href="https://youtube.com/channel/${v.snippet.channelId}" target="_blank" class="watch-btn" style="border-color:var(--text-color); color:var(--text-color); padding:10px 20px; flex:none;">
                        <i class="fas fa-user"></i> CHANNEL
                    </a>
                    
                    <div class="share-container" style="flex:none;">
                        <button onclick="toggleShareMenu(this)" class="watch-btn" style="border-color:var(--text-color); color:var(--text-color); background:transparent; padding:10px 20px; cursor:pointer;">
                            <i class="fas fa-share-nodes"></i> SHARE
                        </button>
                        <div class="share-menu">
                            <a href="${twitterShare}" target="_blank" class="social-icon x-tw"><i class="fa-brands fa-x-twitter"></i></a>
                            <a href="${fbShare}" target="_blank" class="social-icon fb"><i class="fa-brands fa-facebook-f"></i></a>
                            <a href="${whatsappShare}" target="_blank" class="social-icon wa"><i class="fa-brands fa-whatsapp"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

document.getElementById('fetchBtn').onclick = startScanning;

window.onscroll = () => {
    const btn = document.getElementById('scrollTop');
    if (window.scrollY > 500) btn.style.display = "block";
    else btn.style.display = "none";
};