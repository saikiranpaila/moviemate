const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    title: { type: String, required: true },
    overview: String,
    rating: Number,
    poster_path: String,
    backdrop: String,
    lang: String,
    runtime: Number,
    genres: [String],
    release_date: Date,
    trailer: String,
    movie: String,
    processing: Boolean,
    status: String,
    status_type: String
});

// Create an index on the 'id' field
movieSchema.index({ id: 1 });

// Create the model from the schema
const Movie = mongoose.model('Movie', movieSchema);

// Export the model
module.exports = Movie;
