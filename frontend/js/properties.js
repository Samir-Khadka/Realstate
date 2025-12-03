// =========================================
// PROPERTY MANAGEMENT
// =========================================

let allProperties = [];
let filteredProperties = [];

// =========================================
// LOAD PROPERTIES
// =========================================

// Load All Properties
async function loadAllProperties() {
    try {
        showLoading('properties-grid');

        const properties = await apiRequest('/properties');
        allProperties = properties;
        filteredProperties = properties;

        // Apply any stored search params
        const searchParams = storage.get('search_params');
        if (searchParams) {
            applyStoredSearch(searchParams);
            storage.remove('search_params');
        } else {
            displayProperties(filteredProperties, 'properties-grid');
        }

        updatePropertyCount();

    } catch (error) {
        console.error('Error loading properties:', error);
        document.getElementById('properties-grid').innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <p style="color: var(--error);">Failed to load properties. Please try again.</p>
            </div>
        `;
    }
}

// Load My Listings (Sellers/Agents)
async function loadMyListings() {
    try {
        showLoading('my-listings-grid');

        const properties = await apiRequest('/properties');
        const myListings = properties.filter(p => p.seller_id === currentUser.username);

        displayProperties(myListings, 'my-listings-grid');

    } catch (error) {
        console.error('Error loading my listings:', error);
        showToast('Failed to load your listings', 'error');
    }
}

// =========================================
// FILTERING & SORTING
// =========================================

// Apply Filters
function applyFilters() {
    const location = document.getElementById('filter-location').value.toLowerCase().trim();
    const type = document.getElementById('filter-type').value;
    const minPrice = parseFloat(document.getElementById('filter-min-price').value) || 0;
    const maxPrice = parseFloat(document.getElementById('filter-max-price').value) || Infinity;
    const bedrooms = parseInt(document.getElementById('filter-bedrooms').value) || 0;

    filteredProperties = allProperties.filter(property => {
        const matchLocation = !location || property.location.toLowerCase().includes(location);
        const matchType = !type || property.property_type === type;
        const matchPrice = property.price >= minPrice && property.price <= maxPrice;
        const matchBedrooms = property.bedrooms >= bedrooms;

        return matchLocation && matchType && matchPrice && matchBedrooms;
    });

    displayProperties(filteredProperties, 'properties-grid');
    updatePropertyCount();

    showToast(`Found ${filteredProperties.length} properties`, 'success');
}

// Reset Filters
function resetFilters() {
    document.getElementById('filter-location').value = '';
    document.getElementById('filter-type').value = '';
    document.getElementById('filter-min-price').value = '';
    document.getElementById('filter-max-price').value = '';
    document.getElementById('filter-bedrooms').value = '';

    filteredProperties = allProperties;
    displayProperties(filteredProperties, 'properties-grid');
    updatePropertyCount();
}

// Apply Stored Search from Hero
function applyStoredSearch(params) {
    if (params.location) {
        document.getElementById('filter-location').value = params.location;
    }
    if (params.type) {
        document.getElementById('filter-type').value = params.type;
    }
    if (params.priceRange) {
        const [min, max] = params.priceRange.split('-');
        document.getElementById('filter-min-price').value = min;
        if (max !== '999999999') {
            document.getElementById('filter-max-price').value = max;
        }
    }

    applyFilters();
}

// Sort Properties
function sortProperties() {
    const sortBy = document.getElementById('sort-properties').value;

    switch (sortBy) {
        case 'newest':
            filteredProperties.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'price-low':
            filteredProperties.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProperties.sort((a, b) => b.price - a.price);
            break;
        case 'views':
            filteredProperties.sort((a, b) => (b.views || 0) - (a.views || 0));
            break;
    }

    displayProperties(filteredProperties, 'properties-grid');
}

// Update Property Count
function updatePropertyCount() {
    const countElement = document.getElementById('property-count');
    if (countElement) {
        countElement.textContent = filteredProperties.length;
    }
}

// =========================================
// PROPERTY DETAILS
// =========================================

// Show Property Detail Modal
async function showPropertyDetail(propertyId) {
    try {
        const property = await apiRequest(`/properties/${propertyId}`);

        // Populate modal
        document.getElementById('modal-property-title').textContent = property.property_title;
        document.getElementById('modal-property-price').textContent = formatCurrency(property.price);
        document.getElementById('modal-property-location').textContent = property.location;
        document.getElementById('modal-property-type').textContent = capitalize(property.property_type);
        document.getElementById('modal-property-bedrooms').textContent = property.bedrooms;
        document.getElementById('modal-property-bathrooms').textContent = property.bathrooms;
        document.getElementById('modal-property-area').textContent = formatNumber(property.area_sqft);
        document.getElementById('modal-property-views').textContent = property.views || 0;
        document.getElementById('modal-property-age').textContent = property.listing_age || 0;
        document.getElementById('modal-property-seller').textContent = property.seller_id;

        // Set image
        const image = getPropertyImage(parseFloat(property._id?.slice(-8)) || Math.random());
        document.getElementById('modal-property-image').src = image;

        // Set description (placeholder since not in schema)
        document.getElementById('modal-property-description').textContent =
            `This beautiful ${property.property_type} is located in ${property.location}. ` +
            `Featuring ${property.bedrooms} bedrooms and ${property.bathrooms} bathrooms across ${formatNumber(property.area_sqft)} sqft.`;

        // Store current property ID for contact form
        document.getElementById('contact-form').dataset.propertyId = propertyId;

        // Hide contact form if user is the seller
        const contactSection = document.getElementById('contact-form').parentElement.parentElement;
        if (currentUser && property.seller_id === currentUser.username) {
            contactSection.style.display = 'none';
        } else {
            contactSection.style.display = 'block';
        }

        // Show modal
        document.getElementById('property-modal').classList.add('show');

    } catch (error) {
        console.error('Error loading property details:', error);
        showToast('Failed to load property details', 'error');
    }
}

// Close Property Modal
function closePropertyModal() {
    document.getElementById('property-modal').classList.remove('show');
    document.getElementById('contact-form').reset();
}

// Close modal on background click
document.getElementById('property-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'property-modal') {
        closePropertyModal();
    }
});

// =========================================
// CONTACT SELLER
// =========================================

// Handle Contact Seller
async function handleContactSeller(event) {
    event.preventDefault();

    const propertyId = document.getElementById('contact-form').dataset.propertyId;
    const message = document.getElementById('contact-message').value.trim();

    if (!message) {
        showToast('Please enter a message', 'error');
        return;
    }

    try {
        const button = event.target.querySelector('button[type="submit"]');
        button.disabled = true;
        button.textContent = 'Sending...';

        await apiRequest(`/properties/${propertyId}/contact`, {
            method: 'POST',
            body: JSON.stringify({ message }),
        });

        showToast('Your message has been sent successfully!', 'success', 'Message Sent');

        document.getElementById('contact-form').reset();
        setTimeout(() => closePropertyModal(), 2000);

    } catch (error) {
        console.error('Error sending message:', error);
        showToast(error.message || 'Failed to send message', 'error');

        const button = event.target.querySelector('button[type="submit"]');
        button.disabled = false;
        button.textContent = 'Send Message';
    }
}

// =========================================
// ADD/EDIT PROPERTY
// =========================================

// Show Add Property Form
function showAddPropertyForm() {
    document.getElementById('property-form-title').textContent = 'Add New Property';
    document.getElementById('property-form').reset();
    document.getElementById('edit-property-id').value = '';
    document.getElementById('property-form-modal').classList.add('show');
}

// Edit Property
async function editProperty(propertyId) {
    event.stopPropagation(); // Prevent card click

    try {
        const property = await apiRequest(`/properties/${propertyId}`);

        document.getElementById('property-form-title').textContent = 'Edit Property';
        document.getElementById('edit-property-id').value = propertyId;
        document.getElementById('property-title').value = property.property_title;
        document.getElementById('property-price').value = property.price;
        document.getElementById('property-type').value = property.property_type;
        document.getElementById('property-location').value = property.location;
        document.getElementById('property-bedrooms').value = property.bedrooms;
        document.getElementById('property-bathrooms').value = property.bathrooms;
        document.getElementById('property-area').value = property.area_sqft;

        document.getElementById('property-form-modal').classList.add('show');

    } catch (error) {
        console.error('Error loading property for edit:', error);
        showToast('Failed to load property details', 'error');
    }
}

// Close Property Form Modal
function closePropertyFormModal() {
    document.getElementById('property-form-modal').classList.remove('show');
    document.getElementById('property-form').reset();
}

// Close modal on background click
document.getElementById('property-form-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'property-form-modal') {
        closePropertyFormModal();
    }
});

// Handle Property Submit (Add or Edit)
async function handlePropertySubmit(event) {
    event.preventDefault();

    const propertyId = document.getElementById('edit-property-id').value;
    const isEdit = !!propertyId;

    const propertyData = {
        property_title: document.getElementById('property-title').value.trim(),
        price: parseFloat(document.getElementById('property-price').value),
        property_type: document.getElementById('property-type').value,
        location: document.getElementById('property-location').value.trim(),
        bedrooms: parseInt(document.getElementById('property-bedrooms').value),
        bathrooms: parseInt(document.getElementById('property-bathrooms').value),
        area_sqft: parseInt(document.getElementById('property-area').value),
    };

    try {
        const button = event.target.querySelector('button[type="submit"]');
        button.disabled = true;
        button.textContent = isEdit ? 'Updating...' : 'Creating...';

        if (isEdit) {
            await apiRequest(`/properties/${propertyId}`, {
                method: 'PUT',
                body: JSON.stringify(propertyData),
            });
            showToast('Property updated successfully!', 'success');
        } else {
            await apiRequest('/properties', {
                method: 'POST',
                body: JSON.stringify(propertyData),
            });
            showToast('Property created successfully!', 'success');
        }

        closePropertyFormModal();

        // Reload listings
        if (currentScreen === 'dashboard-screen') {
            loadMyListings();
        }

    } catch (error) {
        console.error('Error saving property:', error);
        showToast(error.message || 'Failed to save property', 'error');

        const button = event.target.querySelector('button[type="submit"]');
        button.disabled = false;
        button.textContent = 'Save Property';
    }
}

// Delete Property
function deleteProperty(propertyId) {
    event.stopPropagation(); // Prevent card click

    confirmAction('Are you sure you want to delete this property?', async () => {
        try {
            await apiRequest(`/properties/${propertyId}`, {
                method: 'DELETE',
            });

            showToast('Property deleted successfully', 'success');

            // Reload listings
            if (currentScreen === 'dashboard-screen') {
                loadMyListings();
            }

        } catch (error) {
            console.error('Error deleting property:', error);
            showToast(error.message || 'Failed to delete property', 'error');
        }
    });
}
