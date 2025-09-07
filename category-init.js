// category-init.js
// Auto-load products for each category page

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
if (category) {
  // Use the correct backend URL and fetch/render directly
  const API_BASE_URL = 'https://correct-backend-gu05.onrender.com';
  fetch(`${API_BASE_URL}/products?category=${encodeURIComponent(category)}`)
    .then(res => res.json())
    .then(products => {
      if (window.renderProducts) {
        window.renderProducts(products, '.product-grid');
      }
    });
}
