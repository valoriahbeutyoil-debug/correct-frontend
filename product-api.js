// product-api.js
// Reusable script to fetch and render products from backend API

async function fetchProducts(category = null) {
  let url = 'https://backend-crqd.onrender.com/products';
  if (category) url += `?category=${encodeURIComponent(category)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch products');
  return await res.json();
}

function renderProducts(products, containerSelector) {
// ...existing code...
}
  const container = document.querySelector(containerSelector);
  if (!container) return;
  container.innerHTML = '';
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
          <span class="review-icon">&#9998;</span> ${product.quickReview ? product.quickReview : ''}
        </div>
        <p class="description">${product.description || ''}</p>
        <button class="add-to-cart-btn" data-product-id="${product._id || product.id}">
          <i class="fas fa-shopping-cart"></i> Add to Cart
        </button>
        <button class="quick-review-btn" data-product-id="${product._id || product.id}">
          <i class="fas fa-eye"></i> Quick Review
        </button>
      </div>
    `;
    container.appendChild(el);
  });

  // Add event listeners for Add to Cart and Quick Review
  container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const productId = btn.getAttribute('data-product-id');
      const product = products.find(p => (p._id || p.id) == productId);
      if (!product) return;
      // Add to cart using cart.js logic
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

  // Professional Quick Review modal
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
  container.querySelectorAll('.quick-review-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const productId = btn.getAttribute('data-product-id');
      const product = products.find(p => (p._id || p.id) == productId);
      if (!product) return;
      document.getElementById('quick-review-title').textContent = product.name;
      document.getElementById('quick-review-content').textContent = product.description || product.quickReview || 'No review available.';
      modal.style.display = 'flex';
    });
  });
}

// Usage example (to be placed in each product page):
// fetchProducts('documents').then(products => renderProducts(products, '.product-grid'));
