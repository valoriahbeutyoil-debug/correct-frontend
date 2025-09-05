// product.js - Entry point for product/category auto-load
// This file simply re-exports the main logic from products.js

// If products.js is present in frontend/js, load it here
// For flat GitHub structure, you may need to copy the code from products.js

// --- Dynamic Product Rendering for Category Pages ---
async function renderCategoryProducts(category) {
  if (window.renderCategoryProductsImpl) {
    return window.renderCategoryProductsImpl(category);
  }
  // fallback: show error
  const container = document.querySelector('.product-grid');
  if (container) container.innerHTML = '<div style="color:red">Product loader not found.</div>';
}
window.renderCategoryProducts = renderCategoryProducts;

// Optionally, you can copy the full code from frontend/js/products.js here for a single-file setup.
