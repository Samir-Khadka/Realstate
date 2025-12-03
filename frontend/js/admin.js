// =========================================
// ADMIN PANEL
// =========================================

// Load Admin Panel
function loadAdminPanel() {
    if (!currentUser || currentUser.role !== 'admin') {
        showToast('Access denied. Admin only.', 'error');
        return;
    }

    // Load users by default
    showAdminTab('users');
}

// Show Admin Sub-tab
function showAdminTab(tabName) {
    // Update tab buttons
    const usersTab = document.getElementById('admin-users-tab');
    const propertiesTab = document.getElementById('admin-properties-tab');

    if (tabName === 'users') {
        usersTab.style.borderBottom = '3px solid var(--primary-start)';
        usersTab.style.color = 'var(--primary-start)';
        propertiesTab.style.borderBottom = 'none';
        propertiesTab.style.color = 'var(--text-secondary)';

        document.getElementById('admin-users-content').classList.remove('hidden');
        document.getElementById('admin-properties-content').classList.add('hidden');

        loadAdminUsers();
    } else {
        propertiesTab.style.borderBottom = '3px solid var(--primary-start)';
        propertiesTab.style.color = 'var(--primary-start)';
        usersTab.style.borderBottom = 'none';
        usersTab.style.color = 'var(--text-secondary)';

        document.getElementById('admin-properties-content').classList.remove('hidden');
        document.getElementById('admin-users-content').classList.add('hidden');

        loadAdminProperties();
    }
}

// =========================================
// ADMIN - USERS MANAGEMENT
// =========================================

