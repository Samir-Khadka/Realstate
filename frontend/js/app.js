// =========================================
// MAIN APPLICATION LOGIC
// =========================================

// Application State
let currentUser = null;
let currentScreen = 'landing-screen';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Load saved theme
    const savedTheme = storage.get('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);

    // Update theme icon if available
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }

    checkAuthStatus();
});

// Check Authentication Status
function checkAuthStatus() {
    const token = storage.get('auth_token');
    const userData = storage.get('user_data');

    if (token && userData) {
        currentUser = userData;
        showScreen('dashboard-screen');
        loadDashboard();
    } else {
        showScreen('landing-screen');
    }
}

// Screen Navigation
function showScreen(screenId) {
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.add('hidden'));

    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        currentScreen = screenId;

        // Scroll to top
        window.scrollTo(0, 0);
    }
}

// Dashboard Tab Navigation
function showDashboardTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.dashboard-tab');
    tabs.forEach(tab => tab.classList.add('hidden'));

    // Show target tab
    const targetTab = document.getElementById(`tab-${tabName}`);
    if (targetTab) {
        targetTab.classList.remove('hidden');
    }

    // Update nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    event.target.classList.add('active');

    // Load tab content
    switch (tabName) {
        case 'home':
            loadDashboardHome();
            break;
        case 'properties':
            loadAllProperties();
            break;
        case 'my-listings':
            loadMyListings();
            break;
        case 'admin':
            loadAdminPanel();
            break;
        case 'messages':
            loadMessages();
            break;
    }
}

// =========================================
// AUTHENTICATION
// =========================================

// Handle Login
async function handleLogin(event) {
    event.preventDefault();
    clearFormErrors('login-form');

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    try {
        const button = event.target.querySelector('button[type="submit"]');
        button.disabled = true;
        button.textContent = 'Logging in...';

        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });

        // Store token
        storage.set('auth_token', data.access_token);

        // Fetch user profile
        const profile = await apiRequest('/auth/profile', {
            headers: {
                'Authorization': `Bearer ${data.access_token}`
            }
        });

        storage.set('user_data', profile);
        currentUser = profile;

        showToast('Login successful!', 'success', 'Welcome back!');

        // Navigate to dashboard
        setTimeout(() => {
            showScreen('dashboard-screen');
            loadDashboard();
        }, 1000);

    } catch (error) {
        console.error('Login error:', error);
        showToast(error.message || 'Login failed. Please check your credentials.', 'error', 'Login Error');

        const button = event.target.querySelector('button[type="submit"]');
        button.disabled = false;
        button.textContent = 'Login';
    }
}

// Handle Register
async function handleRegister(event) {
    event.preventDefault();
    clearFormErrors('register-form');

    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value;

    // Validation
    if (!username || !email || !password || !role) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showFieldError('register-email', 'Please enter a valid email address');
        return;
    }

    if (!isValidPassword(password)) {
        showFieldError('register-password', 'Password must be at least 6 characters');
        return;
    }

    try {
        const button = event.target.querySelector('button[type="submit"]');
        button.disabled = true;
        button.textContent = 'Creating account...';

        await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password, role }),
        });

        showToast('Account created successfully! Please login.', 'success', 'Registration Complete');

        // Clear form
        document.getElementById('register-form').reset();

        // Navigate to login after 2 seconds
        setTimeout(() => {
            showScreen('login-screen');
        }, 2000);

    } catch (error) {
        console.error('Registration error:', error);
        showToast(error.message || 'Registration failed. Please try again.', 'error', 'Registration Error');

        const button = event.target.querySelector('button[type="submit"]');
        button.disabled = false;
        button.textContent = 'Create Account';
    }
}

// Handle Logout
function handleLogout() {
    // Clear storage
    storage.remove('auth_token');
    storage.remove('user_data');
    currentUser = null;

    showToast('You have been logged out', 'info');

    // Redirect to landing page
    setTimeout(() => {
        showScreen('landing-screen');
    }, 1000);
}

// =========================================
// DASHBOARD
// =========================================

