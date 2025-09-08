// product-api.js
// Reusable script to fetch and render products from backend API

async function fetchProducts(category = null) {
  let url = 'https://correct-backend-gu05.onrender.com/products';
  if (category) url += `?category=${encodeURIComponent(category)}`;
  console.log('[DEBUG] fetchProducts URL:', url);
  const res = await fetch(url);
  console.log('[DEBUG] fetchProducts response status:', res.status);
  if (!res.ok) throw new Error('Failed to fetch products');
  const data = await res.json();
  console.log('[DEBUG] fetchProducts data:', data);
  return data;
}

function renderProducts(products, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  container.innerHTML = '';
  console.log('[DEBUG] renderProducts called with:', products);

  if (!products || products.length === 0) {
    container.innerHTML = '<div class="no-products">No products found for this category.</div>';
    return;
  }

  products.forEach(product => {
    console.log('[DEBUG] Rendering product:', product);
    const el = document.createElement('article');
    el.className = 'product-card';
    el.dataset.category = product.category;

    el.innerHTML = `
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" loading="lazy" 
             style="width:220px;height:220px;object-fit:cover;">
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <div class="price">$${Number(product.price).toFixed(2)}</div>
        <p class="description">${product.description || ''}</p>
        <button class="add-to-cart-btn" data-product-id="${product._id || product.id}">Add to Cart</button>
        <button class="quick-review-btn" data-product-id="${product._id || product.id}">Quick Review</button>
      </div>
    `;

    container.appendChild(el);
  });

  // ✅ Add to Cart buttons
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
          qty: 1
        });
      }

      // Feedback
      btn.textContent = 'Added!';
      btn.style.background = '#28a745';
      setTimeout(() => {
        btn.textContent = 'Add to Cart';
        btn.style.background = '';
      }, 1500);
    });
  });

  // ✅ Quick Review modal
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
      document.getElementById('quick-review-content').textContent =
        product.description || product.quickReview || 'No review available.';
      modal.style.display = 'flex';
    });
  });
}
