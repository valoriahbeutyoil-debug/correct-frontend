// Set API base URL for easy switching between local and deployed environments
const API_BASE_URL = 'https://backend-crqd.onrender.com'; // Live backend URL
// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.currentSection = 'dashboard';
        this.products = [];
        this.users = [];
        this.orders = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadDashboardData();
        this.loadProducts();
        this.loadUsers();
        this.loadOrders();
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.dataset.section;
                this.showSection(section);
            });
        });

        // Sidebar toggle
        const sidebar = document.querySelector('.admin-sidebar');
        const backdrop = document.querySelector('.sidebar-backdrop');
        document.getElementById('sidebar-toggle').addEventListener('click', () => {
            sidebar.classList.toggle('open');
            backdrop.classList.toggle('active');
        });

        // Backdrop click closes sidebar
        backdrop.addEventListener('click', () => {
            sidebar.classList.remove('open');
            backdrop.classList.remove('active');
        });

        // Add product button
        document.getElementById('add-product-btn').addEventListener('click', () => {
            this.showModal('add-product-modal');
        });

        // Add user button
        document.getElementById('add-user-btn').addEventListener('click', () => {
            this.showModal('add-user-modal');
        });

        // Form submissions
        document.getElementById('add-product-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addProduct();
        });

        document.getElementById('add-user-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addUser();
        });

        // Content save
        document.getElementById('save-content-btn').addEventListener('click', () => {
            this.saveContent();
        });

        // Settings save
        document.getElementById('save-settings-btn').addEventListener('click', () => {
            this.saveSettings();
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideAllModals();
            });
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideAllModals();
            }
        });
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        document.getElementById(sectionName).classList.add('active');

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update page title
        document.getElementById('page-title').textContent = this.getSectionTitle(sectionName);

        this.currentSection = sectionName;
    }

    getSectionTitle(section) {
        const titles = {
            'dashboard': 'Dashboard',
            'products': 'Products Management',
            'users': 'User Management',
            'content': 'Site Content',
            'orders': 'Order Management',
            'settings': 'Admin Settings'
        };
        return titles[section] || 'Dashboard';
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    loadDashboardData() {
        // Load statistics
        this.updateStats();
        
        // Load recent activity
        this.loadRecentActivity();
    }

    updateStats() {
        // These would normally come from a database
        document.getElementById('total-users').textContent = this.users.length;
        document.getElementById('total-products').textContent = this.products.length;
        document.getElementById('total-orders').textContent = this.orders.length;
        
        // Calculate revenue
        const revenue = this.orders.reduce((total, order) => total + order.total, 0);
        document.getElementById('total-revenue').textContent = `$${revenue.toFixed(2)}`;
    }

    loadRecentActivity() {
        const activityContainer = document.getElementById('recent-activity');
        const activities = [
            { type: 'user', text: 'New user registered', time: '2 minutes ago' },
            { type: 'order', text: 'Order #1234 completed', time: '15 minutes ago' },
            { type: 'product', text: 'New product added', time: '1 hour ago' },
            { type: 'user', text: 'User profile updated', time: '2 hours ago' }
        ];

        activityContainer.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.text}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');
    }

    getActivityIcon(type) {
        const icons = {
            'user': 'user',
            'order': 'shopping-cart',
            'product': 'box',
            'system': 'cog'
        };
        return icons[type] || 'info-circle';
    }

    async loadProducts() {
        try {
            const res = await fetch(`${API_BASE_URL}/products`);
            if (!res.ok) throw new Error('Failed to fetch products');
            this.products = await res.json();
            this.renderProducts();
        } catch (err) {
            this.showNotification('Error loading products: ' + err.message, 'error');
        }
    }

    renderProducts() {
        const container = document.getElementById('products-grid');
        const filter = document.getElementById('product-category-filter');
        let filtered = this.products;
        if (filter && filter.value) {
            filtered = this.products.filter(p => p.category === filter.value);
        }
        container.innerHTML = filtered.map(product => `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" style="width: 220px; height: 220px; object-fit: cover;">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <div class="product-category">${product.category}</div>
                    <div class="product-review">${product.quickReview ? product.quickReview : ''}</div>
                    <div class="product-actions">
                        <button class="btn btn-secondary" onclick="adminPanel.editProduct('${product._id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-secondary" onclick="adminPanel.deleteProduct('${product._id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async addProduct() {
        const form = document.getElementById('add-product-form');
        const formData = new FormData(form);
        // Validate required fields
        if (!formData.get('name') || !formData.get('category') || !formData.get('price') || !formData.get('image')) {
            this.showNotification('Please fill in all required fields.', 'error');
            return;
        }
        // Add status field
        formData.append('status', 'active');
        try {
            const res = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                body: formData
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to add product');
            }
            this.showNotification('Product added successfully!', 'success');
            this.loadProducts();
            this.updateStats();
            this.hideAllModals();
            form.reset();
        } catch (err) {
            this.showNotification('Error adding product: ' + err.message, 'error');
        }
    }

    async editProduct(id) {
    const product = this.products.find(p => p._id === id);
        if (product) {
            // Example: open edit modal and update product
            // For now, just show notification
            this.showNotification('Edit functionality coming soon!', 'info');
            // You can implement edit modal and call backend PUT /products/:id
        }
    }

    async deleteProduct(id) {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                const res = await fetch(`${API_BASE_URL}/products/${id}`, {
                    method: 'DELETE'
                });
                if (!res.ok) throw new Error('Failed to delete product');
                this.showNotification('Product deleted successfully!', 'success');
                this.loadProducts();
                this.updateStats();
            } catch (err) {
                this.showNotification('Error deleting product: ' + err.message, 'error');
            }
        }
    }

    async loadUsers() {
        try {
            const res = await fetch(`${API_BASE_URL}/users`);
            if (!res.ok) throw new Error('Failed to fetch users');
            this.users = await res.json();
            this.renderUsers();
        } catch (err) {
            this.showNotification('Error loading users: ' + err.message, 'error');
        }
    }

    renderUsers() {
        const tbody = document.getElementById('users-tbody');
        tbody.innerHTML = this.users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td><span class="role-badge ${user.role}">${user.role}</span></td>
                <td><span class="status-badge ${user.status}">${user.status}</span></td>
                <td>
                    <button class="btn btn-secondary" onclick="adminPanel.editUser(${user.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-secondary" onclick="adminPanel.deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async addUser() {
        const form = document.getElementById('add-user-form');
        const formData = new FormData(form);
        const user = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password'),
            role: formData.get('role'),
            status: 'active'
        };
        try {
            const res = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });
            if (!res.ok) throw new Error('Failed to add user');
            this.showNotification('User added successfully!', 'success');
            await this.loadUsers();
            this.updateStats();
            this.hideAllModals();
            form.reset();
        } catch (err) {
            this.showNotification('Error adding user: ' + err.message, 'error');
        }
    }

    editUser(id) {
        const user = this.users.find(u => u.id === id);
        if (user) {
            this.showNotification('Edit functionality coming soon!', 'info');
        }
    }

    deleteUser(id) {
        if (confirm('Are you sure you want to delete this user?')) {
            this.users = this.users.filter(u => u.id !== id);
            this.renderUsers();
            this.updateStats();
            this.showNotification('User deleted successfully!', 'success');
        }
    }

    async loadOrders() {
        try {
            const res = await fetch(`${API_BASE_URL}/orders`);
            if (!res.ok) throw new Error('Failed to fetch orders');
            this.orders = await res.json();
            this.renderOrders();
        } catch (err) {
            this.showNotification('Error loading orders: ' + err.message, 'error');
        }
    }

    renderOrders() {
        const tbody = document.getElementById('orders-tbody');
        tbody.innerHTML = this.orders.map(order => {
            let billing = {};
            let cart = [];
            try {
                billing = JSON.parse(order.billing);
                cart = JSON.parse(order.cart);
            } catch {}
            return `
                <tr>
                    <td>${order.id}</td>
                    <td>${billing.firstName || ''} ${billing.lastName || ''}</td>
                    <td>${cart.map(p => p.name).join(', ')}</td>
                    <td>$${cart.reduce((sum, p) => sum + (p.price * p.qty), 0).toFixed(2)}</td>
                    <td><span class="status-badge ${order.status}">${order.status}</span></td>
                    <td>${order.created_at || ''}</td>
                    <td>
                        <button class="btn btn-secondary" onclick="adminPanel.viewOrder('${order.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    viewOrder(id) {
        const order = this.orders.find(o => o.id == id);
        if (order) {
            let billing = {};
            let cart = [];
            try {
                billing = JSON.parse(order.billing);
                cart = JSON.parse(order.cart);
            } catch {}
            // Display billing and cart info in a modal or alert
            alert(`Order #${order.id}\n\nBilling Info:\nName: ${billing.firstName || ''} ${billing.lastName || ''}\nEmail: ${billing.email || ''}\nPhone: ${billing.phone || ''}\nAddress: ${billing.address || ''}\n\nProducts:\n${cart.map(p => `${p.name} x${p.qty} ($${p.price})`).join('\n')}`);
        }
    }

    saveContent() {
        const heroTitle = document.getElementById('hero-title').value;
        const heroDescription = document.getElementById('hero-description').value;
        const heroButton = document.getElementById('hero-button').value;
        const siteTitle = document.getElementById('site-title').value;
        const siteDescription = document.getElementById('site-description').value;

        // In real app, save to database and update live site
        const contentData = {
            hero: { title: heroTitle, description: heroDescription, button: heroButton },
            site: { title: siteTitle, description: siteDescription }
        };

        localStorage.setItem('docushop_content', JSON.stringify(contentData));
        this.showNotification('Content saved successfully!', 'success');
    }

    saveSettings() {
        const adminEmail = document.getElementById('admin-email').value;
        const maintenanceMode = document.getElementById('maintenance-mode').value;
        const defaultCurrency = document.getElementById('default-currency').value;

        // In real app, save to database
        const settings = {
            adminEmail,
            maintenanceMode: maintenanceMode === 'true',
            defaultCurrency
        };

        localStorage.setItem('docushop_settings', JSON.stringify(settings));
        this.showNotification('Settings saved successfully!', 'success');
    }

    async loadCryptoAddresses() {
        try {
            const res = await fetch(`${API_BASE_URL}/crypto-addresses`);
            if (!res.ok) throw new Error('Failed to fetch crypto addresses');
            const data = await res.json();
            document.getElementById('bitcoin-address').value = data.bitcoin || '';
            document.getElementById('ethereum-address').value = data.ethereum || '';
            document.getElementById('usdt-address').value = data.usdt || '';
        } catch (err) {
            this.showNotification('Error loading crypto addresses: ' + err.message, 'error');
        }
    }

    async saveCryptoAddresses(e) {
        e.preventDefault();
        const bitcoin = document.getElementById('bitcoin-address').value;
        const ethereum = document.getElementById('ethereum-address').value;
        const usdt = document.getElementById('usdt-address').value;
        try {
            const res = await fetch(`${API_BASE_URL}/crypto-addresses`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bitcoin, ethereum, usdt })
            });
            if (!res.ok) throw new Error('Failed to save crypto addresses');
            this.showNotification('Crypto addresses updated!', 'success');
        } catch (err) {
            this.showNotification('Error saving crypto addresses: ' + err.message, 'error');
        }
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            // Clear session
            sessionStorage.removeItem('docushop_session');
            // Redirect to home page
            window.location.href = 'index.html';
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Initialize admin panel when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is admin
    let session = sessionStorage.getItem('docushop_session');
    if (!session) session = localStorage.getItem('docushop_session');
    let isAdmin = false;
    if (session) {
        try {
            const sessionData = JSON.parse(session);
            isAdmin = sessionData.user && sessionData.user.role === 'admin' && sessionData.isActive;
        } catch {}
    }
    if (!isAdmin) {
        // Clear any session and redirect to admin login
        localStorage.removeItem('docushop_session');
        sessionStorage.removeItem('docushop_session');
        window.location.href = 'admin-login.html';
        return;
    }
    window.adminPanel = new AdminPanel();
    const filter = document.getElementById('product-category-filter');
    if (filter) {
        filter.addEventListener('change', () => window.adminPanel.renderProducts());
    }
    // Crypto Payment Settings logic
    if (document.getElementById('crypto-address-form')) {
        window.adminPanel.loadCryptoAddresses();
        document.getElementById('crypto-address-form').addEventListener('submit', function(e) {
            window.adminPanel.saveCryptoAddresses(e);
        });
    }
});

