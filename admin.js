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
            this.showNotification('Edit functionality coming soon!', 'info');
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
            alert(`Order #${order.id}\n\nBilling Info:\nName: ${billing.firstName || ''} ${billing.lastName || ''}\nEmail: ${billing.email || ''}\nPhone: ${billing.phone || ''}\nAddress: ${billing.address || ''}\n\nProducts:\n${cart.map(p => `${p.name} x${p.qty} ($${p.price})`).join('\n')}`);
        }
    }

    saveContent() {
        const heroTitle = document.getElementById('hero-title').value;
        const heroDescription = document.getElementById('hero-description').value;
        const heroButton = document.getElementById('hero-button').value;
        const siteTitle = document.getElementById('site-title').value;
        const siteDescription = document.getElementById('site-description').value;

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

        const settings = {
            adminEmail,
            maintenanceMode: maintenanceMode === 'true',
            defaultCurrency
        };

        localStorage.setItem('docushop_settings', JSON.stringify(settings));
        this.showNotification('Settings saved successfully!', 'success');
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            sessionStorage.removeItem('docushop_session');
            window.location.href = 'index.html';
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;

        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);

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
});

// (notificationStyles + payment methods modal logic stays same as before...)


