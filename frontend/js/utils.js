// =========================================
// UTILITY FUNCTIONS
// =========================================

// API Configuration
const API_BASE_URL = 'http://localhost:5000';

// Toast Notifications
function showToast(message, type = 'info', title = '') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type} fade-in`;
    
    const toastContent = `
        <div class="toast-content">
            ${title ? `<div class="toast-title">${title}</div>` : ''}
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    toast.innerHTML = toastContent;
    container.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

// Format Currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
}

// Format Number with Commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Debounce Function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Validate Email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate Password (minimum 6 characters)
function isValidPassword(password) {
    return password && password.length >= 6;
}

// Show Error on Form Field
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.add('error');
        
        // Remove existing error message
        const existingError = field.parentElement.querySelector('.form-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.innerHTML = `⚠️ ${message}`;
        field.parentElement.appendChild(errorDiv);
        
        // Remove error on input
        field.addEventListener('input', function() {
            this.classList.remove('error');
            const error = this.parentElement.querySelector('.form-error');
            if (error) error.remove();
        }, { once: true });
    }
}

// Clear All Form Errors
function clearFormErrors(formId) {
    const form = document.getElementById(formId);
    if (form) {
        const errorFields = form.querySelectorAll('.error');
        errorFields.forEach(field => field.classList.remove('error'));
        
        const errorMessages = form.querySelectorAll('.form-error');
        errorMessages.forEach(msg => msg.remove());
    }
}

// Generate Random Property Image
function getPropertyImage(seed = Math.random()) {
    const images = [
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400',
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400',
        'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
    ];
    
    const index = Math.floor(seed * images.length);
    return images[index];
}

// Local Storage Helpers
const storage = {
    get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return null;
        }
    },
    
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Error writing to localStorage:', e);
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Error removing from localStorage:', e);
        }
    },
    
    clear() {
        try {
            localStorage.clear();
        } catch (e) {
            console.error('Error clearing localStorage:', e);
        }
    }
};

// API Helper Function
async function apiRequest(endpoint, options = {}) {
    const token = storage.get('auth_token');
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };
    
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        // Handle 401 Unauthorized
        if (response.status === 401) {
            storage.remove('auth_token');
            storage.remove('user_data');
            showToast('Session expired. Please login again.', 'error');
            setTimeout(() => showScreen('login-screen'), 2000);
            throw new Error('Unauthorized');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// Loading Spinner
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div style="display: flex; justify-content: center; padding: 3rem;"><div class="loading-spinner"></div></div>';
    }
}

// Animate on Scroll
function initScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });
    
    elements.forEach(el => observer.observe(el));
}

// Capitalize First Letter
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Truncate Text
function truncate(str, maxLength) {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + '...';
}

// Get Property Type Icon
function getPropertyTypeIcon(type) {
    const icons = {
        'apartment': '🏢',
        'villa': '🏰',
        'house': '🏠',
        'commercial': '🏪',
    };
    return icons[type] || '🏡';
}

// Confirm Dialog
function confirmAction(message, onConfirm) {
    if (confirm(message)) {
        onConfirm();
    }
}

// Initialize utilities when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    
    // Check theme preference
    const savedTheme = storage.get('theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) {
            themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        }
    }
});
