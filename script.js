
// Supabase Configuration
const SUPABASE_URL = 'https://nfkksatslsdreefmdjfa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ma2tzYXRzbHNkcmVlZm1kamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNjMzNDEsImV4cCI6MjA4NjgzOTM0MX0.ovXCr95lw_w5WafiZodGeKYuvxJaEV0OHB8Nj-JeePY';

const { createClient } = supabase;
const client = createClient(SUPABASE_URL, SUPABASE_KEY);

// Dates Configuration (UTC+0 base for simplicity, calculations use local Date objects)
const START_DATE_RAW = '2026-04-21T00:00:00+07:00'; // TH time
const TARGET_DATE_RAW = '2029-04-21T00:00:00+07:00'; // TH time

const START_DATE = new Date(START_DATE_RAW);
const TARGET_DATE = new Date(TARGET_DATE_RAW);

// DOM Elements
const els = {
    // Countdown
    days: document.getElementById('days'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    bar: document.getElementById('progress-bar'),
    progressText: document.getElementById('progress-text'),
    msg: document.getElementById('daily-message'),

    // Thailand Pane
    thClock: document.getElementById('th-clock'),
    thDate: document.getElementById('th-date'),
    thWeather: document.getElementById('th-weather'),
    thSeason: document.getElementById('th-season'),
    thPane: document.getElementById('th-pane'),
    thOverlay: document.getElementById('th-overlay'),
    thAnim: document.querySelector('.th-anim'),

    // Japan Pane
    jpClock: document.getElementById('jp-clock'),
    jpDate: document.getElementById('jp-date'),
    jpWeather: document.getElementById('jp-weather'),
    jpSeason: document.getElementById('jp-season'),
    jpPane: document.getElementById('jp-pane'),
    jpOverlay: document.getElementById('jp-overlay'),
    jpAnim: document.querySelector('.jp-anim'),

    // History
    historyList: document.getElementById('history-list'),
    historyParams: document.getElementById('history-pagination'),

    // Temp placeholders
    thTemp: document.getElementById('th-temp'),
    jpTemp: document.getElementById('jp-temp')
};

// ------------------------------------------------------------------
// 1. Time & Clock System
//    Thailand: UTC+7
//    Japan: UTC+9
// ------------------------------------------------------------------

function updateWorldClocks() {
    const now = new Date();

    // 1. Update Clocks & Dates
    // Thailand
    els.thClock.innerText = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit' });
    if (els.thDate) {
        els.thDate.innerText = now.toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    }

    // Japan
    els.jpClock.innerText = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit' });
    if (els.jpDate) {
        els.jpDate.innerText = now.toLocaleDateString('th-TH', { timeZone: 'Asia/Tokyo', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    }

    // 2. Update Ambience
    const thHour = parseInt(now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Bangkok', hour: 'numeric', hour12: false }));
    const jpHour = parseInt(now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Tokyo', hour: 'numeric', hour12: false }));

    setAmbience(thHour, els.thOverlay, els.thWeather);
    setAmbience(jpHour, els.jpOverlay, els.jpWeather);

    // 3. Countdown Logic (Keep existing)
    const distance = TARGET_DATE - now; // Countdown based on user viewing time vs target

    if (distance < 0) {
        els.days.innerText = "0"; els.hours.innerText = "0";
        els.minutes.innerText = "0"; els.seconds.innerText = "0";
        els.bar.style.width = "100%";
    } else {
        const d = Math.floor(distance / (1000 * 60 * 60 * 24));
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);

        els.days.innerText = d; els.hours.innerText = h;
        els.minutes.innerText = m; els.seconds.innerText = s;

        // Progress
        const total = TARGET_DATE - START_DATE;
        const elapsed = now - START_DATE;
        let p = (elapsed / total) * 100;
        if (p < 0) p = 0; if (p > 100) p = 100;

        els.bar.style.width = `${p.toFixed(2)}%`;
        els.progressText.innerText = `${Math.floor(p)}%`;

        // Update Runner Position
        const runnerYou = document.getElementById('runner-you');
        if (runnerYou) {
            // Offset to prevent overflow at 100%
            runnerYou.style.left = `calc(${p}% - 20px)`;
        }

        // Meeting Logic
        const heart = document.getElementById('meeting-heart');
        const runnerMe = document.getElementById('runner-me');

        if (p >= 99.9) {
            // Hugged!
            if (heart) heart.classList.remove('d-none');
            if (runnerYou) runnerYou.style.opacity = 0; // Hide individual runners
            if (runnerMe) runnerMe.style.opacity = 0;
        } else {
            if (heart) heart.classList.add('d-none');
            if (runnerYou) runnerYou.style.opacity = 1;
            if (runnerMe) runnerMe.style.opacity = 1;
        }
    }
}

function formatTime(dateObj) {
    let h = dateObj.getHours().toString().padStart(2, '0');
    let m = dateObj.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
}

function setAmbience(hour, overlayEl, iconEl) {
    // 6 - 18 is Day. Else Night.
    // Darkness builds up from 17-19. Fades 05-07.
    let opacity = 0;

    if (hour >= 19 || hour < 5) opacity = 0.6; // Deep Night
    else if (hour === 18) opacity = 0.3; // Twilight
    else if (hour === 5) opacity = 0.3; // Dawn
    else opacity = 0; // Day

    overlayEl.style.opacity = opacity;

    // Icon
    if (hour >= 6 && hour < 18) {
        iconEl.className = 'fas fa-sun weather-icon mb-2 text-warning';
    } else {
        iconEl.className = 'fas fa-moon weather-icon mb-2 text-white-50';
    }
}

// ------------------------------------------------------------------
// 2. Data Fetching (Themes & Messages)
// ------------------------------------------------------------------

let simulatedDate = null; // Stored as 'YYYY-MM-DD' String

async function initData() {
    const today = simulatedDate || new Date().toISOString().split('T')[0];

    // A. Fetch Themes for BOTH Locations
    const { data: themes } = await client
        .from('themes')
        .select('*')
        .lte('start_date', today)
        .gte('end_date', today);

    // Default States
    let thTheme = { name: 'summer' }; // Default TH
    let jpTheme = { name: 'default' }; // Default JP

    if (themes) {
        // Priority 1: Special Events (Overrides Location Specifics)
        const anniversary = themes.find(t => t.name === 'anniversary');
        const valentine = themes.find(t => t.name === 'valentine');
        const newyear = themes.find(t => t.name === 'newyear'); // Maybe newyear too?

        if (anniversary) {
            thTheme = anniversary;
            jpTheme = anniversary;
        } else if (valentine) {
            thTheme = valentine;
            jpTheme = valentine;
        } else {
            // Priority 2: Location Specific Overrides (Normal Seasons)
            const thOverride = themes.find(t => t.location === 'TH');
            const jpOverride = themes.find(t => t.location === 'JP');
            const globalTheme = themes.find(t => t.location === 'BOTH');

            if (thOverride) thTheme = thOverride;
            else if (globalTheme) thTheme = globalTheme;

            if (jpOverride) jpTheme = jpOverride;
            else if (globalTheme) jpTheme = globalTheme;
        }
    }

    // Apply only if not currently manually forced safely (simple check)
    if (!window.manualThemeForce) {
        applyThemeToPane('TH', thTheme);
        applyThemeToPane('JP', jpTheme);
    }

    // B. Fetch Daily Message
    const { data: msgs } = await client
        .from('daily_messages')
        .select('message')
        .eq('date', today)
        .limit(1);

    if (msgs && msgs.length > 0) els.msg.innerText = msgs[0].message;
    else els.msg.innerText = "ระยะทางไม่มีความหมาย เมื่อใจเราใกล้กัน";

    // C. Fetch Real Weather (Bang Saen & Gifu)
    fetchRealWeather();
}

// Dev Tools & Simulation Logic
window.manualThemeForce = false;

window.simulateDate = function () {
    const input = document.getElementById('sim-date').value;
    if (input) {
        simulatedDate = input;
        window.manualThemeForce = false; // Reset manual force to allow date to take effect
        initData();
        // Update UI helper
        document.getElementById('daily-message').innerText = `กำลังจำลองวันที่: ${input}...`;
    }
};

window.resetDate = function () {
    simulatedDate = null;
    window.manualThemeForce = false;
    document.getElementById('sim-date').value = '';
    initData();
};

window.forceTheme = function (loc, themeName) {
    window.manualThemeForce = true;
    applyThemeToPane(loc, { name: themeName });
};


async function fetchRealWeather() {
    try {
        // Bang Saen (TH) & Gifu (JP)
        const url = "https://api.open-meteo.com/v1/forecast?latitude=13.28,35.42&longitude=100.92,136.76&current=temperature_2m,weather_code,is_day&timezone=auto";

        const response = await fetch(url);
        const data = await response.json();

        if (Array.isArray(data) && data.length === 2) {
            const th = data[0].current;
            const jp = data[1].current;

            // Update Temp
            if (els.thTemp) els.thTemp.innerText = `${Math.round(th.temperature_2m)}°C`;
            if (els.jpTemp) els.jpTemp.innerText = `${Math.round(jp.temperature_2m)}°C`;
        }
    } catch (e) {
        console.error("Weather Fetch Error", e);
        if (els.thTemp) els.thTemp.innerText = "--°C";
        if (els.jpTemp) els.jpTemp.innerText = "--°C";
    }
}

// Thai Theme Names Mapping
const themeNamesTH = {
    'summer': '🌞 ฤดูร้อน',
    'green': '🌿 ฤดูฝน (เขียวขจี)',
    'rainy': '🌧️ หน้าฝน',
    'winter': '❄️ หน้าหนาว',
    'sakura': '🌸 ซากุระ',
    'autumn': '🍂 ใบไม้เปลี่ยนสี',
    'hanabi': '🎆 ดอกไม้ไฟ',
    'songkran': '🔫 สงกรานต์',
    'loykrathong': '🌕 ลอยกระทง',
    'newyear': '🎉 ปีใหม่',
    'cool': '💨 อากาศเย็นสบาย',
    'valentine': '💖 วาเลนไทน์',
    'anniversary': '💍 สุขสันต์วันครบรอบ',
    'default': '✨ ทั่วไป'
};

function applyThemeToPane(loc, theme) {
    const pane = loc === 'TH' ? els.thPane : els.jpPane;
    const label = loc === 'TH' ? els.thSeason : els.jpSeason;
    const animContainer = loc === 'TH' ? els.thAnim : els.jpAnim;

    pane.className = `split-side position-relative theme-${theme.name}`;

    // Set label to Thai translation if available, else original
    const thName = themeNamesTH[theme.name.toLowerCase()] || theme.name.toUpperCase();
    label.innerText = thName;

    // Clear Animation
    animContainer.innerHTML = '';
    clearAnimations(loc);

    // Start Animation Logic based on Theme Name
    if (theme.name === 'sakura') startAnimation(animContainer, 'sakura-petal', 2000);
    if (theme.name === 'autumn') startAnimation(animContainer, 'sakura-petal', 2500); // Red petals via CSS

    if (theme.name === 'rainy') startAnimation(animContainer, 'raindrop', 50);
    if (theme.name === 'songkran') startAnimation(animContainer, 'raindrop', 30); // Heavy water

    if (theme.name === 'winter') startAnimation(animContainer, 'snowflake', 800);
    if (theme.name === 'hanabi') startAnimation(animContainer, 'snowflake', 1000); // Neon dust via CSS

    if (theme.name === 'loykrathong') {
        // Add Big Moon
        const moon = document.createElement('div');
        moon.className = 'super-moon';
        animContainer.appendChild(moon);

        startAnimation(animContainer, 'lantern', 3000);
        startAnimation(animContainer, 'krathong', 6000); // Slower
    }

    if (theme.name === 'valentine') startAnimation(animContainer, 'floating-heart', 800);

    if (theme.name === 'anniversary') {
        startAnimation(animContainer, 'floating-heart', 1500);
        startAnimation(animContainer, 'snowflake', 1000); // Sparkles

        // Check for specific time trigger? Or just show it.
        // User mentioned "22.20". Maybe create a special message or persistent element?
        // Let's add a small text overlay if it's the specific year/time?
        // But for now, just the visual theme.
    }
}

function startAnimation(container, className, interval) {
    if (!window.themeIntervals) window.themeIntervals = {};
    const loc = container.classList.contains('th-anim') ? 'TH' : 'JP';

    // Using an array to store multiple intervals per Location (since Loy Krathong has 2)
    if (!window.themeIntervals[loc]) window.themeIntervals[loc] = [];

    const id = setInterval(() => {
        const p = document.createElement('div');
        p.className = className;

        let removeTime = 6000;

        if (className === 'lantern') {
            p.innerText = '🏮'; // Or ✨
            p.style.left = (Math.random() * 80 + 10) + '%';
            p.style.animationDuration = (Math.random() * 5 + 10) + 's'; // Slow rise 10-15s
            removeTime = 15000;
        }
        else if (className === 'krathong') {
            p.innerText = '🪷';
            // Start from left or right? Let's just do random X
            // Actually floatWater keyframes go from Left to Right mostly.
            p.style.animationDuration = (Math.random() * 5 + 15) + 's'; // Very slow drift
            // Random vertical offset for variety
            p.style.bottom = (Math.random() * 10) + '%';
            removeTime = 20000;
        }
        else if (className === 'floating-heart') {
            const hearts = ['❤️', '💖', '💘', '💝', '💕'];
            p.innerText = hearts[Math.floor(Math.random() * hearts.length)];
            p.style.fontSize = (Math.random() * 20 + 10) + 'px';
            p.style.left = Math.random() * 100 + '%';
            // Start transparent or scale 0? handled by keyframe floatUp (opacity 0->1->0)
            p.style.animationName = 'floatUp'; // Ensure correct keyframe
            p.style.animationDuration = (Math.random() * 3 + 4) + 's';
            removeTime = 8000;
        }
        else {
            // Default Falling
            p.style.left = Math.random() * 100 + '%';
            let duration = 3;
            if (className === 'raindrop') duration = 0.5;
            p.style.animationDuration = (Math.random() * 2 + duration) + 's';
            removeTime = duration * 1000 + 1000;
        }

        container.appendChild(p);
        setTimeout(() => p.remove(), removeTime);
    }, interval);

    window.themeIntervals[loc].push(id);
}

function clearAnimations(loc) {
    if (window.themeIntervals && window.themeIntervals[loc]) {
        window.themeIntervals[loc].forEach(id => clearInterval(id));
        window.themeIntervals[loc] = [];
    }
}

// ------------------------------------------------------------------
// 3. History (Same as before, optimized)
// ------------------------------------------------------------------
// (Keeping existing modal logic simple for brevity, assumed functional from previous step)
document.getElementById('historyModal').addEventListener('show.bs.modal', () => fetchHistory(1));
let currentHistoryPage = 1;
// History Logic
window.fetchHistory = async function (page) {
    els.historyList.innerHTML = '<div class="text-center p-2">Loading...</div>';
    const limit = 5;
    const start = (page - 1) * limit;

    const { count } = await client
        .from('daily_messages')
        .select('*', { count: 'exact', head: true });

    const { data } = await client
        .from('daily_messages')
        .select('*')
        .order('date', { ascending: false })
        .range(start, start + limit - 1);

    if (!data || data.length === 0) {
        els.historyList.innerHTML = '<div class="text-center text-muted p-2">No memories found.</div>';
        return;
    }

    els.historyList.innerHTML = data.map(m => `
        <div class="list-group-item bg-transparent border-bottom">
            <div class="d-flex justify-content-between"><small class="text-muted fw-bold">${m.date}</small></div>
            <p class="mb-0 small text-dark">${m.message}</p>
        </div>
    `).join('');

    // Update Pagination UI
    const totalPages = Math.ceil(count / limit);
    const paginationEl = document.getElementById('history-pagination');
    let navHtml = '';

    // Prev
    if (page > 1) {
        navHtml += `<li class="page-item"><button class="page-link" onclick="fetchHistory(${page - 1})">&laquo;</button></li>`;
    } else {
        navHtml += `<li class="page-item disabled"><span class="page-link">&laquo;</span></li>`;
    }

    // Current Status
    navHtml += `<li class="page-item disabled"><span class="page-link bg-light text-dark">${page} / ${totalPages || 1}</span></li>`;

    // Next
    if (page < totalPages) {
        navHtml += `<li class="page-item"><button class="page-link" onclick="fetchHistory(${page + 1})">&raquo;</button></li>`;
    } else {
        navHtml += `<li class="page-item disabled"><span class="page-link">&raquo;</span></li>`;
    }

    paginationEl.innerHTML = navHtml;
};

// Init
setInterval(updateWorldClocks, 1000); // Clock & Countdown every second
updateWorldClocks();
initData();
