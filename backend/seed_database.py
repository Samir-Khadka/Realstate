"""
Database Seeding Script

This script populates the MongoDB database with initial users and property listings
for development and testing purposes.

WARNING: This script will DELETE all existing data in the 'users' and 'properties'
collections before seeding new data.

Usage:
    python seed_database.py
"""

import os
import sys
from pymongo import MongoClient
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Add the project root to the Python path to import local modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables from .env file
load_dotenv()

# --- Configuration ---
MONGO_URI = os.environ.get('MONGO_URI')
DB_NAME = MONGO_URI.split('/')[-1] if MONGO_URI else 'real_estate_db'

# --- Helper Function (copied from utils to avoid app context) ---
def hash_password(password):
    """Hashes a password using bcrypt."""
    import bcrypt
    pwhash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    return pwhash.decode('utf-8')

# --- Seed Data ---
USERS = [
    {
        "username": "admin",
        "email": "admin@example.com",
        "password": hash_password("password123"),
        "role": "admin",
        "created_at": datetime.utcnow()
    },
    {
        "username": "seller_jane",
        "email": "jane.seller@example.com",
        "password": hash_password("password123"),
        "role": "seller",
        "created_at": datetime.utcnow()
    },
    {
        "username": "seller_bob",
        "email": "bob.seller@example.com",
        "password": hash_password("password123"),
        "role": "seller",
        "created_at": datetime.utcnow()
    },
    {
        "username": "agent_mike",
        "email": "mike.agent@example.com",
        "password": hash_password("password123"),
        "role": "agent",
        "created_at": datetime.utcnow()
    },
    {
        "username": "agent_sarah",
        "email": "sarah.agent@example.com",
        "password": hash_password("password123"),
        "role": "agent",
        "created_at": datetime.utcnow()
    },
    {
        "username": "buyer_john",
        "email": "john.buyer@example.com",
        "password": hash_password("password123"),
        "role": "buyer",
        "created_at": datetime.utcnow()
    }
]

