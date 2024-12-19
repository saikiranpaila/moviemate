const API_VERSION = 'v1';
const API_PATH = 'api';
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/moviemate_test";

module.exports = { API_VERSION, API_PATH, MONGO_URI };