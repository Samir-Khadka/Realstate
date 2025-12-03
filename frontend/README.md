# Real Estate Marketplace - Frontend

A professional, modern frontend application for the real estate marketplace with stunning UI/UX and comprehensive functionality.

## Features

✨ **Modern UI/UX**
- Gradient color schemes with glassmorphism effects
- Smooth animations and micro-interactions
- Dark mode support
- Fully responsive design

🔐 **Authentication**
- User registration and login
- JWT-based authentication
- Role-based access control

🏠 **Property Management**
- Browse properties with advanced filters
- Property details with image gallery
- Create, edit, and delete listings (sellers/agents)
- Contact sellers directly

👤 **Role-Based Features**
- **Buyers**: Browse and contact sellers
- **Sellers/Agents**: Manage property listings
- **Admins**: User and property management

## Tech Stack

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS variables
- **JavaScript (ES6+)**: Vanilla JS for maximum performance
- **Backend API**: Flask REST API (localhost:5000)

## Project Structure

```
frontend/
├── index.html          # Main HTML file with all screens
├── css/
│   └── styles.css      # Comprehensive design system
├── js/
│   ├── app.js          # Main application logic
│   ├── properties.js   # Property management
│   ├── admin.js        # Admin functionality
│   └── utils.js        # Utility functions
└── assets/
    ├── images/         # Property images
    └── icons/          # UI icons
```

## Getting Started

### Prerequisites

1. Backend API must be running on `http://localhost:5000`
2. Modern web browser (Chrome, Firefox, Edge, Safari)

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Open `index.html` in your browser:
   - Double-click the file, or
   - Use a local server (recommended):
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx serve
   ```

3. Access the application:
   - File: `file:///path/to/index.html`
   - Server: `http://localhost:8000`

## Usage

### For Buyers

1. **Register/Login**: Create an account with the "buyer" role
2. **Browse Properties**: Use filters to find properties
3. **View Details**: Click on a property card to see full details
4. **Contact Sellers**: Send messages to property owners

### For Sellers/Agents

All buyer features, plus:

1. **Add Listings**: Click "Add New Property" to create listings
2. **Manage Listings**: Edit or delete your properties
3. **View Statistics**: See views and engagement

### For Admins

All features, plus:

1. **User Management**: View all registered users
2. **Property Management**: View and delete any property

## Features in Detail

### Landing Page
- Hero section with search bar
- Featured properties carousel
- Benefits section
- Responsive footer

### Authentication
- Separate login and register screens
- Form validation
- Error handling
- Auto-login after registration

### Dashboard
- Role-based navigation
- Statistics cards
- Recent properties
- Quick actions

### Property Browsing
- Advanced filters (location, type, price, bedrooms)
- Sorting options
- Grid/card layout
- Property details modal

### Property Management
- Add/Edit property forms
- Image placeholders (from Unsplash)
- Real-time validation
- CRUD operations

### Admin Panel
- Users table with role badges
- Properties grid with delete actions
- Statistics (expandable)

## Dark Mode

Toggle dark mode using the moon/sun icon in the navigation bar. Your preference is saved automatically.

## API Integration

The frontend connects to the backend API at:
```
http://localhost:5000
```

All API requests include JWT authentication when logged in.

### API Endpoints Used

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile
- `GET /properties` - List all properties
- `GET /properties/:id` - Get property details
- `POST /properties` - Create property (sellers/agents)
- `PUT /properties/:id` - Update property (owners)
- `DELETE /properties/:id` - Delete property (owners)
- `POST /properties/:id/contact` - Contact seller
- `GET /admin/users` - List all users (admin)
- `GET /admin/properties` - List all properties (admin)
- `DELETE /admin/properties/:id` - Delete property (admin)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Edge (latest)
- Safari (latest)

## Responsive Breakpoints

- Mobile: 480px and below
- Tablet: 768px
- Desktop: 1024px and above

## Customization

### Colors

Edit CSS variables in `css/styles.css`:

```css
:root {
  --primary-start: #667eea;
  --primary-end: #764ba2;
  --accent-teal: #38b2ac;
  /* ... */
}
```

### Backend URL

Edit `API_BASE_URL` in `js/utils.js`:

```javascript
const API_BASE_URL = 'http://localhost:5000';
```

## Troubleshooting

### Properties not loading
- Ensure backend is running on port 5000
- Check browser console for errors
- Verify JWT token is valid

### CORS errors
- Backend must allow CORS from frontend origin
- Check backend CORS configuration

### Images not displaying
- Using Unsplash for property images
- Internet connection required for images

## Future Enhancements

- Image upload for properties
- Advanced search with autocomplete
- Saved/favorite properties
- Real-time notifications
- Chat functionality
- Map integration
- Virtual tours

## Credits

- Design inspiration: Modern web design trends
- Icons: Emoji icons for simplicity
- Images: Unsplash (https://unsplash.com)
- Fonts: Google Fonts (Poppins, Inter)

## License

This project is part of the Real Estate Marketplace application.

---

**Made with ❤️ using vanilla HTML, CSS, and JavaScript**
