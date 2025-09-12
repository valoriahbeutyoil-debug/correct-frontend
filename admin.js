// Set API base URL for easy switching between local and deployed environments
const API_BASE_URL = 'https://correct-backend-gu05.onrender.com'; // Live backend URL

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
        this.loadShippingSettings();
        fetchOrders(); // global function for orders
    }

    // =======================
    // EVENT BINDINGS
    // =======================
    bindEvents() {
        // Product category filter
        const filter = document.getElementById('product-category-filter');
        if (filter) {
            filter.addEventListener('change', () => this.renderProducts());
        }

        // Shipping form submit
        const shippingForm = document.getElementById("shipping-form");
        if (shippingForm) {
            shippingForm.addEventListener("submit", (e) => this.saveShippingSettings(e));
        }

        // Close modal (clicking × specifically for payments)
        const closeBtn = document.querySelector('#payment-methods-modal .modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                const modal = document.getElementById('payment-methods-modal');
                if (modal) modal.style.display = 'none';
            });
        }

        // Close modal (clicking outside payments modal)
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('payment-methods-modal');
            if (modal && e.target === modal) {
                modal.style.display = 'none';
            }
        });

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
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                backdrop.classList.toggle('active');
            });
        }
        if (backdrop) {
            backdrop.addEventListener('click', () => {
                sidebar.classList.remove('open');
                backdrop.classList.remove('active');
            });
        }

        // Add product button
        const addProductBtn = document.getElementById('add-product-btn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => {
                this.showModal('add-product-modal');
            });
        }

        // Add user button
        const addUserBtn = document.getElementById('add-user-btn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => {
                this.showModal('add-user-modal');
            });
        }

        // Manage payment methods button
        const managePaymentsBtn = document.getElementById('manage-payment-methods-btn');
        if (managePaymentsBtn) {
            managePaymentsBtn.addEventListener('click', async () => {
                const modal = document.getElementById('payment-methods-modal');
                if (modal) modal.style.display = 'block';

                try {
                    const res = await fetch(`${API_BASE_URL}/api/payment-methods`);
                    if (!res.ok) throw new Error("Failed to load payment methods");
                    const data = await res.json();

                    const bankInput = document.getElementById('bank');
                    if (bankInput) bankInput.value = data.bank || '';
                    const paypalInput = document.getElementById('paypal');
                    if (paypalInput) paypalInput.value = data.paypal || '';
                    const skypeInput = document.getElementById('skype');
                    if (skypeInput) skypeInput.value = data.skype || '';
                    const btcInput = document.getElementById('bitcoin');
                    if (btcInput) btcInput.value = data.bitcoin || '';
                    const ethInput = document.getElementById('eth-address');
                    if (ethInput) ethInput.value = data.ethereum || '';
                    const usdtInput = document.getElementById('usdt-address');
                    if (usdtInput) usdtInput.value = data.usdt || '';
                } catch (err) {
                    window.adminPanel.showNotification("Error loading payment methods: " + err.message, "error");
                }
            });
        }

        // Add product form submission
        const addProductForm = document.getElementById('add-product-form');
        if (addProductForm) {
            addProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addProduct();
            });
        }

        // Add user form submission
        const addUserForm = document.getElementById('add-user-form');
        if (addUserForm) {
            addUserForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addUser();
            });
        }

        // Save content
        const saveContentBtn = document.getElementById('save-content-btn');
        if (saveContentBtn) {
            saveContentBtn.addEventListener('click', () => {
                this.saveContent();
            });
        }

        // Payment methods save
        const paymentForm = document.getElementById('payment-methods-form');
        if (paymentForm) {
            paymentForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveSettings();
            });
        }

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideAllModals();
            });
        });

        // Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideAllModals();
            }
        });
    }

    // =======================
    // NAVIGATION + MODALS
    // =======================
    showSection(sectionName) {
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        document.getElementById(sectionName).classList.add('active');

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

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

    // =======================
    // DASHBOARD
    // =======================
    loadDashboardData() {
        this.updateStats();
        this.loadRecentActivity();
    }

    updateStats() {
        const totalUsers = document.getElementById('total-users');
        if (totalUsers) totalUsers.textContent = this.users.length;
        const totalProducts = document.getElementById('total-products');
        if (totalProducts) totalProducts.textContent = this.products.length;
        const totalOrders = document.getElementById('total-orders');
        if (totalOrders) totalOrders.textContent = this.orders.length;

        const revenue = this.orders.reduce((total, order) => total + order.total, 0);
        const totalRevenue = document.getElementById('total-revenue');
        if (totalRevenue) totalRevenue.textContent = `$${revenue.toFixed(2)}`;
    }

    loadRecentActivity() {
        const activityContainer = document.getElementById('recent-activity');
        if (!activityContainer) return;
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

    // =======================
    // PRODUCTS
    // =======================
    async loadProducts() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/products`);
            this.products = await res.json();
            this.renderProducts();
        } catch (err) {
            console.error("Error loading products:", err);
        }
    }

    renderProducts() {
        const container = document.getElementById('product-list');
        if (!container) return;
        container.innerHTML = this.products.map(product => `
            <div class="product-item">
                <h4>${product.name}</h4>
                <p>₦${product.price}</p>
                <button onclick="window.adminPanel.editProduct('${product._id}')">Edit</button>
                <button onclick="window.adminPanel.deleteProduct('${product._id}')">Delete</button>
            </div>
        `).join('');
    }

    async addProduct() {
        try {
            const name = document.getElementById('product-name').value;
            const price = parseFloat(document.getElementById('product-price').value);
            const res = await fetch(`${API_BASE_URL}/api/products`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, price })
            });
            const product = await res.json();
            this.products.push(product);
            this.renderProducts();
            this.hideAllModals();
        } catch (err) {
            console.error("Error adding product:", err);
        }
    }

    async editProduct(id) {
        alert(`Edit product ${id} clicked`);
    }

    async deleteProduct(id) {
        if (!confirm("Are you sure?")) return;
        try {
            await fetch(`${API_BASE_URL}/api/products/${id}`, { method: "DELETE" });
            this.products = this.products.filter(p => p._id !== id);
            this.renderProducts();
        } catch (err) {
            console.error("Error deleting product:", err);
        }
    }

    // =======================
    // USERS
    // =======================
    async loadUsers() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/users`);
            this.users = await res.json();
            this.renderUsers();
        } catch (err) {
            console.error("Error loading users:", err);
        }
    }

    renderUsers() {
        const container = document.getElementById('user-list');
        if (!container) return;
        container.innerHTML = this.users.map(user => `
            <div class="user-item">
                <h4>${user.username}</h4>
                <p>${user.email}</p>
                <button onclick="window.adminPanel.editUser('${user._id}')">Edit</button>
                <button onclick="window.adminPanel.deleteUser('${user._id}')">Delete</button>
            </div>
        `).join('');
    }

    async addUser() {
        try {
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const res = await fetch(`${API_BASE_URL}/api/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email })
            });
            const user = await res.json();
            this.users.push(user);
            this.renderUsers();
            this.hideAllModals();
        } catch (err) {
            console.error("Error adding user:", err);
        }
    }

    editUser(id) {
        alert(`Edit user ${id} clicked`);
    }

    deleteUser(id) {
        if (!confirm("Are you sure?")) return;
        try {
            fetch(`${API_BASE_URL}/api/users/${id}`, { method: "DELETE" });
            this.users = this.users.filter(u => u._id !== id);
            this.renderUsers();
        } catch (err) {
            console.error("Error deleting user:", err);
        }
    }

    // =======================
    // CONTENT & SETTINGS
    // =======================
    saveContent() {
        alert("Content saved!");
    }

    async saveSettings() {
        try {
            const bank = document.getElementById('bank').value;
            const paypal = document.getElementById('paypal').value;
            const skype = document.getElementById('skype').value;
            const bitcoin = document.getElementById('bitcoin').value;
            const ethereum = document.getElementById('eth-address').value;
            const usdt = document.getElementById('usdt-address').value;

            await fetch(`${API_BASE_URL}/api/payment-methods`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bank, paypal, skype, bitcoin, ethereum, usdt })
            });

            this.showNotification("✅ Payment methods updated!", "success");
        } catch (err) {
            console.error("Error saving payment methods:", err);
            this.showNotification("❌ Failed to save payment methods", "error");
        }
    }

    // =======================
    // SHIPPING
    // =======================
    async loadShippingSettings() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/shipping`);
            const data = await res.json();

            if (data) {
                document.getElementById("shipping-method").value = data.method || "";
                document.getElementById("shipping-cost").value = data.cost || 0;
                document.getElementById("shipping-estimated").value = data.estimatedDelivery || "";
            }
        } catch (err) {
            console.error("Error loading shipping settings:", err);
        }
    }

    async saveShippingSettings(e) {
        e.preventDefault();
        try {
            const method = document.getElementById("shipping-method").value;
            const cost = parseFloat(document.getElementById("shipping-cost").value);
            const estimatedDelivery = document.getElementById("shipping-estimated").value;

            const res = await fetch(`${API_BASE_URL}/api/shipping`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ method, cost, estimatedDelivery })
            });

            await res.json();
            alert("✅ Shipping settings updated!");
        } catch (err) {
            console.error("Error saving shipping settings:", err);
            alert("❌ Failed to update shipping settings");
        }
    }

    // =======================
    // AUTH + NOTIFICATIONS
    // =======================
    logout() {
        alert("Logged out!");
        window.location.href = "login.html";
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span class="icon">${this.getNotificationIcon(type)}</span>
            <span>${message}</span>
        `;

        container.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: "✅",
            error: "❌",
            info: "ℹ️",
            warning: "⚠️"
        };
        return icons[type] || "ℹ️";
    }
}

// =======================
// INIT
// =======================
window.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});

// =======================
// ORDERS (global funcs)
// =======================
async function fetchOrders() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/orders`);
        const orders = await res.json();
        window.adminPanel.orders = orders;

        const container = document.getElementById('order-list');
        if (container) {
            container.innerHTML = orders.map(order => `
                <div class="order-item">
                    <h4>Order #${order._id}</h4>
                    <p>Total: ₦${order.total}</p>
                    <button onclick="cancelOrder('${order._id}')">Cancel</button>
                    <button onclick="viewOrderDetails('${order._id}')">View</button>
                </div>
            `).join('');
        }

        window.adminPanel.updateStats();
    } catch (err) {
        console.error("Error fetching orders:", err);
    }
}

async function cancelOrder(orderId) {
    if (!confirm("Cancel this order?")) return;
    try {
        await fetch(`${API_BASE_URL}/api/orders/${orderId}`, { method: "DELETE" });
        fetchOrders();
    } catch (err) {
        console.error("Error cancelling order:", err);
    }
}

function viewOrderDetails(orderId) {
    alert(`View details for order ${orderId}`);
}

// Expose globally
window.fetchOrders = fetchOrders;
window.cancelOrder = cancelOrder;
window.viewOrderDetails = viewOrderDetails;

// Auto-run
document.addEventListener("DOMContentLoaded", fetchOrders);
