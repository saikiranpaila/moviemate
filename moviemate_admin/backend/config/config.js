const API_VERSION = 'v1';
const API_PATH = 'api';
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/test";
const REGION = process.env.REGION || "us-east-1"
const SOURCE_BUCKET = process.env.SOURCE_BUCKET || "src.22122024.bucket"
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "bcb7d74dce437291bbf167095065d93a"
const ADMIN_USER_ID = process.env.ADMIN_USER_ID || "admin"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin"

module.exports = { API_VERSION, API_PATH, MONGO_URI, REGION, SOURCE_BUCKET, JWT_SECRET_KEY, ADMIN_USER_ID, ADMIN_PASSWORD };