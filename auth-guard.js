// Authentication Guard - Protects pages from unauthorized access
(function() {
  'use strict';

  // Pages that require authentication (exclude login and index pages)
  const PROTECTED_PAGES = [
    'admin.html',
    'checkout.html',
    'clone-cards.html',
    'documents.html',
    'shop.html',
    'counterfeit-notes.html',
    'us-dollar-bills.html',
    'euro-bills.html',
    'british-pounds.html',
    'australian-dollars.html',
    'canadian-dollars.html',
    'swiss-franc.html',
    'kuwaiti-dinar.html',
    'ssd-chemicals.html',
    'faq.html',
    'contact.html',
    'how-to-order.html',
    'reviews.html',
    'privacy.html',
    'terms.html',
    'shipping.html'
  ];

  // Check if current page requires authentication
  function isProtectedPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    return PROTECTED_PAGES.includes(currentPage);
  }

  // Check if user is authenticated
  function isAuthenticated() {
    const session = sessionStorage.getItem('docushop_session');
    if (!session) return false;
    
    try {
      const sessionData = JSON.parse(session);
      return sessionData.userId && sessionData.isActive;
    } catch {
      return false;
    }
  }

  // Redirect to login page
  function redirectToLogin() {
    // Store the intended destination for after login
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPage === 'admin.html') {
      window.location.href = 'admin-login.html';
      return;
    }
    if (currentPage !== 'index.html' && currentPage !== 'login.html') {
      sessionStorage.setItem('docushop_redirect_after_login', currentPage);
    }
    window.location.href = 'login.html';
  }

  // Main authentication check
  function checkAuth() {
    // Skip check for index.html and login.html
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPage === 'index.html' || currentPage === 'login.html') {
      return;
    }

    // If page is protected and user is not authenticated, redirect to login
    if (isProtectedPage() && !isAuthenticated()) {
      redirectToLogin();
    }
  }

  // Run authentication check when DOM is loaded
  document.addEventListener('DOMContentLoaded', checkAuth);

  // Also check on page load for single-page applications
  window.addEventListener('load', checkAuth);

  // Export functions for use in other scripts
  window.AuthGuard = {
    isAuthenticated,
    isProtectedPage,
    redirectToLogin,
    checkAuth
  };

})();