// Load All Users
async function loadAdminUsers() {
    try {
        const tableBody = document.getElementById('admin-users-table');
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;"><div class="loading-spinner" style="margin: 0 auto;"></div></td></tr>';

        const users = await apiRequest('/admin/users');

        if (users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">No users found</td></tr>';
            return;
        }

        tableBody.innerHTML = users.map(user => `
            <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 1rem;">
                    <strong>${user.username}</strong>
                </td>
                <td style="padding: 1rem; color: var(--text-secondary);">
                    ${user.email}
                </td>
                <td style="padding: 1rem;">
                    <span style="
                        display: inline-block;
                        padding: 0.25rem 0.75rem;
                        background: ${getRoleBadgeColor(user.role)};
                        color: white;
                        border-radius: var(--radius-full);
                        font-size: 0.875rem;
                        font-weight: 600;
                    ">
                        ${capitalize(user.role)}
                    </span>
                </td>
                <td style="padding: 1rem; color: var(--text-muted); font-size: 0.875rem;">
                    ${formatDate(user.created_at)}
                </td>
                <td style="padding: 1rem;">
                    <button class="btn btn-sm btn-secondary" onclick='editUser(${JSON.stringify(user)})' style="margin-right: 0.5rem;">
                        ✏️ Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.username}')">
                        🗑️ Delete
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error loading users:', error);
        showToast('Failed to load users: ' + error.message, 'error');

        const tableBody = document.getElementById('admin-users-table');
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--error);">Failed to load users: ${error.message}</td></tr>`;
    }
}

// Edit User
function editUser(user) {
    const modal = document.getElementById('edit-user-modal');
    modal.classList.add('show');

    // Populate form
    document.getElementById('edit-user-username').value = user.username;
    document.getElementById('edit-user-username-display').value = user.username;
    document.getElementById('edit-user-email').value = user.email;
    document.getElementById('edit-user-role').value = user.role;
}

// Close Edit User Modal
function closeEditUserModal() {
    const modal = document.getElementById('edit-user-modal');
    modal.classList.remove('show');
}

// Save User Edits
async function saveUserEdits(event) {
    event.preventDefault();

    const username = document.getElementById('edit-user-username').value;
    const email = document.getElementById('edit-user-email').value;
    const role = document.getElementById('edit-user-role').value;

    try {
        const button = event.target.querySelector('button[type="submit"]');
        button.disabled = true;
        button.textContent = 'Saving...';

        await apiRequest(`/admin/users/${username}`, {
            method: 'PUT',
            body: JSON.stringify({ email, role }),
        });

        showToast('User updated successfully!', 'success');
        closeEditUserModal();
        loadAdminUsers();

    } catch (error) {
        console.error('Error updating user:', error);
        showToast(error.message || 'Failed to update user', 'error');

        const button = event.target.querySelector('button[type="submit"]');
        button.disabled = false;
        button.textContent = 'Save Changes';
    }
}

// Delete User
function deleteUser(username) {
    confirmAction(
        `Are you sure you want to delete user "${username}"? This will also delete all their properties. This action cannot be undone.`,
        async () => {
            try {
                await apiRequest(`/admin/users/${username}`, {
                    method: 'DELETE',
                });

                showToast('User deleted successfully', 'success');
                loadAdminUsers();

            } catch (error) {
                console.error('Error deleting user:', error);
                showToast(error.message || 'Failed to delete user', 'error');
            }
        }
    );
}

// Get Role Badge Color
function getRoleBadgeColor(role) {
    const colors = {
        'admin': 'var(--error)',
        'seller': 'var(--primary-start)',
        'agent': 'var(--accent-purple)',
        'buyer': 'var(--accent-teal)',
    };
    return colors[role] || 'var(--text-secondary)';
}

// =========================================
// ADMIN - PROPERTIES MANAGEMENT
// =========================================

// Load All Properties (Admin)
async function loadAdminProperties() {
    try {
        showLoading('admin-properties-grid');

        const properties = await apiRequest('/admin/properties');

        // Display properties with admin actions
        displayAdminProperties(properties);

    } catch (error) {
        console.error('Error loading admin properties:', error);
        showToast('Failed to load properties', 'error');

        document.getElementById('admin-properties-grid').innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--error);">
                Failed to load properties: ${error.message}
            </div>
        `;
    }
}

// Display Admin Properties
function displayAdminProperties(properties) {
    const container = document.getElementById('admin-properties-grid');
    if (!container) return;

    if (properties.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🏠</div>
                <h3>No properties found</h3>
            </div>
        `;
        return;
    }

    container.innerHTML = properties.map(property => {
        const image = getPropertyImage(parseFloat(property._id?.slice(-8)) || Math.random());

        return `
            <div class="property-card">
                <img src="${image}" alt="${property.property_title}" class="property-image" onclick="showPropertyDetail('${property._id}')">
                <div class="property-details" onclick="showPropertyDetail('${property._id}')">
                    <div class="property-price">${formatCurrency(property.price)}</div>
                    <h3 class="property-title">${truncate(property.property_title, 50)}</h3>
                    <div class="property-location">
                        📍 ${property.location}
                    </div>
                    <div style="font-size: 0.875rem; color: var(--text-muted); margin-top: 0.5rem;">
                        Seller: <strong>${property.seller_id}</strong>
                    </div>
                    <div class="property-features">
                        <div class="feature-item">🛏️ ${property.bedrooms}</div>
                        <div class="feature-item">🛁 ${property.bathrooms}</div>
                        <div class="feature-item">📐 ${formatNumber(property.area_sqft)} sqft</div>
                    </div>
                </div>
                <div style="padding: 1rem; border-top: 1px solid var(--border-color);">
                    <button class="btn btn-sm btn-danger" onclick="adminDeleteProperty('${property._id}')" style="width: 100%;">
                        Delete Property
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Admin Delete Property
function adminDeleteProperty(propertyId) {
    event.stopPropagation(); // Prevent card click

    confirmAction('Are you sure you want to delete this property? This action cannot be undone.', async () => {
        try {
            await apiRequest(`/admin/properties/${propertyId}`, {
                method: 'DELETE',
            });

            showToast('Property deleted successfully', 'success');

            // Reload admin properties
            loadAdminProperties();

        } catch (error) {
            console.error('Error deleting property:', error);
            showToast(error.message || 'Failed to delete property', 'error');
        }
    });
}

// =========================================
// ADMIN - STATISTICS (Future Enhancement)
// =========================================

// This can be expanded in the future to show:
// - Total users by role
// - Total properties by type
// - Revenue statistics
// - Most active sellers
// - etc.
