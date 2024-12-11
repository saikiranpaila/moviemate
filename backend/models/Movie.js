const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');  // Import UUID v4

const movieSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        default: uuidv4  // Automatically generate a UUID for the `id`
    },
    title: { type: String, required: true },
    overview: String,
    poster_path: String,
    original_language: String,
    genre_ids: [Number],
    release_date: Date,
    vote_average: Number,
    vote_count: Number
});

// Create an index on the 'id' field
movieSchema.index({ id: 1 });

// Create the model from the schema
const Movie = mongoose.model('Movie', movieSchema);

// Export the model
module.exports = Movie;
