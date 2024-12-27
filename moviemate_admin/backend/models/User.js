const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, // Ensure the username is unique
    },
    password: {
        type: String,
        required: true,
    },
});

// Index on the username field for better query performance
// userSchema.index({ username: 1 });

// Create and export the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
