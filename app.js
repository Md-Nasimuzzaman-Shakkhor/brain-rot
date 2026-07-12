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
function focusGameFrame() {
    const iframe = document.getElementById('gameFrame');
    if (!iframe) return;
    // Games listen for keydown on their own document, so the iframe (and its
    // window) must actually hold keyboard focus or arrow keys never arrive.
    iframe.focus();
    try { iframe.contentWindow.focus(); } catch (err) { /* not loaded yet */ }
}

function openGame(gameUrl, gameName) {
    const modal = document.getElementById('gameModal');
    const iframe = document.getElementById('gameFrame');
    const title = document.getElementById('modalTitle');

    iframe.src = gameUrl; // Loads the independent game file
    if (title) title.textContent = gameName || 'Now Playing';
    modal.classList.add('active');

    // Focus as soon as the game finishes loading...
    iframe.onload = focusGameFrame;
    // ...and again shortly after, in case the load event fires before the
    // browser is ready to hand off focus.
    setTimeout(focusGameFrame, 150);
}

function closeGame() {
    const modal = document.getElementById('gameModal');
    const iframe = document.getElementById('gameFrame');

    iframe.onload = null;
    iframe.src = ''; // Stops the game and audio instantly
    modal.classList.remove('active');
}

// Close modal on backdrop click or Escape key. Clicking the frame itself
// re-focuses it, so a stray click never leaves the keyboard stuck on the
// parent page.
document.addEventListener('click', (e) => {
    if (e.target.id === 'gameModal') { closeGame(); return; }
    if (e.target.id === 'gameFrame') focusGameFrame();
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
    const yearEl = document.getElementById('footerYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

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
