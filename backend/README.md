# Real Estate Property Listings Backend

A robust and scalable RESTful API backend for a real estate marketplace, built with Python Flask and MongoDB.

## Features

- **Property Management**: Full CRUD operations for property listings.
- **User Authentication**: Secure JWT-based authentication.
- **Role-Based Access Control (RBAC)**: Different permissions for Buyers, Sellers, Agents, and Admins.
- **Advanced Filtering**: Search properties by location, price, type, etc.
- **Security**: Password hashing, JWT tokens, and role-protected endpoints.
- **Scalable Architecture**: Uses Flask Blueprints and an app factory pattern.

## Project Structure
real-estate-property-listings-backend/
├── app/                          # Main application package
│   ├── init.py              # App factory
│   ├── models/                  # Database model definitions (for clarity)
│   ├── routes/                  # API routes/blueprints
│   │   ├── auth.py              # Authentication endpoints
│   │   ├── properties.py        # Property CRUD endpoints
│   │   └── admin.py             # Admin-specific endpoints
│   ├── schemas/                 # Request/response validation schemas (Marshmallow)
│   └── utils/                   # Utility functions and decorators
│       ├── decorators.py        # Custom decorators for RBAC
│       └── helpers.py           # Helper functions (e.g., password hashing)
├── config/                       # Configuration files
│   ├── init.py
│   └── config.py               # Configuration classes (Dev, Test, Prod)
├── logs/                        # Application logs (created automatically)
├── tests/                       # Unit and integration tests (placeholder)
├── run.py                       # Application entry point
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore file
└── README.md                    # This file