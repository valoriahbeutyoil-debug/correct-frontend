// Login and Registration JavaScript
const API_BASE_URL = 'https://correct-backend-gu05.onrender.com'; // Live backend URL

class AuthManager {
    constructor() {
        this.currentForm = 'login';
        this.users = this.loadUsers();
        this.currentUser = this.getCurrentUser();
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkPasswordStrength();
        this.updateUI();
    }

    bindEvents() {
        // Form switching
        document.querySelectorAll('.switch-form').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const formType = e.currentTarget.dataset.form;
                this.switchForm(formType);
            });
        });

        // Form submissions
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegistration();
        });

        // Password strength checking
        document.getElementById('register-password').addEventListener('input', () => {
            this.checkPasswordStrength();
        });

        // Password confirmation validation
        document.getElementById('register-confirm-password').addEventListener('input', () => {
            this.validatePasswordConfirmation();
        });

        // Real-time validation
        this.setupRealTimeValidation();
    }

    switchForm(formType) {
        // Hide all form sections
        document.querySelectorAll('.form-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected form
        document.getElementById(`${formType}-section`).classList.add('active');

        // Update current form
        this.currentForm = formType;

        // Clear any existing messages
        this.clearMessages();

        // Reset forms
        if (formType === 'login') {
            document.getElementById('login-form').reset();
        } else {
            document.getElementById('register-form').reset();
        }
    }

    setupRealTimeValidation() {
        // Email validation
        const emailInputs = ['login-email', 'register-email'];
        emailInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('blur', () => this.validateEmail(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            }
        });

        // Username validation
        const usernameInput = document.getElementById('register-username');
        if (usernameInput) {
            usernameInput.addEventListener('blur', () => this.validateUsername(usernameInput));
            usernameInput.addEventListener('input', () => this.clearFieldError(usernameInput));
        }

        // Phone validation
        const phoneInput = document.getElementById('register-phone');
        if (phoneInput) {
            phoneInput.addEventListener('blur', () => this.validatePhone(phoneInput));
            phoneInput.addEventListener('input', () => this.clearFieldError(phoneInput));
        }
    }

    validateEmail(input) {
        const email = input.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            this.showFieldError(input, 'Email is required');
            return false;
        }
        
        if (!emailRegex.test(email)) {
            this.showFieldError(input, 'Please enter a valid email address');
            return false;
        }
        
        this.showFieldSuccess(input);
        return true;
    }

    validateUsername(input) {
        const username = input.value.trim();
        
        if (!username) {
            this.showFieldError(input, 'Username is required');
            return false;
        }
        
        if (username.length < 3) {
            this.showFieldError(input, 'Username must be at least 3 characters');
            return false;
        }
        
        if (username.length > 20) {
            this.showFieldError(input, 'Username must be less than 20 characters');
            return false;
        }
        
        // Check if username already exists
        if (this.users.some(user => user.username === username)) {
            this.showFieldError(input, 'Username already exists');
            return false;
        }
        
        this.showFieldSuccess(input);
        return true;
    }

    validatePhone(input) {
        const phone = input.value.trim();
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        
        if (!phone) {
            this.showFieldError(input, 'Phone number is required');
            return false;
        }
        
        if (!phoneRegex.test(phone)) {
            this.showFieldError(input, 'Please enter a valid phone number');
            return false;
        }
        
        this.showFieldSuccess(input);
        return true;
    }

    showFieldError(input, message) {
        input.classList.add('error');
        input.classList.remove('success');
        
        // Remove existing error message
        const existingError = input.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i>${message}`;
        input.parentNode.appendChild(errorDiv);
    }

    showFieldSuccess(input) {
        input.classList.remove('error');
        input.classList.add('success');
        
        // Remove error message if exists
        const existingError = input.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }

    clearFieldError(input) {
        input.classList.remove('error', 'success');
        const errorMessage = input.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    checkPasswordStrength() {
        const password = document.getElementById('register-password').value;
        const strengthFill = document.getElementById('strength-fill');
        const strengthText = document.getElementById('strength-text');
        
        if (!password) {
            strengthFill.className = 'strength-fill';
            strengthText.textContent = 'Password strength';
            return;
        }
        
        let score = 0;
        let feedback = [];
        
        // Length check
        if (password.length >= 8) score += 1;
        else feedback.push('At least 8 characters');
        
        // Lowercase check
        if (/[a-z]/.test(password)) score += 1;
        else feedback.push('Include lowercase letters');
        
        // Uppercase check
        if (/[A-Z]/.test(password)) score += 1;
        else feedback.push('Include uppercase letters');
        
        // Number check
        if (/\d/.test(password)) score += 1;
        else feedback.push('Include numbers');
        
        // Special character check
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
        else feedback.push('Include special characters');
        
        // Update strength bar
        strengthFill.className = 'strength-fill';
        if (score <= 1) {
            strengthFill.classList.add('weak');
            strengthText.textContent = 'Weak';
        } else if (score <= 2) {
            strengthFill.classList.add('fair');
            strengthText.textContent = 'Fair';
        } else if (score <= 3) {
            strengthFill.classList.add('good');
            strengthText.textContent = 'Good';
        } else {
            strengthFill.classList.add('strong');
            strengthText.textContent = 'Strong';
        }
    }

    validatePasswordConfirmation() {
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const confirmInput = document.getElementById('register-confirm-password');
        
        if (!confirmPassword) {
            this.clearFieldError(confirmInput);
            return false;
        }
        
        if (password !== confirmPassword) {
            this.showFieldError(confirmInput, 'Passwords do not match');
            return false;
        }
        
        this.showFieldSuccess(confirmInput);
        return true;
    }

    async handleLogin() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const remember = document.querySelector('input[name="remember"]').checked;
        if (!email || !password) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) {
                this.showMessage(data.error || 'Login failed', 'error');
                return;
            }
            // Save session
            const user = data.user;
            this.loginUser(user, remember);
            this.showMessage('Login successful! Redirecting...', 'success');
            // Always redirect to index.html unless admin
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1500);
        } catch (err) {
            this.showMessage('Server error. Please try again.', 'error');
        }
    }

    async handleRegistration() {
        const formData = new FormData(document.getElementById('register-form'));
        const userData = {
            firstname: formData.get('firstname').trim(),
            lastname: formData.get('lastname').trim(),
            username: formData.get('username').trim(),
            email: formData.get('email').trim(),
            phone: formData.get('phone').trim(),
            password: formData.get('password'),
            confirmPassword: formData.get('confirm-password'),
            terms: formData.get('terms'),
            newsletter: formData.get('newsletter')
        };
        if (!this.validateRegistrationData(userData)) {
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            const data = await res.json();
            if (!res.ok) {
                this.showMessage(data.error || 'Registration failed', 'error');
                return;
            }
            this.showMessage('Registration successful! You can now login.', 'success');
            setTimeout(() => {
                this.switchForm('login');
            }, 2000);
        } catch (err) {
            this.showMessage('Server error. Please try again.', 'error');
        }
    }

    validateRegistrationData(userData) {
        // Check required fields
        const requiredFields = ['firstname', 'lastname', 'username', 'email', 'phone', 'password', 'confirmPassword'];
        for (const field of requiredFields) {
            if (!userData[field]) {
                this.showMessage(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`, 'error');
                return false;
            }
        }
        
        // Check terms agreement
        if (!userData.terms) {
            this.showMessage('You must agree to the Terms of Service and Privacy Policy', 'error');
            return false;
        }
        
        // Check password confirmation
        if (userData.password !== userData.confirmPassword) {
            this.showMessage('Passwords do not match', 'error');
            return false;
        }
        
        // Check password strength
        if (userData.password.length < 8) {
            this.showMessage('Password must be at least 8 characters long', 'error');
            return false;
        }
        
        // Check if email already exists
        if (this.users.some(user => user.email === userData.email)) {
            this.showMessage('Email already registered. Please use a different email or login.', 'error');
            return false;
        }
        
        // Check if username already exists
        if (this.users.some(user => user.username === userData.username)) {
            this.showMessage('Username already exists. Please choose a different username.', 'error');
            return false;
        }
        
        return true;
    }

    loginUser(user, remember) {
        // Store user session with userId and isActive for auth-guard compatibility
        const sessionData = {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            userId: user.id,
            isActive: user.status === 'active',
            loginTime: new Date().toISOString(),
            remember: remember
        };
        // Always set session in BOTH storages for persistence
        sessionStorage.setItem('docushop_session', JSON.stringify(sessionData));
        localStorage.setItem('docushop_session', JSON.stringify(sessionData));
        this.currentUser = user;
        this.updateUI();
    }

    logout() {
        // Clear session
        localStorage.removeItem('docushop_session');
        sessionStorage.removeItem('docushop_session');
        
        this.currentUser = null;
        this.updateUI();
        
        // Redirect to login
        window.location.href = 'login.html';
    }

    getCurrentUser() {
    const session = localStorage.getItem('docushop_session') || sessionStorage.getItem('docushop_session');
    if (session) {
        try {
            const sessionData = JSON.parse(session);
            return sessionData.user; // ✅ return the actual user stored in session
        } catch (e) {
            return null;
        }
    }
    return null;
}

    updateUI() {
        // Update header if user is logged in
        const header = document.querySelector('.site-header');
        if (header && this.currentUser) {
            // Update cart section to show user info
            const cartSection = header.querySelector('.cart-section');
            if (cartSection) {
                cartSection.innerHTML = `
                    <span class="cart-text">Welcome, ${this.currentUser.username}</span>
                    <i class="fas fa-user"></i>
                    <button class="logout-btn" onclick="authManager.logout()">Logout</button>
                `;
            }
        }
    }

    loadUsers() {
        const users = localStorage.getItem('docushop_users');
        if (users) {
            try {
                return JSON.parse(users);
            } catch (e) {
                return this.getDefaultUsers();
            }
        }
        return this.getDefaultUsers();
    }

    saveUsers() {
        localStorage.setItem('docushop_users', JSON.stringify(this.users));
    }

    getDefaultUsers() {
        return [
            {
                id: 1,
                firstname: 'Admin',
                lastname: 'User',
                username: 'admin',
                email: 'admin@docushop.com',
                phone: '+1234567890',
                password: 'admin123',
                role: 'admin',
                status: 'active',
                createdAt: new Date().toISOString(),
                newsletter: false
            }
        ];
    }

    showMessage(message, type = 'info') {
        const container = document.getElementById('message-container');
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            <i class="message-icon fas fa-${this.getMessageIcon(type)}"></i>
            <span class="message-text">${message}</span>
            <button class="message-close" onclick="this.parentElement.remove()">&times;</button>
        `;
        
        container.appendChild(messageDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    getMessageIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    clearMessages() {
        const container = document.getElementById('message-container');
        container.innerHTML = '';
    }
}

// Global functions
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.parentNode.querySelector('.password-toggle i');
    
    if (input.type === 'password') {
        input.type = 'text';
        toggle.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        toggle.className = 'fas fa-eye';
    }
}

// Initialize auth manager when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});

// Add logout button styles
const logoutStyles = `
    .logout-btn {
        background: #ef4444;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.8rem;
        transition: background 0.3s ease;
    }
    
    .logout-btn:hover {
        background: #dc2626;
    }
`;

// Inject logout styles
const styleSheet = document.createElement('style');
styleSheet.textContent = logoutStyles;
document.head.appendChild(styleSheet);


