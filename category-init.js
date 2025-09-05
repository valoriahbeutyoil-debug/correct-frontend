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
if (category && window.fetchProducts && window.renderProducts) {
  fetchProducts(category).then(products => renderProducts(products, '.product-grid'));
}
