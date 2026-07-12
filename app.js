// Navigation tab switching
function switchTab(pageId) {
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.content-page').forEach(page => page.classList.remove('active'));
    
    event.currentTarget.classList.add('active');
    document.getElementById('page-' + pageId).classList.add('active');
}

// Open game via dynamic iframe loading
function openGame(gameUrl) {
    const modal = document.getElementById('gameModal');
    const iframe = document.getElementById('gameFrame');
    
    iframe.src = gameUrl; // Loads the independent game file
    modal.classList.add('active');
}

function closeGame() {
    const modal = document.getElementById('gameModal');
    const iframe = document.getElementById('gameFrame');
    
    iframe.src = ""; // Stops the game and audio instantly
    modal.classList.remove('active');
}