// Load Dashboard
function loadDashboard() {
    if (!currentUser) {
        showScreen('login-screen');
        return;
    }

    // Update username display
    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay) {
        usernameDisplay.textContent = currentUser.username;
    }

    // Show/hide role-based menu items
    const myListingsNav = document.getElementById('my-listings-nav');
    const adminNav = document.getElementById('admin-nav');
    const statsMyListingsCard = document.getElementById('stats-my-listings-card');

    if (currentUser.role === 'seller' || currentUser.role === 'agent') {
        if (myListingsNav) myListingsNav.classList.remove('hidden');
        if (statsMyListingsCard) statsMyListingsCard.classList.remove('hidden');
    } else {
        if (myListingsNav) myListingsNav.classList.add('hidden');
        if (statsMyListingsCard) statsMyListingsCard.classList.add('hidden');
    }

    if (currentUser.role === 'admin') {
        if (adminNav) adminNav.classList.remove('hidden');
    } else {
        if (adminNav) adminNav.classList.add('hidden');
    }

    // Show messages for everyone (or specific roles)
    const messagesNav = document.getElementById('messages-nav');
    if (messagesNav) messagesNav.classList.remove('hidden');

    // Update avatar with profile picture
    updateNavigationAvatar();

    // Load home tab by default
    loadDashboardHome();
}

// Load Dashboard Home
async function loadDashboardHome() {
    try {
        // Load recent properties
        const properties = await apiRequest('/properties');

        // Update stats
        document.getElementById('stats-properties').textContent = properties.length;

        // Calculate total views
        const totalViews = properties.reduce((sum, prop) => sum + (prop.views || 0), 0);
        document.getElementById('stats-views').textContent = formatNumber(totalViews);

        // If seller/agent, get my listings count
        if (currentUser.role === 'seller' || currentUser.role === 'agent') {
            const myListings = properties.filter(p => p.seller_id === currentUser.username);
            document.getElementById('stats-my-listings').textContent = myListings.length;
        }

        // Display recent properties (limit to 6)
        const recentProperties = properties.slice(0, 6);
        displayProperties(recentProperties, 'recent-properties');

    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Failed to load dashboard data', 'error');
    }
}

