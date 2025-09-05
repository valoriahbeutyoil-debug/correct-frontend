// Admin Login Logic
class AdminLoginManager {
    constructor() {
        this.users = this.loadUsers();
        this.bindEvents();
    }

    loadUsers() {
        const users = localStorage.getItem('docushop_users');
        if (users) {
            try {
                return JSON.parse(users);
            } catch (e) {
                return [];
            }
        }
        return [];
    }

    bindEvents() {
        document.getElementById('admin-login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
    }

    async handleLogin() {
        const email = document.getElementById('admin-login-email').value.trim();
        const password = document.getElementById('admin-login-password').value;
        const messageContainer = document.getElementById('admin-message-container');
        messageContainer.innerHTML = '';

        if (!email || !password) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        try {
            const res = await fetch('https://backend-crqd.onrender.com/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok || !data.user || data.user.role !== 'admin') {
                this.showMessage('Invalid admin credentials', 'error');
                return;
            }
            // Save admin session
            const sessionData = {
                user: {
                    id: data.user.id,
                    username: data.user.username,
                    email: data.user.email,
                    role: data.user.role
                },
                userId: data.user.id,
                isActive: data.user.status === 'active',
                loginTime: new Date().toISOString(),
                remember: true
            };
            // Always set session in sessionStorage for auth-guard compatibility
            sessionStorage.setItem('docushop_session', JSON.stringify(sessionData));
            localStorage.setItem('docushop_session', JSON.stringify(sessionData));
            this.showMessage('Admin login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1500);
        } catch (err) {
            this.showMessage('Server error. Please try again.', 'error');
        }
    }

    showMessage(message, type = 'info') {
        const container = document.getElementById('admin-message-container');
        const div = document.createElement('div');
        div.className = `message ${type}`;
        div.textContent = message;
        container.appendChild(div);
        setTimeout(() => {
            if (div.parentNode) div.remove();
        }, 4000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.adminLoginManager = new AdminLoginManager();
});

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}