PROPERTIES = [
    {
        "property_title": "Modern Downtown Apartment with City Views",
        "price": 550000.00,
        "location": "New York, NY",
        "property_type": "apartment",
        "bedrooms": 2,
        "bathrooms": 2,
        "area_sqft": 1200,
        "listing_age": 5,
        "views": 152,
        "seller_id": "seller_jane",
        "created_at": datetime.utcnow() - timedelta(days=5),
        "updated_at": datetime.utcnow() - timedelta(days=5)
    },
    {
        "property_title": "Spacious Suburban Villa with Garden",
        "price": 1200000.00,
        "location": "Westchester, NY",
        "property_type": "villa",
        "bedrooms": 4,
        "bathrooms": 3,
        "area_sqft": 3500,
        "listing_age": 20,
        "views": 88,
        "seller_id": "seller_jane",
        "created_at": datetime.utcnow() - timedelta(days=20),
        "updated_at": datetime.utcnow() - timedelta(days=20)
    },
    {
        "property_title": "Cozy Studio in the Heart of the City",
        "price": 350000.00,
        "location": "San Francisco, CA",
        "property_type": "studio",
        "bedrooms": 1,
        "bathrooms": 1,
        "area_sqft": 550,
        "listing_age": 1,
        "views": 310,
        "seller_id": "agent_mike",
        "created_at": datetime.utcnow() - timedelta(days=1),
        "updated_at": datetime.utcnow() - timedelta(days=1)
    },
    {
        "property_title": "Luxury Penthouse with Rooftop Terrace",
        "price": 2500000.00,
        "location": "Miami, FL",
        "property_type": "apartment",
        "bedrooms": 3,
        "bathrooms": 4,
        "area_sqft": 2800,
        "listing_age": 15,
        "views": 450,
        "seller_id": "agent_mike",
        "created_at": datetime.utcnow() - timedelta(days=15),
        "updated_at": datetime.utcnow() - timedelta(days=15)
    },
    {
        "property_title": "Charming Cottage Near the Lake",
        "price": 450000.00,
        "location": "Lake Tahoe, CA",
        "property_type": "house",
        "bedrooms": 3,
        "bathrooms": 2,
        "area_sqft": 1800,
        "listing_age": 10,
        "views": 200,
        "seller_id": "seller_bob",
        "created_at": datetime.utcnow() - timedelta(days=10),
        "updated_at": datetime.utcnow() - timedelta(days=10)
    },
    {
        "property_title": "Modern Loft in Arts District",
        "price": 650000.00,
        "location": "Los Angeles, CA",
        "property_type": "apartment",
        "bedrooms": 1,
        "bathrooms": 2,
        "area_sqft": 1500,
        "listing_age": 3,
        "views": 320,
        "seller_id": "seller_bob",
        "created_at": datetime.utcnow() - timedelta(days=3),
        "updated_at": datetime.utcnow() - timedelta(days=3)
    },
    {
        "property_title": "Family Home with Large Backyard",
        "price": 750000.00,
        "location": "Austin, TX",
        "property_type": "house",
        "bedrooms": 4,
        "bathrooms": 3,
        "area_sqft": 2400,
        "listing_age": 7,
        "views": 180,
        "seller_id": "agent_sarah",
        "created_at": datetime.utcnow() - timedelta(days=7),
        "updated_at": datetime.utcnow() - timedelta(days=7)
    },
    {
        "property_title": "Downtown Commercial Space",
        "price": 1500000.00,
        "location": "Chicago, IL",
        "property_type": "commercial",
        "bedrooms": 0,
        "bathrooms": 2,
        "area_sqft": 3000,
        "listing_age": 30,
        "views": 50,
        "seller_id": "agent_sarah",
        "created_at": datetime.utcnow() - timedelta(days=30),
        "updated_at": datetime.utcnow() - timedelta(days=30)
    },
    {
        "property_title": "Seaside Villa with Private Beach",
        "price": 3500000.00,
        "location": "Malibu, CA",
        "property_type": "villa",
        "bedrooms": 5,
        "bathrooms": 6,
        "area_sqft": 5000,
        "listing_age": 2,
        "views": 600,
        "seller_id": "seller_jane",
        "created_at": datetime.utcnow() - timedelta(days=2),
        "updated_at": datetime.utcnow() - timedelta(days=2)
    },
    {
        "property_title": "Historic Townhouse",
        "price": 950000.00,
        "location": "Boston, MA",
        "property_type": "house",
        "bedrooms": 3,
        "bathrooms": 2,
        "area_sqft": 2000,
        "listing_age": 12,
        "views": 120,
        "seller_id": "seller_bob",
        "created_at": datetime.utcnow() - timedelta(days=12),
        "updated_at": datetime.utcnow() - timedelta(days=12)
    },
    {
        "property_title": "Mountain View Cabin",
        "price": 300000.00,
        "location": "Denver, CO",
        "property_type": "house",
        "bedrooms": 2,
        "bathrooms": 1,
        "area_sqft": 1000,
        "listing_age": 8,
        "views": 90,
        "seller_id": "agent_mike",
        "created_at": datetime.utcnow() - timedelta(days=8),
        "updated_at": datetime.utcnow() - timedelta(days=8)
    },
    {
        "property_title": "Luxury Condo with Pool Access",
        "price": 850000.00,
        "location": "San Diego, CA",
        "property_type": "apartment",
        "bedrooms": 2,
        "bathrooms": 2,
        "area_sqft": 1400,
        "listing_age": 4,
        "views": 250,
        "seller_id": "agent_sarah",
        "created_at": datetime.utcnow() - timedelta(days=4),
        "updated_at": datetime.utcnow() - timedelta(days=4)
    },
    {
        "property_title": "Retail Storefront on Main St",
        "price": 400000.00,
        "location": "Portland, OR",
        "property_type": "commercial",
        "bedrooms": 0,
        "bathrooms": 1,
        "area_sqft": 1200,
        "listing_age": 25,
        "views": 40,
        "seller_id": "seller_jane",
        "created_at": datetime.utcnow() - timedelta(days=25),
        "updated_at": datetime.utcnow() - timedelta(days=25)
    },
    {
        "property_title": "Contemporary Home in Gated Community",
        "price": 1100000.00,
        "location": "Phoenix, AZ",
        "property_type": "house",
        "bedrooms": 4,
        "bathrooms": 3,
        "area_sqft": 2800,
        "listing_age": 6,
        "views": 160,
        "seller_id": "seller_bob",
        "created_at": datetime.utcnow() - timedelta(days=6),
        "updated_at": datetime.utcnow() - timedelta(days=6)
    },
    {
        "property_title": "Compact Office Space",
        "price": 250000.00,
        "location": "Seattle, WA",
        "property_type": "commercial",
        "bedrooms": 0,
        "bathrooms": 1,
        "area_sqft": 800,
        "listing_age": 18,
        "views": 70,
        "seller_id": "agent_mike",
        "created_at": datetime.utcnow() - timedelta(days=18),
        "updated_at": datetime.utcnow() - timedelta(days=18)
    },
    {
        "property_title": "Renovated Farmhouse",
        "price": 500000.00,
        "location": "Nashville, TN",
        "property_type": "house",
        "bedrooms": 3,
        "bathrooms": 2,
        "area_sqft": 2200,
        "listing_age": 14,
        "views": 110,
        "seller_id": "agent_sarah",
        "created_at": datetime.utcnow() - timedelta(days=14),
        "updated_at": datetime.utcnow() - timedelta(days=14)
    },
    {
        "property_title": "High-Rise Apartment",
        "price": 900000.00,
        "location": "Atlanta, GA",
        "property_type": "apartment",
        "bedrooms": 2,
        "bathrooms": 2,
        "area_sqft": 1300,
        "listing_age": 9,
        "views": 190,
        "seller_id": "seller_jane",
        "created_at": datetime.utcnow() - timedelta(days=9),
        "updated_at": datetime.utcnow() - timedelta(days=9)
    },
    {
        "property_title": "Beachfront Bungalow",
        "price": 600000.00,
        "location": "Key West, FL",
        "property_type": "house",
        "bedrooms": 2,
        "bathrooms": 1,
        "area_sqft": 900,
        "listing_age": 11,
        "views": 280,
        "seller_id": "seller_bob",
        "created_at": datetime.utcnow() - timedelta(days=11),
        "updated_at": datetime.utcnow() - timedelta(days=11)
    },
    {
        "property_title": "Industrial Warehouse",
        "price": 800000.00,
        "location": "Detroit, MI",
        "property_type": "commercial",
        "bedrooms": 0,
        "bathrooms": 2,
        "area_sqft": 5000,
        "listing_age": 40,
        "views": 30,
        "seller_id": "agent_mike",
        "created_at": datetime.utcnow() - timedelta(days=40),
        "updated_at": datetime.utcnow() - timedelta(days=40)
    }
]

