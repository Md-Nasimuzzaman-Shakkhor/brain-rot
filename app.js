// ============ Tab switching ============
function switchTab(pageId, evt) {
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.content-page').forEach(page => page.classList.remove('active'));

    if (evt && evt.currentTarget) evt.currentTarget.classList.add('active');
    const page = document.getElementById('page-' + pageId);
    if (page) page.classList.add('active');

    closeSidebarOnMobile();
}

// ============ Sidebar items (Library / Favorites / Settings) ============
function sidebarClick(el, label) {
    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    showToast(label + ' is still being built — check back soon ✨');
}

// ============ Mobile sidebar toggle ============
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('open');
}
function closeSidebarOnMobile() {
    if (window.innerWidth <= 860) {
        document.querySelector('.sidebar').classList.remove('open');
    }
}

// ============ Toast ============
let toastTimer = null;
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

// ============ Game modal ============
function openGame(gameUrl, gameName) {
    const modal = document.getElementById('gameModal');
    const iframe = document.getElementById('gameFrame');
    const title = document.getElementById('modalTitle');

    iframe.src = gameUrl; // Loads the independent game file
    if (title) title.textContent = gameName || 'Now Playing';
    modal.classList.add('active');
}

function closeGame() {
    const modal = document.getElementById('gameModal');
    const iframe = document.getElementById('gameFrame');

    iframe.src = ''; // Stops the game and audio instantly
    modal.classList.remove('active');
}

// Close modal on backdrop click or Escape key
document.addEventListener('click', (e) => {
    if (e.target.id === 'gameModal') closeGame();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('gameModal');
        if (modal && modal.classList.contains('active')) closeGame();
    }
});

// ============ Auto-resize the dashboard iframe to its real content height ============
// This keeps everything scrolling inside the single .content-area instead of
// fighting a second scroll container inside the iframe.
function resizeDashboardFrame() {
    const iframe = document.getElementById('dashboardFrame');
    if (!iframe) return;
    try {
        const doc = iframe.contentWindow.document;
        const h = Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight);
        iframe.style.height = h + 'px';
    } catch (err) {
        // cross-origin or not loaded yet — ignore, min-height CSS covers the fallback
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const iframe = document.getElementById('dashboardFrame');
    if (iframe) {
        iframe.addEventListener('load', () => {
            resizeDashboardFrame();
            // content can still animate/expand in shortly after load (counters etc.)
            setTimeout(resizeDashboardFrame, 400);
            setTimeout(resizeDashboardFrame, 1200);
        });
    }
    window.addEventListener('resize', () => {
        clearTimeout(window._dashResizeT);
        window._dashResizeT = setTimeout(resizeDashboardFrame, 150);
    });
});
