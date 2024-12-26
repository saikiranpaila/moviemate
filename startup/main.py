import time
import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

def test_mongo_connection(host, port, retry_interval=5):
    uri = f'mongodb://{host}:{port}'
    
    while True:
        try:
            # Create a MongoClient instance
            client = MongoClient(uri, serverSelectionTimeoutMS=5000)
            
            # Test the connection by trying to retrieve server information
            client.server_info()
            print(f"Successfully connected to MongoDB at {host}:{port}")
            return  # Exit the loop when the connection is successful
        except ConnectionFailure:
            print(f"Failed to connect to MongoDB at {host}:{port}")
        except Exception as e:
            print(f"An error occurred: {str(e)}")
        
        print(f"Retrying in {retry_interval} seconds...")
        time.sleep(retry_interval)  # Wait before retrying

HOST = os.getenv("HOST", "localhost")
PORT = os.getenv("PORT", 27017)

# Example usage
test_mongo_connection(host=HOST, port=PORT)  # Replace with your MongoDB host and port
