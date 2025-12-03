import os
import json
from pymongo import MongoClient
from bson.objectid import ObjectId
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

MONGO_URI = os.environ.get('MONGO_URI')
DB_NAME = MONGO_URI.split('/')[-1] if MONGO_URI else 'real_estate_db'

# This custom encoder handles MongoDB-specific data types like ObjectId and datetime
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        if isinstance(o, datetime):
            return o.isoformat()
        return super().default(o)

def export_collections():
    if not MONGO_URI:
        print("Error: MONGO_URI not found in .env file.")
        return

    try:
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        print(f"Connected to database '{DB_NAME}'.")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        return
    
    collections_to_export = ['users', 'properties', 'messages']
    
    print("\nExporting collections...")
    for collection_name in collections_to_export:
        try:
            collection = db[collection_name]
            documents = list(collection.find({}))
            
            filename = f"{collection_name}.json"
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(documents, f, indent=4, cls=CustomJSONEncoder)
            
            print(f"  - Exported {len(documents)} documents to {filename}")
        except Exception as e:
            print(f"  - Error exporting {collection_name}: {e}")

    client.close()
    print("\nExport complete. Your JSON files are ready.")

if __name__ == "__main__":
    export_collections()