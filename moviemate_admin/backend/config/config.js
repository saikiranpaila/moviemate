const API_VERSION = 'v1';
const API_PATH = 'api';
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/test";
const REGION = process.env.REGION || "us-east-1"
const SOURCE_BUCKET = process.env.SOURCE_BUCKET || "src.24122024.bucket"

module.exports = { API_VERSION, API_PATH, MONGO_URI, REGION, SOURCE_BUCKET };