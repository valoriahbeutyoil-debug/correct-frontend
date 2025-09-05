(function () {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Simple countdown to 7 days from now
  const target = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const ids = { d: 'd', h: 'h', m: 'm', s: 's' };
  function tick() {
    const diff = Math.max(0, target - Date.now());
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const set = (k, v) => { const el = document.getElementById(k); if (el) el.textContent = String(v).padStart(2, '0'); };
    set(ids.d, days); set(ids.h, hours); set(ids.m, mins); set(ids.s, secs);
  }
  setInterval(tick, 1000); tick();

  // Newsletter form behavior
  const newsForm = document.getElementById('newsletter-form');
  if (newsForm) {
    newsForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const note = document.getElementById('newsletter-note');
      if (note) note.textContent = 'Thanks! Check your inbox for a confirmation.';
      newsForm.reset();
    });
  }

  const footForm = document.getElementById('footer-newsletter-form');
  if (footForm) {
    footForm.addEventListener('submit', function (e) {
      e.preventDefault();
      alert('Subscribed!');
      footForm.reset();
    });
  }

  // Menu and submenu toggles
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const siteNav = document.querySelector('.site-nav');
  if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', function () {
      siteNav.classList.toggle('open');
    });
  }

  // Global header submenu behavior
  document.querySelectorAll('.has-submenu').forEach(function (item) {
    const link = item.querySelector(':scope > a');
    const submenu = item.querySelector(':scope > .submenu');
    if (!link || !submenu) return;

    let hoverTimeout;

    // Improved hover behavior with delay
    item.addEventListener('mouseenter', function(){
      clearTimeout(hoverTimeout);
      item.classList.add('open');
      item.setAttribute('aria-expanded','true');
    });

    item.addEventListener('mouseleave', function(){
      hoverTimeout = setTimeout(function(){
        item.classList.remove('open');
        item.setAttribute('aria-expanded','false');
      }, 150); // Small delay to prevent accidental closes
    });

    // Click behavior for mobile and desktop
    link.addEventListener('click', function(e){
      e.preventDefault();
      const isOpen = item.classList.contains('open');

      // Close all other submenus first
      document.querySelectorAll('.has-submenu').forEach(function(otherItem){
        if(otherItem !== item){
          otherItem.classList.remove('open');
          otherItem.setAttribute('aria-expanded','false');
        }
      });

      // Toggle current submenu
      if (!isOpen) {
        item.classList.add('open');
        item.setAttribute('aria-expanded','true');
      } else {
        item.classList.remove('open');
        item.setAttribute('aria-expanded','false');
      }
    });
  });

  // Close any open submenu when clicking outside
  document.addEventListener('click', function(e){
    const target = e.target;
    document.querySelectorAll('.has-submenu.open').forEach(function(openItem){
      if (!openItem.contains(target)) {
        openItem.classList.remove('open');
        openItem.setAttribute('aria-expanded','false');
      }
    });
  });

  // Cart count demo
  const cartCount = document.getElementById('cart-count');
  document.querySelectorAll('[data-add-to-cart]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const current = Number(cartCount?.textContent || '0') || 0;
      if (cartCount) cartCount.textContent = String(current + 1);
    });
  });

  // Login modal
  const loginOpen = document.querySelector('[data-login-open]');
  const loginModal = document.getElementById('login-modal');
  if (loginOpen && loginModal) {
    function close() { loginModal.setAttribute('hidden', ''); }
    function open() { loginModal.removeAttribute('hidden'); }
    loginOpen.addEventListener('click', open);
    loginModal.querySelectorAll('[data-login-close]').forEach(function (el) {
      el.addEventListener('click', close);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

// Header functionality
document.addEventListener('DOMContentLoaded', function() {
  // Close banner functionality
  const closeBannerBtn = document.querySelector('.close-banner');
  const topBanner = document.querySelector('.top-banner');

  if (closeBannerBtn && topBanner) {
    closeBannerBtn.addEventListener('click', function() {
      topBanner.style.display = 'none';
    });
  }

  // Start countdown timer
  startCountdown(365);
});

// Countdown timer functionality
function startCountdown(days) {
  let totalSeconds = days * 24 * 60 * 60;
  const d = document.querySelector('#d');
  const h = document.querySelector('#h');
  const m = document.querySelector('#m');
  const s = document.querySelector('#s');

  if (!d || !h || !m || !s) return;

  function updateCountdown() {
    let days = Math.floor(totalSeconds / (24 * 60 * 60));
    let hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    let minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    let seconds = totalSeconds % 60;

    d.textContent = String(days);
    h.textContent = String(hours).padStart(2, '0');
    m.textContent = String(minutes).padStart(2, '0');
    s.textContent = String(seconds).padStart(2, '0');

    if (totalSeconds > 0) {
      totalSeconds--;
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// Cart functionality

// Login/Logout button management
function updateAuthButtons() {
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  
  if (!loginBtn || !logoutBtn) return;
  
  const session = sessionStorage.getItem('docushop_session');
  if (session) {
    try {
      const sessionData = JSON.parse(session);
      if (sessionData.userId && sessionData.isActive) {
        // User is logged in
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
      } else {
        // User is not logged in
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
      }
    } catch {
      // Invalid session data
      loginBtn.style.display = 'inline-block';
      logoutBtn.style.display = 'none';
    }
  } else {
    // No session
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
  }
}

// Handle logout
function handleLogout() {
  sessionStorage.removeItem('docushop_session');
  updateAuthButtons();
  window.location.href = 'index.html';
}

// Initialize auth buttons
document.addEventListener('DOMContentLoaded', function() {
  updateAuthButtons();
  
  // Bind logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (confirm('Are you sure you want to logout?')) {
        handleLogout();
      }
    });
  }
});

})();