// Load Messages
async function loadMessages() {
    try {
        showLoading('messages-list');
        const messages = await apiRequest('/messages');

        const container = document.getElementById('messages-list');
        if (messages.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; background: var(--bg-secondary); border-radius: var(--radius-md);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
                    <h3>No messages yet</h3>
                    <p style="color: var(--text-secondary);">Messages from interested buyers will appear here.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = messages.map(msg => `
            <div class="card">
                <div class="card-body">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <h4 style="margin: 0;">Property: ${msg.property_title || 'Unknown Property'}</h4>
                        <span style="color: var(--text-muted); font-size: 0.875rem;">${formatDate(msg.created_at)}</span>
                    </div>
                    <div style="margin-bottom: 1rem; color: var(--text-secondary); font-size: 0.875rem;">
                        From: <strong>${msg.from_user}</strong>
                    </div>
                    <p style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-sm); margin: 0;">
                        ${msg.message}
                    </p>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading messages:', error);
        showToast('Failed to load messages', 'error');
    }
}

// =========================================
// UI HELPERS
// =========================================

// Toggle Dark Mode
function toggleDarkMode() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    body.setAttribute('data-theme', newTheme);
    storage.set('theme', newTheme);

    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }
}

// Toggle User Dropdown
function toggleUserDropdown() {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', (event) => {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('user-dropdown');

    if (dropdown && !userMenu.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Toggle Mobile Menu
function toggleMobileMenu() {
    const nav = document.getElementById('main-nav');
    if (nav) {
        nav.classList.toggle('show');
    }
}

// Show Profile (placeholder)
function showProfile() {
    showToast(`Profile for ${currentUser.username}`, 'info', 'Profile');
    toggleUserDropdown();
}

// Search from Hero
function searchFromHero() {
    const location = document.getElementById('hero-search-location').value;
    const type = document.getElementById('hero-search-type').value;
    const priceRange = document.getElementById('hero-search-price').value;

    // Store search parameters
    storage.set('search_params', { location, type, priceRange });

    // Navigate to login or properties
    if (currentUser) {
        showScreen('dashboard-screen');
        setTimeout(() => showDashboardTab('properties'), 100);
    } else {
        showToast('Please login to search properties', 'info');
        showScreen('login-screen');
    }
}

// =========================================
// PROPERTY DISPLAY HELPERS
// =========================================

// Create Property Card HTML
function createPropertyCard(property, showActions = false) {
    const image = property.image_url || getPropertyImage(parseFloat(property._id?.slice(-8)) || Math.random());
    const isOwner = currentUser && property.seller_id === currentUser.username;

    const actionsHTML = showActions ? `
        <div style="padding: 1rem; border-top: 1px solid var(--border-color); display: flex; gap: 0.5rem;">
            ${isOwner ? `
                <button class="btn btn-sm btn-secondary" onclick="editProperty('${property._id}')" style="flex: 1;">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteProperty('${property._id}')" style="flex: 1;">Delete</button>
            ` : ''}
        </div>
    ` : '';

    return `
        <div class="property-card" onclick="showPropertyDetail('${property._id}')">
            <img src="${image}" alt="${property.property_title}" class="property-image">
            <div class="property-details">
                <div class="property-price">${formatCurrency(property.price)}</div>
                <h3 class="property-title">${truncate(property.property_title, 50)}</h3>
                <div class="property-location">
                    📍 ${property.location}
                </div>
                <div class="property-features">
                    <div class="feature-item">🛏️ ${property.bedrooms} Beds</div>
                    <div class="feature-item">🛁 ${property.bathrooms} Baths</div>
                    <div class="feature-item">📐 ${formatNumber(property.area_sqft)} sqft</div>
                </div>
            </div>
            ${actionsHTML}
        </div>
    `;
}

// Display Properties
function displayProperties(properties, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (properties.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🏠</div>
                <h3>No properties found</h3>
                <p style="color: var(--text-secondary);">Try adjusting your filters or check back later.</p>
            </div>
        `;
        return;
    }

    const showActions = containerId === 'my-listings-grid' || containerId === 'admin-properties-grid';
    container.innerHTML = properties.map(property => createPropertyCard(property, showActions)).join('');
}

// =========================================
// PROFILE PICTURE
// =========================================

let selectedProfilePicture = null;

// Show Profile Modal
function showProfile() {
    if (!currentUser) return;

    const modal = document.getElementById('profile-modal');
    modal.classList.add('show');

    // Populate user info
    document.getElementById('profile-username').textContent = currentUser.username;
    document.getElementById('profile-email').textContent = currentUser.email;
    document.getElementById('profile-role').textContent = currentUser.role;

    // Set current profile picture
    const preview = document.getElementById('profile-picture-preview');
    if (currentUser.profile_picture) {
        preview.src = currentUser.profile_picture;
    } else {
        preview.src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='40' fill='%23667eea'/><text x='50' y='60' text-anchor='middle' fill='white' font-size='40' font-family='Arial'>${currentUser.username.charAt(0).toUpperCase()}</text></svg>`;
    }

    toggleUserDropdown(); // Close dropdown
}

// Close Profile Modal
function closeProfileModal() {
    const modal = document.getElementById('profile-modal');
    modal.classList.remove('show');
    selectedProfilePicture = null;
}

// Preview Profile Picture
function previewProfilePicture(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5MB', 'error');
        return;
    }

    // Read file and convert to base64
    const reader = new FileReader();
    reader.onload = function (e) {
        selectedProfilePicture = e.target.result;
        document.getElementById('profile-picture-preview').src = selectedProfilePicture;
    };
    reader.readAsDataURL(file);
}

// Save Profile Picture
async function saveProfilePicture() {
    if (!selectedProfilePicture) {
        showToast('No image selected', 'info');
        closeProfileModal();
        return;
    }

    try {
        const button = event.target;
        button.disabled = true;
        button.textContent = 'Saving...';

        await apiRequest('/auth/upload-profile-picture', {
            method: 'POST',
            body: JSON.stringify({ profile_picture: selectedProfilePicture }),
        });

        // Update current user data
        currentUser.profile_picture = selectedProfilePicture;
        storage.set('user_data', currentUser);

        // Update avatar in navigation
        updateNavigationAvatar();

        showToast('Profile picture updated successfully!', 'success');
        closeProfileModal();

    } catch (error) {
        console.error('Upload error:', error);
        showToast(error.message || 'Failed to upload profile picture', 'error');

        const button = event.target;
        button.disabled = false;
        button.textContent = 'Save Changes';
    }
}

// Update Navigation Avatar
function updateNavigationAvatar() {
    const avatar = document.querySelector('.user-avatar img');
    if (avatar && currentUser) {
        if (currentUser.profile_picture) {
            avatar.src = currentUser.profile_picture;
        } else {
            avatar.src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='40' fill='%23667eea'/><text x='50' y='60' text-anchor='middle' fill='white' font-size='40' font-family='Arial'>${currentUser.username.charAt(0).toUpperCase()}</text></svg>`;
        }
    }
}

// Close modal when clicking outside
document.addEventListener('click', (event) => {
    const profileModal = document.getElementById('profile-modal');
    if (profileModal && event.target === profileModal) {
        closeProfileModal();
    }
});
