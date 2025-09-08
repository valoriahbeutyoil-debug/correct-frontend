(function(){
  "use strict";

  const CART_STORAGE_KEY = "docushop_cart_items";

  function readCart(){
    try { return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]"); } catch { return []; }
  }
  function writeCart(items){ localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items)); }

  function addItem(item){
    const items = readCart();
    const existing = items.find(x => x.id === item.id && x.variant === item.variant);
    if (existing) existing.qty += item.qty || 1;
    else items.push({ ...item, qty: item.qty || 1 });
    writeCart(items);
    updateCartDetails();
    updateCartTotal();
    // User login removed. Anyone can checkout.
    updateCartTotal();
    renderCheckoutItems();
  }

  function updateCartDetails(){
    const items = readCart();
    const total = items.reduce((s,i)=>s+i.qty,0);
    const cartCountElement = document.getElementById('cart-count');
    const totalItemsDisplay = document.getElementById('total-items');
    if (cartCountElement) cartCountElement.textContent = String(total);
    if (totalItemsDisplay) totalItemsDisplay.textContent = String(total);
  }

  function updateCartTotal(){
    const items = readCart();
    const subtotal = items.reduce((s,i)=>s+(i.price * i.qty),0);
    let shipping = 30.00;
    try {
      const settings = JSON.parse(localStorage.getItem('docushop_settings') || '{}');
      if (settings && settings.shippingDiscreet) {
        shipping = parseFloat(settings.shippingDiscreet) || shipping;
      }
    } catch {}
    const total = subtotal + shipping;
    
    // Update cart total display in header/navbar
    const cartTotalElement = document.getElementById('cart-total');
    if (cartTotalElement) {
      cartTotalElement.textContent = `$${subtotal.toFixed(2)}`;
    }
    
    // Update cart total in cart dropdown/sidebar
    const cartTotalDisplay = document.getElementById('cart-total-display');
    if (cartTotalDisplay) {
      cartTotalDisplay.textContent = `$${subtotal.toFixed(2)}`;
    }
    
    // Update checkout page totals
    const checkoutSubtotal = document.getElementById('checkout-subtotal');
    const checkoutTotal = document.getElementById('checkout-total');
    if (checkoutSubtotal) {
      checkoutSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    }
    if (checkoutTotal) {
      checkoutTotal.textContent = `$${total.toFixed(2)}`;
    }
    
    // Update any other total displays
    const totalPriceElements = document.querySelectorAll('.total-price, .cart-total, .checkout-total');
    totalPriceElements.forEach(el => {
      el.textContent = `$${subtotal.toFixed(2)}`;
    });
  }

  // --- Enhanced Checkout Item Rendering ---
  function renderCheckoutItems() {
  const items = readCart();
  const container = document.getElementById('checkout-order-items');
  if (!container) return;

  container.innerHTML = '';

  if (items.length === 0) {
    container.innerHTML = `
      <div class="order-item">
        <div class="item-info">
          <div class="item-name">No items in cart</div>
        </div>
        <div class="item-price">$0.00</div>
      </div>`;
    return;
  }

  items.forEach(item => {
    const orderItem = document.createElement('div');
    orderItem.className = 'order-item';
    orderItem.innerHTML = `
      <div class="item-info">
        <div class="item-name">${item.name}</div>
        <div class="item-quantity">
          Quantity: ${item.qty}${item.variant && item.variant !== 'default' ? ` (${item.variant})` : ''}
        </div>
      </div>
      <div class="item-price">$${(item.price * item.qty).toFixed(2)}</div>
      <button 
        class="remove-item-btn" 
        data-product-id="${item.id}" 
        data-variant="${item.variant || ''}" 
        title="Remove" 
        style="background:none;border:none;color:#ef4444;font-size:18px;cursor:pointer;margin-left:12px;">
        &times;
      </button>
    `;
    container.appendChild(orderItem);
  });

  // Attach remove button events
  container.querySelectorAll('.remove-item-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const productId = btn.getAttribute('data-product-id');
      const variant = btn.getAttribute('data-variant');
      removeItem(productId, variant);   // ✅ this now knows what to remove
    });
  });
}

      // Remove button logic
     function removeItem(productId, variant = null) {
  let items = readCart();

  items = items.filter(item => {
    if (variant) {
      return item.id !== productId || item.variant !== variant;
    } else {
      return item.id !== productId;
    }
  });

  writeCart(items);
  updateCartDetails();
  updateCartTotal();
  renderCheckoutItems();
}


  function bindAddToCart(){
    document.querySelectorAll('.add-to-cart-btn, .btn.add, .add-to-cart').forEach(btn => {
      btn.addEventListener('click', function(e){
        e.preventDefault();
        const card = this.closest('[data-product-id], .product, .product-card');
        const id = this.getAttribute('data-product-id') || card?.querySelector('[data-product-id]')?.getAttribute('data-product-id') || (card?.querySelector('h3')?.textContent || 'item').toLowerCase().replace(/\s+/g,'-');
        const name = card?.querySelector('h3')?.textContent || 'Item';
        const priceText = card?.querySelector('.price, .current')?.textContent || '0';
        const price = Number(String(priceText).replace(/[^0-9.]/g,'')) || 0;
        const variant = (card?.querySelector('select[data-variant]')?.value || 'default');
        addItem({ id, name, price, variant, qty: 1 });
        this.textContent = 'Added!';
        this.classList.add('added');
        setTimeout(()=>{
          this.textContent = this.getAttribute('aria-label')?.replace('Add ','') || 'Add to Cart';
          this.classList.remove('added');
        }, 1500);
      });
    });
  }

  function renderCartTable(container){
    const items = readCart();
    const table = document.createElement('table');
    table.className = 'cart-table';
    table.innerHTML = '<thead><tr><th>Product</th><th>Variant</th><th>Qty</th><th>Price</th><th>Total</th><th></th></tr></thead>';
    const tbody = document.createElement('tbody');
    let subtotal = 0;
    items.forEach(item => {
      const row = document.createElement('tr');
      const line = item.price * item.qty; subtotal += line;
      row.innerHTML = `
        <td>${item.name}</td>
        <td>${item.variant || 'default'}</td>
        <td><input type="number" min="1" value="${item.qty}" data-id="${item.id}" data-variant="${item.variant}" class="qty-input" /></td>
        <td>$${item.price.toFixed(2)}</td>
        <td>$${line.toFixed(2)}</td>
        <td><button class="cart-remove-btn" title="Remove" data-id="${item.id}" data-variant="${item.variant}">&times;</button></td>`;
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    const foot = document.createElement('div');
    foot.className = 'cart-summary';
    foot.innerHTML = `<div class="summary-row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
      <div class="summary-row"><span>Payment</span>
      <select id="payment-method"><option value="btc">Bitcoin (BTC)</option><option value="eth">Ethereum (ETH)</option><option value="usdt">Tether (USDT-TRC20)</option></select></div>
      <button id="proceed-checkout" class="btn primary">Proceed to Checkout</button>`;
    container.innerHTML = '';
    container.appendChild(table);
    container.appendChild(foot);

    container.querySelectorAll('.qty-input').forEach(inp => {
      inp.addEventListener('change', function(){ setQty(this.getAttribute('data-id'), this.getAttribute('data-variant'), Number(this.value)); renderCartTable(container); });
    });
    container.querySelectorAll('.cart-remove-btn').forEach(btn => {
      btn.addEventListener('click', function(){ removeItem(this.getAttribute('data-id'), this.getAttribute('data-variant')); renderCartTable(container); });
    });
    const go = container.querySelector('#proceed-checkout');
    if (go){ go.addEventListener('click', function(){ window.location.href = 'checkout.html'; }); }
  }

  function bindQuickView(){
    document.querySelectorAll('.quick-view-btn, .quick-view').forEach(btn => {
      btn.addEventListener('click', function(){
        const card = this.closest('.product-card, .product');
        const id = this.getAttribute('data-product-id') || (card?.querySelector('h3')?.textContent || 'item').toLowerCase().replace(/\s+/g,'-');
        const modal = document.createElement('div');
        modal.className = 'modal';
        const countryOptions = ['United States','United Kingdom','Canada','Australia','Germany','France','Spain','Italy','Netherlands','Sweden','Norway','Denmark','Finland','Ireland','Switzerland','Poland','Czech Republic','Belgium','Austria','Portugal'];
        modal.innerHTML = `
          <div class="modal-backdrop" data-close></div>
          <div class="modal-dialog">
            <button class="modal-close" aria-label="Close" data-close>×</button>
            <h3>Quick View</h3>
            <p>Select country variant, then add to cart.</p>
            <label>Country
              <select data-variant>${countryOptions.map(c=>`<option value="${c}">${c}</option>`).join('')}</select>
            </label>
            <div style="margin-top:12px;display:flex;gap:8px;">
              <button class="btn primary" data-qv-add>Add to Cart</button>
              <button class="btn" data-close>Close</button>
            </div>
          </div>`;
        document.body.appendChild(modal);
        modal.querySelectorAll('[data-close]').forEach(x=>x.addEventListener('click', ()=>modal.remove()));
        const add = modal.querySelector('[data-qv-add]');
        add.addEventListener('click', function(){
          const variant = modal.querySelector('select[data-variant]').value;
          addItem({ id, name: id.replace(/-/g,' '), price: 0, variant, qty: 1 });
          modal.remove();
        });
      });
    });
  }

  function bindSorting(){
    const sortSelect = document.querySelector('[data-sort]');
    const grid = document.querySelector('.product-grid');
    const counter = document.querySelector('[data-result-count]');
    if (!sortSelect || !grid) return;
    function parsePrice(el){ const t = el.querySelector('.price, .current')?.textContent || '0'; return Number(t.replace(/[^0-9.]/g,'')) || 0; }
    function apply(){
      const items = Array.from(grid.children);
      const total = items.length;
      if (counter) counter.textContent = `1-${total} out of ${total} results`;
      const v = sortSelect.value;
      if (v === 'latest') items.reverse();
      if (v === 'price-asc') items.sort((a,b)=>parsePrice(a)-parsePrice(b));
      if (v === 'price-desc') items.sort((a,b)=>parsePrice(b)-parsePrice(a));
      items.forEach(it=>grid.appendChild(it));
    }
    sortSelect.addEventListener('change', apply);
    apply();
  }

  function init(){
    updateCartDetails();
    updateCartTotal();
    renderCheckoutItems();
    bindAddToCart();
    bindQuickView();
    bindSorting();
    const cartContainer = document.getElementById('cart-container');
    if (cartContainer) renderCartTable(cartContainer);
  }
 document.addEventListener('DOMContentLoaded', init);
  
  // Make core cart functions global so product-api.js can call them
window.addItem = addItem;
window.removeItem = removeItem;
window.updateCartDetails = updateCartDetails;
window.updateCartTotal = updateCartTotal;
window.renderCheckoutItems = renderCheckoutItems;


  document.addEventListener('DOMContentLoaded', init);
})();
// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
  updateCartDetails();
  updateCartTotal();
});
document.addEventListener('DOMContentLoaded', function() {
  updateCartDetails();     // refresh cart icon count
  updateCartTotal();       // refresh totals
  renderCheckoutItems();   // refresh checkout items (if on checkout page)
});
// Expose cart functions globally so other scripts/pages can access them
window.updateCartDetails = updateCartDetails;
window.updateCartTotal = updateCartTotal;
window.addItem = addItem;
window.renderCheckoutItems = renderCheckoutItems;





