// Professional E-commerce Product Management
"use strict";

// Product data and management
const productData = {
  all: [
    {
      id: 'passport',
      name: 'Grade A Passports',
      category: 'documents',
      price: 1250,
      originalPrice: 1500,
      discount: 17,
      rating: 5,
      reviews: 124,
      image: 'sideimage.jpg'
    },
    {
      id: 'clone-card',
      name: 'Premium Clone Card',
      category: 'cards',
      price: 1500,
      originalPrice: 1600,
      discount: 6,
      rating: 5,
      reviews: 89,
      image: 'logo.png'
    }
  ]
};

// Initialize product filters when DOM loads
document.addEventListener('DOMContentLoaded', function() {
  initializeProductFilters();
  initializeCartFunctionality();
});

function initializeProductFilters() {
  const filterButtons = document.querySelectorAll('.category-filter');
  const productGrid = document.querySelector('.product-grid');

  if (!filterButtons.length || !productGrid) return;

  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      const category = this.dataset.category;

      // Update active button
      filterButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');

      // Filter products
      filterProducts(category);
    });
  });
}

function filterProducts(category) {
  const products = document.querySelectorAll('.product-card, .product');

  products.forEach(product => {
    if (category === 'all') {
      product.style.display = 'block';
    } else {
      const productCategory = product.dataset.category ||
        product.querySelector('.product-category')?.textContent.toLowerCase().replace(/\s+/g, '-');

      if (productCategory && productCategory.includes(category)) {
        product.style.display = 'block';
      } else {
        product.style.display = 'none';
      }
    }
  });
}

function initializeCartFunctionality() {
  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn, .btn.add');

  addToCartButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();

      // Add visual feedback
      const originalText = this.textContent;
      this.textContent = 'Added!';
      this.style.background = '#28a745';

      // Reset after 2 seconds
      setTimeout(() => {
        this.textContent = originalText;
        this.style.background = '';
      }, 2000);

      // Update cart count
      updateCartCount();
    });
  });
}

function updateCartCount() {
  const cartCount = document.getElementById('cart-count');
  if (cartCount) {
    const currentCount = parseInt(cartCount.textContent) || 0;
    cartCount.textContent = currentCount + 1;
  }
}

// --- Dynamic Product Rendering for Category Pages ---
async function renderCategoryProducts(category) {
  const container = document.querySelector('.product-grid');
  if (!container) return;
  container.innerHTML = '';
  let url = 'https://backend-crqd.onrender.com/products';
  if (category) url += `?category=${encodeURIComponent(category)}`;
  try {
    const res = await fetch(url);
    const products = await res.json();
    products.forEach(product => {
      const el = document.createElement('article');
      el.className = 'product-card';
      el.dataset.category = product.category;
      el.innerHTML = `
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}" loading="lazy" style="width:220px;height:220px;object-fit:cover;">
        </div>
        <div class="product-info">
          <h3>${product.name}</h3>
          <div class="price">$${product.price.toFixed(2)}</div>
          <div class="product-review">
            <span class="review-icon" style="cursor:pointer;color:#007bff;" title="Quick Review">&#9998;</span> ${product.quickReview ? product.quickReview : ''}
          </div>
          <p class="description">${product.description || ''}</p>
          <button class="add-to-cart-btn" data-product-id="${product._id || product.id}"><i class="fas fa-shopping-cart"></i> Add to Cart</button>
          <button class="quick-review-btn" data-product-id="${product._id || product.id}"><i class="fas fa-eye"></i> Quick Review</button>
        </div>
      `;
      container.appendChild(el);
    });
    // Add to cart logic
    container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const productId = btn.getAttribute('data-product-id');
        const product = products.find(p => (p._id || p.id) == productId);
        if (!product) return;
        if (window.addItem) {
          window.addItem({
            id: product._id || product.id,
            name: product.name,
            price: product.price,
            variant: '',
            qty: 1
          });
        }
        btn.textContent = 'Added!';
        btn.style.background = '#28a745';
        setTimeout(() => {
          btn.textContent = 'Add to Cart';
          btn.style.background = '';
        }, 1500);
      });
    });
    // Quick review modal logic
    if (!document.getElementById('quick-review-modal')) {
      const modal = document.createElement('div');
      modal.id = 'quick-review-modal';
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100vw';
      modal.style.height = '100vh';
      modal.style.background = 'rgba(0,0,0,0.5)';
      modal.style.display = 'none';
      modal.style.justifyContent = 'center';
      modal.style.alignItems = 'center';
      modal.style.zIndex = '9999';
      modal.innerHTML = `<div style="background:#fff;padding:32px 24px;border-radius:8px;max-width:400px;box-shadow:0 2px 16px rgba(0,0,0,0.15);text-align:left;position:relative;">
        <button id="close-quick-review" style="position:absolute;top:8px;right:8px;font-size:1.5em;background:none;border:none;cursor:pointer;">&times;</button>
        <h2 id="quick-review-title" style="margin-bottom:12px;color:#007bff;"></h2>
        <div id="quick-review-content" style="font-size:1.1em;color:#333;"></div>
      </div>`;
      document.body.appendChild(modal);
      document.getElementById('close-quick-review').onclick = () => {
        modal.style.display = 'none';
      };
    }
    const modal = document.getElementById('quick-review-modal');
    container.querySelectorAll('.quick-review-btn, .review-icon').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const productId = btn.getAttribute('data-product-id') || btn.closest('.product-card')?.querySelector('.add-to-cart-btn')?.getAttribute('data-product-id');
        const product = products.find(p => (p._id || p.id) == productId);
        if (!product) return;
        document.getElementById('quick-review-title').textContent = product.name;
        document.getElementById('quick-review-content').textContent = product.description || product.quickReview || 'No review available.';
        modal.style.display = 'flex';
      });
    });
  } catch (err) {
    container.innerHTML = '<div style="color:red">Unable to load products.</div>';
  }
}

// Example usage: renderCategoryProducts('documents');
window.renderCategoryProducts = renderCategoryProducts;