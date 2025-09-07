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

    // User login removed. Only admin-login logic remains. No user authentication or redirects.

})();
