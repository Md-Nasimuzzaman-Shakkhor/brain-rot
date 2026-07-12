// Open API Endpoints for La Liga (ID: 4335) and Premier League (ID: 4328)
const UPCOMING_LALIGA_URL = 'https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=4335';
const UPCOMING_EPL_URL    = 'https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=4328';
const PAST_LALIGA_URL     = 'https://www.thesportsdb.com/api/v1/json/3/eventspastleague.php?id=4335';
const PAST_EPL_URL        = 'https://www.thesportsdb.com/api/v1/json/3/eventspastleague.php?id=4328';

// Target Fan News Matrix
const elClasicoNewsMatrix = [
    { league: "Real Madrid 👑", tagClass: "madrid-tag", title: "Mbappé and Vinicius Jr. develop tactical chemistry in training ahead of the upcoming Champions League tie." },
    { league: "FC Barcelona 🔵🔴", tagClass: "barca-tag", title: "La Masia graduates excel as Hansi Flick implements an aggressive high-press system." },
    { league: "Transfer Rumor 🔥", tagClass: "", title: "Barcelona closely monitors a major Bundesliga midfield talent for the summer window." },
    { league: "Injury Watch 🏥", tagClass: "madrid-tag", title: "Real Madrid medical team targets next week's derby match for the star goalkeeper's return." },
    { league: "Camp Nou Update 🏟️", tagClass: "barca-tag", title: "Stadium renovation works proceed ahead of schedule, with increased seat capacities planned." },
    { league: "El Clásico Drama ⚔️", tagClass: "", title: "Pundits debate midfield tactical control ahead of the high-stakes matchup." }
];

/**
 * Generates a rolling, self-updating calendar of core El Clásico fixtures.
 * Because it filters using 'new Date()', games that have passed drop out automatically.
 */
function getRollingBigMatches() {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    const masterSchedule = [
        { strLeague: "La Liga 🇪🇸", strHomeTeam: "Real Madrid", strAwayTeam: "Barcelona", dateEvent: `${currentYear}-10-25`, strTime: "20:00:00" },
        { strLeague: "La Liga 🇪🇸", strHomeTeam: "Barcelona", strAwayTeam: "Real Madrid", dateEvent: `${nextYear}-03-22`, strTime: "21:00:00" },
        { strLeague: "La Liga 🇪🇸", strHomeTeam: "Real Madrid", strAwayTeam: "Atletico Madrid", dateEvent: `${currentYear}-09-28`, strTime: "19:00:00" },
        { strLeague: "La Liga 🇪🇸", strHomeTeam: "Barcelona", strAwayTeam: "Atletico Madrid", dateEvent: `${currentYear}-12-20`, strTime: "20:45:00" },
        { strLeague: "La Liga 🇪🇸", strHomeTeam: "Valencia", strAwayTeam: "Real Madrid", dateEvent: `${currentYear}-11-02`, strTime: "18:30:00" },
        { strLeague: "La Liga 🇪🇸", strHomeTeam: "Real Betis", strAwayTeam: "Barcelona", dateEvent: `${currentYear}-11-30`, strTime: "16:15:00" }
    ];

    const todayStr = new Date().toISOString().split('T')[0];
    
    // Only return matches scheduled for today or in the future
    return masterSchedule.filter(match => match.dateEvent >= todayStr);
}