// Add notification styles
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 8px;
        padding: 16px 20px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        z-index: 10000;
        max-width: 400px;
    }

    .notification.show {
        transform: translateX(0);
    }

    .notification-success {
        border-left: 4px solid #059669;
        color: #059669;
    }

    .notification-error {
        border-left: 4px solid #dc2626;
        color: #dc2626;
    }

    .notification-warning {
        border-left: 4px solid #d97706;
        color: #d97706;
    }

    .notification-info {
        border-left: 4px solid #3b82f6;
        color: #3b82f6;
    }

    .notification-close {
        background: none;
        border: none;
        font-size: 1.2rem;
        color: inherit;
        cursor: pointer;
        margin-left: auto;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.3s ease;
    }

    .notification-close:hover {
        background: rgba(0, 0, 0, 0.1);
    }

    .role-badge, .status-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 500;
        text-transform: capitalize;
    }

    .role-badge.admin {
        background: #fef3c7;
        color: #92400e;
    }

    .role-badge.user {
        background: #dbeafe;
        color: #1e40af;
    }

    .status-badge.active {
        background: #d1fae5;
        color: #065f46;
    }

    .status-badge.inactive {
        background: #fee2e2;
        color: #991b1b;
    }

    .status-badge.completed {
        background: #d1fae5;
        color: #065f46;
    }

    .status-badge.pending {
        background: #fef3c7;
        color: #92400e;
    }
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// --- Payment Methods Modal Logic ---
(function() {
    const API_BASE_URL = 'https://backend-crqd.onrender.com';
    const paymentModal = document.getElementById('payment-methods-modal');
    const openPaymentBtn = document.getElementById('manage-payment-methods-btn');
    if (!paymentModal || !openPaymentBtn) return;

    // Open modal and default to Bank tab
    openPaymentBtn.addEventListener('click', () => {
        paymentModal.style.display = 'flex';
        showPaymentTab('bank');
        loadPaymentMethods();
    });
    // Close modal
    paymentModal.querySelector('.modal-close').addEventListener('click', () => {
        paymentModal.style.display = 'none';
    });
    paymentModal.addEventListener('click', (e) => {
        if (e.target === paymentModal) paymentModal.style.display = 'none';
    });
    // Tab switching
    paymentModal.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showPaymentTab(btn.dataset.tab);
        });
    });
    function showPaymentTab(tab) {
        ['bank', 'skype', 'paypal', 'crypto'].forEach(t => {
            document.getElementById('tab-' + t).style.display = (t === tab) ? 'block' : 'none';
        });
        paymentModal.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
    }
    // Load current payment methods
    async function loadPaymentMethods() {
        try {
            const res = await fetch(`${API_BASE_URL}/payment-methods`);
            if (!res.ok) throw new Error('Failed to fetch payment methods');
            const methods = await res.json();
            methods.forEach(method => {
                if (method.type === 'Bank') {
                    document.querySelector('#bank-method-form [name="bankName"]').value = method.credentials.bankName || '';
                    document.querySelector('#bank-method-form [name="accountNumber"]').value = method.credentials.accountNumber || '';
                    document.querySelector('#bank-method-form [name="accountName"]').value = method.credentials.accountName || '';
                } else if (method.type === 'Skype') {
                    document.querySelector('#skype-method-form [name="skypeId"]').value = method.credentials.skypeId || '';
                } else if (method.type === 'PayPal') {
                    document.querySelector('#paypal-method-form [name="paypalEmail"]').value = method.credentials.paypalEmail || '';
                } else if (method.type === 'Crypto') {
                    document.querySelector('#crypto-method-form [name="bitcoin"]').value = method.credentials.bitcoin || '';
                    document.querySelector('#crypto-method-form [name="ethereum"]').value = method.credentials.ethereum || '';
                    document.querySelector('#crypto-method-form [name="usdt"]').value = method.credentials.usdt || '';
                }
            });
        } catch (err) {
            // Optionally show error notification
        }
    }
    // Save payment method
    async function savePaymentMethod(type) {
        let credentials = {};
        let form;
        if (type === 'Bank') {
            form = document.getElementById('bank-method-form');
            credentials = {
                bankName: form.bankName.value,
                accountNumber: form.accountNumber.value,
                accountName: form.accountName.value
            };
        } else if (type === 'Skype') {
            form = document.getElementById('skype-method-form');
            credentials = {
                skypeId: form.skypeId.value
            };
        } else if (type === 'PayPal') {
            form = document.getElementById('paypal-method-form');
            credentials = {
                paypalEmail: form.paypalEmail.value
            };
        } else if (type === 'Crypto') {
            form = document.getElementById('crypto-method-form');
            credentials = {
                bitcoin: form.bitcoin.value,
                ethereum: form.ethereum.value,
                usdt: form.usdt.value
            };
        }
        try {
            const res = await fetch(`${API_BASE_URL}/payment-methods`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, credentials, active: true })
            });
            if (!res.ok) throw new Error('Failed to save payment method');
            if (window.adminPanel && typeof window.adminPanel.showNotification === 'function') {
                window.adminPanel.showNotification(type + ' payment method saved!', 'success');
            }
            paymentModal.style.display = 'none';
            loadPaymentMethods();
        } catch (err) {
            if (window.adminPanel && typeof window.adminPanel.showNotification === 'function') {
                window.adminPanel.showNotification('Error saving payment method: ' + err.message, 'error');
            }
        }
    }
    // Form submissions
    document.getElementById('bank-method-form').addEventListener('submit', function(e) {
        e.preventDefault();
        savePaymentMethod('Bank');
    });
    document.getElementById('skype-method-form').addEventListener('submit', function(e) {
        e.preventDefault();
        savePaymentMethod('Skype');
    });
    document.getElementById('paypal-method-form').addEventListener('submit', function(e) {
        e.preventDefault();
        savePaymentMethod('PayPal');
    });
    document.getElementById('crypto-method-form').addEventListener('submit', function(e) {
        e.preventDefault();
        savePaymentMethod('Crypto');
    });
})();
