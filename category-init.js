// category-init.js
// Auto-load products for each category page
// Robust session check for user-facing pages
function getSession() {
  let session = sessionStorage.getItem('docushop_session');
  if (!session) session = localStorage.getItem('docushop_session');
  if (!session) return null;
  try {
    const data = JSON.parse(session);
    if (data.userId) return data;
  } catch {}
  return null;
}

document.addEventListener('DOMContentLoaded', function() {
  // Session check removed. Users can browse without logging in.
});

const categoryMap = {
  'shop.html': 'shop',
  'clone-cards.html': 'clone-cards',
  'us-dollar-bills.html': 'us-dollar-bills',
  'euro-bills.html': 'euro-bills',
  'british-pounds.html': 'british-pounds',
  'australian-dollars.html': 'australian-dollars',
  'canadian-dollars.html': 'canadian-dollars',
  'swiss-franc.html': 'swiss-franc',
  'kuwaiti-dinar.html': 'kuwaiti-dinar',
  'documents.html': 'documents',
  'counterfeit-notes.html': 'counterfeit-notes'
};

const page = window.location.pathname.split('/').pop();
const category = categoryMap[page];
console.log('[DEBUG] Current page:', page, 'Mapped category:', category);
if (category) {
  const API_BASE_URL = 'https://correct-backend-gu05.onrender.com';
  fetch(`${API_BASE_URL}/products?category=${encodeURIComponent(category)}`)
    .then(res => {
      console.log('[DEBUG] Product fetch response status:', res.status);
      return res.json();
    })
    .then(products => {
      console.log('[DEBUG] Products fetched:', products);
      if (window.renderProducts) {
        window.renderProducts(products, '.product-grid');
      }
    })
    .catch(err => {
      console.error('[DEBUG] Product fetch error:', err);
    });
}
