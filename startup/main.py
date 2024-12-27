import time
import os
import logging
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

# Configure logging
logging.basicConfig(
    level=logging.INFO,  # Adjust to DEBUG or ERROR based on your needs
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),  # Log to console
        logging.FileHandler("mongo_connection.log", mode='a')  # Log to a file
    ]
)

def test_mongo_connection():
    while True:
        try:
            MONGO_HOST = os.getenv("MONGO_HOST", "localhost")
            MONGO_PORT = os.getenv("MONGO_PORT", 27017)
            retry_interval=5
            uri = f'mongodb://{MONGO_HOST}:{MONGO_PORT}'
            # Create a MongoClient instance
            client = MongoClient(uri, serverSelectionTimeoutMS=5000)
            
            # Test the connection by trying to retrieve server information
            client.server_info()
            logging.info(f"Successfully connected to MongoDB at {MONGO_HOST}:{MONGO_PORT}")
            return  # Exit the loop when the connection is successful
        except ConnectionFailure:
            logging.error(f"Failed to connect to MongoDB at {MONGO_HOST}:{MONGO_PORT}")
        except Exception as e:
            logging.error(f"An error occurred: {str(e)}")
        
        logging.info(f"Retrying in {retry_interval} seconds...")
        time.sleep(retry_interval)  # Wait before retrying

# Example usage
test_mongo_connection()  # Replace with your MongoDB host and port