def seed_database():
    """Connects to the database and seeds it with initial data."""
    if not MONGO_URI:
        print("Error: MONGO_URI not found in environment variables.")
        print("Please configure your .env file.")
        return

    print(f"Connecting to MongoDB at {MONGO_URI}...")
    try:
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        client.server_info() # Trigger exception if cannot connect
        print("Connection successful.")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        return

    # --- Clear existing collections ---
    print("\nDropping existing collections...")
    db.users.drop()
    db.properties.drop()
    print("Collections 'users' and 'properties' dropped.")

    # --- Seed new data ---
    print("\nSeeding users...")
    if USERS:
        db.users.insert_many(USERS)
        print(f"Inserted {len(USERS)} users.")

    print("\nSeeding properties...")
    if PROPERTIES:
        db.properties.insert_many(PROPERTIES)
        print(f"Inserted {len(PROPERTIES)} properties.")

    print("\n----------------------------------------")
    print("✅ Database seeded successfully!")
    print("----------------------------------------")
    print("\nDefault Logins:")
    print("  Admin:      username='admin', password='password123'")
    print("  Seller:     username='seller_jane', password='password123'")
    print("  Agent:      username='agent_mike', password='password123'")
    print("  Buyer:      username='buyer_john', password='password123'")

    client.close()

if __name__ == "__main__":
    seed_database()