// 1. Fetch & Combine Upcoming Fixtures (Google-Style Sorted Timeline)
async function fetchUpcomingMatches() {
    const feed = document.getElementById('upcoming-feed');
    try {
        const [laLigaRes, eplRes] = await Promise.all([
            fetch(UPCOMING_LALIGA_URL),
            fetch(UPCOMING_EPL_URL)
        ]);

        const laLigaData = await laLigaRes.json();
        const eplData = await eplRes.json();

        const laLigaEvents = laLigaData.events || [];
        const eplEvents = eplData.events || [];
        
        // Inject rolling fan favorites to guarantee they always display alongside raw API inputs
        const fanFavorites = getRollingBigMatches();
        let combinedMatches = [...laLigaEvents, ...eplEvents, ...fanFavorites];

        // Filter out duplicate matchups if the API happens to return them at the same time
        const seenMatches = new Set();
        combinedMatches = combinedMatches.filter(match => {
            const uniqueKey = `${match.strHomeTeam}-${match.strAwayTeam}-${match.dateEvent}`;
            if (seenMatches.has(uniqueKey)) return false;
            seenMatches.add(uniqueKey);
            return true;
        });

        if (combinedMatches.length === 0) {
            feed.innerHTML = `<div class="feed-item"><div class="feed-title">No upcoming La Liga or Premier League matches scheduled.</div></div>`;
            return;
        }

        // Chronological sort: closest upcoming matches show up at the very top
        combinedMatches.sort((a, b) => new Date(a.dateEvent) - new Date(b.dateEvent));

        // Display next 5 matches like a clean Google timeline
        feed.innerHTML = combinedMatches.slice(0, 5).map(event => {
            const isLaLiga = event.strLeague.toLowerCase().includes('la liga');
            const leagueLabel = isLaLiga ? 'La Liga 🇪🇸' : 'Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿';
            
            // Check if it's a special fan favorite matchup to add visual flair
            const isSpecialTeam = event.strHomeTeam.includes('Madrid') || event.strAwayTeam.includes('Madrid') || 
                                 event.strHomeTeam.includes('Barcelona') || event.strAwayTeam.includes('Barcelona');
            
            const cardStyle = isSpecialTeam ? 'border-left: 4px solid var(--accent-2); background: rgba(255, 77, 148, 0.03);' : '';

            return `
                <div class="feed-item" style="${cardStyle}">
                    <div class="feed-league" style="color: ${isLaLiga ? 'var(--accent-mint)' : 'var(--accent)'}">
                        ${leagueLabel} ${isSpecialTeam ? '⭐' : ''}
                    </div>
                    <div class="feed-title">
                        ⏳ <strong>${event.strHomeTeam}</strong> vs <strong>${event.strAwayTeam}</strong>
                        <br><span style="font-size:11px; color:var(--text-muted)">📅 Date: ${event.dateEvent} @ ${event.strTime ? event.strTime.substring(0, 5) : 'TBD'}</span>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        feed.innerHTML = `<div class="feed-item" style="border-color: #ef4444;"><div class="feed-title">⚠️ Failed to load upcoming schedule.</div></div>`;
    }
}

// 2. Fetch & Combine Recent Results
async function fetchRecentResults() {
    const feed = document.getElementById('scores-feed');
    try {
        const [laLigaRes, eplRes] = await Promise.all([
            fetch(PAST_LALIGA_URL),
            fetch(PAST_EPL_URL)
        ]);

        const laLigaData = await laLigaRes.json();
        const eplData = await eplRes.json();

        const laLigaEvents = laLigaData.events || [];
        const eplEvents = eplData.events || [];
        let combinedResults = [...laLigaEvents, ...eplEvents];

        if (combinedResults.length === 0) {
            feed.innerHTML = `<div class="feed-item"><div class="feed-title">No recent results found.</div></div>`;
            return;
        }

        // Sort by date descending (most recent results at the top)
        combinedResults.sort((a, b) => new Date(b.dateEvent) - new Date(a.dateEvent));

        feed.innerHTML = combinedResults.slice(0, 5).map(event => {
            const isLaLiga = event.strLeague.toLowerCase().includes('la liga');
            const leagueLabel = isLaLiga ? 'La Liga 🇪🇸' : 'Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿';
            
            return `
                <div class="feed-item">
                    <div class="feed-league" style="color: ${isLaLiga ? 'var(--accent-mint)' : 'var(--accent)'}">
                        ${leagueLabel}
                    </div>
                    <div class="feed-title">
                        🏁 <strong>${event.strHomeTeam}</strong> ${event.intHomeScore} — ${event.intAwayScore} <strong>${event.strAwayTeam}</strong>
                        <br><span style="font-size:11px; color:var(--text-muted)">Played on: ${event.dateEvent}</span>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        feed.innerHTML = `<div class="feed-item" style="border-color: #ef4444;"><div class="feed-title">⚠️ Failed to load recent scores.</div></div>`;
    }
}

// 3. Generate Fan News Feed
function generateFanNews() {
    const feed = document.getElementById('news-feed');
    const shuffled = [...elClasicoNewsMatrix].sort(() => 0.5 - Math.random());
    feed.innerHTML = shuffled.slice(0, 4).map(n => `
        <div class="feed-item">
            <div class="feed-league ${n.tagClass}">${n.league}</div>
            <div class="feed-title">${n.title}</div>
        </div>
    `).join('');
}

// Run everything on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    fetchUpcomingMatches();
    fetchRecentResults();
    generateFanNews();
    
    // Auto-refresh scores and match schedules every 5 minutes
    setInterval(() => {
        fetchUpcomingMatches();
        fetchRecentResults();
    }, 300000);
});